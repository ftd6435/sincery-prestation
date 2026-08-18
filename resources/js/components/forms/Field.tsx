import { forwardRef, type ChangeEvent, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';

const inputClasses =
  'w-full rounded-md border border-line bg-white px-3 py-2.5 text-base text-black/90 outline-none transition-colors placeholder:text-black/45 focus:border-brand disabled:bg-surface-alt disabled:text-black/60 disabled:cursor-not-allowed';

interface BaseProps {
  label?: string;
  name: string;
  required?: boolean;
  error?: string | null;
  className?: string;
  helpText?: string;
  icon?: ReactNode;
  suffix?: ReactNode;
}

function ErrorText({ id, error }: { id?: string; error?: string | null }) {
  if (!error) return null;
  return (
    <p id={id} className="mt-1 text-sm text-danger">
      {error}
    </p>
  );
}

function HelpText({ value }: { value?: string }) {
  if (!value) return null;
  return <p className="mt-1 text-sm text-black/55">{value}</p>;
}

type StringOnChange = (value: string) => void;
type BoolOnChange = (checked: boolean) => void;

// ———————————————————————————————————————————————————————————————————————————
// TextField
// ———————————————————————————————————————————————————————————————————————————

export type TextFieldProps = BaseProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, 'name' | 'required' | 'className' | 'onChange' | 'ref'> & {
    onChange?: StringOnChange | InputHTMLAttributes<HTMLInputElement>['onChange'];
  };

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(props, ref) {
  const {
    label,
    name,
    required,
    error,
    className,
    helpText,
    icon,
    suffix,
    type = 'text',
    placeholder,
    disabled,
    id,
    value,
    onChange,
    ...rest
  } = props;

  const wrapperId = id ?? name;
  const inputId = `${wrapperId}-input`;
  const errId = error ? `${wrapperId}-error` : undefined;
  const helpId = helpText ? `${wrapperId}-help` : undefined;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!onChange) return;
    if (typeof onChange === 'function') {
      if (typeof value !== 'undefined') {
        (onChange as StringOnChange)(e.target.value);
      } else {
        (onChange as (e: ChangeEvent<HTMLInputElement>) => void)(e);
      }
    }
  };

  const resolvedValue =
    typeof value === 'undefined' || value === null
      ? undefined
      : typeof value === 'string' || typeof value === 'number'
        ? String(value)
        : value;

  const input = (
    <input
      {...rest}
      ref={ref}
      id={inputId}
      name={name}
      type={type}
      value={resolvedValue as never}
      required={required}
      placeholder={placeholder}
      disabled={disabled}
      aria-invalid={!!error || undefined}
      aria-describedby={[errId, helpId].filter(Boolean).join(' ') || undefined}
      onChange={handleChange}
      className={`${inputClasses} ${error ? 'border-danger' : ''} ${icon ? 'pl-10' : ''} ${suffix ? 'pr-10' : ''}`}
    />
  );

  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm text-black/65">
          {label}
          {required && <span className="text-brand"> *</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-black/45">
            {icon}
          </span>
        )}
        {input}
        {suffix && (
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-black/45">
            {suffix}
          </span>
        )}
      </div>
      <ErrorText id={errId} error={error} />
      <HelpText value={helpText} />
    </div>
  );
});

// ———————————————————————————————————————————————————————————————————————————
// TextAreaField
// ———————————————————————————————————————————————————————————————————————————

export type TextAreaFieldProps = BaseProps &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'name' | 'required' | 'className' | 'onChange' | 'ref'> & {
    onChange?: StringOnChange | TextareaHTMLAttributes<HTMLTextAreaElement>['onChange'];
  };

export const TextAreaField = forwardRef<HTMLTextAreaElement, TextAreaFieldProps>(function TextAreaField(props, ref) {
  const {
    label,
    name,
    required,
    error,
    className,
    helpText,
    value,
    onChange,
    rows = 4,
    placeholder,
    disabled,
    id,
    ...rest
  } = props;

  const wrapperId = id ?? name;
  const inputId = `${wrapperId}-input`;
  const errId = error ? `${wrapperId}-error` : undefined;
  const helpId = helpText ? `${wrapperId}-help` : undefined;

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    if (!onChange) return;
    if (typeof value !== 'undefined') {
      (onChange as StringOnChange)(e.target.value);
    } else {
      (onChange as (e: ChangeEvent<HTMLTextAreaElement>) => void)(e);
    }
  };

  const resolvedValue =
    typeof value === 'undefined' || value === null ? undefined : String(value);

  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm text-black/65">
          {label}
          {required && <span className="text-brand"> *</span>}
        </label>
      )}
      <textarea
        {...rest}
        ref={ref}
        id={inputId}
        name={name}
        rows={rows}
        value={resolvedValue}
        required={required}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={!!error || undefined}
        aria-describedby={[errId, helpId].filter(Boolean).join(' ') || undefined}
        onChange={handleChange}
        className={`${inputClasses} ${error ? 'border-danger' : ''}`}
      />
      <ErrorText id={errId} error={error} />
      <HelpText value={helpText} />
    </div>
  );
});

