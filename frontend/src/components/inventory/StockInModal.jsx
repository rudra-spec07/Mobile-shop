import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import partsService from '../../services/parts.service';
import { ArrowDownLeft, Package } from 'lucide-react';

const StockInModal = ({ isOpen, onClose, part, onSuccess }) => {
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setQuantity('');
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const qty = Number(quantity);
    if (!qty || qty <= 0) {
      setError('Stock-in quantity must be greater than 0');
      return;
    }

    try {
      setLoading(true);
      await partsService.stockIn(part.id, qty);
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to perform stock-in operation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Stock In (Add Inventory)" maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">{error}</div>}

        {/* Part Info Banner */}
        <div className="p-3.5 bg-blue-50/80 border border-blue-200/80 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-blue-600 font-semibold tracking-wider">
              {part?.partNumber}
            </span>
            <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{part?.name}</h4>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-500 uppercase font-medium block">Current Stock</span>
            <span className="text-sm font-bold text-slate-900">{part?.quantity || 0} units</span>
          </div>
        </div>

        {/* Quantity Input */}
        <div>
          <Input
            label="Stock-In Quantity (Units)"
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="e.g. 25"
            required
            helperText="Stock will be incremented atomically and logged in the inventory history."
          />
        </div>

        {/* Projected New Stock Summary */}
        {Number(quantity) > 0 && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900">
            <span className="font-medium flex items-center gap-1.5">
              <ArrowDownLeft className="w-4 h-4 text-emerald-600" /> Projected New Stock:
            </span>
            <span className="font-bold text-sm">{(part?.quantity || 0) + Number(quantity)} units</span>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" loading={loading}>
            Confirm Stock In
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default StockInModal;
