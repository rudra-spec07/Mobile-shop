import React from 'react';
import { Link } from 'react-router-dom';
import CustomerLayout from '../../components/layout/CustomerLayout';
import { Shield, ArrowLeft } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <CustomerLayout>
      <div className="max-w-3xl mx-auto py-8 px-4">
        <Link to="/register" className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <h1 className="text-xl font-extrabold text-slate-900">Privacy Policy</h1>
          </div>
          <div className="prose prose-sm prose-slate max-w-none space-y-4 text-sm text-slate-600 leading-relaxed">
            <p>At Armaan Mobile Service Centre, we are committed to protecting your privacy and personal information.</p>
            <h3 className="text-base font-bold text-slate-800">1. Information We Collect</h3>
            <p>We collect personal information such as your name, email address, mobile number, and address when you register or place an order.</p>
            <h3 className="text-base font-bold text-slate-800">2. How We Use Your Information</h3>
            <p>Your information is used to process orders, provide customer support, send important updates, and improve our services.</p>
            <h3 className="text-base font-bold text-slate-800">3. Data Security</h3>
            <p>We implement appropriate security measures to protect your personal data from unauthorized access, alteration, or disclosure.</p>
            <h3 className="text-base font-bold text-slate-800">4. Third-Party Sharing</h3>
            <p>We do not sell or share your personal information with third parties except as required to provide our services or comply with legal obligations.</p>
            <h3 className="text-base font-bold text-slate-800">5. Your Rights</h3>
            <p>You have the right to access, update, or delete your personal information. Contact our support team for any such requests.</p>
            <h3 className="text-base font-bold text-slate-800">6. Contact</h3>
            <p>For any privacy-related questions, please reach out to us through our support channels.</p>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default PrivacyPolicy;
