import React from 'react';
import MobileDemo from './components/MobileDemo';

export default function AppMobile() {
  return (
    <div className="h-screen w-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      <MobileDemo native />
    </div>
  );
}
