import React from 'react';
import { Link } from 'react-router-dom';
import CustomerLayout from '../../components/layout/CustomerLayout';
import { Shield, ArrowLeft, Lock, FileText, UserCheck, PhoneCall, HelpCircle } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <CustomerLayout>
      <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-10 space-y-6">
          <div className="flex items-center gap-3.5 pb-6 border-b border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200/80 mb-1">
                DPDP Act, 2023 Compliant
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Privacy Policy & Data Notice</h1>
              <p className="text-xs text-slate-500 font-medium">Last updated: September 2026 • Armaan Mobile Service Centre</p>
            </div>
          </div>

          <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-600 leading-relaxed space-y-5">
            <p>
              At <strong>Armaan Mobile Service Centre (Mobile-Adda)</strong>, we are committed to processing your personal data lawfully, transparently, and securely in accordance with the <strong>Digital Personal Data Protection (DPDP) Act, 2023</strong> of India.
            </p>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-600" /> 1. Data Fiduciary Identity
              </h3>
              <p className="text-xs text-slate-600">
                Armaan Mobile Service Centre acts as the Data Fiduciary responsible for determining the purpose and means of processing your personal data.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" /> 2. Personal Data We Collect & Specified Purposes
              </h3>
              <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600">
                <li><strong>Identity & Contact Data:</strong> Name, email address, mobile number for account creation and service updates.</li>
                <li><strong>Service & Order Data:</strong> Device model, spare parts inquiries, and repair request history.</li>
                <li><strong>Technical & System Logs:</strong> IP address, browser type, and security audit logs to prevent unauthorized access.</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-600" /> 3. Data Principal Rights (Your Rights under DPDP)
              </h3>
              <p className="text-xs text-slate-600">
                Under Section 11 & 12 of the DPDP Act 2023, you hold the following rights:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600">
                <li><strong>Right to Access & Data Portability:</strong> You may request a machine-readable JSON export of your personal data from your profile dashboard at any time.</li>
                <li><strong>Right to Correction & Updating:</strong> You can edit your name and mobile number directly via your Account Profile.</li>
                <li><strong>Right to Erasure & Consent Withdrawal:</strong> You may withdraw your consent at any time, which will deactivate your account and initiate data erasure protocols.</li>
                <li><strong>Right to Grievance Redressal:</strong> Direct escalation pathway to our Data Protection Officer.</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-blue-600" /> 4. Data Security & Storage Limitation
              </h3>
              <p className="text-xs text-slate-600">
                We store personal data only for as long as necessary to fulfill specified service obligations or satisfy legal retention requirements. Data is encrypted in transit and protected via strict role-based access control (RBAC).
              </p>
            </div>

            <div className="bg-blue-50/60 rounded-2xl p-4 border border-blue-200/80 space-y-2">
              <h3 className="text-xs font-extrabold text-blue-900 uppercase tracking-wider flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-blue-600" /> 5. Grievance Redressal Officer Contact
              </h3>
              <p className="text-xs text-blue-800">
                If you have questions, concerns, or grievances regarding your data processing, contact our Grievance Officer:
              </p>
              <div className="text-xs font-medium text-slate-700 space-y-1 pt-1">
                <p><strong>Grievance Officer:</strong> <span className="bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded text-[11px] font-bold">[CLIENT CONFIRMATION REQUIRED - Nominated Grievance Officer Name]</span></p>
                <p><strong>Email:</strong> <span className="bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded text-[11px] font-bold">[CLIENT CONFIRMATION REQUIRED - e.g. privacy@domain.com]</span></p>
                <p><strong>Address:</strong> <span className="bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded text-[11px] font-bold">[CLIENT CONFIRMATION REQUIRED - Registered Business Address]</span></p>
                <p><strong>Response Timeframe:</strong> <span className="bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded text-[11px] font-bold">[CLIENT CONFIRMATION REQUIRED - e.g. Responded within statutory 30 days]</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default PrivacyPolicy;
