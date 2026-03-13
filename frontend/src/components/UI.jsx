import React from 'react';

// ---------- Utility ----------
export function cn(...classes) {
    return classes.filter(Boolean).join(' ');
}

// ---------- Card ----------
export const Card = ({ children, className = '' }) => (
    <div className={cn(
        'bg-[#FFFFFF] border border-[#E6E8EC] rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)]',
        className
    )}>
        {children}
    </div>
);

// ---------- Button ----------
export const Button = ({ children, className = '', variant = 'primary', size = 'md', ...props }) => {
    const base = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 active:scale-[0.98] disabled:opacity-50 cursor-pointer select-none';

    const variants = {
        primary: 'bg-[#635BFF] text-white hover:bg-[#524ade] shadow-[0_2px_4px_rgba(99,91,255,0.2)]',
        secondary: 'bg-[#FFFFFF] border border-[#E6E8EC] text-[#111827] hover:bg-[#F1F2F4] shadow-sm',
        danger: 'bg-[#EF4444] text-white hover:bg-[#dc2626] shadow-sm',
        success: 'bg-[#22C55E] text-white hover:bg-[#16a34a] shadow-sm',
        ghost: 'bg-transparent text-[#6B7280] hover:bg-[#F1F2F4] hover:text-[#111827]',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-xs gap-1.5',
        md: 'px-4 py-2 text-sm gap-2',
        lg: 'px-6 py-3 text-base gap-2',
    };

    return (
        <button
            className={cn(base, variants[variant] || variants.primary, sizes[size] || sizes.md, className)}
            {...props}
        >
            {children}
        </button>
    );
};

// ---------- Input ----------
export const Input = ({ className = '', icon: Icon, ...props }) => (
    <div className="relative">
        {Icon && <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />}
        <input
            className={cn(
                'w-full bg-[#FFFFFF] border border-[#E6E8EC] rounded-lg text-sm text-[#111827] outline-none',
                'focus:border-[#635BFF] focus:ring-2 focus:ring-[#635BFF]/10 transition-all',
                'placeholder:text-[#9CA3AF]',
                Icon ? 'pl-9 pr-4 py-2' : 'px-4 py-2',
                className
            )}
            {...props}
        />
    </div>
);

// ---------- Badge ----------
export const Badge = ({ children, variant = 'info', className = '' }) => {
    const variants = {
        info: 'bg-[#635BFF]/10 text-[#635BFF]',
        success: 'bg-[#22C55E]/10 text-[#22C55E]',
        warning: 'bg-[#F59E0B]/10 text-[#F59E0B]',
        danger: 'bg-[#EF4444]/10 text-[#EF4444]',
        secondary: 'bg-[#F1F2F4] text-[#6B7280]',
    };

    return (
        <span className={cn(
            'inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium tracking-wide',
            variants[variant] || variants.info,
            className
        )}>
            {children}
        </span>
    );
};

// ---------- Skeleton ----------
export const Skeleton = ({ className = '' }) => (
    <div className={cn('animate-pulse bg-[#F1F2F4] rounded-xl', className)} />
);

// ---------- PageHeader ----------
export const PageHeader = ({ title, subtitle, children }) => (
    <div className="flex items-center justify-between mb-8">
        <div>
            <h1 className="text-2xl font-semibold text-[#111827] tracking-tight">{title}</h1>
            {subtitle && <p className="text-sm text-[#6B7280] mt-1">{subtitle}</p>}
        </div>
        {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
);

// ---------- StatusDot ----------
export const StatusDot = ({ active = true }) => (
    <span className={cn(
        'inline-block w-2 h-2 rounded-full',
        active ? 'bg-[#22C55E] shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-[#9CA3AF]'
    )} />
);

export default { Card, Button, Input, Badge, Skeleton, PageHeader, StatusDot };
