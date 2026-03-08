const mongoose = require('mongoose');
const Room = require('../models/Room');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { deleteByPublicId } = require('../services/cloudinaryService');
const { parseArray, parseNumber, buildRoomMatchFromQuery } = require('../utils/queryHelpers');
const { geocodeAddress, normalizeCoordinates } = require('../services/geocodeService');
const { toImageHash, detectFraudSignals } = require('../services/fraudService');

const normalizeImageUrl = (img) => {
  if (!img) return null;
  if (typeof img === 'string') return img;
  if (typeof img === 'object' && typeof img.url === 'string') return img.url;
  return null;
};

const normalizeImages = (images) => (Array.isArray(images) ? images.map(normalizeImageUrl).filter(Boolean) : []);
const deleteRoomImagesFromCloudinary = async (images) => {
  await Promise.all((images || []).map((img) => {
    if (img && typeof img === 'object' && img.publicId) {
      return deleteByPublicId(img.publicId);
    }
    return Promise.resolve();
  }));
};

const normalizeRoomForResponse = (room) => {
  if (!room) return room;
  const raw = room.toObject ? room.toObject() : room;
  const parsedDistance = parseNumber(body.distanceToWorkOrCollegeKm);

  return {
    ...raw,
    images: normalizeImages(raw.images)
  };
};

const toPublicRoom = (room) => {
  const normalized = normalizeRoomForResponse(room);
  if (!normalized) return normalized;

  const address = typeof normalized.address === 'string' ? normalized.address.trim() : '';
  const city = address ? address.split(',').pop().trim() : '';

  return {
    ...normalized,
    address: city || normalized.pincode || 'Location not specified',
    contactNumber: undefined
  };
};

const normalizeRoomPayload = async (body, uploadedImages, existingRoom) => {
  const address = typeof body.address === 'string' ? body.address.trim() : existingRoom?.address;
  const pincode = typeof body.pincode === 'string' ? body.pincode.trim() : existingRoom?.pincode;
  let location;

  if (address && pincode) {
    location = await geocodeAddress({ address, pincode });
  } else if (existingRoom?.location?.coordinates?.length === 2) {
    location = normalizeCoordinates(existingRoom.location.coordinates[1], existingRoom.location.coordinates[0]);
  } else {
    location = null;
  }

  const images = uploadedImages?.length ? normalizeImages(uploadedImages) : existingRoom?.images || [];
  const imageHashes = images.map((img) => toImageHash(img)).filter(Boolean);

  return {
    title: body.title,
    price: parseNumber(body.price),
    deposit: parseNumber(body.deposit) || 0,
    description: body.description || '',
    location,
    address,
    pincode,
    facilities: parseArray(body.facilities),
    roomType: body.roomType,
    gender: body.gender || 'Any',
    foodType: body.foodType || existingRoom?.foodType || 'Both',
    isAC:
      body.isAC !== undefined
        ? body.isAC === true || body.isAC === 'true' || body.isAC === '1'
        : existingRoom?.isAC || false,
    distanceToWorkOrCollegeKm:
      parsedDistance !== undefined ? parsedDistance : existingRoom?.distanceToWorkOrCollegeKm || 0,
    contactNumber: body.contactNumber,
    ...(uploadedImages?.length ? { images } : {}),
    imageHashes
  };
};

const createRoom = asyncHandler(async (req, res) => {
  const payload = await normalizeRoomPayload(req.body, req.uploadedImages);

  const required = ['title', 'price', 'address', 'pincode', 'roomType', 'contactNumber'];
  const missing = required.filter((field) => payload[field] === undefined || payload[field] === null || payload[field] === '');

  if (missing.length) {
    throw new ApiError(400, `Missing required fields: ${missing.join(', ')}`);
  }

  if (!payload.location) {
    throw new ApiError(400, 'Unable to determine location from address/pincode');
  }

  const room = await Room.create({
    ...payload,
    flagged: false,
    flaggedReasons: [],
    ownerId: req.user.id
  });

  const fraudCheck = await detectFraudSignals({
    roomId: room._id,
    contactNumber: room.contactNumber,
    title: room.title,
    address: room.address,
    imageHashes: room.imageHashes
  });

  if (fraudCheck.flagged) {
    room.flagged = true;
    room.flaggedReasons = fraudCheck.reasons;
    await room.save();
  }

  res.status(201).json({
    success: true,
    message: 'Room created',
    data: normalizeRoomForResponse(room)
  });
});

const updateRoom = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id);

  if (!room) {
    throw new ApiError(404, 'Room not found');
  }

  if (room.ownerId.toString() !== req.user.id.toString()) {
    throw new ApiError(403, 'You can update only your own listing');
  }

  const payload = await normalizeRoomPayload(req.body, req.uploadedImages, room);

  if (payload.location) {
    room.location = payload.location;
  }

  const updatable = [
    'title',
    'price',
    'deposit',
    'description',
    'address',
    'pincode',
    'facilities',
    'roomType',
    'gender',
    'foodType',
    'isAC',
    'distanceToWorkOrCollegeKm',
    'contactNumber'
  ];
  updatable.forEach((field) => {
    if (payload[field] !== undefined) {
      room[field] = payload[field];
    }
  });

  if (req.uploadedImages?.length) {
    await deleteRoomImagesFromCloudinary(room.images);
    room.images = normalizeImages(req.uploadedImages);
    room.imageHashes = payload.imageHashes;
  }

  const fraudCheck = await detectFraudSignals({
    roomId: room._id,
    contactNumber: room.contactNumber,
    title: room.title,
    address: room.address,
    imageHashes: room.imageHashes
  });
  room.flagged = fraudCheck.flagged;
  room.flaggedReasons = fraudCheck.reasons;

  await room.save();

  res.json({
    success: true,
    message: 'Room updated',
    data: normalizeRoomForResponse(room)
  });
});

