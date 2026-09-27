import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Edit2, Trash2, Plus, X, Loader2 } from 'lucide-react';
import ImageWithFallback from '../components/ImageWithFallback';
import ImageUpload from './components/ImageUpload';

const OccasionsManager = () => {
  const [occasions, setOccasions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ slug: '', name: '', description: '', image_url: '', active: true });
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetchOccasions();
  }, []);

  const fetchOccasions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.from('occasions').select('*').order('name');
      if (error) throw error;
      setOccasions(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (occasion = null) => {
    if (occasion) {
      setEditingId(occasion.id);
      setFormData({
        slug: occasion.slug || '',
        name: occasion.name || '',
        description: occasion.description || '',
        image_url: occasion.image_url || '',
        active: occasion.active !== false
      });
    } else {
      setEditingId(null);
      setFormData({ slug: '', name: '', description: '', image_url: '', active: true });
    }
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setSelectedFile(null);
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
      const formattedSlug = formData.slug.trim().toLowerCase().replace(/\s+/g, '-');
      if (!formattedSlug) throw new Error("Slug is required");

      let finalImageUrl = formData.image_url.trim();

      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `occasions/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, selectedFile);
          
        if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

        const { data: publicUrlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);
          
        finalImageUrl = publicUrlData.publicUrl;
      }

      const finalData = { ...formData, slug: formattedSlug, image_url: finalImageUrl };

      if (editingId) {
        const { error } = await supabase.from('occasions').update(finalData).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('occasions').insert([finalData]);
        if (error) throw error;
      }

      // Cleanup old image if replaced
      if (selectedFile && formData.image_url && formData.image_url.includes('product-images/')) {
        const oldPath = formData.image_url.split('product-images/')[1];
        if (oldPath && !oldPath.includes('http')) {
          await supabase.storage.from('product-images').remove([oldPath]);
        }
      }

      await fetchOccasions();
      handleCloseModal();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteOccasion = async (id) => {
    if (!window.confirm('Are you sure you want to delete this occasion?')) return;
    setIsLoading(true);
    setError(null);
    try {
      const { error } = await supabase.from('occasions').delete().eq('id', id);
      if (error) throw error;
      await fetchOccasions();
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Manage Occasions</h1>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-wine text-white px-4 py-2 rounded-lg font-medium hover:bg-wine/90 flex items-center shadow-sm"
        >
          <Plus size={20} className="mr-2" /> Add Occasion
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
              <th className="px-6 py-4 font-medium text-gray-600">Occasion</th>
              <th className="px-6 py-4 font-medium text-gray-600">ID / Slug</th>
              <th className="px-6 py-4 font-medium text-gray-600">Description</th>
              <th className="px-6 py-4 font-medium text-gray-600">Status</th>
              <th className="px-6 py-4 font-medium text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {occasions.map(occasion => (
              <tr key={occasion.id} className="hover:bg-gray-50/50">
                <td className="px-6 py-4 flex items-center space-x-4">
                  <ImageWithFallback 
                    src={occasion.image_url} 
                    alt={occasion.name} 
                    fallbackIdentifier={occasion.slug || occasion.name}
                    className="w-12 h-12 rounded object-cover border border-gray-200" 
                  />
                  <span className="font-medium text-gray-900">{occasion.name}</span>
                </td>
                <td className="px-6 py-4 text-gray-500 text-sm font-mono">{occasion.slug}</td>
                <td className="px-6 py-4 text-gray-600 text-sm">{occasion.description}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${occasion.active !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {occasion.active !== false ? 'Active' : 'Hidden'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleOpenModal(occasion)} className="text-blue-600 hover:text-blue-800 mx-2 p-1">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => deleteOccasion(occasion.id)} className="text-red-600 hover:text-red-800 mx-2 p-1">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {!isLoading && occasions.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No occasions found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">{editingId ? 'Edit Occasion' : 'Add Occasion'}</h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                <input required type="text" name="slug" value={formData.slug} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-wine/50" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Occasion Label *</label>
                <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-wine/50" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows="2" className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-wine/50"></textarea>
              </div>

              <div>
                <ImageUpload 
                  currentImage={formData.image_url} 
                  fallbackIdentifier={formData.slug || formData.name}
                  onImageSelect={(file) => setSelectedFile(file)}
                  onClear={() => {
                    setSelectedFile(null);
                    setFormData({ ...formData, image_url: '' });
                  }}
                />
              </div>

              <div className="border-t border-gray-100 pt-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" name="active" checked={formData.active} onChange={handleChange} className="w-5 h-5 rounded border-gray-300 text-wine focus:ring-wine" />
                  <span className="text-sm font-medium text-gray-700">Available (Visible)</span>
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

export default OccasionsManager;
