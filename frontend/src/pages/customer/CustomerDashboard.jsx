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
      <Breadcrumb />
      
      {/* Dashboard Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 sm:p-8 rounded-2xl mb-6 shadow-sm">
        <h1 className="text-2xl font-bold">Welcome back, {user?.name || 'Customer'}!</h1>
        <p className="text-xs sm:text-sm text-blue-100 mt-1">
          Manage your mobile enquiries, part requests, and track shop responses.
        </p>
      </div>

      {/* Metrics Summary Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Link key={idx} to={stat.link}>
              <Card className="hover:shadow-md transition-shadow">
                <CardBody className="p-4 sm:p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500">{stat.label}</p>
                    <p className="text-lg sm:text-xl font-bold text-slate-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-2.5 rounded-xl ${stat.color}`}>
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                </CardBody>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Recent Activity List */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <h2 className="text-sm font-semibold text-slate-900">Recent Activity & Requests</h2>
          </div>
          <Link to="/customer/enquiries" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center">
            View All <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </Link>
        </CardHeader>
        <CardBody className="divide-y divide-slate-100 p-0">
          {recentActivities.map((act) => (
            <div key={act.id} className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-900">{act.title}</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${act.badgeClass}`}>
                    {act.status}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-500">
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
        </CardBody>
      </Card>
    </CustomerLayout>
  );
};

export default CustomerDashboard;
