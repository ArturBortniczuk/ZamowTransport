import React from 'react';
import TransportOrderForm from '../components/TransportOrderForm';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-purple-100 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">
          System zamawiania transportu
        </h1>
        <TransportOrderForm />
      </div>
    </div>
  );
}