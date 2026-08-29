import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import Spinner from '../common/Spinner';
import catalogService from '../../services/catalog.service';
import { Plus, Tag } from 'lucide-react';

const MobileFormModal = ({ isOpen, onClose, mobileToEdit = null, onSaved }) => {
  const isEditMode = Boolean(mobileToEdit?.id);

  const [brands, setBrands] = useState([]);
  const [isLoadingBrands, setIsLoadingBrands] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

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
      }
      setError('');
    }
  }, [isOpen, mobileToEdit]);

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
        await catalogService.createMobile(payload);
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
          </div>

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
