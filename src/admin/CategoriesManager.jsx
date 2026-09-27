import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Edit2, Trash2, Plus, X, Loader2 } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import ImageWithFallback from '../components/ImageWithFallback';
import ImageUpload from './components/ImageUpload';

const CategoriesManager = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ slug: '', name: '', description: '', image_url: '', active: true });
  const [selectedFile, setSelectedFile] = useState(null);

  const { refreshData } = useAdmin();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.from('categories').select('*').order('name');
      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingId(category.id);
      setFormData({
        slug: category.slug || '',
        name: category.name || '',
        description: category.description || '',
        image_url: category.image_url || '',
        active: category.active !== false
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

      const { data: existingCat } = await supabase.from('categories').select('id').eq('slug', formattedSlug).single();
      if (existingCat && existingCat.id !== editingId) {
        throw new Error("A category with this slug already exists.");
      }

      let finalImageUrl = formData.image_url.trim();

      if (selectedFile) {
        if (!selectedFile.type.match(/^image\/(jpeg|png|webp)$/)) {
          throw new Error("Only JPG, PNG, and WEBP images are allowed.");
        }
        if (selectedFile.size > 5 * 1024 * 1024) {
          throw new Error("Image size must be less than 5MB.");
        }

        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `categories/${fileName}`;
        
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
        const { error } = await supabase.from('categories').update(finalData).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('categories').insert([finalData]);
        if (error) throw error;
      }

      if (selectedFile && formData.image_url && formData.image_url.includes('product-images/')) {
        const oldPath = formData.image_url.split('product-images/')[1];
        if (oldPath && !oldPath.includes('http')) {
          await supabase.storage.from('product-images').remove([oldPath]);
        }
      }

      await fetchCategories();
      await refreshData();
      handleCloseModal();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    setIsLoading(true);
    setError(null);
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
      await fetchCategories();
      await refreshData();
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Manage Categories</h1>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-wine text-white px-4 py-2 rounded-lg font-medium hover:bg-wine/90 flex items-center shadow-sm"
        >
          <Plus size={20} className="mr-2" /> Add Category
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
              <th className="px-6 py-4 font-medium text-gray-600">ID / Slug</th>
              <th className="px-6 py-4 font-medium text-gray-600">Label</th>
              <th className="px-6 py-4 font-medium text-gray-600">Description</th>
              <th className="px-6 py-4 font-medium text-gray-600">Status</th>
              <th className="px-6 py-4 font-medium text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories.map(category => (
              <tr key={category.id} className="hover:bg-gray-50/50">
                <td className="px-6 py-4 text-gray-500 text-sm font-mono">{category.slug}</td>
                <td className="px-6 py-4 flex items-center space-x-4">
                  <ImageWithFallback 
                    src={category.image_url} 
                    alt={category.name} 
                    fallbackIdentifier={category.slug || category.name}
                    className="w-12 h-12 rounded object-cover border border-gray-200" 
                  />
                  <span className="font-medium text-gray-900">{category.name}</span>
                </td>
                <td className="px-6 py-4 text-gray-600 text-sm">{category.description}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${category.active !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {category.active !== false ? 'Active' : 'Hidden'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleOpenModal(category)} className="text-blue-600 hover:text-blue-800 mx-2 p-1">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => deleteCategory(category.id)} className="text-red-600 hover:text-red-800 mx-2 p-1">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {!isLoading && categories.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No categories found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">{editingId ? 'Edit Category' : 'Add Category'}</h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                <input required type="text" name="slug" value={formData.slug} onChange={handleChange} placeholder="e.g. chocolate-bouquets" className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-wine/50" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Label *</label>
                <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-wine/50" />
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
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows="2" className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-wine/50"></textarea>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" name="active" checked={formData.active} onChange={handleChange} className="w-5 h-5 rounded border-gray-300 text-wine focus:ring-wine" />
                  <span className="text-sm font-medium text-gray-700">Status (Visible)</span>
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

export default CategoriesManager;
