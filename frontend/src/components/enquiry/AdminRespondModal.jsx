import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import enquiryService from '../../services/enquiry.service';
import { MessageSquare, AlertCircle } from 'lucide-react';

const AdminRespondModal = ({ isOpen, onClose, enquiry = null, onSuccess }) => {
  const [response, setResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setResponse(enquiry?.adminResponse || '');
      setError('');
    }
  }, [isOpen, enquiry]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!response.trim() || response.trim().length < 2) {
      setError('Response message must be at least 2 characters long.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      const res = await enquiryService.respondToEnquiry(enquiry.id, { response: response.trim() });
      const updated = res.data?.enquiry || res.data;
      if (onSuccess) onSuccess(updated);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit admin response.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!enquiry) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Respond to Enquiry #${enquiry.id.slice(0, 8)}`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Customer Question Reference */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="font-semibold text-slate-700">Customer Question:</span>
            <span>{enquiry.customer?.name} ({enquiry.customer?.email})</span>
          </div>
          <p className="font-bold text-slate-900">{enquiry.subject}</p>
          <p className="text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200/80 leading-relaxed">
            {enquiry.message}
          </p>
        </div>

        {/* Admin Response Text Area */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Admin Response Message <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={4}
            placeholder="Type official store response to customer..."
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
            maxLength={2000}
            required
          />
          <div className="text-right text-[10px] text-slate-400 mt-1">
            {response.length} / 2000
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" className="bg-blue-600 hover:bg-blue-700" isLoading={isSubmitting}>
            Send Official Response
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AdminRespondModal;
