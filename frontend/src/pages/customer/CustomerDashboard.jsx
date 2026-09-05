import React from 'react';
import CustomerLayout from '../../components/layout/CustomerLayout';
import Card, { CardBody, CardHeader } from '../../components/common/Card';
import Breadcrumb from '../../components/navigation/Breadcrumb';
import { Smartphone, Wrench, MessageSquare, FileText, Clock, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const CustomerDashboard = () => {
  const { user } = useAuth();

  const stats = [
    { label: 'Mobiles Available', value: '45+', icon: Smartphone, color: 'text-blue-600 bg-blue-50', link: '/mobiles' },
    { label: 'Parts Available', value: '120+', icon: Wrench, color: 'text-purple-600 bg-purple-50', link: '/parts' },
    { label: 'My Enquiries', value: 'Enquiries', icon: MessageSquare, color: 'text-amber-600 bg-amber-50', link: '/customer/enquiries' },
    { label: 'Active Requests', value: 'Orders', icon: FileText, color: 'text-emerald-600 bg-emerald-50', link: '/customer/requests' },
  ];

  const recentActivities = [
    {
      id: 'req-101',
      title: 'Samsung Galaxy A54 Display Enquiry',
      type: 'Part Availability',
      status: 'RESPONDED',
      date: 'Today, 10:30 AM',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      id: 'req-102',
      title: 'iPhone 13 Battery Replacement Request',
      type: 'Repair Service',
      status: 'NEW',
      date: 'Yesterday, 4:15 PM',
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    },
  ];

  return (
    <CustomerLayout>
      <div className="space-y-6">
        <Breadcrumb />
        
        {/* Dashboard Welcome Header */}
        <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
          <div className="relative z-10 space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Welcome back, {user?.name || 'Customer'}!</h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
              Manage your mobile enquiries, spare part requests, and track shop responses.
            </p>
          </div>
        </div>

        {/* Metrics Summary Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Link key={idx} to={stat.link}>
                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 flex items-center justify-between hover:shadow-md hover:border-slate-300 transition-all duration-200 h-full">
                  <div>
                    <p className="text-[11px] font-medium text-slate-500">{stat.label}</p>
                    <p className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5">{stat.value}</p>
                  </div>
                  <div className={`p-2.5 rounded-2xl ${stat.color} shrink-0`}>
                    <Icon className="w-5 h-5 stroke-[1.8]" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Recent Activity List */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Recent Activity & Requests</h2>
            </div>
            <Link to="/customer/enquiries" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center">
              View All <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {recentActivities.map((act) => (
              <div key={act.id} className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50/60 transition-colors">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{act.title}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${act.badgeClass}`}>
                      {act.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[11px] text-slate-400 font-medium">
                    <span>Type: {act.type}</span>
                    <span>•</span>
                    <span>{act.date}</span>
                  </div>
                </div>
                <Link to="/customer/enquiries" className="text-slate-400 hover:text-slate-600 p-1">
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default CustomerDashboard;
