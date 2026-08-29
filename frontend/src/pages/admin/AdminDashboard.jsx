import React from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import Card, { CardBody, CardHeader } from '../../components/common/Card';
import { Smartphone, Wrench, Users, MessageSquare, FileText, AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const metrics = [
    { label: 'Total Mobiles', value: '48', icon: Smartphone, color: 'text-blue-600 bg-blue-50' },
    { label: 'Total Parts', value: '154', icon: Wrench, color: 'text-purple-600 bg-purple-50' },
    { label: 'Registered Customers', value: '89', icon: Users, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Pending Enquiries', value: '5', icon: MessageSquare, color: 'text-amber-600 bg-amber-50' },
    { label: 'Active Service Requests', value: '3', icon: FileText, color: 'text-indigo-600 bg-indigo-50' },
    { label: 'Low Stock Parts', value: '4', icon: AlertTriangle, color: 'text-red-600 bg-red-50' },
  ];

  const recentEnquiries = [
    { id: 'enq-1', customer: 'Rahul Kumar', subject: 'Samsung Galaxy A54 Display original?', date: '10 mins ago', status: 'NEW' },
    { id: 'enq-2', customer: 'Anish Sharma', subject: 'iPhone 13 battery replacement cost', date: '1 hour ago', status: 'NEW' },
  ];

  const lowStockParts = [
    { id: 'p-1', name: 'Type-C Fast Charging Board', stock: 2, minLevel: 5 },
    { id: 'p-2', name: 'OnePlus Nord Battery', stock: 1, minLevel: 5 },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Dashboard Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Super Admin Dashboard</h1>
            <p className="text-xs text-slate-500">Overview of shop inventory, customer inquiries, and repair requests</p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/admin/mobiles">
              <span className="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                + Add Mobile
              </span>
            </Link>
            <Link to="/admin/parts">
              <span className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
                + Add Part
              </span>
            </Link>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.map((m, idx) => {
            const Icon = m.icon;
            return (
              <Card key={idx}>
                <CardBody className="p-4 sm:p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500">{m.label}</p>
                    <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">{m.value}</p>
                  </div>
                  <div className={`p-2.5 rounded-xl ${m.color}`}>
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>

        {/* Operational Feeds Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Customer Enquiries */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">Recent Customer Enquiries</h2>
              <Link to="/admin/enquiries" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center">
                View All <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
              </Link>
            </CardHeader>
            <CardBody className="divide-y divide-slate-100 p-0">
              {recentEnquiries.map((enq) => (
                <div key={enq.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="text-xs font-semibold text-slate-900">{enq.subject}</p>
                    <p className="text-[11px] text-slate-500">From: {enq.customer} • {enq.date}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full">
                    {enq.status}
                  </span>
                </div>
              ))}
            </CardBody>
          </Card>

          {/* Low Stock Warning Alert */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <h2 className="text-sm font-semibold text-slate-900">Low Stock Inventory Warnings</h2>
              </div>
              <Link to="/admin/inventory" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center">
                Manage Stock <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
              </Link>
            </CardHeader>
            <CardBody className="divide-y divide-slate-100 p-0">
              {lowStockParts.map((part) => (
                <div key={part.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="text-xs font-semibold text-slate-900">{part.name}</p>
                    <p className="text-[11px] text-red-600 font-medium">Stock: {part.stock} items remaining (Min: {part.minLevel})</p>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 rounded-lg">
                    Low Stock
                  </span>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
