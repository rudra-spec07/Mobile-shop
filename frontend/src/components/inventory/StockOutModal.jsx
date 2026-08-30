import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import partsService from '../../services/parts.service';
import { ArrowUpRight, AlertCircle } from 'lucide-react';

const StockOutModal = ({ isOpen, onClose, part, onSuccess }) => {
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
      setError('Stock-out quantity must be greater than 0');
      return;
    }

    if (qty > (part?.quantity || 0)) {
      setError(`Cannot issue ${qty} units. Only ${part?.quantity || 0} units available in stock.`);
      return;
    }

    try {
      setLoading(true);
      await partsService.stockOut(part.id, qty);
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to perform stock-out operation');
    } finally {
      setLoading(false);
    }
  };

  const isOverdraft = Number(quantity) > (part?.quantity || 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Stock Out (Issue Inventory)" maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">{error}</div>}

        {/* Part Info Summary */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold tracking-wider">
              {part?.partNumber}
            </span>
            <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{part?.name}</h4>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-500 uppercase font-medium block">Available Stock</span>
            <span className="text-sm font-bold text-blue-600">{part?.quantity || 0} units</span>
          </div>
        </div>

        {/* Quantity Input */}
        <div>
          <Input
            label="Stock-Out Quantity (Units)"
            type="number"
            min="1"
            max={part?.quantity || undefined}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="e.g. 5"
            required
            helperText="Deducted units will generate a Stock-Out audit log."
          />
        </div>

        {/* Overdraft Alert */}
        {isOverdraft && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Requested quantity exceeds available stock level!</span>
          </div>
        )}

        {/* Projected Remaining Stock */}
        {Number(quantity) > 0 && !isOverdraft && (
          <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-between text-xs text-slate-800">
            <span className="font-medium flex items-center gap-1.5">
              <ArrowUpRight className="w-4 h-4 text-rose-500" /> Remaining Stock:
            </span>
            <span className="font-bold text-sm">{(part?.quantity || 0) - Number(quantity)} units</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="danger" size="sm" loading={loading} disabled={isOverdraft}>
            Confirm Stock Out
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default StockOutModal;
