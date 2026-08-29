import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Select from '../common/Select';
import Spinner from '../common/Spinner';
import catalogService from '../../services/catalog.service';
import { AlertCircle } from 'lucide-react';

const StatusChangeModal = ({ isOpen, onClose, mobile, onStatusUpdated }) => {
  const [status, setStatus] = useState('ACTIVE');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (mobile?.status) {
      setStatus(mobile.status);
    }
  }, [mobile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!mobile?.id) return;

    setIsSubmitting(true);
    setError('');

    try {
      await catalogService.updateMobileStatus(mobile.id, status);
      onClose();
      if (onStatusUpdated) onStatusUpdated();
    } catch (err) {
      setError(err.message || 'Failed to update status');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Update Status: ${mobile?.name || 'Mobile'}`}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs bg-red-50 text-red-600 border border-red-200 rounded-lg">
            {error}
          </div>
        )}

        <Select
          label="Catalog Status *"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          options={[
            { value: 'ACTIVE', label: 'ACTIVE (Visible in Customer Catalog)' },
            { value: 'OUT_OF_STOCK', label: 'OUT OF STOCK (Visible as Out of Stock)' },
            { value: 'INACTIVE', label: 'INACTIVE (Hidden from Customer Catalog)' },
          ]}
        />

        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2.5 text-amber-800 text-xs">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="leading-snug">
            Setting status to <strong>INACTIVE</strong> hides this mobile from customer browsing while preserving historical records in the database.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" isDisabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Spinner size="sm" className="mr-1.5" />
                Updating...
              </>
            ) : (
              'Save Status'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default StatusChangeModal;
