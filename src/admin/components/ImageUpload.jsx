import React, { useState, useRef } from 'react';
import { UploadCloud, X, Image as ImageIcon } from 'lucide-react';
import ImageWithFallback from '../../components/ImageWithFallback';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const ImageUpload = ({ 
  currentImage, 
  fallbackIdentifier, 
  onImageSelect, 
  onClear 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    setError(null);
    if (!file) return false;
    
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Invalid file type. Only JPG, PNG, and WEBP are allowed.');
      return false;
    }
    
    if (file.size > MAX_FILE_SIZE) {
      setError('File is too large. Maximum size is 5 MB.');
      return false;
    }
    
    return true;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (validateFile(file)) {
      createPreview(file);
      onImageSelect(file);
    } else {
      e.target.value = ''; // Reset input
    }
  };

  const createPreview = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (validateFile(file)) {
      createPreview(file);
      onImageSelect(file);
    }
  };

  const handleClear = () => {
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClear();
  };

  const triggerSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">Image (optional)</label>
      
      {/* Hidden file input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept=".jpg,.jpeg,.png,.webp" 
        className="hidden" 
      />

      {(preview || currentImage) ? (
        <div className="relative rounded-xl border border-gray-200 overflow-hidden group bg-gray-50">
          <ImageWithFallback 
            src={preview || currentImage} 
            alt="Upload preview"
            fallbackIdentifier={fallbackIdentifier}
            className="w-full h-48 object-cover"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 backdrop-blur-sm text-center">
            {preview && fileInputRef.current?.files?.[0] && (
              <div className="mb-4 text-white">
                <p className="font-medium text-sm truncate max-w-xs">{fileInputRef.current.files[0].name}</p>
                <p className="text-xs text-white/80">{(fileInputRef.current.files[0].size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            )}
            <div className="flex items-center gap-4">
              <button 
                type="button" 
                onClick={triggerSelect}
                className="px-4 py-2 bg-white text-gray-900 text-sm font-medium rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
              >
                Replace
              </button>
              <button 
                type="button" 
                onClick={handleClear}
                className="p-2 bg-red-600 text-white rounded-lg shadow-sm hover:bg-red-700 transition-colors"
                title="Remove image"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerSelect}
          className={`
            w-full h-48 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors
            ${isDragging ? 'border-wine bg-wine/5' : 'border-gray-300 hover:border-wine/50 hover:bg-gray-50'}
            ${error ? 'border-red-300 bg-red-50' : ''}
          `}
        >
          <div className={`p-3 rounded-full mb-3 ${isDragging ? 'bg-wine/10 text-wine' : 'bg-gray-100 text-gray-500'}`}>
            <UploadCloud size={24} />
          </div>
          <p className="text-sm font-medium text-gray-900 mb-1">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-gray-500">
            JPG, PNG or WEBP (max. 5MB)
          </p>
        </div>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-600 font-medium flex items-center gap-1">
          <X size={14} /> {error}
        </p>
      )}
      
      {!preview && !currentImage && !error && (
        <div className="mt-3 bg-gray-50 rounded-lg p-3 border border-gray-100 flex gap-3 items-start">
          <ImageIcon className="text-gray-400 shrink-0 mt-0.5" size={16} />
          <p className="text-xs text-gray-500 leading-relaxed">
            If left empty, a smart fallback image will be generated automatically based on the item's name or category.
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
