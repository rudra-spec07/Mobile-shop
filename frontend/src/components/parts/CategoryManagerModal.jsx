import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import Loader from '../common/Loader';
import EmptyState from '../common/EmptyState';
import PartStatusBadge from './PartStatusBadge';
import partsService from '../../services/parts.service';
import { Plus, Edit, RefreshCw } from 'lucide-react';

const CategoryManagerModal = ({ isOpen, onClose, onCategoryChange }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      resetForm();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await partsService.getPartCategories({ limit: 100 });
      setCategories(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setName('');
    setDescription('');
    setError('');
  };

  const handleStartEdit = (cat) => {
    setIsEditing(true);
    setEditingId(cat.id);
    setName(cat.name);
    setDescription(cat.description || '');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Category name cannot be empty');
      return;
    }

    try {
      setSubmitting(true);
      if (isEditing) {
        await partsService.updatePartCategory(editingId, {
          name: name.trim(),
          description: description.trim() || undefined,
        });
      } else {
        await partsService.createPartCategory({
          name: name.trim(),
          description: description.trim() || undefined,
        });
      }
      resetForm();
      await fetchCategories();
      onCategoryChange?.();
    } catch (err) {
      setError(err.message || 'Failed to save category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (cat) => {
    try {
      const targetStatus = cat.status === 'INACTIVE' ? 'ACTIVE' : 'INACTIVE';
      await partsService.updatePartCategoryStatus(cat.id, targetStatus);
      await fetchCategories();
      onCategoryChange?.();
    } catch (err) {
      setError(err.message || 'Failed to toggle status');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Manage Part Categories" maxWidth="max-w-2xl">
      <div className="space-y-6">
        {/* Form Section */}
        <form onSubmit={handleSubmit} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
          <h4 className="text-xs font-bold text-slate-900 flex items-center justify-between">
            <span>{isEditing ? 'Edit Category' : 'Create New Category'}</span>
            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                className="text-[11px] font-semibold text-slate-500 hover:text-slate-700"
              >
                + New Category Mode
              </button>
            )}
          </h4>

          {error && (
            <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">{error}</div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Category Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Battery, Screen Assembly"
              required
            />
            <Input
              label="Description (Optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            {isEditing && (
              <Button type="button" variant="outline" size="sm" onClick={resetForm} disabled={submitting}>
                Cancel
              </Button>
            )}
            <Button type="submit" variant="primary" size="sm" loading={submitting}>
              {isEditing ? 'Update Category' : 'Save Category'}
            </Button>
          </div>
        </form>

        {/* Existing Categories Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900">Existing Categories ({categories.length})</h4>
            <button
              onClick={fetchCategories}
              className="p-1 text-slate-500 hover:text-slate-700 rounded-lg"
              title="Refresh"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {loading ? (
            <div className="py-8">
              <Loader text="Loading categories..." />
            </div>
          ) : categories.length === 0 ? (
            <EmptyState title="No Categories" message="No part categories have been created yet." />
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/80 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-2.5">Category Name</th>
                    <th className="px-4 py-2.5">Description</th>
                    <th className="px-4 py-2.5 text-center">Status</th>
                    <th className="px-4 py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  {categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-slate-50">
                      <td className="px-4 py-2.5 font-semibold text-slate-900">{cat.name}</td>
                      <td className="px-4 py-2.5 text-slate-500 truncate max-w-xs">{cat.description || 'N/A'}</td>
                      <td className="px-4 py-2.5 text-center whitespace-nowrap">
                        <PartStatusBadge status={cat.status} type="record" />
                      </td>
                      <td className="px-4 py-2.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleStartEdit(cat)}
                            className="p-1 text-slate-600 hover:text-blue-600 bg-slate-100 hover:bg-slate-200 rounded-md"
                            title="Edit Category"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(cat)}
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              cat.status === 'ACTIVE'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {cat.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default CategoryManagerModal;
