import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import enquiryService from '../../services/enquiry.service';
import { MessageSquare, Smartphone, Wrench, CheckCircle2, AlertCircle } from 'lucide-react';

const CreateEnquiryModal = ({ isOpen, onClose, mobile = null, part = null, onSuccess }) => {
  const navigate = useNavigate();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [createdEnquiry, setCreatedEnquiry] = useState(null);

  // Auto-fill default subject when mobile or part is provided
  useEffect(() => {
    if (isOpen) {
      setError('');
      setCreatedEnquiry(null);
      if (mobile) {
        setSubject(`Inquiry regarding ${mobile.name}`);
        setMessage(`Hi, I am interested in purchasing the ${mobile.name}. Please confirm stock availability and best price details.`);
      } else if (part) {
        setSubject(`Stock & Repair Inquiry for ${part.name}`);
        setMessage(`Hi, I need information regarding spare part availability for ${part.name} (Part #: ${part.partNumber}).`);
      } else {
        setSubject('');
        setMessage('');
      }
    }
  }, [isOpen, mobile, part]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || subject.trim().length < 3) {
      setError('Subject must be at least 3 characters long.');
      return;
    }
    if (!message.trim() || message.trim().length < 5) {
      setError('Message must be at least 5 characters long.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      const payload = {
        subject: subject.trim(),
        message: message.trim(),
      };
      if (mobile?.id) payload.mobileId = mobile.id;
      if (part?.id) payload.partId = part.id;

      const res = await enquiryService.createEnquiry(payload);
      const newEnquiry = res.data?.enquiry || res.data;
      setCreatedEnquiry(newEnquiry);

      if (onSuccess) {
        onSuccess(newEnquiry);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit enquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSubject('');
    setMessage('');
    setError('');
    setCreatedEnquiry(null);
    onClose();
  };

  const title = mobile
    ? `Enquire About ${mobile.name}`
    : part
    ? `Enquire About ${part.name}`
    : 'Submit General Customer Enquiry';

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title} size="md">
      {createdEnquiry ? (
        /* Success State */
        <div className="text-center py-4 space-y-4 animate-fade-in">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-slate-900">Enquiry Submitted Successfully!</h4>
            <p className="text-xs text-slate-500 mt-1">
              Your enquiry reference code is <span className="font-mono font-bold text-slate-700">#{createdEnquiry.id.slice(0, 8)}</span>
            </p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-left text-xs space-y-1">
            <p className="font-semibold text-slate-800">Subject: {createdEnquiry.subject}</p>
            <p className="text-slate-500 line-clamp-2">{createdEnquiry.message}</p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 justify-center"
              onClick={handleClose}
            >
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="flex-1 justify-center bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                handleClose();
                navigate('/customer/enquiries');
              }}
            >
              View My Enquiries
            </Button>
          </div>
        </div>
      ) : (
        /* Creation Form */
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Product Summary Card if attached */}
          {mobile && (
            <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl flex items-center gap-3">
              <div className="p-2 bg-blue-600 text-white rounded-lg">
                <Smartphone className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-slate-900 block">{mobile.name}</span>
                <span className="text-slate-500">Model: {mobile.modelNumber || 'Standard'}</span>
              </div>
            </div>
          )}

          {part && (
            <div className="p-3 bg-purple-50/60 border border-purple-100 rounded-xl flex items-center gap-3">
              <div className="p-2 bg-purple-600 text-white rounded-lg">
                <Wrench className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-slate-900 block">{part.name}</span>
                <span className="text-slate-500">Part #: {part.partNumber}</span>
              </div>
            </div>
          )}

          {/* Subject Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Subject <span className="text-rose-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="e.g. Price inquiry or stock availability"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="text-xs"
              maxLength={150}
              required
            />
          </div>

          {/* Message Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Enquiry Message <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              placeholder="Provide detailed questions regarding warranty, EMI options, compatibility, or in-store inspection..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
              maxLength={2000}
              required
            />
            <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
              <span>Min 5 characters</span>
              <span>{message.length} / 2000</span>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
              isLoading={isSubmitting}
            >
              Submit Enquiry
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default CreateEnquiryModal;
