import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { roomsApi } from '../api/services';

export default function RoomForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { isOwner, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadRoom, setLoadRoom] = useState(isEdit);
  const [form, setForm] = useState({
    title: '',
    price: '',
    deposit: '',
    description: '',
    address: '',
    pincode: '',
    roomType: 'Single',
    gender: 'Any',
    contactNumber: '',
    facilities: '',
    foodType: 'Both',
    isAC: 'false',
    distanceToWorkOrCollegeKm: ''
  });
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    if (!authLoading && !isOwner) {
      navigate('/');
      return;
    }
    if (!isEdit) return;

    roomsApi
      .getFullById(id)
      .then(({ data }) => {
        const r = data.data;
        setForm({
          title: r.title || '',
          price: r.price ?? '',
          deposit: r.deposit ?? '',
          description: r.description || '',
          address: r.address || '',
          pincode: r.pincode || '',
          roomType: r.roomType || 'Single',
          gender: r.gender || 'Any',
          contactNumber: r.contactNumber || '',
          facilities: Array.isArray(r.facilities) ? r.facilities.join(', ') : '',
          foodType: r.foodType || 'Both',
          isAC: r.isAC ? 'true' : 'false',
          distanceToWorkOrCollegeKm: r.distanceToWorkOrCollegeKm ?? ''
        });
      })
      .catch(() => navigate('/dashboard'))
      .finally(() => setLoadRoom(false));
  }, [id, isEdit, isOwner, authLoading, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      ...form,
      price: Number(form.price) || 0,
      deposit: Number(form.deposit) || 0,
      facilities: form.facilities ? form.facilities.split(',').map((s) => s.trim()).filter(Boolean) : [],
      isAC: form.isAC === 'true',
      distanceToWorkOrCollegeKm: Number(form.distanceToWorkOrCollegeKm) || 0
    };

    const formData = new FormData();
    Object.keys(payload).forEach((k) => {
      if (payload[k] !== '' && payload[k] != null) formData.append(k, payload[k]);
    });
    if (imageFile) {
      formData.append('images', imageFile);
    }

    const promise = isEdit ? roomsApi.update(id, formData) : roomsApi.create(formData);
    promise
      .then(() => navigate('/dashboard'))
      .catch(() => setLoading(false))
      .finally(() => setLoading(false));
  };

  if (authLoading || (isEdit && loadRoom)) {
    return (
      <div className="max-w-xl mx-auto px-4 py-8">
        <div className="h-8 bg-airbnb-gray-light rounded animate-pulse w-48 mb-6" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="h-12 bg-airbnb-gray-light rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!isOwner) return null;

  const fieldClass = 'w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-white transition-colors duration-300';

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 bg-white dark:bg-gray-900 text-airbnb-black dark:text-gray-100 min-h-screen transition-colors duration-300">
      <h1 className="text-2xl font-bold mb-6">{isEdit ? 'Edit listing' : 'New listing'}</h1>
      <form onSubmit={handleSubmit} className="rounded-airbnb bg-white dark:bg-gray-800 shadow-card p-6 space-y-4 transition-colors duration-300">
        <div>
          <label className="block text-sm font-medium mb-1">Title *</label>
          <input name="title" value={form.title} onChange={handleChange} required className={fieldClass} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Price/mo (Rs) *</label>
            <input name="price" type="number" min="0" value={form.price} onChange={handleChange} required className={fieldClass} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Deposit (Rs)</label>
            <input name="deposit" type="number" min="0" value={form.deposit} onChange={handleChange} className={fieldClass} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={3} className={fieldClass} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Address *</label>
          <input name="address" value={form.address} onChange={handleChange} required className={fieldClass} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Pincode *</label>
            <input name="pincode" value={form.pincode} onChange={handleChange} required className={fieldClass} />
          </div>
          <div />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Room type *</label>
            <select name="roomType" value={form.roomType} onChange={handleChange} className={fieldClass}>
              <option value="Single">Single</option>
              <option value="Double">Double</option>
              <option value="Triple">Triple</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Gender</label>
            <select name="gender" value={form.gender} onChange={handleChange} className={fieldClass}>
              <option value="Any">Any</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Contact number *</label>
          <input name="contactNumber" value={form.contactNumber} onChange={handleChange} required className={fieldClass} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Facilities (comma-separated)</label>
          <input name="facilities" value={form.facilities} onChange={handleChange} placeholder="WiFi, AC, Laundry" className={fieldClass} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">AC</label>
            <select name="isAC" value={form.isAC} onChange={handleChange} className={fieldClass}>
              <option value="false">Non-AC</option>
              <option value="true">AC</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Food Type</label>
            <select name="foodType" value={form.foodType} onChange={handleChange} className={fieldClass}>
              <option value="Both">Both</option>
              <option value="Veg">Veg</option>
              <option value="Non-Veg">Non-Veg</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Distance to college/work (km)</label>
            <input
              name="distanceToWorkOrCollegeKm"
              type="number"
              min="0"
              value={form.distanceToWorkOrCollegeKm}
              onChange={handleChange}
              className={fieldClass}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Room image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            className={fieldClass}
          />
          <p className="text-xs text-airbnb-gray dark:text-gray-300 mt-1">Upload one image (optional).</p>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-full bg-airbnb-pink text-white py-3 font-medium hover:bg-airbnb-pink-hover disabled:opacity-50 transition-colors duration-300"
          >
            {loading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-4 py-3 rounded-full border border-gray-300 dark:border-gray-700 transition-colors duration-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
