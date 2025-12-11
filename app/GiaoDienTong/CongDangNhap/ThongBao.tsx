'use client';
import React from 'react';

interface Props {
  errorMsg: string;
  successMsg: string;
}

export default function ThongBao({ errorMsg, successMsg }: Props) {
  if (errorMsg) {
    return (
      <div className="text-red-400/80 text-[10px] uppercase tracking-wider text-center border-l-2 border-red-500/50 pl-2 py-1 bg-red-900/10 animate-pulse">
          {errorMsg}
      </div>
    );
  }

  if (successMsg) {
    return (
      <div className="text-green-400/80 text-[10px] uppercase tracking-wider text-center border-l-2 border-green-500/50 pl-2 py-1 bg-green-900/10">
          {successMsg}
      </div>
    );
  }

  return null;
}