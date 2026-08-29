import React from 'react';
import Header from './Header';
import Footer from './Footer';
import BottomNavigation from '../navigation/BottomNavigation';

const CustomerLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 md:pb-8">
        {children}
      </main>

      <Footer />
      <BottomNavigation />
    </div>
  );
};

export default CustomerLayout;
