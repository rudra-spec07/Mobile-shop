import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import Spinner from '../common/Spinner';
import catalogService from '../../services/catalog.service';
import { Plus, Edit2, CheckCircle, XCircle, Tag } from 'lucide-react';

const BrandManagerModal = ({ isOpen, onClose, onBrandsUpdated }) => {
  const [brands, setBrands] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [editingBrandId, setEditingBrandId] = useState(null);
  const [name, setName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');

  const fetchBrands = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await catalogService.getBrands({ limit: 100 });
      setBrands(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load brands');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchBrands();
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setEditingBrandId(null);
    setName('');
    setLogoUrl('');
    setError('');
  };

  const handleStartEdit = (brand) => {
    setEditingBrandId(brand.id);
    setName(brand.name);
    setLogoUrl(brand.logoUrl || '');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || name.trim().length < 2) {
      setError('Brand name must be at least 2 characters long');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      if (editingBrandId) {
        await catalogService.updateBrand(editingBrandId, {
          name: name.trim(),
          logoUrl: logoUrl.trim() || null,
        });
      } else {
        await catalogService.createBrand({
          name: name.trim(),
          logoUrl: logoUrl.trim() || null,
        });
      }
      resetForm();
      await fetchBrands();
      if (onBrandsUpdated) onBrandsUpdated();
    } catch (err) {
      setError(err.message || 'Failed to save brand');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (brand) => {
    const newStatus = brand.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await catalogService.updateBrandStatus(brand.id, newStatus);
      await fetchBrands();
      if (onBrandsUpdated) onBrandsUpdated();
    } catch (err) {
      setError(err.message || 'Failed to update brand status');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Brand Management" size="lg">
      <div className="space-y-6">
        {/* Brand Create/Edit Form */}
        <form onSubmit={handleSubmit} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Tag className="w-4 h-4 text-blue-600" />
            {editingBrandId ? 'Edit Brand' : 'Add New Brand'}
          </h4>

          {error && (
            <div className="p-3 text-xs bg-red-50 text-red-600 border border-red-200 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Brand Name *"
              placeholder="e.g. Samsung, Apple, OnePlus"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Logo URL (Optional)"
              placeholder="https://example.com/logo.png"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 justify-end pt-1">
            {editingBrandId && (
              <Button variant="ghost" size="sm" type="button" onClick={resetForm}>
                Cancel
              </Button>
            )}
            <Button variant="primary" size="sm" type="submit" isDisabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner size="sm" className="mr-1.5" />
                  Saving...
                </>
              ) : editingBrandId ? (
                'Update Brand'
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-1" />
                  Create Brand
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Brands List */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Existing Brands ({brands.length})
          </h4>

          {isLoading ? (
            <div className="py-8 flex justify-center text-slate-400">
              <Spinner size="md" />
            </div>
          ) : brands.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-400">No brands created yet.</div>
          ) : (
            <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl bg-white">
              {brands.map((b) => (
                <div key={b.id} className="p-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    {b.logoUrl ? (
                      <img src={b.logoUrl} alt={b.name} className="w-8 h-8 object-contain rounded p-0.5 border border-slate-200" />
                    ) : (
                      <div className="w-8 h-8 bg-slate-100 rounded text-slate-400 flex items-center justify-center font-bold text-xs">
                        {b.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-bold text-slate-900">{b.name}</p>
                      <p className="text-[10px] text-slate-400">
                        {b._count?.mobiles || 0} mobile models • Slug: {b.slug}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleStatus(b)}
                      className={`px-2 py-1 text-[10px] font-bold rounded-full transition-colors flex items-center gap-1 ${
                        b.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                          : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {b.status === 'ACTIVE' ? (
                        <>
                          <CheckCircle className="w-3 h-3 text-emerald-600" /> Active
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 text-slate-400" /> Inactive
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleStartEdit(b)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Brand"
                    >
                      <Edit2 className="w-4 h-4" />
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

export default BrandManagerModal;
