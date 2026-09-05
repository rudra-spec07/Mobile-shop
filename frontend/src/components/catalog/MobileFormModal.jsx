import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import Spinner from '../common/Spinner';
import catalogService from '../../services/catalog.service';
import { Plus, Tag, Upload, X, Star, Trash2, RefreshCw, Check } from 'lucide-react';

const MobileFormModal = ({ isOpen, onClose, mobileToEdit = null, onSaved }) => {
  const isEditMode = Boolean(mobileToEdit?.id);

  const [brands, setBrands] = useState([]);
  const [isLoadingBrands, setIsLoadingBrands] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // Image CRUD State for Edit Mode
  const [existingImages, setExistingImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [confirmDeleteImage, setConfirmDeleteImage] = useState(null);
  const [isDeletingImage, setIsDeletingImage] = useState(false);
  const [isAddingNewImage, setIsAddingNewImage] = useState(false);
  const [replacingImageId, setReplacingImageId] = useState(null);

  // Inline Brand Creation State
  const [isAddBrandModalOpen, setIsAddBrandModalOpen] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [newBrandLogoUrl, setNewBrandLogoUrl] = useState('');
  const [isCreatingBrand, setIsCreatingBrand] = useState(false);
  const [addBrandError, setAddBrandError] = useState('');

  // Form Fields
  const [formData, setFormData] = useState({
    brandId: '',
    name: '',
    modelNumber: '',
    description: '',
    price: '',
    sellingPrice: '',
    ram: '',
    storage: '',
    processor: '',
    display: '',
    frontCamera: '',
    rearCamera: '',
    battery: '',
    operatingSystem: '',
    network: '',
    simType: '',
    color: '',
    featured: false,
    status: 'ACTIVE',
  });

  const fetchBrands = async (autoSelectBrandId = null) => {
    setIsLoadingBrands(true);
    try {
      const res = await catalogService.getBrands({ limit: 100 });
      const allBrands = res.data || [];
      const activeBrands = allBrands.filter(
        (b) => b.status === 'ACTIVE' || b.id === mobileToEdit?.brandId || b.id === autoSelectBrandId
      );
      setBrands(activeBrands);

      if (autoSelectBrandId) {
        setFormData((prev) => ({ ...prev, brandId: autoSelectBrandId }));
      }
    } catch (err) {
      console.error('Failed to load brands:', err);
    } finally {
      setIsLoadingBrands(false);
    }
  };

  const fetchMobileImages = async (mobileId) => {
    if (!mobileId) return;
    setLoadingImages(true);
    try {
      const res = await catalogService.getMobileImages(mobileId);
      setExistingImages(res.data?.images || []);
    } catch (err) {
      console.error('Failed to fetch mobile images:', err);
    } finally {
      setLoadingImages(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchBrands();
      if (mobileToEdit) {
        setFormData({
          brandId: mobileToEdit.brandId || '',
          name: mobileToEdit.name || '',
          modelNumber: mobileToEdit.modelNumber || '',
          description: mobileToEdit.description || '',
          price: mobileToEdit.price !== undefined && mobileToEdit.price !== null ? String(mobileToEdit.price) : '',
          sellingPrice: mobileToEdit.sellingPrice !== undefined && mobileToEdit.sellingPrice !== null ? String(mobileToEdit.sellingPrice) : '',
          ram: mobileToEdit.ram || '',
          storage: mobileToEdit.storage || '',
          processor: mobileToEdit.processor || '',
          display: mobileToEdit.display || '',
          frontCamera: mobileToEdit.frontCamera || '',
          rearCamera: mobileToEdit.rearCamera || '',
          battery: mobileToEdit.battery || '',
          operatingSystem: mobileToEdit.operatingSystem || '',
          network: mobileToEdit.network || '',
          simType: mobileToEdit.simType || '',
          color: mobileToEdit.color || '',
          featured: Boolean(mobileToEdit.featured),
          status: mobileToEdit.status || 'ACTIVE',
        });
        fetchMobileImages(mobileToEdit.id);
      } else {
        setFormData({
          brandId: '',
          name: '',
          modelNumber: '',
          description: '',
          price: '',
          sellingPrice: '',
          ram: '',
          storage: '',
          processor: '',
          display: '',
          frontCamera: '',
          rearCamera: '',
          battery: '',
          operatingSystem: '',
          network: '',
          simType: '',
          color: '',
          featured: false,
          status: 'ACTIVE',
        });
        setExistingImages([]);
      }
      setError('');
      setImageFile(null);
      setImagePreview('');
      setConfirmDeleteImage(null);
    }
  }, [isOpen, mobileToEdit]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(file.type)) {
      setError('Invalid file type. Only JPG, JPEG, PNG, and WebP images are allowed.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size exceeds maximum permitted limit of 5MB.');
      return;
    }

    setError('');
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSetPrimary = async (imageId) => {
    try {
      await catalogService.setPrimaryImage(mobileToEdit.id, imageId);
      await fetchMobileImages(mobileToEdit.id);
      if (onSaved) onSaved();
    } catch (err) {
      setError(err.message || 'Failed to update primary image');
    }
  };

  const handleAddAdditionalImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(file.type)) {
      setError('Invalid file type. Only JPG, JPEG, PNG, and WebP images are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File size exceeds maximum permitted limit of 5MB.');
      return;
    }

    setIsAddingNewImage(true);
    setError('');
    try {
      const formDataPayload = new FormData();
      formDataPayload.append('image', file);
      await catalogService.addMobileImage(mobileToEdit.id, formDataPayload);
      await fetchMobileImages(mobileToEdit.id);
      if (onSaved) onSaved();
    } catch (err) {
      setError(err.message || 'Failed to upload image');
    } finally {
      setIsAddingNewImage(false);
      e.target.value = '';
    }
  };

  const handleReplaceImage = async (imageId, file) => {
    if (!file) return;

    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(file.type)) {
      setError('Invalid file type. Only JPG, JPEG, PNG, and WebP images are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File size exceeds maximum permitted limit of 5MB.');
      return;
    }

    setReplacingImageId(imageId);
    setError('');
    try {
      const formDataPayload = new FormData();
      formDataPayload.append('image', file);
      await catalogService.replaceMobileImage(mobileToEdit.id, imageId, formDataPayload);
      await fetchMobileImages(mobileToEdit.id);
      if (onSaved) onSaved();
    } catch (err) {
      setError(err.message || 'Failed to replace image');
    } finally {
      setReplacingImageId(null);
    }
  };

  const handleConfirmDeleteImage = async () => {
    if (!confirmDeleteImage) return;
    setIsDeletingImage(true);
    setError('');
    try {
      await catalogService.deleteMobileImage(mobileToEdit.id, confirmDeleteImage.id);
      await fetchMobileImages(mobileToEdit.id);
      setConfirmDeleteImage(null);
      if (onSaved) onSaved();
    } catch (err) {
      setError(err.message || 'Failed to delete image');
    } finally {
      setIsDeletingImage(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'brandId' && value === '__ADD_NEW_BRAND__') {
      setIsAddBrandModalOpen(true);
      return;
    }
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleCreateBrandSubmit = async (e) => {
    e.preventDefault();
    if (!newBrandName.trim()) {
      setAddBrandError('Brand name is required');
      return;
    }
    setAddBrandError('');
    setIsCreatingBrand(true);

    try {
      const res = await catalogService.createBrand({
        name: newBrandName.trim(),
        logoUrl: newBrandLogoUrl.trim() || undefined,
      });
      const createdBrand = res.data?.brand;
      if (createdBrand?.id) {
        await fetchBrands(createdBrand.id);
      }
      setIsAddBrandModalOpen(false);
      setNewBrandName('');
      setNewBrandLogoUrl('');
    } catch (err) {
      setAddBrandError(err.message || 'Failed to create brand');
    } finally {
      setIsCreatingBrand(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.brandId || formData.brandId === '__ADD_NEW_BRAND__') {
      setError('Please select a valid brand');
      return;
    }
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      setError('Mobile model name must be at least 2 characters long');
      return;
    }

    const priceNum = Number(formData.price);
    const sellingPriceNum = formData.sellingPrice.trim() !== '' ? Number(formData.sellingPrice) : null;

    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Regular price must be a positive number greater than 0');
      return;
    }

    if (sellingPriceNum !== null) {
      if (isNaN(sellingPriceNum) || sellingPriceNum <= 0) {
        setError('Selling price must be a positive number greater than 0');
        return;
      }
      if (sellingPriceNum > priceNum) {
        setError('Selling price cannot be greater than regular price');
        return;
      }
    }

    setIsSubmitting(true);

    const payload = {
      brandId: formData.brandId,
      name: formData.name.trim(),
      modelNumber: formData.modelNumber.trim() || null,
      description: formData.description.trim() || null,
      price: priceNum,
      sellingPrice: sellingPriceNum,
      ram: formData.ram.trim() || null,
      storage: formData.storage.trim() || null,
      processor: formData.processor.trim() || null,
      display: formData.display.trim() || null,
      frontCamera: formData.frontCamera.trim() || null,
      rearCamera: formData.rearCamera.trim() || null,
      battery: formData.battery.trim() || null,
      operatingSystem: formData.operatingSystem.trim() || null,
      network: formData.network.trim() || null,
      simType: formData.simType.trim() || null,
      color: formData.color.trim() || null,
      featured: formData.featured,
      status: formData.status,
    };

    try {
      if (isEditMode) {
        await catalogService.updateMobile(mobileToEdit.id, payload);
      } else {
        if (imageFile) {
          const formDataPayload = new FormData();
          Object.keys(payload).forEach((key) => {
            if (payload[key] !== null && payload[key] !== undefined) {
              formDataPayload.append(key, payload[key]);
            }
          });
          formDataPayload.append('image', imageFile);
          await catalogService.createMobile(formDataPayload);
        } else {
          await catalogService.createMobile(payload);
        }
      }
      onClose();
      if (onSaved) onSaved();
    } catch (err) {
      setError(err.message || 'Failed to save mobile model');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={isEditMode ? `Edit Mobile: ${mobileToEdit?.name}` : 'Add New Mobile Model'}
        size="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 text-xs bg-red-50 text-red-600 border border-red-200 rounded-lg">
              {error}
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-1">
              Basic Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">Brand *</label>
                  <button
                    type="button"
                    onClick={() => setIsAddBrandModalOpen(true)}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-0.5"
                  >
                    <Plus className="w-3 h-3" /> Add Brand
                  </button>
                </div>
                <Select
                  name="brandId"
                  value={formData.brandId}
                  onChange={handleChange}
                  options={[
                    { value: '', label: isLoadingBrands ? 'Loading brands...' : '-- Select Brand --' },
                    ...brands.map((b) => ({ value: b.id, label: b.name })),
                    { value: '__ADD_NEW_BRAND__', label: '+ Add New Brand...' },
                  ]}
                  required
                />
              </div>

              <Input
                label="Model Name *"
                name="name"
                placeholder="e.g. Galaxy S24 Ultra / iPhone 16"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <Input
                label="Model Number"
                name="modelNumber"
                placeholder="e.g. SM-S928B"
                value={formData.modelNumber}
                onChange={handleChange}
              />
            </div>

            {/* Initial Image Upload Field for Create Mode */}
            {!isEditMode && (
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mobile Primary Image (Optional)
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors text-xs text-slate-700">
                    <Upload className="w-4 h-4 text-slate-500" />
                    <span>{imageFile ? imageFile.name : 'Select Image File (JPG, PNG, WebP)'}</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                  {imagePreview && (
                    <div className="relative w-12 h-12 rounded-lg border border-slate-200 overflow-hidden bg-slate-50 flex-shrink-0">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview('');
                        }}
                        className="absolute top-0 right-0 p-0.5 bg-red-500 text-white rounded-bl"
                        title="Remove Image"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Edit Mode Product Gallery Management */}
          {isEditMode && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Product Gallery & Images
                </h4>
                <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer">
                  {isAddingNewImage ? (
                    <Spinner size="xs" />
                  ) : (
                    <Plus className="w-3.5 h-3.5" />
                  )}
                  <span>Add Image</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    className="hidden"
                    onChange={handleAddAdditionalImage}
                    disabled={isAddingNewImage}
                  />
                </label>
              </div>

              {loadingImages ? (
                <div className="py-4 text-center text-xs text-slate-400">Loading gallery images...</div>
              ) : existingImages.length === 0 ? (
                <div className="p-4 text-center border border-dashed border-slate-200 rounded-xl text-xs text-slate-400">
                  No images added yet. Click "+ Add Image" above to upload photos.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {existingImages.map((img) => {
                    const isReplacingThis = replacingImageId === img.id;
                    return (
                      <div
                        key={img.id}
                        className={`relative rounded-xl border p-2 bg-slate-50 flex flex-col items-center gap-2 group transition-all ${
                          img.isPrimary
                            ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="relative w-full h-24 rounded-lg overflow-hidden bg-white flex items-center justify-center">
                          <img
                            src={img.imageUrl}
                            alt="Mobile product"
                            className="max-h-full max-w-full object-contain"
                          />
                          {img.isPrimary && (
                            <span
                              className="absolute top-1 right-1 bg-blue-600 text-white rounded-full p-1 shadow-xs"
                              title="Primary Image"
                            >
                              <Star className="w-3 h-3 fill-current" />
                            </span>
                          )}
                          {isReplacingThis && (
                            <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                              <Spinner size="sm" />
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between w-full pt-1 border-t border-slate-200/60 text-[11px]">
                          {!img.isPrimary ? (
                            <button
                              type="button"
                              onClick={() => handleSetPrimary(img.id)}
                              className="text-slate-600 hover:text-blue-600 font-semibold transition-colors"
                            >
                              Make Primary
                            </button>
                          ) : (
                            <span className="font-bold text-blue-600 flex items-center gap-0.5">
                              <Check className="w-3 h-3" /> Primary
                            </span>
                          )}

                          <div className="flex items-center gap-1">
                            <label
                              className="p-1 text-slate-500 hover:text-blue-600 rounded cursor-pointer transition-colors"
                              title="Replace Image"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              <input
                                type="file"
                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                className="hidden"
                                onChange={(e) => handleReplaceImage(img.id, e.target.files?.[0])}
                              />
                            </label>

                            <button
                              type="button"
                              onClick={() => setConfirmDeleteImage(img)}
                              className="p-1 text-slate-500 hover:text-red-600 rounded transition-colors"
                              title="Delete Image"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Pricing & Status */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-1">
              Pricing & Status
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Regular Price (₹) *"
                name="price"
                type="number"
                placeholder="129999"
                value={formData.price}
                onChange={handleChange}
                required
              />
              <Input
                label="Selling Price (₹)"
                name="sellingPrice"
                type="number"
                placeholder="119999 (Optional)"
                value={formData.sellingPrice}
                onChange={handleChange}
              />
              <Select
                label="Catalog Status *"
                name="status"
                value={formData.status}
                onChange={handleChange}
                options={[
                  { value: 'ACTIVE', label: 'ACTIVE (Available)' },
                  { value: 'OUT_OF_STOCK', label: 'OUT OF STOCK' },
                  { value: 'INACTIVE', label: 'INACTIVE (Hidden)' },
                ]}
              />
            </div>
            <div className="pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <span>Mark as Featured Mobile (Highlight on Customer Home Page)</span>
              </label>
            </div>
          </div>

          {/* Specifications Grid */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-1">
              Hardware Specifications
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <Input
                label="RAM"
                name="ram"
                placeholder="e.g. 12GB"
                value={formData.ram}
                onChange={handleChange}
              />
              <Input
                label="Storage"
                name="storage"
                placeholder="e.g. 512GB"
                value={formData.storage}
                onChange={handleChange}
              />
              <Input
                label="Processor"
                name="processor"
                placeholder="e.g. Snapdragon 8 Gen 3"
                value={formData.processor}
                onChange={handleChange}
              />
              <Input
                label="Display"
                name="display"
                placeholder="e.g. 6.8 inch Dynamic AMOLED"
                value={formData.display}
                onChange={handleChange}
              />
              <Input
                label="Front Camera"
                name="frontCamera"
                placeholder="e.g. 12MP Selfie"
                value={formData.frontCamera}
                onChange={handleChange}
              />
              <Input
                label="Rear Camera"
                name="rearCamera"
                placeholder="e.g. 200MP + 50MP + 12MP"
                value={formData.rearCamera}
                onChange={handleChange}
              />
              <Input
                label="Battery Capacity"
                name="battery"
                placeholder="e.g. 5000 mAh"
                value={formData.battery}
                onChange={handleChange}
              />
              <Input
                label="Operating System"
                name="operatingSystem"
                placeholder="e.g. Android 14, One UI 6.1"
                value={formData.operatingSystem}
                onChange={handleChange}
              />
              <Input
                label="Color / Finish"
                name="color"
                placeholder="e.g. Titanium Gray"
                value={formData.color}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Description</label>
            <textarea
              name="description"
              rows="3"
              placeholder="Detailed description of features, warranty, and highlights..."
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isDisabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner size="sm" className="mr-1.5" />
                  Saving Mobile...
                </>
              ) : isEditMode ? (
                'Update Mobile'
              ) : (
                'Create Mobile'
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Mobile Image Confirmation Modal */}
      <Modal
        isOpen={Boolean(confirmDeleteImage)}
        onClose={() => setConfirmDeleteImage(null)}
        title="Delete Product Image"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Are you sure you want to delete this product image? The Cloudinary asset will be removed and this action cannot be undone.
          </p>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => setConfirmDeleteImage(null)}
              disabled={isDeletingImage}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              type="button"
              onClick={handleConfirmDeleteImage}
              isDisabled={isDeletingImage}
            >
              {isDeletingImage ? <Spinner size="sm" className="mr-1" /> : <Trash2 className="w-3.5 h-3.5 mr-1" />}
              Delete Image
            </Button>
          </div>
        </div>
      </Modal>

      {/* Inline Brand Creation Dialog */}
      <Modal
        isOpen={isAddBrandModalOpen}
        onClose={() => setIsAddBrandModalOpen(false)}
        title="Create New Manufacturer Brand"
        size="sm"
      >
        <form onSubmit={handleCreateBrandSubmit} className="space-y-4">
          {addBrandError && (
            <div className="p-2.5 text-xs bg-red-50 text-red-600 border border-red-200 rounded-lg">
              {addBrandError}
            </div>
          )}

          <Input
            label="Brand Name *"
            placeholder="e.g. Nothing, Apple, OnePlus"
            value={newBrandName}
            onChange={(e) => setNewBrandName(e.target.value)}
            required
          />

          <Input
            label="Logo URL (Optional)"
            placeholder="https://example.com/logo.png"
            value={newBrandLogoUrl}
            onChange={(e) => setNewBrandLogoUrl(e.target.value)}
          />

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => setIsAddBrandModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              isDisabled={isCreatingBrand}
            >
              {isCreatingBrand ? <Spinner size="sm" className="mr-1" /> : <Tag className="w-3.5 h-3.5 mr-1" />}
              Create Brand
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default MobileFormModal;
