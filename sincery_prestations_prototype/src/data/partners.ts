import type { Partner } from '../types/content';

export const partnerCategories = [
'Fournisseurs',
'Fabricants',
'Distributeurs',
'Partenaires techniques',
'Partenaires commerciaux',
'Partenaires institutionnels'];


export const partners: Partner[] = [
{
  id: 'pa-1',
  name: 'ProtecLine Industries',
  logoText: 'PL',
  description:
  'Fabricant européen d’équipements de protection individuelle certifiés, spécialisé dans la protection de la tête et des mains.',
  sector: 'Équipements de protection',
  category: 'Fabricants',
  country: 'France',
  city: 'Lyon',
  website: 'https://exemple-protecline.com',
  phone: '+33 4 78 00 00 00',
  email: 'contact@exemple-protecline.com',
  featured: true,
  active: true,
  order: 1
},
{
  id: 'pa-2',
  name: 'Hydrotech Solutions',
  logoText: 'HT',
  description:
  'Spécialiste des composants hydrauliques et du sertissage sur mesure pour engins de chantier.',
  sector: 'Hydraulique industrielle',
  category: 'Partenaires techniques',
  country: 'France',
  city: 'Marseille',
  website: 'https://exemple-hydrotech.com',
  phone: '+33 4 91 00 00 00',
  email: 'contact@exemple-hydrotech.com',
  featured: false,
  active: true,
  order: 2
},
{
  id: 'pa-3',
  name: 'SecuriPlus',
  logoText: 'S+',
  description:
  'Distributeur de matériel de lutte incendie et de secourisme pour les entreprises et collectivités.',
  sector: 'Sécurité incendie',
  category: 'Distributeurs',
  country: 'Côte d’Ivoire',
  city: 'Abidjan',
  website: 'https://exemple-securiplus.com',
  phone: '+225 27 00 00 00',
  email: 'contact@exemple-securiplus.com',
  featured: false,
  active: true,
  order: 3
},
{
  id: 'pa-4',
  name: 'MécaParts Afrique',
  logoText: 'MP',
  description:
  'Fournisseur de pièces détachées et consommables pour engins de terrassement et matériel agricole.',
  sector: 'Pièces détachées',
  category: 'Fournisseurs',
  country: 'Sénégal',
  city: 'Dakar',
  website: 'https://exemple-mecaparts.com',
  phone: '+221 33 000 00 00',
  email: 'contact@exemple-mecaparts.com',
  featured: false,
  active: true,
  order: 4
},
{
  id: 'pa-5',
  name: 'LumaWorks',
  logoText: 'LW',
  description:
  'Concepteur de solutions d’éclairage LED professionnelles pour chantiers, ateliers et zones techniques.',
  sector: 'Éclairage professionnel',
  category: 'Fabricants',
  country: 'Belgique',
  city: 'Gand',
  website: 'https://exemple-lumaworks.com',
  phone: '+32 9 000 00 00',
  email: 'contact@exemple-lumaworks.com',
  featured: false,
  active: true,
  order: 5
},
{
  id: 'pa-6',
  name: 'Chambre des Métiers & Industries',
  logoText: 'CM',
  description:
  'Partenaire institutionnel accompagnant les entreprises dans leur mise en conformité sécurité au travail.',
  sector: 'Institutionnel',
  category: 'Partenaires institutionnels',
  country: 'France',
  city: 'Paris',
  website: 'https://exemple-cmi.org',
  phone: '+33 1 40 00 00 00',
  email: 'contact@exemple-cmi.org',
  featured: false,
  active: true,
  order: 6
}];