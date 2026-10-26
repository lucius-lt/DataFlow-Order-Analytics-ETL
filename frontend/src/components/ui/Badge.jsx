import React from 'react';

/**
 * Standardized status pill badge with restrained enterprise styling
 */
export const Badge = ({ 
  children, 
  variant = 'default', 
  size = 'sm', 
  dot = true,
  className = '' 
}) => {
  const variantStyles = {
    default: 'bg-slate-100 text-slate-700 border-slate-200/80',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
    warning: 'bg-amber-50 text-amber-800 border-amber-200/80',
    danger: 'bg-rose-50 text-rose-800 border-rose-200/80',
    info: 'bg-blue-50 text-blue-800 border-blue-200/80',
    indigo: 'bg-indigo-50 text-indigo-800 border-indigo-200/80',
    delivered: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
    delayed: 'bg-amber-50 text-amber-800 border-amber-200/80'
  };

  const dotStyles = {
    default: 'bg-slate-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
    info: 'bg-blue-500',
    indigo: 'bg-indigo-500',
    delivered: 'bg-emerald-500',
    delayed: 'bg-amber-500'
  };

  const sizeStyles = {
    xs: 'px-2 py-0.5 text-[10px]',
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1 text-sm'
  };

  const selectedVariant = variantStyles[variant.toLowerCase()] || variantStyles.default;
  const selectedDot = dotStyles[variant.toLowerCase()] || dotStyles.default;
  const selectedSize = sizeStyles[size] || sizeStyles.sm;

  return (
    <span 
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border tracking-normal select-none ${selectedVariant} ${selectedSize} ${className}`}
    >
      {dot && (
        <span 
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${selectedDot}`} 
          aria-hidden="true" 
        />
      )}
      <span>{children}</span>
    </span>
  );
};

export default Badge;
