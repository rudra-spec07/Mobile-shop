import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import enquiryService from '../../services/enquiry.service';
import { AlertCircle } from 'lucide-react';

const AdminStatusModal = ({ isOpen, onClose, enquiry = null, onSuccess }) => {
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSelectedStatus(enquiry?.status || 'NEW');
      setError('');
    }
  }, [isOpen, enquiry]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStatus) return;

    try {
      setIsSubmitting(true);
      setError('');
      const res = await enquiryService.updateEnquiryStatus(enquiry.id, { status: selectedStatus });
      const updated = res.data?.enquiry || res.data;
      if (onSuccess) onSuccess(updated);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update enquiry status.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!enquiry) return null;

  // Allowed transitions map
  const allowedTransitionsMap = {
    NEW: ['NEW', 'IN_PROGRESS', 'CANCELLED'],
    IN_PROGRESS: ['IN_PROGRESS', 'RESPONDED', 'CANCELLED'],
    RESPONDED: ['RESPONDED', 'RESOLVED', 'IN_PROGRESS'],
    RESOLVED: ['RESOLVED'],
    CANCELLED: ['CANCELLED'],
  };

  const validOptions = allowedTransitionsMap[enquiry.status] || ['NEW', 'IN_PROGRESS', 'RESPONDED', 'RESOLVED', 'CANCELLED'];

  const statusLabels = {
    NEW: 'NEW (New Customer Query)',
    IN_PROGRESS: 'IN_PROGRESS (Under Review)',
    RESPONDED: 'RESPONDED (Store Responded)',
    RESOLVED: 'RESOLVED (Completed & Resolved)',
    CANCELLED: 'CANCELLED (Cancelled)',
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Update Status for Enquiry #${enquiry.id.slice(0, 8)}`}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="text-xs text-slate-600 space-y-1">
          <p><span className="font-semibold text-slate-700">Current Status:</span> <span className="font-bold text-blue-600">{enquiry.status}</span></p>
          <p><span className="font-semibold text-slate-700">Subject:</span> {enquiry.subject}</p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            New Status Transition
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            disabled={validOptions.length <= 1}
          >
            {validOptions.map((st) => (
              <option key={st} value={st}>
                {statusLabels[st] || st}
              </option>
            ))}
          </select>
          {validOptions.length <= 1 && (
            <p className="text-[11px] text-amber-600 mt-1 font-medium">
              Enquiry is in a final state ({enquiry.status}). No further transitions allowed.
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
            isLoading={isSubmitting}
            disabled={validOptions.length <= 1}
          >
            Update Status
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AdminStatusModal;
