import React, { useState, useEffect, useRef } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import Spinner from '../common/Spinner';
import catalogService from '../../services/catalog.service';
import { getImageUrl } from '../../utils/image';
import { Plus, Trash2, Star, Image as ImageIcon, Upload, Link as LinkIcon, CheckCircle2, AlertCircle, X } from 'lucide-react';

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const MobileImageManagerModal = ({ isOpen, onClose, mobile, onImagesUpdated }) => {
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'url'

  // URL Mode State
  const [imageUrl, setImageUrl] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [isPrimary, setIsPrimary] = useState(false);
  const [isSubmittingUrl, setIsSubmittingUrl] = useState(false);

  // Local File Upload Mode State
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const fetchImages = async () => {
    if (!mobile?.id) return;
    setIsLoading(true);
    setError('');
    try {
      const res = await catalogService.getMobileImages(mobile.id);
      setImages(res.data?.images || []);
    } catch (err) {
      setError(err.message || 'Failed to load mobile images');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && mobile?.id) {
      fetchImages();
      resetAllForms();
    }
    return () => {
      // Cleanup Object URLs on unmount
      selectedFiles.forEach((fileItem) => {
        if (fileItem.previewUrl) {
          URL.revokeObjectURL(fileItem.previewUrl);
        }
      });
    };
  }, [isOpen, mobile]);

  const resetAllForms = () => {
    setImageUrl('');
    setSortOrder('0');
    setIsPrimary(false);
    setError('');
    setSuccessMessage('');

    // Cleanup existing object URLs
    selectedFiles.forEach((fileItem) => {
      if (fileItem.previewUrl) {
        URL.revokeObjectURL(fileItem.previewUrl);
      }
    });
    setSelectedFiles([]);
  };

  // Process File Selection & Validation
  const processFiles = (files) => {
    setError('');
    setSuccessMessage('');
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSizeBytes = 5 * 1024 * 1024; // 5MB

    const newFileItems = [];
    let validationError = '';

    Array.from(files).forEach((file) => {
      if (!validTypes.includes(file.type.toLowerCase())) {
        validationError = 'Only JPG, PNG and WEBP images are supported.';
        return;
      }
      if (file.size > maxSizeBytes) {
        validationError = 'Image size must be 5 MB or less.';
        return;
      }

      newFileItems.push({
        id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        file,
        name: file.name,
        size: formatFileSize(file.size),
        previewUrl: URL.createObjectURL(file),
      });
    });

    if (validationError) {
      setError(validationError);
    }

    if (newFileItems.length > 0) {
      setSelectedFiles((prev) => [...prev, ...newFileItems]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      e.target.value = ''; // Reset input to allow selecting same file again
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveSelectedFile = (idToRemove) => {
    setSelectedFiles((prev) => {
      const itemToRemove = prev.find((item) => item.id === idToRemove);
      if (itemToRemove && itemToRemove.previewUrl) {
        URL.revokeObjectURL(itemToRemove.previewUrl);
      }
      return prev.filter((item) => item.id !== idToRemove);
    });
  };

  // Convert File to Base64 Data URL helper
  const readFileAsDataURL = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  // Batch Upload Selected Local Files
  const handleUploadSelectedFiles = async () => {
    if (selectedFiles.length === 0) return;
    setIsUploading(true);
    setError('');
    setSuccessMessage('');

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const item = selectedFiles[i];
        const base64DataUrl = await readFileAsDataURL(item.file);
        await catalogService.addMobileImage(mobile.id, {
          imageUrl: base64DataUrl,
          sortOrder: i,
          isPrimary: images.length === 0 && i === 0,
        });
      }

      // Cleanup preview URLs
      selectedFiles.forEach((item) => {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      });
      setSelectedFiles([]);
      setSuccessMessage('Images uploaded successfully.');

      await fetchImages();
      if (onImagesUpdated) onImagesUpdated();
    } catch (err) {
      setError(err.message || 'Unable to upload images. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Add Image by URL Handler
  const handleAddImageUrl = async (e) => {
    e.preventDefault();
    if (!imageUrl.trim()) {
      setError('Please provide a valid image URL');
      return;
    }

    setIsSubmittingUrl(true);
    setError('');
    setSuccessMessage('');

    try {
      await catalogService.addMobileImage(mobile.id, {
        imageUrl: imageUrl.trim(),
        sortOrder: Number(sortOrder) || 0,
        isPrimary: Boolean(isPrimary),
      });
      setImageUrl('');
      setSortOrder('0');
      setIsPrimary(false);
      setSuccessMessage('Image added successfully.');

      await fetchImages();
      if (onImagesUpdated) onImagesUpdated();
    } catch (err) {
      setError(err.message || 'Failed to add image');
    } finally {
      setIsSubmittingUrl(false);
    }
  };

  const handleSetPrimary = async (imageId) => {
    setError('');
    setSuccessMessage('');
    try {
      await catalogService.setPrimaryImage(mobile.id, imageId);
      await fetchImages();
      if (onImagesUpdated) onImagesUpdated();
    } catch (err) {
      setError(err.message || 'Failed to set primary image');
    }
  };

  const handleDeleteImage = async (imageId) => {
    setError('');
    setSuccessMessage('');
    try {
      await catalogService.deleteMobileImage(mobile.id, imageId);
      await fetchImages();
      if (onImagesUpdated) onImagesUpdated();
    } catch (err) {
      setError(err.message || 'Failed to delete image');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Image Gallery: ${mobile?.name || 'Mobile'}`}
      size="lg"
    >
      <div className="space-y-6">
        {/* Feedback Banners */}
        {error && (
          <div className="p-3 text-xs bg-red-50 text-red-600 border border-red-200 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Tab Selection */}
        <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setActiveTab('upload');
              setError('');
              setSuccessMessage('');
            }}
            className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'upload'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload From Computer</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('url');
              setError('');
              setSuccessMessage('');
            }}
            className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'url'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Add Image URL</span>
          </button>
        </div>

        {/* Tab 1: Local Computer File Upload */}
        {activeTab === 'upload' && (
          <div className="space-y-4 bg-slate-50/80 p-4 rounded-2xl border border-slate-200">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Drag and Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                isDragOver
                  ? 'border-blue-500 bg-blue-50/60 scale-[1.01]'
                  : 'border-slate-300 hover:border-blue-400 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-800">
                Drag & drop mobile images here, or <span className="text-blue-600 hover:underline">browse</span>
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Supports JPG, PNG, WEBP • Max 5 MB per image
              </p>
              <div className="mt-3">
                <Button variant="outline" size="sm" type="button" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                  Choose Images From Computer
                </Button>
              </div>
            </div>

            {/* Selected File Previews */}
            {selectedFiles.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-slate-700">
                    Selected Images ({selectedFiles.length})
                  </h5>
                  <button
                    type="button"
                    onClick={() => {
                      selectedFiles.forEach((item) => { if (item.previewUrl) URL.revokeObjectURL(item.previewUrl); });
                      setSelectedFiles([]);
                    }}
                    className="text-[11px] text-slate-400 hover:text-red-600 font-medium"
                  >
                    Clear All
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-56 overflow-y-auto pr-1">
                  {selectedFiles.map((fileItem) => (
                    <div
                      key={fileItem.id}
                      className="p-2 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-3 shadow-xs"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <img
                          src={fileItem.previewUrl}
                          alt={fileItem.name}
                          className="w-12 h-12 object-cover rounded-lg border border-slate-100 flex-shrink-0"
                        />
                        <div className="overflow-hidden">
                          <p className="text-xs font-bold text-slate-800 truncate">{fileItem.name}</p>
                          <p className="text-[10px] text-slate-400 font-medium mt-0.5">{fileItem.size}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveSelectedFile(fileItem.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                        title="Remove from selection"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full justify-center bg-blue-600 hover:bg-blue-700 font-bold"
                    onClick={handleUploadSelectedFiles}
                    isDisabled={isUploading}
                  >
                    {isUploading ? (
                      <>
                        <Spinner size="sm" className="mr-2" />
                        Uploading Selected Images...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-1.5" />
                        Upload {selectedFiles.length} Image{selectedFiles.length > 1 ? 's' : ''} to Mobile Listing
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Add Image by URL */}
        {activeTab === 'url' && (
          <form onSubmit={handleAddImageUrl} className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <LinkIcon className="w-4 h-4 text-blue-600" />
              Add Image using Image URL
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <Input
                  label="Image URL *"
                  placeholder="https://example.com/mobile-image.png"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  required
                />
              </div>
              <Input
                label="Sort Order"
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={isPrimary}
                  onChange={(e) => setIsPrimary(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <span>Set as Primary Image</span>
              </label>

              <Button variant="primary" size="sm" type="submit" isDisabled={isSubmittingUrl}>
                {isSubmittingUrl ? (
                  <>
                    <Spinner size="sm" className="mr-1.5" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Image URL
                  </>
                )}
              </Button>
            </div>
          </form>
        )}

        {/* Existing Attached Mobile Gallery */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Attached Images Gallery ({images.length})
          </h4>

          {isLoading ? (
            <div className="py-8 flex justify-center text-slate-400">
              <Spinner size="md" />
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400 border border-slate-200 border-dashed rounded-2xl">
              No images added for this mobile yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto p-1">
              {images.map((img) => {
                const formattedSrc = getImageUrl(img.imageUrl);
                return (
                  <div
                    key={img.id}
                    className={`p-3 bg-white rounded-xl border flex items-center justify-between gap-3 shadow-xs transition-all ${
                      img.isPrimary ? 'border-blue-500 ring-2 ring-blue-500/10' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <img
                        src={formattedSrc}
                        alt="Thumbnail"
                        className="w-12 h-12 object-contain bg-slate-50 rounded-lg p-1 border border-slate-100 flex-shrink-0"
                        onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
                      />
                      <div className="overflow-hidden">
                        <div className="flex items-center gap-1.5">
                          {img.isPrimary ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              <Star className="w-3 h-3 fill-current" /> Primary
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium text-slate-400">
                              Order: {img.sortOrder}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 truncate mt-1">{img.imageUrl}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {!img.isPrimary && (
                        <button
                          onClick={() => handleSetPrimary(img.id)}
                          className="px-2 py-1 text-[10px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
                          title="Set Primary Image"
                        >
                          Set Primary
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteImage(img.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Image"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default MobileImageManagerModal;
