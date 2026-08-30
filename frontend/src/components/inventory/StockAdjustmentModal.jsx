import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import partsService from '../../services/parts.service';
import { SlidersHorizontal } from 'lucide-react';

const StockAdjustmentModal = ({ isOpen, onClose, part, onSuccess }) => {
  const [newQuantity, setNewQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setNewQuantity(part?.quantity !== undefined ? String(part.quantity) : '0');
      setReason('');
      setError('');
    }
  }, [isOpen, part]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const qty = Number(newQuantity);
    if (newQuantity === '' || isNaN(qty) || qty < 0) {
      setError('New quantity must be 0 or greater');
      return;
    }

    if (!reason.trim()) {
      setError('A valid reason for stock adjustment is required');
      return;
    }

    try {
      setLoading(true);
      await partsService.stockAdjustment(part.id, qty, reason.trim());
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to adjust stock');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Stock Adjustment (Correction)" maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">{error}</div>}

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold tracking-wider">
              {part?.partNumber}
            </span>
            <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{part?.name}</h4>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-500 uppercase font-medium block">Current Recorded</span>
            <span className="text-sm font-bold text-slate-900">{part?.quantity || 0} units</span>
          </div>
        </div>

        <div>
          <Input
            label="Corrected Target Quantity (Units)"
            type="number"
            min="0"
            value={newQuantity}
            onChange={(e) => setNewQuantity(e.target.value)}
            placeholder="0"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Reason for Adjustment <span className="text-red-500">*</span>
          </label>
          <textarea
            rows="3"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Physical inventory count correction, damaged unit write-off..."
            required
            className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" loading={loading}>
            Save Adjustment
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default StockAdjustmentModal;
