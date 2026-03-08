const mongoose = require('mongoose');
const asyncHandler = require('../utils/asyncHandler');
const Room = require('../models/Room');
const RoomView = require('../models/RoomView');

const getOwnerAnalytics = asyncHandler(async (req, res) => {
  const ownerId = new mongoose.Types.ObjectId(req.user.id);

  const listingStats = await Room.aggregate([
    { $match: { ownerId } },
    {
      $project: {
        title: 1,
        viewsCount: 1,
        inquiriesCount: 1,
        conversionsCount: 1,
        averageRating: 1,
        conversionRate: {
          $cond: [
            { $gt: ['$inquiriesCount', 0] },
            { $multiply: [{ $divide: ['$conversionsCount', '$inquiriesCount'] }, 100] },
            0
          ]
        }
      }
    },
    { $sort: { viewsCount: -1 } }
  ]);

  const weeklyGrowth = await RoomView.aggregate([
    {
      $lookup: {
        from: 'rooms',
        localField: 'roomId',
        foreignField: '_id',
        as: 'room'
      }
    },
    { $unwind: '$room' },
    { $match: { 'room.ownerId': ownerId } },
    {
      $group: {
        _id: {
          year: { $isoWeekYear: '$viewedAt' },
          week: { $isoWeek: '$viewedAt' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': -1, '_id.week': -1 } },
    { $limit: 8 }
  ]);

  const totals = listingStats.reduce(
    (acc, item) => {
      acc.totalViews += item.viewsCount || 0;
      acc.totalInquiries += item.inquiriesCount || 0;
      acc.totalConversions += item.conversionsCount || 0;
      return acc;
    },
    { totalViews: 0, totalInquiries: 0, totalConversions: 0 }
  );

  const overallConversionRate = totals.totalInquiries
    ? Number(((totals.totalConversions / totals.totalInquiries) * 100).toFixed(2))
    : 0;

  res.json({
    success: true,
    data: {
      listingStats,
      weeklyGrowth: weeklyGrowth.reverse(),
      totals: {
        ...totals,
        overallConversionRate
      }
    }
  });
});

module.exports = {
  getOwnerAnalytics
};
