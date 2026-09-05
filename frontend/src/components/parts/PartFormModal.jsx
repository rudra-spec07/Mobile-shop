import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import CategoryFormModal from './CategoryFormModal';
import partsService from '../../services/parts.service';
import { Plus, RefreshCw, AlertCircle, Upload, X, Trash2, Image as ImageIcon } from 'lucide-react';

const PartFormModal = ({ isOpen, onClose, part = null, onSuccess, onCategoryCreated }) => {
  const isEdit = Boolean(part?.id);

  const [categories, setCategories] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [formData, setFormData] = useState({
    categoryId: '',
    name: '',
    partNumber: '',
    description: '',
    price: '',
    quantity: '0',
    minimumStock: '0',
    imageUrl: '',
  });

  const [loading, setLoading] = useState(false);
  const [fetchingCategories, setFetchingCategories] = useState(false);
  const [categoriesError, setCategoriesError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Inline Category Creation Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Image Deletion Confirmation Modal State
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deletingImage, setDeletingImage] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchActiveCategories();
      if (part) {
        setFormData({
          categoryId: part.categoryId || part.category?.id || '',
          name: part.name || '',
          partNumber: part.partNumber || '',
          description: part.description || '',
          price: part.price !== undefined ? String(part.price) : '',
          quantity: part.quantity !== undefined ? String(part.quantity) : '0',
          minimumStock: part.minimumStock !== undefined ? String(part.minimumStock) : '0',
          imageUrl: part.imageUrl || '',
        });
      } else {
        setFormData({
          categoryId: '',
          name: '',
          partNumber: '',
          description: '',
          price: '',
          quantity: '0',
          minimumStock: '5',
          imageUrl: '',
        });
      }
      setErrorMessage('');
      setFieldErrors({});
      setImageFile(null);
      setImagePreview('');
      setIsDeleteConfirmOpen(false);
    }
  }, [isOpen, part]);

  const handleDeleteImage = async () => {
    if (!isEdit || !part?.id) {
      setImageFile(null);
      setImagePreview('');
      setFormData((prev) => ({ ...prev, imageUrl: '' }));
      setIsDeleteConfirmOpen(false);
      return;
    }

    try {
      setDeletingImage(true);
      await partsService.deletePartImage(part.id);
      setImageFile(null);
      setImagePreview('');
      setFormData((prev) => ({ ...prev, imageUrl: '' }));
      setIsDeleteConfirmOpen(false);
      onSuccess?.();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to delete part image');
      setIsDeleteConfirmOpen(false);
    } finally {
      setDeletingImage(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(file.type)) {
      setErrorMessage('Invalid file type. Only JPG, JPEG, PNG, and WebP images are allowed.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('File size exceeds maximum permitted limit of 5MB.');
      return;
    }

    setErrorMessage('');
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const fetchActiveCategories = async (selectNewId = null) => {
    try {
      setFetchingCategories(true);
      setCategoriesError('');
      const res = await partsService.getPartCategories({ status: 'ACTIVE', limit: 100 });
      const activeList = res.data || [];
      setCategories(activeList);

      if (selectNewId) {
        setFormData((prev) => ({ ...prev, categoryId: selectNewId }));
        if (fieldErrors.categoryId) {
          setFieldErrors((prev) => ({ ...prev, categoryId: '' }));
        }
      } else if (!isEdit && activeList.length > 0 && !formData.categoryId) {
        setFormData((prev) => ({ ...prev, categoryId: activeList[0].id }));
      }
    } catch (err) {
      console.error('Failed to load categories', err);
      setCategoriesError('Unable to load categories. Please try again.');
    } finally {
      setFetchingCategories(false);
    }
  };

  const handleCategorySelectChange = (e) => {
    const value = e.target.value;
    if (value === 'CREATE_NEW') {
      setIsCategoryModalOpen(true);
      return;
    }
    setFormData((prev) => ({ ...prev, categoryId: value }));
    if (fieldErrors.categoryId) {
      setFieldErrors((prev) => ({ ...prev, categoryId: '' }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleCategoryCreated = async (newCat) => {
    if (newCat?.id) {
      await fetchActiveCategories(newCat.id);
    } else {
      await fetchActiveCategories();
    }
    onCategoryCreated?.(newCat);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.categoryId) errors.categoryId = 'Category is required';
    if (!formData.name.trim()) errors.name = 'Part name is required';
    if (!formData.partNumber.trim()) errors.partNumber = 'Part number is required';
    if (formData.price === '' || isNaN(formData.price) || Number(formData.price) < 0) {
      errors.price = 'Valid non-negative price is required';
    }
    if (!isEdit) {
      if (formData.quantity === '' || isNaN(formData.quantity) || Number(formData.quantity) < 0) {
        errors.quantity = 'Valid non-negative initial stock is required';
      }
    }
    if (formData.minimumStock === '' || isNaN(formData.minimumStock) || Number(formData.minimumStock) < 0) {
      errors.minimumStock = 'Valid non-negative minimum stock threshold is required';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!validateForm()) return;

    try {
      setLoading(true);
      if (isEdit) {
        const payload = {
          categoryId: formData.categoryId,
          name: formData.name.trim(),
          partNumber: formData.partNumber.trim(),
          description: formData.description.trim() || null,
          price: Number(formData.price),
          minimumStock: Number(formData.minimumStock),
          imageUrl: formData.imageUrl.trim() || null,
        };
        await partsService.updatePart(part.id, payload);
      } else {
        const payload = {
          categoryId: formData.categoryId,
          name: formData.name.trim(),
          partNumber: formData.partNumber.trim(),
          description: formData.description.trim() || null,
          price: Number(formData.price),
          quantity: Number(formData.quantity),
          minimumStock: Number(formData.minimumStock),
          imageUrl: formData.imageUrl.trim() || null,
        };
        if (imageFile) {
          const formDataPayload = new FormData();
          Object.keys(payload).forEach((key) => {
            if (payload[key] !== null && payload[key] !== undefined) {
              formDataPayload.append(key, payload[key]);
            }
          });
          formDataPayload.append('image', imageFile);
          await partsService.createPart(formDataPayload);
        } else {
          await partsService.createPart(payload);
        }
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to save part details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Inline Category Creator Modal */}
      <CategoryFormModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSuccess={handleCategoryCreated}
      />

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={isEdit ? `Edit Part: ${part?.partNumber}` : 'Add New Spare Part'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
              {errorMessage}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category Selection Field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Category <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(true)}
                  disabled={fetchingCategories || loading}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Category</span>
                </button>
              </div>

              {categoriesError ? (
                <div className="flex items-center justify-between p-2 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                  <span>{categoriesError}</span>
                  <button
                    type="button"
                    onClick={() => fetchActiveCategories()}
                    className="p-1 text-red-700 hover:bg-red-100 rounded-lg"
                    title="Retry Loading Categories"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <Select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleCategorySelectChange}
                  disabled={fetchingCategories || loading}
                  error={fieldErrors.categoryId}
                >
                  {fetchingCategories ? (
                    <option value="">Loading categories...</option>
                  ) : categories.length === 0 ? (
                    <option value="">No categories available</option>
                  ) : (
                    <option value="">Select Category</option>
                  )}

                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}

                  {!fetchingCategories && (
                    <option value="CREATE_NEW" className="font-semibold text-blue-600">
                      + Add New Category...
                    </option>
                  )}
                </Select>
              )}
            </div>

            {/* Part Number */}
            <Input
              label="Part Number"
              name="partNumber"
              value={formData.partNumber}
              onChange={handleChange}
              placeholder="e.g. PN-DISP-101"
              required
              error={fieldErrors.partNumber}
            />

            {/* Part Name */}
            <div className="md:col-span-2">
              <Input
                label="Part Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. iPhone 15 Pro OLED Display Screen"
                required
                error={fieldErrors.name}
              />
            </div>

            {/* Price */}
            <Input
              label="Price (₹)"
              name="price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={handleChange}
              placeholder="0.00"
              required
              error={fieldErrors.price}
            />

            {/* Minimum Stock Threshold */}
            <Input
              label="Minimum Stock Alert Level"
              name="minimumStock"
              type="number"
              min="0"
              value={formData.minimumStock}
              onChange={handleChange}
              placeholder="5"
              required
              error={fieldErrors.minimumStock}
            />

            {/* Initial Quantity (Create Mode Only) */}
            <div className="md:col-span-2">
              {isEdit ? (
                <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl text-xs text-amber-800">
                  <span className="font-semibold block mb-0.5">⚠️ Stock Quantity Protected</span>
                  Current quantity is <strong>{part?.quantity} units</strong>. To update stock levels, please use the{' '}
                  <strong>Stock In</strong>, <strong>Stock Out</strong>, or <strong>Stock Adjustment</strong> operations.
                </div>
              ) : (
                <Input
                  label="Initial Quantity (Stock-In)"
                  name="quantity"
                  type="number"
                  min="0"
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder="0"
                  helperText="Initial stock level will automatically generate a Stock-In audit record."
                  error={fieldErrors.quantity}
                />
              )}
            </div>

            {/* Image Management Section */}
            <div className="md:col-span-2 space-y-2 pt-2 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-700">
                Part Image
              </label>

              {(formData.imageUrl || imagePreview) ? (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-lg border border-slate-200 bg-white p-1 flex items-center justify-center overflow-hidden flex-shrink-0">
                        <img
                          src={imagePreview || formData.imageUrl}
                          alt="Part Preview"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-800">
                          {imageFile ? imageFile.name : 'Current Part Image'}
                        </p>
                        {imageFile ? (
                          <span className="inline-block mt-0.5 text-[10px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                            New file selected (Save changes to upload)
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-500 block truncate max-w-[200px]">
                            {formData.imageUrl}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-xs font-medium text-slate-700 cursor-pointer transition-colors shadow-sm">
                        <Upload className="w-3.5 h-3.5 text-slate-500" />
                        <span>Replace</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsDeleteConfirmOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 hover:bg-red-100 rounded-lg text-xs font-medium text-red-600 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <label className="flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors text-xs text-slate-700">
                      <Upload className="w-4 h-4 text-slate-500" />
                      <span>{imageFile ? imageFile.name : 'Upload Image File (JPG, PNG, WebP)'}</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </label>
                    <div className="flex-1">
                      <Input
                        placeholder="or enter Image URL (https://...)"
                        name="imageUrl"
                        value={formData.imageUrl}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Description / Notes</label>
              <textarea
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleChange}
                placeholder="Provide component specs, compatibility details, or warranty terms..."
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={loading} disabled={loading}>
              {isEdit ? 'Save Changes' : 'Create Part'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Image Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        title="Delete Part Image"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-red-700 space-y-1">
              <p className="font-semibold">Are you sure you want to delete this part image?</p>
              <p>This action will remove the image from the database and Cloudinary storage. This cannot be undone.</p>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteConfirmOpen(false)}
              disabled={deletingImage}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={handleDeleteImage}
              loading={deletingImage}
              disabled={deletingImage}
            >
              Delete Image
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default PartFormModal;
