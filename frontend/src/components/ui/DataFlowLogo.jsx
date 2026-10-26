import React from 'react';

export const DataFlowLogo = ({ size = 28, showText = true, className = '' }) => {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div 
        className="relative flex items-center justify-center shrink-0 rounded-lg bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 shadow-sm border border-indigo-500/20"
        style={{ width: size, height: size }}
      >
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg" 
          className="w-3/5 h-3/5 text-white"
        >
          {/* DataFlow geometric stream & pipeline icon */}
          <path 
            d="M4 7H12C14.2091 7 16 8.79086 16 11V13C16 15.2091 17.7909 17 20 17H21" 
            stroke="currentColor" 
            strokeWidth="2.2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <path 
            d="M4 17H8C10.2091 17 12 15.2091 12 13V11C12 8.79086 13.7909 7 16 7H20" 
            stroke="#93c5fd" 
            strokeWidth="2.2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeOpacity="0.85"
          />
          <circle cx="4" cy="7" r="1.5" fill="#ffffff" />
          <circle cx="4" cy="17" r="1.5" fill="#93c5fd" />
          <circle cx="20" cy="7" r="1.5" fill="#93c5fd" />
          <circle cx="21" cy="17" r="1.5" fill="#ffffff" />
        </svg>
      </div>
      {showText && (
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-base font-bold text-slate-900 tracking-tight leading-none font-sans">
              DataFlow
            </span>
            <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200/60 rounded">
              BI
            </span>
          </div>
          <span className="text-[11px] font-medium text-slate-500 truncate leading-tight mt-0.5">
            Order Analytics & ETL
          </span>
        </div>
      )}
    </div>
  );
};

export default DataFlowLogo;
