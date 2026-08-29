import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import CustomerLayout from '../../components/layout/CustomerLayout';
import Card, { CardBody } from '../../components/common/Card';
import Breadcrumb from '../../components/navigation/Breadcrumb';
import { Smartphone, Wrench } from 'lucide-react';

const CatalogPlaceholder = () => {
  const { id } = useParams();
  const location = useLocation();
  const isMobileRoute = location.pathname.includes('/mobiles');

  return (
    <CustomerLayout>
      <Breadcrumb />
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              {isMobileRoute ? <Smartphone className="w-6 h-6" /> : <Wrench className="w-6 h-6" />}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {isMobileRoute ? (id ? `Mobile Details #${id}` : 'Mobiles Catalogue') : (id ? `Part Details #${id}` : 'Spare Parts Catalogue')}
              </h1>
              <p className="text-xs text-slate-500">
                {id ? 'Detailed view and availability enquiry options' : 'Explore available products and components'}
              </p>
            </div>
          </div>
        </div>

        <Card>
          <CardBody className="py-12 text-center">
            <p className="text-sm font-medium text-slate-600 mb-2">
              {isMobileRoute ? 'Mobile Catalogue Foundation Ready' : 'Parts Catalogue Foundation Ready'}
            </p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Dynamic products, filtering, search, and enquiry submission workflows will be connected in subsequent business modules.
            </p>
          </CardBody>
        </Card>
      </div>
    </CustomerLayout>
  );
};

export default CatalogPlaceholder;
