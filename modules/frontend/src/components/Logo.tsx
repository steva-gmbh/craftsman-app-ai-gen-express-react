import React from 'react';
import { WrenchScrewdriverIcon } from '@heroicons/react/24/solid';

export default function Logo() {
  return (
    <div className="flex items-center justify-center mb-4">
      <div className="w-32 h-32 bg-indigo-600 rounded-full flex items-center justify-center">
        <WrenchScrewdriverIcon className="h-16 w-16 text-white" />
      </div>
    </div>
  );
} 