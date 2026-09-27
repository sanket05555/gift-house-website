import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Edit2, Trash2, Plus, X, Star, Loader2 } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

const TestimonialsManager = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', location: '', rating: 5, text: '', visible: true });

  const { refreshData } = useAdmin();

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.from('testimonials').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setTestimonials(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (testimonial = null) => {
    if (testimonial) {
      setEditingId(testimonial.id);
      setFormData({
        name: testimonial.name || '',
        location: testimonial.location || '',
        rating: testimonial.rating || 5,
        text: testimonial.text || '',
        visible: testimonial.visible !== false
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', location: '', rating: 5, text: '', visible: true });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      const ratingInt = parseInt(formData.rating, 10);
      if (isNaN(ratingInt) || ratingInt < 1 || ratingInt > 5) {
        throw new Error("Rating must be an integer between 1 and 5.");
      }

      const finalData = { ...formData, rating: ratingInt, name: formData.name.trim(), location: formData.location.trim(), text: formData.text.trim() };

      if (editingId) {
        const { error } = await supabase.from('testimonials').update(finalData).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('testimonials').insert([finalData]);
        if (error) throw error;
      }
      await fetchTestimonials();
      await refreshData();
      handleCloseModal();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteTestimonial = async (id) => {
    if (!window.confirm('Are you sure you want to delete this testimonial?')) return;
    setIsLoading(true);
    setError(null);
    try {
      const { error } = await supabase.from('testimonials').delete().eq('id', id);
      if (error) throw error;
      await fetchTestimonials();
      await refreshData();
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Manage Testimonials</h1>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-wine text-white px-4 py-2 rounded-lg font-medium hover:bg-wine/90 flex items-center shadow-sm"
        >
          <Plus size={20} className="mr-2" /> Add Testimonial
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-100">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative min-h-[200px]">
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-wine animate-spin" />
          </div>
        )}
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-4 font-medium text-gray-600">Customer Name</th>
              <th className="px-6 py-4 font-medium text-gray-600">Location</th>
              <th className="px-6 py-4 font-medium text-gray-600">Rating</th>
              <th className="px-6 py-4 font-medium text-gray-600">Status</th>
              <th className="px-6 py-4 font-medium text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {testimonials.map(testimonial => (
              <tr key={testimonial.id} className="hover:bg-gray-50/50">
                <td className="px-6 py-4 font-medium text-gray-900">{testimonial.name}</td>
                <td className="px-6 py-4 text-gray-600">{testimonial.location}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={14} className={i < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} />
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${testimonial.visible !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {testimonial.visible !== false ? 'Active' : 'Hidden'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleOpenModal(testimonial)} className="text-blue-600 hover:text-blue-800 mx-2 p-1">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => deleteTestimonial(testimonial.id)} className="text-red-600 hover:text-red-800 mx-2 p-1">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {!isLoading && testimonials.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No testimonials found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">{editingId ? 'Edit Testimonial' : 'Add Testimonial'}</h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
                  <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-wine/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                  <input required type="text" name="location" value={formData.location} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-wine/50" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating (1-5) *</label>
                <input required type="number" min="1" max="5" name="rating" value={formData.rating} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-wine/50" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Review Text *</label>
                <textarea required name="text" value={formData.text} onChange={handleChange} rows="3" className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-wine/50"></textarea>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" name="visible" checked={formData.visible} onChange={handleChange} className="w-5 h-5 rounded border-gray-300 text-wine focus:ring-wine" />
                  <span className="text-sm font-medium text-gray-700">Visible on website</span>
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={handleCloseModal} disabled={isSaving} className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50">Cancel</button>
                <button type="submit" disabled={isSaving} className="px-5 py-2.5 bg-wine text-white rounded-lg font-medium hover:bg-wine/90 flex items-center disabled:opacity-50">
                  {isSaving && <Loader2 size={16} className="mr-2 animate-spin" />} Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestimonialsManager;
