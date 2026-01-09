'use client';

import React from 'react';

const NenHieuUng = ({ isModalMode }: { isModalMode: boolean }) => {
  return (
    <div className={`w-full h-full ${isModalMode ? '' : ''}`}>
      {/* Layered gradient to match landing page */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent" />
    </div>
  );
};

export default NenHieuUng;
