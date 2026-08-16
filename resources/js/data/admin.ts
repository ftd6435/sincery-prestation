import type {
  AdminOrder,
  AdminQuote,
  AdminUser,
  ContactMessage,
  OrderStatus,
  QuoteStatus } from
'../types/content';
import type { Tone } from '../components/ui/StatusBadge';

export const orderStatusLabels: Record<OrderStatus, string> = {
  nouvelle: 'Nouvelle',
  en_cours: 'En cours de traitement',
  confirmee: 'Confirmée',
  preparee: 'Préparée',
  livree: 'Livrée',
  annulee: 'Annulée'
};

export const orderStatusTones: Record<OrderStatus, Tone> = {
  nouvelle: 'info',
  en_cours: 'warning',
  confirmee: 'info',
  preparee: 'warning',
  livree: 'success',
  annulee: 'danger'
};

export const quoteStatusLabels: Record<QuoteStatus, string> = {
  nouveau: 'Nouveau',
  en_cours: 'En cours',
  envoye: 'Devis envoyé',
  accepte: 'Accepté',
  refuse: 'Refusé',
  expire: 'Expiré'
};

export const quoteStatusTones: Record<QuoteStatus, Tone> = {
  nouveau: 'info',
  en_cours: 'warning',
  envoye: 'info',
  accepte: 'success',
  refuse: 'danger',
  expire: 'neutral'
};

export const adminOrders: AdminOrder[] = [
{
  id: 'o-1',
  reference: 'CMD-2026-000212',
  customer: 'Karim Diallo',
  company: 'BTP Horizon',
  date: '2026-08-07',
  itemCount: 14,
  status: 'nouvelle'
},
{
  id: 'o-2',
  reference: 'CMD-2026-000211',
  customer: 'Awa Traoré',
  company: 'Transafrique Logistique',
  date: '2026-08-06',
  itemCount: 6,
  status: 'en_cours'
},
{
  id: 'o-3',
  reference: 'CMD-2026-000209',
  customer: 'Julien Marchand',
  company: 'Atelier Méca Pro',
  date: '2026-08-04',
  itemCount: 3,
  status: 'confirmee'
},
{
  id: 'o-4',
  reference: 'CMD-2026-000205',
  customer: 'Fatou Ndiaye',
  company: 'Sécurité Plus',
  date: '2026-08-01',
  itemCount: 22,
  status: 'preparee'
},
{
  id: 'o-5',
  reference: 'CMD-2026-000198',
  customer: 'Marc Ouattara',
  company: 'Terrassement Ivoire',
  date: '2026-07-28',
  itemCount: 9,
  status: 'livree'
},
{
  id: 'o-6',
  reference: 'CMD-2026-000191',
  customer: 'Sophie Bernard',
  company: 'Groupe Constructa',
  date: '2026-07-22',
  itemCount: 4,
  status: 'annulee'
}];


export const adminQuotes: AdminQuote[] = [
{
  id: 'q-1',
  reference: 'DEV-2026-000125',
  customer: 'Karim Diallo',
  company: 'BTP Horizon',
  date: '2026-08-08',
  itemCount: 8,
  status: 'nouveau'
},
{
  id: 'q-2',
  reference: 'DEV-2026-000124',
  customer: 'Nadia Cherif',
  company: 'Industries Delta',
  date: '2026-08-05',
  itemCount: 12,
  status: 'en_cours'
},
{
  id: 'q-3',
  reference: 'DEV-2026-000121',
  customer: 'Paul Kouassi',
  company: 'Agri Services',
  date: '2026-08-02',
  itemCount: 5,
  status: 'envoye'
},
{
  id: 'q-4',
  reference: 'DEV-2026-000118',
  customer: 'Léa Fontaine',
  company: 'Chantiers du Nord',
  date: '2026-07-27',
  itemCount: 16,
  status: 'accepte'
},
{
  id: 'q-5',
  reference: 'DEV-2026-000112',
  customer: 'Ibrahim Sow',
  company: 'Sow Transport',
  date: '2026-07-19',
  itemCount: 2,
  status: 'refuse'
}];


export const contactMessages: ContactMessage[] = [
{
  id: 'm-1',
  name: 'Claire Dubois',
  email: 'claire.dubois@exemple.com',
  phone: '+33 6 12 34 56 78',
  subject: 'Demande de partenariat',
  message:
  'Bonjour, nous fabriquons des vêtements de travail haute visibilité et souhaiterions étudier une collaboration avec vos équipes.',
  date: '2026-08-08',
  status: 'nouveau'
},
{
  id: 'm-2',
  name: 'Yao Kablan',
  email: 'y.kablan@exemple.com',
  phone: '+225 07 00 00 00',
  subject: 'Disponibilité chaussures S3',
  message:
  'Bonjour, les chaussures de sécurité S3 en pointure 45 sont indiquées en rupture. Quel est le délai de réapprovisionnement ?',
  date: '2026-08-07',
  status: 'lu'
},
{
  id: 'm-3',
  name: 'Hélène Roux',
  email: 'h.roux@exemple.com',
  phone: '',
  subject: 'Devis équipement chantier',
  message:
  'Nous démarrons un chantier de 20 personnes en septembre et cherchons un équipement complet.',
  date: '2026-08-03',
  status: 'traite'
}];


export const adminUsers: AdminUser[] = [
{
  id: 'u-1',
  name: 'Amadou Sincery',
  email: 'direction@sincery-prestations.com',
  role: 'Super Admin',
  lastLogin: '2026-08-09',
  active: true
},
{
  id: 'u-2',
  name: 'Sandrine Kouamé',
  email: 's.kouame@sincery-prestations.com',
  role: 'Administrateur',
  lastLogin: '2026-08-08',
  active: true
},
{
  id: 'u-3',
  name: 'Thomas Leroy',
  email: 't.leroy@sincery-prestations.com',
  role: 'Éditeur',
  lastLogin: '2026-08-05',
  active: true
},
{
  id: 'u-4',
  name: 'Fatima Bah',
  email: 'f.bah@sincery-prestations.com',
  role: 'Administrateur',
  lastLogin: '2026-06-30',
  active: false
}];