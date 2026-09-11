import React from 'react';
import CustomerLayout from '../../components/layout/CustomerLayout';
import ServiceSection from '../../components/home/ServiceSection';
import TrustStrip from '../../components/home/TrustStrip';
import Breadcrumb from '../../components/navigation/Breadcrumb';

const ServicesPage = () => {
  return (
    <CustomerLayout>
      <div className="space-y-8">
        <Breadcrumb items={[{ label: 'Services', path: '/services' }]} />
        <ServiceSection />
        <TrustStrip />
      </div>
    </CustomerLayout>
  );
};

export default ServicesPage;
