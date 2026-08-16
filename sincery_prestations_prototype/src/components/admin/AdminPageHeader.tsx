import React from 'react';

export function AdminPageHeader({
  title,
  description,
  actions




}: {title: string;description?: string;actions?: React.ReactNode;}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-black/90">{title}</h1>
        {description &&
        <p className="mt-1 text-base text-black/65">{description}</p>
        }
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>);

}

export function AdminCard({
  children,
  className = ''



}: {children: React.ReactNode;className?: string;}) {
  return (
    <div
      className={`rounded-lg border border-line bg-white shadow-card ${className}`}>
      
      {children}
    </div>);

}