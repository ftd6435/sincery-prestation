import type { Category } from '../types/catalog';

export const categories: Category[] = [
{
  id: 'cat-1',
  slug: 'epi',
  name: 'EPI',
  description:
  'Équipements de Protection Individuelle certifiés : casques, gants, lunettes, chaussures et vêtements de travail.',
  image: "/a4430595-ac4a-436f-bd75-02a9d5dd63f6.jpg",

  children: [
  { slug: 'protection-tete', name: 'Protection de la tête' },
  { slug: 'protection-mains', name: 'Protection des mains' },
  { slug: 'protection-pieds', name: 'Protection des pieds' },
  { slug: 'protection-oculaire', name: 'Protection oculaire' }]

},
{
  id: 'cat-2',
  slug: 'accessoires-engins',
  name: 'Accessoires pour engins',
  description:
  'Pièces détachées et accessoires pour engins roulants : filtration, hydraulique, signalisation et usure.',
  image: "/c94de528-ea0d-4f81-836f-fb8236c2c7f8.jpg",

  children: [
  { slug: 'filtration', name: 'Filtration' },
  { slug: 'hydraulique', name: 'Hydraulique' },
  { slug: 'signalisation-engins', name: 'Signalisation' }]

},
{
  id: 'cat-3',
  slug: 'securite',
  name: 'Sécurité',
  description:
  'Équipements de sécurité pour vos sites : extincteurs, signalisation, premiers secours et balisage.',
  image: "/755d3d2c-bb50-4050-981a-968860994b6d.jpg",

  children: [
  { slug: 'incendie', name: 'Lutte incendie' },
  { slug: 'balisage', name: 'Balisage & signalisation' },
  { slug: 'secourisme', name: 'Secourisme' }]

},
{
  id: 'cat-4',
  slug: 'equipements-professionnels',
  name: 'Équipements professionnels',
  description:
  'Matériel et outillage professionnel pour l’atelier, le chantier et la maintenance industrielle.',
  image: "/fb82240a-cbf2-49ce-b8cb-9e4f17cb806b.jpg",

  children: [
  { slug: 'outillage', name: 'Outillage' },
  { slug: 'eclairage', name: 'Éclairage' },
  { slug: 'mesure', name: 'Mesure & contrôle' }]

}];


export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}