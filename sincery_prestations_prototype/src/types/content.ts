export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string[];
  image: string;
  category: string;
  author: string;
  publishedAt: string;
  status: 'published' | 'draft';
}

export interface Partner {
  id: string;
  name: string;
  logoText: string;
  description: string;
  sector: string;
  category: string;
  country: string;
  city: string;
  website: string;
  phone: string;
  email: string;
  featured: boolean;
  active: boolean;
  order: number;
}

export type OrderStatus =
'nouvelle' |
'en_cours' |
'confirmee' |
'preparee' |
'livree' |
'annulee';

export type QuoteStatus =
'nouveau' |
'en_cours' |
'envoye' |
'accepte' |
'refuse' |
'expire';

export interface CustomerInfo {
  fullName: string;
  company: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  country: string;
  comment: string;
  preferredContact: string;
}

export interface AdminOrder {
  id: string;
  reference: string;
  customer: string;
  company: string;
  date: string;
  itemCount: number;
  status: OrderStatus;
}

export interface AdminQuote {
  id: string;
  reference: string;
  customer: string;
  company: string;
  date: string;
  itemCount: number;
  status: QuoteStatus;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  date: string;
  status: 'nouveau' | 'lu' | 'traite';
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Administrateur' | 'Éditeur';
  lastLogin: string;
  active: boolean;
}