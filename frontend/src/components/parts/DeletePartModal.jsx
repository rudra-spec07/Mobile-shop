import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import partsService from '../../services/parts.service';
import { AlertTriangle } from 'lucide-react';

const DeletePartModal = ({ isOpen, onClose, part, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isInactive = part?.status === 'INACTIVE';
  const targetStatus = isInactive ? 'ACTIVE' : 'INACTIVE';

  const handleConfirm = async () => {
    if (!part?.id) return;
    try {
      setLoading(true);
      setError('');
      await partsService.updatePartStatus(part.id, targetStatus);
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update part status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isInactive ? 'Reactivate Part' : 'Deactivate Part'} maxWidth="max-w-md">
      <div className="space-y-4">
        {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">{error}</div>}

        <div className="flex gap-3 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block mb-0.5">
              {isInactive ? 'Confirm Activation' : 'Confirm Status Change'}
            </span>
            {isInactive
              ? `Reactivating "${part?.name}" (${part?.partNumber}) will make it visible in the active catalog.`
              : `Deactivating "${part?.name}" (${part?.partNumber}) will hide it from the public catalog. Existing inventory history records will be preserved.`}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="button"
            variant={isInactive ? 'primary' : 'danger'}
            size="sm"
            onClick={handleConfirm}
            loading={loading}
          >
            {isInactive ? 'Reactivate Part' : 'Deactivate Part'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeletePartModal;
