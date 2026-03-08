import React, { useMemo, useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { roomsApi, favoritesApi, reviewApi, inquiryApi } from '../api/services';
import { useAuth } from '../context/AuthContext';
import { addCompareId, getCompareIds, isInCompare, removeCompareId } from '../utils/compare';
import StarRating from '../components/reviews/StarRating';
import ReviewList from '../components/reviews/ReviewList';

const fallbackImage = 'https://via.placeholder.com/800x600?text=No+image';
const toImageUrl = (img) => (typeof img === 'string' ? img : img?.url);

export default function RoomDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isTenant } = useAuth();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [compareIds, setCompareIds] = useState(getCompareIds());
  const [selectedImage, setSelectedImage] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [myRating, setMyRating] = useState(5);
  const [myReview, setMyReview] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('Is this room currently available?');
  const [inquiryStatus, setInquiryStatus] = useState('');

  useEffect(() => {
    if (!id) return;
    let active = true;

    const loadRoom = async () => {
      setLoading(true);
      try {
        let response;
        if (isAuthenticated) {
          response = await roomsApi.getFullById(id);
        } else {
          response = await roomsApi.getById(id);
        }
        if (active) setRoom(response.data.data);
      } catch (error) {
        if (isAuthenticated && [401, 403].includes(error?.response?.status)) {
          try {
            const fallback = await roomsApi.getById(id);
            if (active) setRoom(fallback.data.data);
            return;
          } catch (_err) {
            // ignore
          }
        }
        if (active) setRoom(null);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadRoom();
    return () => {
      active = false;
    };
  }, [id, isAuthenticated]);

  useEffect(() => {
    if (!id) return;
    reviewApi
      .listByRoom(id)
      .then(({ data }) => setReviews(data.data || []))
      .catch(() => setReviews([]));
  }, [id]);

  const roomId = room?._id;
  useEffect(() => {
    if (!roomId || !user) return;
    favoritesApi
      .list()
      .then(({ data }) => {
        const ids = (data.data || []).map((r) => r._id);
        setIsFavorite(ids.includes(roomId));
      })
      .catch(() => {});
  }, [roomId, user]);

  useEffect(() => {
    const syncCompare = (event) => setCompareIds(event.detail || getCompareIds());
    window.addEventListener('compare-change', syncCompare);
    return () => window.removeEventListener('compare-change', syncCompare);
  }, []);

  const alreadyInCompare = useMemo(() => (room?._id ? isInCompare(room._id) : false), [room?._id]);
  const canAddToCompare = compareIds.length < 3 || alreadyInCompare;
  const imageUrls = useMemo(() => {
    const urls = (room?.images || []).map(toImageUrl).filter(Boolean);
    return urls.length ? urls : [fallbackImage];
  }, [room?.images]);

  useEffect(() => {
    setSelectedImage(0);
  }, [room?._id]);

  const toggleFavorite = () => {
    if (!isAuthenticated || !room?._id) return;
    if (isFavorite) {
      favoritesApi.remove(room._id).then(() => setIsFavorite(false));
    } else {
      favoritesApi.add(room._id).then(() => setIsFavorite(true));
    }
  };

  const toggleCompare = () => {
    if (!room?._id) return;
    if (alreadyInCompare) {
      const ids = removeCompareId(room._id);
      setCompareIds(ids);
      return;
    }
    if (!canAddToCompare) return;
    const ids = addCompareId(room._id);
    setCompareIds(ids);
  };

  const goToCompare = () => {
    const ids = room?._id && !isInCompare(room._id) ? addCompareId(room._id) : getCompareIds();
    navigate(`/compare?ids=${ids.join(',')}`);
  };

  const submitReview = async () => {
    if (!isTenant) return;
    setReviewError('');
    try {
      await reviewApi.create({ roomId: id, rating: myRating, review: myReview });
      const { data } = await reviewApi.listByRoom(id);
      setReviews(data.data || []);
      setMyReview('');
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review');
    }
  };

  const replyReview = async (reviewId, message) => {
    if (!message.trim()) return;
    try {
      await reviewApi.reply(reviewId, { message });
      const { data } = await reviewApi.listByRoom(id);
      setReviews(data.data || []);
    } catch {
      // ignore
    }
  };

  const submitInquiry = async () => {
    setInquiryStatus('');
    try {
      await inquiryApi.create({ roomId: id, message: inquiryMessage });
      setInquiryStatus('Inquiry sent successfully');
    } catch (err) {
      setInquiryStatus(err.response?.data?.message || 'Failed to send inquiry');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 transition-colors duration-300">
        <div className="rounded-airbnb bg-airbnb-gray-light dark:bg-gray-700 h-80 animate-pulse transition-colors duration-300" />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center text-airbnb-gray dark:text-gray-300 transition-colors duration-300">
        Room not found.{' '}
        <Link to="/" className="text-airbnb-pink hover:underline">
          Back to listings
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 text-airbnb-black dark:text-gray-100 transition-colors duration-300">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">{room.title}</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={toggleCompare}
            disabled={!canAddToCompare && !alreadyInCompare}
            className="text-sm px-3 py-2 rounded-full border border-airbnb-gray-light dark:border-gray-700 disabled:opacity-50 transition-colors duration-300"
          >
            {alreadyInCompare ? 'Remove compare' : 'Add to compare'}
          </button>
          <button
            type="button"
            onClick={goToCompare}
            className="text-sm px-3 py-2 rounded-full bg-airbnb-pink text-white hover:bg-airbnb-pink-hover transition-colors duration-300"
          >
            Compare ({compareIds.length}/3)
          </button>
          {isAuthenticated && (
            <button
              type="button"
              onClick={toggleFavorite}
              className="flex items-center gap-1 px-3 py-2 rounded-full border border-airbnb-gray-light dark:border-gray-700 text-sm transition-colors duration-300"
            >
              {isFavorite ? 'Saved' : 'Save'}
            </button>
          )}
        </div>
      </div>

      <div className="rounded-airbnb overflow-hidden bg-white dark:bg-gray-800 shadow-card mb-6 transition-colors duration-300">
        <div className="aspect-room relative">
          <img src={imageUrls[selectedImage] || fallbackImage} alt={room.title} className="w-full h-full object-cover" />
        </div>
        {imageUrls.length > 1 && (
          <div className="flex gap-2 p-2 overflow-x-auto">
            {imageUrls.map((url, i) => (
              <button
                key={`${url}-${i}`}
                type="button"
                onClick={() => setSelectedImage(i)}
                className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border transition-colors duration-300 ${selectedImage === i ? 'border-airbnb-pink' : 'border-airbnb-gray-light dark:border-gray-700'}`}
              >
                <img src={url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div>
            <h2 className="font-semibold mb-1">Rs {room.price?.toLocaleString()}/month</h2>
            {room.deposit > 0 && <p className="text-sm text-airbnb-gray dark:text-gray-300 transition-colors duration-300">Deposit: Rs {room.deposit?.toLocaleString()}</p>}
            <p className="text-sm text-airbnb-gray dark:text-gray-300">Rating: {Number(room.averageRating || 0).toFixed(2)} ({room.ratingsCount || 0})</p>
          </div>
          <p>{room.description || 'No description.'}</p>
          <div>
            <h3 className="font-semibold mb-2">Details</h3>
            <ul className="text-sm text-airbnb-gray dark:text-gray-300 space-y-1 transition-colors duration-300">
              <li>Room type: {room.roomType}</li>
              <li>Gender: {room.gender || 'Any'}</li>
              <li>Location: {room.address}</li>
              <li>AC: {room.isAC ? 'Yes' : 'No'}</li>
              <li>Food: {room.foodType || 'Both'}</li>
              {room.distanceKm != null && <li>Distance: {room.distanceKm} km</li>}
            </ul>
          </div>
          {room.facilities?.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Facilities</h3>
              <p className="text-sm text-airbnb-gray dark:text-gray-300 transition-colors duration-300">{room.facilities.join(', ')}</p>
            </div>
          )}

          <div className="rounded-airbnb bg-white dark:bg-gray-800 p-4 shadow-card">
            <h3 className="font-semibold mb-2">Ratings & Reviews</h3>
            {isTenant && (
              <div className="space-y-2 mb-4">
                <StarRating value={myRating} onChange={setMyRating} />
                <textarea
                  value={myReview}
                  onChange={(e) => setMyReview(e.target.value)}
                  rows={3}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Share your experience"
                />
                {reviewError && <p className="text-sm text-red-600">{reviewError}</p>}
                <button type="button" onClick={submitReview} className="px-4 py-2 rounded-full bg-airbnb-pink text-white text-sm">
                  Submit Review
                </button>
              </div>
            )}
            <ReviewList reviews={reviews} user={user} onReply={replyReview} />
          </div>
        </div>

        <div className="rounded-airbnb bg-white dark:bg-gray-800 p-4 shadow-card h-fit transition-colors duration-300">
          <h3 className="font-semibold mb-2">Contact</h3>
          {isAuthenticated ? (
            <>
              <p className="text-sm text-airbnb-gray dark:text-gray-300 transition-colors duration-300">{room.ownerId?.name || 'Owner'}</p>
              {room.contactNumber ? (
                <a href={`tel:${room.contactNumber}`} className="mt-2 inline-block text-airbnb-pink font-medium hover:underline">
                  {room.contactNumber}
                </a>
              ) : (
                <p className="text-sm text-airbnb-gray dark:text-gray-300">Contact unavailable</p>
              )}

              {isTenant && (
                <div className="mt-3 space-y-2">
                  <textarea
                    rows={3}
                    value={inquiryMessage}
                    onChange={(e) => setInquiryMessage(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    placeholder="Send inquiry to owner"
                  />
                  <button type="button" onClick={submitInquiry} className="w-full rounded-full bg-airbnb-pink text-white py-2 text-sm">
                    Send Inquiry
                  </button>
                  {inquiryStatus && <p className="text-xs text-gray-500">{inquiryStatus}</p>}
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-airbnb-gray dark:text-gray-300 transition-colors duration-300">
              Login to view full address, contact number, and owner details.
            </p>
          )}
          <button
            type="button"
            onClick={goToCompare}
            className="mt-4 w-full text-center rounded-full bg-airbnb-pink text-white py-2 text-sm font-medium hover:bg-airbnb-pink-hover transition-colors duration-300"
          >
            Open Compare
          </button>
        </div>
      </div>
    </div>
  );
}
