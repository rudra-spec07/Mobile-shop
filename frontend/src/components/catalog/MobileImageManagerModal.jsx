import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import Spinner from '../common/Spinner';
import catalogService from '../../services/catalog.service';
import { Plus, Trash2, Star, Image as ImageIcon } from 'lucide-react';

const MobileImageManagerModal = ({ isOpen, onClose, mobile, onImagesUpdated }) => {
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form inputs
  const [imageUrl, setImageUrl] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [isPrimary, setIsPrimary] = useState(false);

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
      resetForm();
    }
  }, [isOpen, mobile]);

  const resetForm = () => {
    setImageUrl('');
    setSortOrder('0');
    setIsPrimary(false);
    setError('');
  };

  const handleAddImage = async (e) => {
    e.preventDefault();
    if (!imageUrl.trim()) {
      setError('Please provide a valid image URL');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await catalogService.addMobileImage(mobile.id, {
        imageUrl: imageUrl.trim(),
        sortOrder: Number(sortOrder) || 0,
        isPrimary: Boolean(isPrimary),
      });
      resetForm();
      await fetchImages();
      if (onImagesUpdated) onImagesUpdated();
    } catch (err) {
      setError(err.message || 'Failed to add image');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetPrimary = async (imageId) => {
    setError('');
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
        {/* Add Image Form */}
        <form onSubmit={handleAddImage} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4 text-blue-600" />
            Add Image by URL
          </h4>

          {error && (
            <div className="p-3 text-xs bg-red-50 text-red-600 border border-red-200 rounded-lg">
              {error}
            </div>
          )}

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

            <Button variant="primary" size="sm" type="submit" isDisabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner size="sm" className="mr-1.5" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Image
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Existing Images Grid */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Attached Images ({images.length})
          </h4>

          {isLoading ? (
            <div className="py-8 flex justify-center text-slate-400">
              <Spinner size="md" />
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400 border border-slate-200 border-dashed rounded-xl">
              No images added for this mobile yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto p-1">
              {images.map((img) => (
                <div
                  key={img.id}
                  className={`p-3 bg-white rounded-xl border flex items-center justify-between gap-3 shadow-xs transition-all ${
                    img.isPrimary ? 'border-blue-500 ring-2 ring-blue-500/10' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <img
                      src={img.imageUrl}
                      alt="Thumbnail"
                      className="w-12 h-12 object-contain bg-slate-50 rounded-lg p-1 border border-slate-100 flex-shrink-0"
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
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default MobileImageManagerModal;
