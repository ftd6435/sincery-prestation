import type { Article } from '../types/content';

export const newsCategories = [
'Conseils EPI',
'Conseils sécurité',
'Nouveaux produits',
'Arrivages',
'Promotions',
'Actualités entreprise',
'Conseils pros'];


export const articles: Article[] = [
{
  id: 'a-1',
  slug: 'bien-choisir-ses-gants-de-protection',
  title: 'Bien choisir ses gants de protection selon le risque',
  excerpt:
  'Coupure, chaleur, produits chimiques : chaque risque appelle une protection spécifique. Voici comment lire une norme EN 388 et éviter les erreurs courantes.',
  content: [
  "Le gant de protection est l'EPI le plus utilisé sur le terrain, et aussi le plus souvent mal choisi. Un gant trop épais nuit à la dextérité et finit par être retiré ; un gant trop fin n'offre pas le niveau de protection attendu.",
  "La norme EN 388 encadre les risques mécaniques à travers quatre à six indices : abrasion, coupure, déchirure, perforation, puis coupe TDM et protection contre les impacts. Plus l'indice est élevé, plus la résistance est importante.",
  "Notre conseil : partez toujours du geste réel de l'opérateur. Manipulation de tôles, montage de pièces fines, travail en milieu huileux ou exposition thermique n'appellent pas les mêmes enductions. Nos équipes peuvent vous accompagner dans le choix et vous fournir des échantillons avant commande."],

  image: "/a4430595-ac4a-436f-bd75-02a9d5dd63f6.jpg",

  category: 'Conseils EPI',
  author: 'Équipe technique Sincery',
  publishedAt: '2026-07-28',
  status: 'published'
},
{
  id: 'a-2',
  slug: 'nouvel-arrivage-signalisation-engins',
  title: 'Nouvel arrivage : signalisation pour engins roulants',
  excerpt:
  'Gyrophares LED, feux de recul et barres lumineuses homologuées ECE R65 sont désormais disponibles en stock.',
  content: [
  "Nous renforçons notre gamme de signalisation destinée aux engins de chantier, véhicules d'intervention et matériel agricole.",
  "Les nouveaux modèles LED consomment jusqu'à 70 % d'énergie en moins que les gyrophares rotatifs traditionnels, avec une durée de vie nettement supérieure et une résistance aux vibrations adaptée aux usages intensifs.",
  "L'ensemble des références est homologué ECE R65 et disponible en double tension 12/24 V. Contactez-nous pour une étude d'équipement de flotte."],

  image: "/c94de528-ea0d-4f81-836f-fb8236c2c7f8.jpg",

  category: 'Arrivages',
  author: 'Service commercial',
  publishedAt: '2026-07-15',
  status: 'published'
},
{
  id: 'a-3',
  slug: 'verification-annuelle-extincteurs',
  title: 'Vérification annuelle des extincteurs : ce qu’il faut savoir',
  excerpt:
  'Périodicité, registre de sécurité, obligations de l’employeur : le point sur la maintenance de vos moyens de secours.',
  content: [
  "La présence d'extincteurs adaptés au risque est une obligation dans les locaux professionnels, tout comme leur vérification périodique par une personne compétente.",
  "Cette vérification annuelle porte sur l'état de l'appareil, la pression, l'accessibilité et la signalisation. Elle doit être consignée dans le registre de sécurité de l'établissement.",
  "Au-delà du contrôle réglementaire, pensez à la formation du personnel : un extincteur conforme mais inutilisé faute de savoir-faire ne protège personne."],

  image: "/755d3d2c-bb50-4050-981a-968860994b6d.jpg",

  category: 'Conseils sécurité',
  author: 'Équipe technique Sincery',
  publishedAt: '2026-06-22',
  status: 'published'
},
{
  id: 'a-4',
  slug: 'sincery-prestations-agrandit-son-depot',
  title: 'Sincery Prestations agrandit son dépôt logistique',
  excerpt:
  'Plus de surface de stockage pour réduire les délais de mise à disposition sur les références les plus demandées.',
  content: [
  "Afin d'améliorer la disponibilité de nos produits, nous avons agrandi notre surface de stockage et réorganisé nos zones de préparation.",
  "Concrètement, cela signifie davantage de références tenues en stock permanent et des délais de mise à disposition raccourcis sur les EPI et consommables de sécurité.",
  "Nous poursuivons par ailleurs le développement de notre catalogue avec de nouveaux partenaires fabricants."],

  image: "/fb82240a-cbf2-49ce-b8cb-9e4f17cb806b.jpg",

  category: 'Actualités entreprise',
  author: 'Direction',
  publishedAt: '2026-05-30',
  status: 'published'
},
{
  id: 'a-5',
  slug: 'equiper-une-equipe-de-chantier',
  title: 'Équiper une nouvelle équipe de chantier : la checklist',
  excerpt:
  'De la tête aux pieds, la liste des équipements à prévoir avant le démarrage d’un chantier.',
  content: [
  "Le démarrage d'un chantier est souvent l'occasion de constater qu'il manque un équipement. Une checklist simple évite les arrêts de production.",
  "Prévoyez systématiquement : protection de la tête, protection oculaire, gants adaptés aux tâches, chaussures de sécurité, vêtements haute visibilité et protections auditives si nécessaire.",
  "Côté site, n'oubliez pas le balisage, la trousse de premiers secours et les moyens d'extinction. Nous établissons des devis groupés pour ce type d'équipement complet."],

  image: "/aef75513-87f1-4112-acbf-caec4aeeda5a.jpg",

  category: 'Conseils pros',
  author: 'Service commercial',
  publishedAt: '2026-04-18',
  status: 'published'
}];


export function getArticle(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}