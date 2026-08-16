import React from 'react';

const inputClasses =
'w-full rounded-md border border-line bg-white px-3 py-2.5 text-base text-black/90 outline-none transition-colors placeholder:text-black/45 focus:border-brand';

interface BaseProps {
  label: string;
  name: string;
  required?: boolean;
  error?: string;
  className?: string;
}

export function TextField({
  label,
  name,
  required,
  error,
  className,
  type = 'text',
  value,
  onChange,
  placeholder





}: BaseProps & {type?: string;value: string;onChange: (value: string) => void;placeholder?: string;}) {
  return (
    <div className={className}>
      <label htmlFor={name} className="mb-1.5 block text-sm text-black/65">
        {label}
        {required && <span className="text-brand"> *</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${name}-error` : undefined}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClasses} ${error ? 'border-danger' : ''}`} />
      
      {error &&
      <p id={`${name}-error`} className="mt-1 text-sm text-danger">
          {error}
        </p>
      }
    </div>);

}

export function TextAreaField({
  label,
  name,
  required,
  error,
  className,
  value,
  onChange,
  rows = 4,
  placeholder





}: BaseProps & {value: string;onChange: (value: string) => void;rows?: number;placeholder?: string;}) {
  return (
    <div className={className}>
      <label htmlFor={name} className="mb-1.5 block text-sm text-black/65">
        {label}
        {required && <span className="text-brand"> *</span>}
      </label>
      <textarea
        id={name}
        name={name}
        rows={rows}
        value={value}
        required={required}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${name}-error` : undefined}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClasses} ${error ? 'border-danger' : ''}`} />
      
      {error &&
      <p id={`${name}-error`} className="mt-1 text-sm text-danger">
          {error}
        </p>
      }
    </div>);

}

export function SelectField({
  label,
  name,
  required,
  error,
  className,
  value,
  onChange,
  options




}: BaseProps & {value: string;onChange: (value: string) => void;options: string[];}) {
  return (
    <div className={className}>
      <label htmlFor={name} className="mb-1.5 block text-sm text-black/65">
        {label}
        {required && <span className="text-brand"> *</span>}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        required={required}
        aria-invalid={error ? true : undefined}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClasses} ${error ? 'border-danger' : ''}`}>
        
        <option value="">Sélectionner…</option>
        {options.map((o) =>
        <option key={o} value={o}>
            {o}
          </option>
        )}
      </select>
      {error &&
      <p id={`${name}-error`} className="mt-1 text-sm text-danger">
          {error}
        </p>
      }
    </div>);

}