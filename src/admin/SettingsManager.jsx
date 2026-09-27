import React, { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import { Save, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const SettingsManager = () => {
  const { settings, updateSettings, refreshData } = useAdmin();
  const [formData, setFormData] = useState(settings);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setSaved(false);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      const payload = {
        id: 1, // Using single row pattern
        business_name: formData.businessName,
        tagline: formData.tagline,
        instagram_handle: formData.instagramHandle,
        whatsapp_number: formData.whatsappNumber,
        hero_title: formData.heroTitle,
        hero_description: formData.heroDescription,
        about_text: formData.aboutText
      };

      const { error: upsertError } = await supabase.from('website_settings').upsert([payload]);
      
      if (upsertError) throw upsertError;

      updateSettings(formData);
      if (refreshData) await refreshData();
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Website Settings</h1>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-8">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Business Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
              <input type="text" name="businessName" value={formData.businessName} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-wine/50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
              <input type="text" name="tagline" value={formData.tagline} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-wine/50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Instagram Handle</label>
              <input type="text" name="instagramHandle" value={formData.instagramHandle} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-wine/50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
              <input type="text" name="whatsappNumber" value={formData.whatsappNumber} onChange={handleChange} placeholder="e.g. 919876543210 (leave empty for demo)" className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-wine/50" />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Homepage Content</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hero Title</label>
              <input type="text" name="heroTitle" value={formData.heroTitle} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-wine/50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hero Description</label>
              <textarea name="heroDescription" value={formData.heroDescription} onChange={handleChange} rows="2" className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-wine/50"></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">About Section Text</label>
              <textarea name="aboutText" value={formData.aboutText} onChange={handleChange} rows="3" className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-wine/50"></textarea>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-4 pt-4">
          {saved && <span className="text-green-600 font-medium">Settings saved successfully!</span>}
          <button type="submit" disabled={isSaving} className="bg-wine text-white px-6 py-3 rounded-lg font-medium hover:bg-wine/90 flex items-center shadow-sm disabled:opacity-50">
            {isSaving ? <Loader2 size={20} className="mr-2 animate-spin" /> : <Save size={20} className="mr-2" />} 
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsManager;
