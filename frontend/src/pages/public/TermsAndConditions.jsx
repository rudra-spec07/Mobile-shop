import React from 'react';
import { Link } from 'react-router-dom';
import CustomerLayout from '../../components/layout/CustomerLayout';
import { FileText, ArrowLeft } from 'lucide-react';

const TermsAndConditions = () => {
  return (
    <CustomerLayout>
      <div className="max-w-3xl mx-auto py-8 px-4">
        <Link to="/register" className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <h1 className="text-xl font-extrabold text-slate-900">Terms & Conditions</h1>
          </div>
          <div className="prose prose-sm prose-slate max-w-none space-y-4 text-sm text-slate-600 leading-relaxed">
            <p>Welcome to Armaan Mobile Service Centre. By using our services, you agree to the following terms and conditions.</p>
            <h3 className="text-base font-bold text-slate-800">1. Services</h3>
            <p>Armaan Mobile Service Centre provides mobile phone sales, spare parts, and repair services. All services are subject to availability and applicable terms.</p>
            <h3 className="text-base font-bold text-slate-800">2. User Accounts</h3>
            <p>You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate and complete information during registration.</p>
            <h3 className="text-base font-bold text-slate-800">3. Orders & Payments</h3>
            <p>All orders are subject to acceptance and availability. Prices are subject to change without prior notice. Payment must be completed before order processing.</p>
            <h3 className="text-base font-bold text-slate-800">4. Returns & Refunds</h3>
            <p>Returns and refunds are subject to our refund policy. Please contact our support team for any return or refund requests.</p>
            <h3 className="text-base font-bold text-slate-800">5. Limitation of Liability</h3>
            <p>Armaan Mobile Service Centre shall not be liable for any indirect, incidental, or consequential damages arising from the use of our services.</p>
            <h3 className="text-base font-bold text-slate-800">6. Contact</h3>
            <p>For any questions regarding these terms, please contact us through our support channels.</p>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default TermsAndConditions;