// ———————————————————————————————————————————————————————————————————————————
// SelectField
// ———————————————————————————————————————————————————————————————————————————

type SelectOption = string | { value: string | number; label: ReactNode; disabled?: boolean };

export type SelectFieldProps = BaseProps &
  Omit<SelectHTMLAttributes<HTMLSelectElement>, 'name' | 'required' | 'className' | 'onChange' | 'ref'> & {
    onChange?: StringOnChange | SelectHTMLAttributes<HTMLSelectElement>['onChange'];
    options: SelectOption[];
    emptyLabel?: string | null;
  };

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(function SelectField(props, ref) {
  const {
    label,
    name,
    required,
    error,
    className,
    helpText,
    value,
    onChange,
    options,
    emptyLabel = 'Sélectionner…',
    disabled,
    id,
    ...rest
  } = props;

  const wrapperId = id ?? name;
  const inputId = `${wrapperId}-input`;
  const errId = error ? `${wrapperId}-error` : undefined;
  const helpId = helpText ? `${wrapperId}-help` : undefined;

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    if (!onChange) return;
    if (typeof value !== 'undefined') {
      (onChange as StringOnChange)(e.target.value);
    } else {
      (onChange as (e: ChangeEvent<HTMLSelectElement>) => void)(e);
    }
  };

  const resolvedValue =
    typeof value === 'undefined' || value === null ? undefined : String(value);

  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm text-black/65">
          {label}
          {required && <span className="text-brand"> *</span>}
        </label>
      )}
      <select
        {...rest}
        ref={ref}
        id={inputId}
        name={name}
        value={resolvedValue}
        required={required}
        disabled={disabled}
        aria-invalid={!!error || undefined}
        aria-describedby={[errId, helpId].filter(Boolean).join(' ') || undefined}
        onChange={handleChange}
        className={`${inputClasses} ${error ? 'border-danger' : ''} pr-8`}
      >
        {emptyLabel !== null && <option value="">{emptyLabel}</option>}
        {options.map((o, i) =>
          typeof o === 'string' ? (
            <option key={`${o}-${i}`} value={o}>
              {o}
            </option>
          ) : (
            <option key={`${o.value}-${i}`} value={o.value} disabled={o.disabled}>
              {o.label}
            </option>
          ),
        )}
      </select>
      <ErrorText id={errId} error={error} />
      <HelpText value={helpText} />
    </div>
  );
});

// ———————————————————————————————————————————————————————————————————————————
// CheckboxField
// ———————————————————————————————————————————————————————————————————————————

export type CheckboxFieldProps = BaseProps &
  Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'name' | 'type' | 'required' | 'value' | 'className' | 'onChange' | 'ref'
  > & {
    value?: string;
    onChange?: BoolOnChange | InputHTMLAttributes<HTMLInputElement>['onChange'];
  };

export const CheckboxField = forwardRef<HTMLInputElement, CheckboxFieldProps>(function CheckboxField(props, ref) {
  const {
    label,
    name,
    required,
    error,
    className,
    helpText,
    checked,
    value,
    onChange,
    disabled,
    id,
    ...rest
  } = props;

  const wrapperId = id ?? name;
  const inputId = `${wrapperId}-input`;
  const errId = error ? `${wrapperId}-error` : undefined;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!onChange) return;
    if (typeof checked !== 'undefined') {
      (onChange as BoolOnChange)(e.target.checked);
    } else {
      (onChange as (e: ChangeEvent<HTMLInputElement>) => void)(e);
    }
  };

  const resolvedChecked =
    typeof checked === 'undefined' || checked === null ? undefined : Boolean(checked);

  return (
    <label
      htmlFor={inputId}
      className={`${className ?? ''} flex cursor-pointer items-start gap-3 ${disabled ? 'opacity-60' : ''}`}
    >
      <input
        {...rest}
        ref={ref}
        id={inputId}
        name={name}
        type="checkbox"
        required={required}
        checked={resolvedChecked}
        value={value}
        disabled={disabled}
        aria-invalid={!!error || undefined}
        aria-describedby={errId}
        onChange={handleChange}
        className="mt-1 h-4 w-4 shrink-0 rounded border-line text-brand focus:ring-brand focus:ring-2"
      />
      <span className="flex-1">
        {label && (
          <span className="text-sm text-black/75">
            {label}
            {required && <span className="text-brand"> *</span>}
          </span>
        )}
        <HelpText value={helpText} />
        <ErrorText id={errId} error={error} />
      </span>
    </label>
  );
});
