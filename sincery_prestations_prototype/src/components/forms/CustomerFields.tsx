import React from 'react';
import type { CustomerInfo } from '../../types/content';
import { SelectField, TextAreaField, TextField } from './Field';

export const emptyCustomer: CustomerInfo = {
  fullName: '',
  company: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  country: '',
  comment: '',
  preferredContact: ''
};

export function validateCustomer(
values: CustomerInfo)
: Partial<Record<keyof CustomerInfo, string>> {
  const errors: Partial<Record<keyof CustomerInfo, string>> = {};
  if (!values.fullName.trim()) errors.fullName = 'Ce champ est obligatoire.';
  if (!values.phone.trim()) errors.phone = 'Ce champ est obligatoire.';
  if (!values.email.trim()) errors.email = 'Ce champ est obligatoire.';else
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))
  errors.email = 'Adresse email invalide.';
  return errors;
}

export function CustomerFields({
  values,
  errors,
  onChange,
  commentLabel = 'Commentaire / message',
  showPreferredContact = true,
  extra







}: {values: CustomerInfo;errors: Partial<Record<keyof CustomerInfo, string>>;onChange: (field: keyof CustomerInfo, value: string) => void;commentLabel?: string;showPreferredContact?: boolean;extra?: React.ReactNode;}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <TextField
        label="Nom et prénom"
        name="fullName"
        required
        value={values.fullName}
        error={errors.fullName}
        onChange={(v) => onChange('fullName', v)} />
      
      <TextField
        label="Entreprise"
        name="company"
        value={values.company}
        onChange={(v) => onChange('company', v)} />
      
      <TextField
        label="Téléphone"
        name="phone"
        type="tel"
        required
        value={values.phone}
        error={errors.phone}
        onChange={(v) => onChange('phone', v)} />
      
      <TextField
        label="Email"
        name="email"
        type="email"
        required
        value={values.email}
        error={errors.email}
        onChange={(v) => onChange('email', v)} />
      
      <TextField
        label="Adresse"
        name="address"
        className="sm:col-span-2"
        value={values.address}
        onChange={(v) => onChange('address', v)} />
      
      <TextField
        label="Ville"
        name="city"
        value={values.city}
        onChange={(v) => onChange('city', v)} />
      
      <TextField
        label="Pays"
        name="country"
        value={values.country}
        onChange={(v) => onChange('country', v)} />
      
      {showPreferredContact &&
      <SelectField
        label="Mode de contact préféré"
        name="preferredContact"
        className="sm:col-span-2"
        value={values.preferredContact}
        onChange={(v) => onChange('preferredContact', v)}
        options={['Téléphone', 'Email', 'WhatsApp']} />

      }
      {extra}
      <TextAreaField
        label={commentLabel}
        name="comment"
        className="sm:col-span-2"
        value={values.comment}
        onChange={(v) => onChange('comment', v)}
        placeholder="Précisez vos contraintes, délais, quantités ou références particulières." />
      
    </div>);

}