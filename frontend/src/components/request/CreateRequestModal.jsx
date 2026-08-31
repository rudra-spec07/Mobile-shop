import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import Spinner from '../common/Spinner';
import requestService from '../../services/request.service';
import { Smartphone, Wrench, ShieldCheck, CheckCircle2, ArrowRight, AlertCircle, ShoppingBag } from 'lucide-react';

const formatCurrency = (val) => {
  if (val === null || val === undefined || isNaN(Number(val))) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(val));
};

const CreateRequestModal = ({ isOpen, onClose, mobile = null, part = null, onSuccess }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Form, 2: Review, 3: Success
  const [quantity, setQuantity] = useState(1);
  const [subject, setSubject] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [createdRequest, setCreatedRequest] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setQuantity(1);
      setError('');
      setCreatedRequest(null);
      setNotes('');

      if (mobile) {
        setSubject(`Purchase Request: ${mobile.name}`);
      } else if (part) {
        setSubject(`Spare Part Request: ${part.name}`);
      } else {
        setSubject('');
      }
    }
  }, [isOpen, mobile, part]);

  if (!isOpen) return null;

  const isMobile = Boolean(mobile);
  const isPart = Boolean(part);
  const item = mobile || part;

  const unitPrice = isMobile
    ? (mobile.sellingPrice !== null && mobile.sellingPrice !== undefined ? Number(mobile.sellingPrice) : Number(mobile.price))
    : isPart
    ? Number(part.price)
    : 0;

  const totalPrice = unitPrice * quantity;
  const availableStock = isPart ? part.quantity : null;

  const handleNextStep = (e) => {
    e.preventDefault();
    setError('');

    if (quantity < 1) {
      setError('Quantity must be at least 1');
      return;
    }

    if (isPart && availableStock !== null && quantity > availableStock) {
      setError(`Requested quantity (${quantity}) exceeds available stock (${availableStock})`);
      return;
    }

    setStep(2); // Go to review step
  };

  const handleSubmitRequest = async () => {
    try {
      setIsSubmitting(true);
      setError('');

      const payload = {
        quantity: Number(quantity),
        subject: subject.trim() || undefined,
        notes: notes.trim() || undefined,
      };

      if (isMobile) payload.mobileId = mobile.id;
      if (isPart) payload.partId = part.id;

      const res = await requestService.createRequest(payload);
      const reqData = res.data?.request || res.data;

      setCreatedRequest(reqData);
      setStep(3); // Go to success step

      if (onSuccess) {
        onSuccess(reqData);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit service request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={step === 3 ? onClose : onClose}
      title={
        step === 3
          ? 'Request Submitted Successfully!'
          : step === 2
          ? 'Review Your Request'
          : isMobile
          ? 'Request Device Purchase'
          : isPart
          ? 'Request Spare Part'
          : 'Create Service Request'
      }
      size="md"
    >
      {/* STEP 1: FORM INPUT */}
      {step === 1 && (
        <form onSubmit={handleNextStep} className="space-y-4">
          {/* Selected Item Card */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center gap-3">
            <div className="p-3 bg-blue-600 text-white rounded-xl shadow-xs shrink-0">
              {isMobile ? <Smartphone className="w-6 h-6" /> : <Wrench className="w-6 h-6" />}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                {isMobile ? 'Mobile Model' : 'Spare Part'}
              </span>
              <h4 className="text-sm font-extrabold text-slate-900 truncate">{item?.name || 'Selected Item'}</h4>
              <p className="text-xs text-slate-500">
                Unit Price:{' '}
                <span className="font-semibold text-slate-900">{formatCurrency(unitPrice)}</span>
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Quantity Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Quantity Requested <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-extrabold hover:bg-slate-200 transition-colors"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                max={availableStock !== null ? availableStock : 99}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-20 text-center font-bold text-slate-900 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() =>
                  setQuantity((prev) => (availableStock !== null ? Math.min(availableStock, prev + 1) : prev + 1))
                }
                className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-extrabold hover:bg-slate-200 transition-colors"
              >
                +
              </button>
              {availableStock !== null && (
                <span className="text-xs text-slate-500 font-medium">({availableStock} available in stock)</span>
              )}
            </div>
          </div>

          {/* Subject Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Request Subject</label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Purchase inquiry for Samsung Phone"
              maxLength={150}
            />
          </div>

          {/* Customer Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Additional Notes / Instructions <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Provide any specific preferences, color choices, or repair notes..."
              className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900 placeholder-slate-400"
              maxLength={2000}
            />
          </div>

          {/* Price Snapshot Calculation Summary */}
          <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-xl flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">Total Price Snapshot</span>
            <span className="text-lg font-extrabold text-blue-700">{formatCurrency(totalPrice)}</span>
          </div>

          {/* Modal Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" className="bg-blue-600 hover:bg-blue-700">
              Review Request <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </form>
      )}

      {/* STEP 2: REVIEW & CONFIRMATION */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex justify-between items-start border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Item Selected</span>
                <h4 className="text-sm font-extrabold text-slate-900">{item?.name}</h4>
              </div>
              <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 font-extrabold text-xs rounded-full">
                Qty: {quantity}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-500 block">Unit Price:</span>
                <span className="font-bold text-slate-900">{formatCurrency(unitPrice)}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Snapshot Total:</span>
                <span className="font-extrabold text-blue-700">{formatCurrency(totalPrice)}</span>
              </div>
            </div>

            {subject && (
              <div className="border-t border-slate-200 pt-2 text-xs">
                <span className="text-slate-500 block">Subject:</span>
                <span className="font-medium text-slate-800">{subject}</span>
              </div>
            )}

            {notes && (
              <div className="border-t border-slate-200 pt-2 text-xs">
                <span className="text-slate-500 block">Notes:</span>
                <p className="font-normal text-slate-700 italic bg-white p-2 rounded-lg border border-slate-100 mt-1">
                  "{notes}"
                </p>
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0 text-amber-600" />
            <span>This request will start in <strong>PENDING</strong> status. Our team will review and confirm your request soon.</span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setStep(1)} disabled={isSubmitting}>
              Back
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              onClick={handleSubmitRequest}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Spinner size="sm" className="mr-2 text-white" /> Submitting...
                </>
              ) : (
                'Confirm & Submit Request'
              )}
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: SUBMISSION SUCCESS */}
      {step === 3 && (
        <div className="text-center py-4 space-y-4">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <h3 className="text-lg font-extrabold text-slate-900">Request Submitted Successfully!</h3>
            <p className="text-xs text-slate-500 mt-1">
              Your service request ID is <span className="font-mono font-bold text-slate-900">{createdRequest?.id?.slice(0, 8)}...</span>
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Status:</span>
              <span className="font-extrabold text-amber-600">PENDING APPROVAL</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Price Snapshot:</span>
              <span className="font-bold text-slate-900">{formatCurrency(createdRequest?.price || totalPrice)}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onClose();
              }}
            >
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                onClose();
                navigate('/customer/requests');
              }}
            >
              View My Requests <ShoppingBag className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default CreateRequestModal;
