import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Edit2, Trash2, Plus, X, Loader2 } from 'lucide-react';
import ImageWithFallback from '../components/ImageWithFallback';
import ImageUpload from './components/ImageUpload';

const ProductsManager = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [occasions, setOccasions] = useState([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '', price: '', category_id: '', image_url: '', occasions: [], featured: false, available: true
  });
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch categories
      const { data: catData, error: catError } = await supabase.from('categories').select('*');
      if (catError) throw catError;
      setCategories(catData || []);

      // Fetch occasions
      const { data: occData, error: occError } = await supabase.from('occasions').select('*');
      if (occError) throw occError;
      setOccasions(occData || []);

      // Fetch products with their occasion relations
      const { data: prodData, error: prodError } = await supabase
        .from('products')
        .select(`
          *,
          product_occasions (
            occasion_id
          )
        `)
        .order('created_at', { ascending: false });
      if (prodError) throw prodError;
      
      // Transform product_occasions into an array of occasion IDs for easier UI mapping
      const formattedProducts = (prodData || []).map(p => ({
        ...p,
        occasions: p.product_occasions ? p.product_occasions.map(po => po.occasion_id) : []
      }));
      
      setProducts(formattedProducts);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingId(product.id);
      setFormData({
        title: product.title || '',
        price: product.price || '',
        category_id: product.category_id || product.collection || '', // fallback to collection if needed
        image_url: product.image_url || '',
        occasions: product.occasions || [],
        featured: product.featured || false,
        available: product.available !== false
      });
    } else {
      setEditingId(null);
      setFormData({ title: '', price: '', category_id: '', image_url: '', occasions: [], featured: false, available: true });
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
    if (type === 'checkbox') {
      if (name === 'occasions') {
        const newOccasions = checked 
          ? [...formData.occasions, value]
          : formData.occasions.filter(o => o !== value);
        setFormData({ ...formData, occasions: newOccasions });
      } else {
        setFormData({ ...formData, [name]: checked });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      let finalImageUrl = formData.image_url.trim();

      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `products/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, selectedFile);
          
        if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

        const { data: publicUrlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);
          
        finalImageUrl = publicUrlData.publicUrl;
      }

      const productPayload = {
        title: formData.title,
        price: formData.price,
        category_id: formData.category_id,
        image_url: finalImageUrl,
        featured: formData.featured,
        available: formData.available
      };

      let productId = editingId;

      if (editingId) {
        // Update product
        const { error: updateError } = await supabase.from('products').update(productPayload).eq('id', editingId);
        if (updateError) throw updateError;
        
        // Delete existing relations
        const { error: delError } = await supabase.from('product_occasions').delete().eq('product_id', editingId);
        if (delError) throw delError;
      } else {
        // Insert product
        const { data, error: insertError } = await supabase.from('products').insert([productPayload]).select();
        if (insertError) throw insertError;
        productId = data[0].id;
      }

      // Insert new relations
      if (formData.occasions.length > 0) {
        const occasionPayload = formData.occasions.map(occId => ({
          product_id: productId,
          occasion_id: occId
        }));
        const { error: relError } = await supabase.from('product_occasions').insert(occasionPayload);
        if (relError) throw relError;
      }

      // Cleanup old image if replaced
      if (selectedFile && formData.image_url && formData.image_url.includes('product-images/')) {
        const oldPath = formData.image_url.split('product-images/')[1];
        if (oldPath && !oldPath.includes('http')) {
          await supabase.storage.from('product-images').remove([oldPath]);
        }
      }

      await fetchData();
      handleCloseModal();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    setIsLoading(true);
    setError(null);
    try {
      // product_occasions might delete on cascade, but let's be explicit if not configured
      await supabase.from('product_occasions').delete().eq('product_id', id);
      
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      await fetchData();
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Manage Products</h1>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-wine text-white px-4 py-2 rounded-lg font-medium hover:bg-wine/90 flex items-center shadow-sm"
        >
          <Plus size={20} className="mr-2" /> Add Product
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
              <th className="px-6 py-4 font-medium text-gray-600">Product</th>
              <th className="px-6 py-4 font-medium text-gray-600">Category</th>
              <th className="px-6 py-4 font-medium text-gray-600">Price</th>
              <th className="px-6 py-4 font-medium text-gray-600">Status</th>
              <th className="px-6 py-4 font-medium text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map(product => {
              const cat = categories.find(c => c.id === product.category_id || c.id === product.collection);
              return (
                <tr key={product.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 flex items-center space-x-4">
                    <ImageWithFallback 
                      src={product.image_url} 
                      alt={product.title} 
                      fallbackIdentifier={cat?.name || product.title}
                      className="w-12 h-12 rounded object-cover border border-gray-200" 
                    />
                    <span className="font-medium text-gray-900">{product.title}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{cat ? cat.name : product.category_id}</td>
                  <td className="px-6 py-4 text-gray-900 font-medium">{product.price}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${product.available !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {product.available !== false ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleOpenModal(product)} className="text-blue-600 hover:text-blue-800 mx-2 p-1">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => deleteProduct(product.id)} className="text-red-600 hover:text-red-800 mx-2 p-1">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              )
            })}
            {!isLoading && products.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No products found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Title *</label>
                  <input required type="text" name="title" value={formData.title} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-wine/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                  <input required type="text" name="price" value={formData.price} onChange={handleChange} placeholder="₹999" className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-wine/50" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select required name="category_id" value={formData.category_id} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-wine/50">
                    <option value="">Select a category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <ImageUpload 
                    currentImage={formData.image_url} 
                    fallbackIdentifier={categories.find(c => c.id === formData.category_id)?.name || formData.title}
                    onImageSelect={(file) => setSelectedFile(file)}
                    onClear={() => {
                      setSelectedFile(null);
                      setFormData({ ...formData, image_url: '' });
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Occasion Tags</label>
                <div className="flex flex-wrap gap-3">
                  {occasions.map(occ => (
                    <label key={occ.id} className="inline-flex items-center space-x-2 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg cursor-pointer">
                      <input 
                        type="checkbox" 
                        name="occasions" 
                        value={occ.id} 
                        checked={formData.occasions.includes(occ.id)} 
                        onChange={handleChange}
                        className="rounded text-wine focus:ring-wine"
                      />
                      <span className="text-sm text-gray-700">{occ.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex space-x-6 border-t border-gray-100 pt-6">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" name="featured" checked={formData.featured} onChange={handleChange} className="w-5 h-5 rounded border-gray-300 text-wine focus:ring-wine" />
                  <span className="text-sm font-medium text-gray-700">Featured Product</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" name="available" checked={formData.available} onChange={handleChange} className="w-5 h-5 rounded border-gray-300 text-wine focus:ring-wine" />
                  <span className="text-sm font-medium text-gray-700">Available (Visible)</span>
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100">
                <button type="button" onClick={handleCloseModal} disabled={isSaving} className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50">Cancel</button>
                <button type="submit" disabled={isSaving} className="px-5 py-2.5 bg-wine text-white rounded-lg font-medium hover:bg-wine/90 flex items-center disabled:opacity-50">
                  {isSaving && <Loader2 size={16} className="mr-2 animate-spin" />} Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsManager;