const deleteRoom = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id);

  if (!room) {
    throw new ApiError(404, 'Room not found');
  }

  if (room.ownerId.toString() !== req.user.id.toString()) {
    throw new ApiError(403, 'You can delete only your own listing');
  }

  await deleteRoomImagesFromCloudinary(room.images);
  await room.deleteOne();

  res.json({
    success: true,
    message: 'Room deleted'
  });
});

const getPublicRoomById = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id);

  if (!room) {
    throw new ApiError(404, 'Room not found');
  }

  res.json({
    success: true,
    data: toPublicRoom(room)
  });
});

const getRoomById = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id).populate('ownerId', 'name email role');

  if (!room) {
    throw new ApiError(404, 'Room not found');
  }

  res.json({
    success: true,
    data: normalizeRoomForResponse(room)
  });
});

const listRooms = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const skip = (page - 1) * limit;

  const lat = parseNumber(req.query.lat);
  const lng = parseNumber(req.query.lng);
  const sortBy = req.query.sortBy || 'createdAt';
  const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

  const match = buildRoomMatchFromQuery(req.query);

  if (lat !== undefined && lng !== undefined) {
    const pipeline = [
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [lng, lat] },
          distanceField: 'distanceMeters',
          spherical: true,
          query: match
        }
      },
      {
        $addFields: {
          distanceKm: { $round: [{ $divide: ['$distanceMeters', 1000] }, 2] }
        }
      }
    ];

    if (sortBy === 'price') {
      pipeline.push({ $sort: { price: sortOrder } });
    } else {
      pipeline.push({ $sort: { distanceMeters: 1 } });
    }

    pipeline.push({ $skip: skip }, { $limit: limit });

    const rooms = await Room.aggregate(pipeline);
    const totalData = await Room.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [lng, lat] },
          distanceField: 'distanceMeters',
          spherical: true,
          query: match
        }
      },
      { $count: 'total' }
    ]);

    res.json({
      success: true,
      data: rooms.map(toPublicRoom),
      meta: {
        page,
        limit,
        total: totalData[0]?.total || 0
      }
    });
    return;
  }

  const [rooms, total] = await Promise.all([
    Room.find(match)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .populate('ownerId', 'name email'),
    Room.countDocuments(match)
  ]);

  res.json({
    success: true,
    data: rooms.map(toPublicRoom),
    meta: {
      page,
      limit,
      total
    }
  });
});

const getNearbyRooms = asyncHandler(async (req, res) => {
  const lat = parseNumber(req.query.lat);
  const lng = parseNumber(req.query.lng);
  const radiusKm = parseNumber(req.query.radius) || 5;

  if (lat === undefined || lng === undefined) {
    throw new ApiError(400, 'lat and lng query params are required');
  }

  const maxDistance = radiusKm * 1000;
  const match = buildRoomMatchFromQuery(req.query);

  const rooms = await Room.aggregate([
    {
      $geoNear: {
        near: { type: 'Point', coordinates: [lng, lat] },
        distanceField: 'distanceMeters',
        maxDistance,
        spherical: true,
        query: match
      }
    },
    {
      $addFields: {
        distanceKm: { $round: [{ $divide: ['$distanceMeters', 1000] }, 2] }
      }
    },
    { $sort: { distanceMeters: 1 } }
  ]);

  res.json({
    success: true,
    data: rooms.map(toPublicRoom),
    meta: {
      radiusKm,
      count: rooms.length
    }
  });
});

const compareRooms = asyncHandler(async (req, res) => {
  const ids = (req.query.ids || '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);

  if (!ids.length || ids.length > 3) {
    throw new ApiError(400, 'Provide 1 to 3 room ids in ids query param');
  }

  const objectIds = ids.map((id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, `Invalid room id: ${id}`);
    }
    return new mongoose.Types.ObjectId(id);
  });

  const lat = parseNumber(req.query.lat);
  const lng = parseNumber(req.query.lng);

  if (lat !== undefined && lng !== undefined) {
    const rooms = await Room.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [lng, lat] },
          distanceField: 'distanceMeters',
          spherical: true,
          query: { _id: { $in: objectIds } }
        }
      },
      {
        $addFields: {
          distanceKm: { $round: [{ $divide: ['$distanceMeters', 1000] }, 2] }
        }
      }
    ]);

    res.json({ success: true, data: rooms.map(toPublicRoom) });
    return;
  }

  const rooms = await Room.find({ _id: { $in: objectIds } });
  res.json({ success: true, data: rooms.map(toPublicRoom) });
});

module.exports = {
  createRoom,
  updateRoom,
  deleteRoom,
  getPublicRoomById,
  getRoomById,
  listRooms,
  getNearbyRooms,
  compareRooms
};
