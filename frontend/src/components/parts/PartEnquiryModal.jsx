import React, { useState } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';

const PartEnquiryModal = ({ isOpen, onClose, part }) => {
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleClose = () => {
    setSubmitted(false);
    setFormData({ name: '', contact: '', message: '' });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Enquire About: ${part?.name || 'Part'}`} maxWidth="max-w-md">
      {submitted ? (
        <div className="py-6 text-center space-y-3">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h4 className="text-base font-semibold text-slate-900">Enquiry Received!</h4>
          <p className="text-xs text-slate-600 max-w-xs mx-auto">
            Our team will check stock availability for <strong>{part?.partNumber}</strong> and contact you shortly.
          </p>
          <div className="pt-2">
            <Button variant="primary" size="sm" onClick={handleClose}>
              Done
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
            <div className="flex justify-between text-slate-700">
              <span className="font-medium">Part Number:</span>
              <span className="font-mono font-semibold">{part?.partNumber}</span>
            </div>
            <div className="flex justify-between text-slate-700">
              <span className="font-medium">Estimated Price:</span>
              <span className="font-semibold text-blue-600">₹{part?.price}</span>
            </div>
          </div>

          <Input
            label="Your Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter full name"
            required
          />

          <Input
            label="Mobile Number / Email"
            value={formData.contact}
            onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
            placeholder="e.g. +91 98765 43210 or email"
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Message / Mobile Model</label>
            <textarea
              rows="3"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Specify your mobile model or questions..."
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Submit Enquiry
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default PartEnquiryModal;
