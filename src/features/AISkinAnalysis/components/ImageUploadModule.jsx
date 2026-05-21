import React from 'react';
import { Upload, X } from 'lucide-react';

const ImageUploadModule = ({
  fileInputRef,
  imagePreview,
  onImageUpload,
  onRemoveImage,
  onBrowseFile
}) => {
  return (
    <>
      {!imagePreview ? (
        <div
          onClick={onBrowseFile}
          className="border-3 border-dashed border-[#C4A57B] rounded-xl p-8 text-center cursor-pointer hover:bg-[#FDF8F5] transition-colors"
        >
          <Upload className="w-12 h-12 text-[#C4A57B] mx-auto mb-3" />
          <p className="text-[#5D4037] font-semibold mb-2">Klik untuk upload foto</p>
          <p className="text-sm text-gray-500">atau drag & drop di sini</p>
          <p className="text-xs text-gray-400 mt-3">
            Maksimal 5MB • Format: JPG, PNG, WebP
          </p>
        </div>
      ) : (
        <div className="relative">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 border-2 border-blue-200">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-64 object-cover rounded-lg border border-blue-300 shadow-md"
            />
          </div>
          <button
            onClick={onRemoveImage}
            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={onImageUpload}
        className="hidden"
      />
    </>
  );
};

export default ImageUploadModule;
