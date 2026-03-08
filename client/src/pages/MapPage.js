import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, Polyline } from 'react-leaflet';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { roomsApi } from '../api/services';

delete L.Icon.Default.prototype._getIconUrl;

const roomIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const userIcon = new L.DivIcon({
  className: 'user-location-icon',
  html: '<div style="width:16px;height:16px;background:#0ea5e9;border:2px solid white;border-radius:9999px;box-shadow:0 0 0 6px rgba(14,165,233,0.25);"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

function FitBounds({ rooms, userLocation }) {
  const map = useMap();

  useEffect(() => {
    const points = rooms
      .map((r) => r.location?.coordinates)
      .filter((c) => Array.isArray(c) && c.length >= 2)
      .map((c) => [c[1], c[0]]);

    if (userLocation) points.push(userLocation);

    if (points.length === 1) {
      map.setView(points[0], 14);
      return;
    }

    if (points.length > 1) {
      map.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 14 });
    }
  }, [map, rooms, userLocation]);

  return null;
}

export default function MapPage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [error, setError] = useState('');

  const defaultCenter = [12.9716, 77.5946];
  const radiusKm = 8;

  useEffect(() => {
    let active = true;
    setLoading(true);
    roomsApi
      .list({ limit: 100 })
      .then(({ data }) => {
        if (active) setRooms(data.data || []);
      })
      .catch(() => {
        if (active) setRooms([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const roomsWithLocation = useMemo(() => rooms.filter((r) => r.location?.coordinates?.length >= 2), [rooms]);

  const findNearby = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported in this browser.');
      return;
    }

    setLocating(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setUserLocation([lat, lng]);

        roomsApi
          .nearby({ lat, lng, radius: radiusKm })
          .then(({ data }) => setRooms(data.data || []))
          .catch(() => setError('Unable to load nearby rooms.'))
          .finally(() => setLocating(false));
      },
      () => {
        setError('Location permission denied.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="h-[calc(100vh-4rem)] relative bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="absolute top-4 left-4 right-4 z-[500] flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={findNearby}
          disabled={locating}
          className="px-4 py-2 rounded-full bg-airbnb-pink text-white text-sm font-medium shadow hover:bg-airbnb-pink-hover disabled:opacity-60 transition-colors duration-300"
        >
          {locating ? 'Locating...' : 'Use My Location'}
        </button>
        {error && <span className="px-3 py-2 rounded-full text-xs bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 transition-colors duration-300">{error}</span>}
      </div>

      {loading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-airbnb-gray-bg dark:bg-gray-900">
          <p className="text-airbnb-gray dark:text-gray-300">Loading map...</p>
        </div>
      ) : (
        <>
          <MapContainer center={defaultCenter} zoom={12} className="h-full w-full" scrollWheelZoom>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <FitBounds rooms={roomsWithLocation} userLocation={userLocation} />

            {userLocation && (
              <>
                <Marker position={userLocation} icon={userIcon}>
                  <Popup>You are here</Popup>
                </Marker>
                <Circle center={userLocation} radius={radiusKm * 1000} pathOptions={{ color: '#0ea5e9', fillOpacity: 0.08 }} />
              </>
            )}

            {roomsWithLocation.map((room) => {
              const position = [room.location.coordinates[1], room.location.coordinates[0]];
              return (
                <Marker
                  key={room._id}
                  position={position}
                  icon={roomIcon}
                  eventHandlers={{ click: () => setSelectedRoom(room) }}
                >
                  <Popup>
                    <div className="min-w-[220px]">
                      <Link to={`/rooms/${room._id}`} className="font-semibold text-airbnb-pink hover:underline block">
                        {room.title}
                      </Link>
                      <p className="text-sm text-airbnb-gray mt-1">Rs {room.price?.toLocaleString()}/mo • {room.roomType}</p>
                      <p className="text-xs text-airbnb-gray truncate">{room.address}</p>
                      {typeof room.distanceKm === 'number' && (
                        <p className="text-xs text-gray-500 mt-1">{room.distanceKm} km away</p>
                      )}
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {userLocation && selectedRoom?.location?.coordinates && (
              <Polyline
                positions={[
                  userLocation,
                  [selectedRoom.location.coordinates[1], selectedRoom.location.coordinates[0]]
                ]}
                pathOptions={{ color: '#FF385C', dashArray: '6, 8' }}
              />
            )}
          </MapContainer>

          <div className="absolute bottom-4 left-4 right-4 md:right-auto md:w-[360px] z-[500]">
            <div className="rounded-airbnb bg-white dark:bg-gray-800 shadow-card border border-airbnb-gray-light dark:border-gray-700 p-3 max-h-60 overflow-auto">
              <h2 className="text-sm font-semibold text-airbnb-black dark:text-gray-100 mb-2">
                {userLocation ? `Nearby rooms (${roomsWithLocation.length})` : `All rooms (${roomsWithLocation.length})`}
              </h2>
              <div className="space-y-2">
                {roomsWithLocation.slice(0, 8).map((room) => (
                  <button
                    key={room._id}
                    type="button"
                    onClick={() => setSelectedRoom(room)}
                    className="w-full text-left p-2 rounded-lg hover:bg-airbnb-gray-bg dark:hover:bg-gray-700"
                  >
                    <p className="text-sm font-medium text-airbnb-black dark:text-gray-100 truncate">{room.title}</p>
                    <p className="text-xs text-airbnb-gray dark:text-gray-300 truncate">{room.address}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
