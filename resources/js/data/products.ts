import type { Product } from '../types/catalog';

const IMG_EPI = "/a4430595-ac4a-436f-bd75-02a9d5dd63f6.jpg";

const IMG_ENGINS = "/c94de528-ea0d-4f81-836f-fb8236c2c7f8.jpg";

const IMG_SECU = "/755d3d2c-bb50-4050-981a-968860994b6d.jpg";

const IMG_PRO = "/fb82240a-cbf2-49ce-b8cb-9e4f17cb806b.jpg";

const IMG_HERO = "/aef75513-87f1-4112-acbf-caec4aeeda5a.jpg";


export const products: Product[] = [
{
  id: 'p-1',
  slug: 'casque-de-protection-chantier',
  name: 'Casque de protection chantier',
  sku: 'EPI-CAS-001',
  categorySlug: 'epi',
  subCategory: 'Protection de la tête',
  shortDescription:
  'Casque de chantier ventilé conforme EN 397, harnais 6 points réglable.',
  description:
  "Casque de protection destiné aux environnements de chantier et industriels. Sa coque en polyéthylène haute densité absorbe efficacement les chocs, tandis que son harnais textile 6 points assure un maintien stable et confortable tout au long de la journée. La molette de serrage permet un réglage rapide, même avec des gants.",
  specs: [
  { label: 'Norme', value: 'EN 397' },
  { label: 'Matière', value: 'Polyéthylène haute densité' },
  { label: 'Harnais', value: '6 points, réglage molette' },
  { label: 'Poids', value: '350 g' },
  { label: 'Coloris', value: 'Blanc, rouge, jaune' }],

  price: 12500,
  quoteOnly: false,
  unit: 'Pièce',
  stock: 148,
  lowStockThreshold: 20,
  images: [IMG_EPI, IMG_HERO, IMG_PRO],
  status: 'published',
  featured: true,
  createdAt: '2026-06-12'
},
{
  id: 'p-2',
  slug: 'gants-anti-coupure-niveau-5',
  name: 'Gants anti-coupure niveau 5',
  sku: 'EPI-GAN-014',
  categorySlug: 'epi',
  subCategory: 'Protection des mains',
  shortDescription:
  'Gants de manutention enduits polyuréthane, résistance à la coupure niveau 5.',
  description:
  "Gants techniques conçus pour la manutention de pièces coupantes : tôles, vitrages, pièces métalliques. Le support tricoté sans couture offre une grande dextérité et l'enduction polyuréthane garantit une excellente préhension en milieu sec ou légèrement huileux.",
  specs: [
  { label: 'Norme', value: 'EN 388 : 4X43C' },
  { label: 'Enduction', value: 'Polyuréthane' },
  { label: 'Tailles', value: '7 à 11' },
  { label: 'Conditionnement', value: 'Paire' }],

  price: 4500,
  quoteOnly: false,
  unit: 'Paire',
  stock: 12,
  lowStockThreshold: 20,
  images: [IMG_EPI, IMG_PRO],
  status: 'published',
  featured: true,
  createdAt: '2026-07-02'
},
{
  id: 'p-3',
  slug: 'chaussures-securite-s3',
  name: 'Chaussures de sécurité S3',
  sku: 'EPI-CHA-032',
  categorySlug: 'epi',
  subCategory: 'Protection des pieds',
  shortDescription:
  'Chaussure montante S3, embout composite, semelle anti-perforation.',
  description:
  "Chaussure de sécurité montante conçue pour les environnements humides et les chantiers. Embout composite non métallique, semelle anti-perforation textile et semelage antidérapant SRC. Tige cuir hydrofuge avec doublure respirante.",
  specs: [
  { label: 'Norme', value: 'EN ISO 20345 S3 SRC' },
  { label: 'Embout', value: 'Composite 200 J' },
  { label: 'Pointures', value: '38 à 47' },
  { label: 'Semelle', value: 'PU/PU antidérapante' }],

  price: 38000,
  quoteOnly: false,
  unit: 'Paire',
  stock: 0,
  lowStockThreshold: 10,
  images: [IMG_EPI, IMG_HERO],
  status: 'published',
  featured: false,
  createdAt: '2026-05-20'
},
{
  id: 'p-4',
  slug: 'lunettes-de-protection-panoramiques',
  name: 'Lunettes de protection panoramiques',
  sku: 'EPI-LUN-008',
  categorySlug: 'epi',
  subCategory: 'Protection oculaire',
  shortDescription:
  'Lunettes-masque anti-buée et anti-rayures, champ de vision panoramique.',
  description:
  "Lunettes-masque à monture souple offrant une protection intégrale contre les projections de particules et de liquides. Traitement anti-buée sur la face interne et anti-rayures sur la face externe. Compatibles avec le port de lunettes correctrices.",
  specs: [
  { label: 'Norme', value: 'EN 166 : 1 B 3 4' },
  { label: 'Écran', value: 'Polycarbonate incolore' },
  { label: 'Traitement', value: 'Anti-buée / anti-rayures' }],

  price: 8900,
  quoteOnly: false,
  unit: 'Pièce',
  stock: 64,
  lowStockThreshold: 15,
  images: [IMG_EPI],
  status: 'published',
  featured: false,
  createdAt: '2026-07-18'
},
{
  id: 'p-5',
  slug: 'gyrophare-led-orange',
  name: 'Gyrophare LED orange',
  sku: 'ENG-GYR-101',
  categorySlug: 'accessoires-engins',
  subCategory: 'Signalisation',
  shortDescription:
  'Gyrophare LED 12/24 V, fixation magnétique, indice de protection IP66.',
  description:
  "Gyrophare à LED haute luminosité pour engins de chantier, véhicules d'intervention et matériel agricole. Double tension 12/24 V, consommation réduite et durée de vie supérieure aux modèles à lampe rotative. Base magnétique renforcée avec câble spiralé et prise allume-cigare.",
  specs: [
  { label: 'Tension', value: '12 / 24 V' },
  { label: 'Indice de protection', value: 'IP66' },
  { label: 'Fixation', value: 'Magnétique' },
  { label: 'Homologation', value: 'ECE R65' }],

  price: 27500,
  quoteOnly: false,
  unit: 'Pièce',
  stock: 33,
  lowStockThreshold: 10,
  images: [IMG_ENGINS, IMG_PRO],
  status: 'published',
  featured: true,
  createdAt: '2026-07-25'
},
{
  id: 'p-6',
  slug: 'kit-filtration-hydraulique',
  name: 'Kit de filtration hydraulique',
  sku: 'ENG-FIL-220',
  categorySlug: 'accessoires-engins',
  subCategory: 'Filtration',
  shortDescription:
  'Kit complet de filtres pour entretien périodique d’engins de terrassement.',
  description:
  "Kit d'entretien regroupant filtre à huile, filtre à gazole, filtre à air et filtre hydraulique. Compatible avec les principales marques d'engins de terrassement. Référence à confirmer selon le modèle et le numéro de série de votre machine.",
  specs: [
  { label: 'Contenu', value: '4 filtres' },
  { label: 'Compatibilité', value: 'Selon modèle d’engin' },
  { label: 'Périodicité', value: '500 h' }],

  price: null,
  quoteOnly: true,
  unit: 'Kit',
  stock: 8,
  lowStockThreshold: 10,
  images: [IMG_ENGINS],
  status: 'published',
  featured: false,
  createdAt: '2026-06-30'
},
{
  id: 'p-7',
  slug: 'flexible-hydraulique-haute-pression',
  name: 'Flexible hydraulique haute pression',
  sku: 'ENG-HYD-315',
  categorySlug: 'accessoires-engins',
  subCategory: 'Hydraulique',
  shortDescription:
  'Flexible 2 nappes, sertissage sur mesure, pression de service 275 bar.',
  description:
  "Flexible hydraulique deux nappes métalliques destiné aux circuits haute pression des engins et machines industrielles. Sertissage réalisé sur mesure selon la longueur et les embouts souhaités. Prix établi sur devis en fonction du diamètre, de la longueur et des raccords.",
  specs: [
  { label: 'Type', value: '2 nappes (2SN)' },
  { label: 'Pression', value: '275 bar' },
  { label: 'Diamètres', value: 'DN6 à DN25' },
  { label: 'Sertissage', value: 'Sur mesure' }],

  price: null,
  quoteOnly: true,
  unit: 'Mètre',
  stock: 120,
  lowStockThreshold: 30,
  images: [IMG_ENGINS, IMG_HERO],
  status: 'published',
  featured: false,
  createdAt: '2026-04-11'
},
{
  id: 'p-8',
  slug: 'extincteur-poudre-6kg',
  name: 'Extincteur à poudre 6 kg',
  sku: 'SEC-EXT-045',
  categorySlug: 'securite',
  subCategory: 'Lutte incendie',
  shortDescription:
  'Extincteur polyvalent ABC 6 kg avec support mural et manomètre.',
  description:
  "Extincteur à poudre polyvalente ABC pour la protection des locaux professionnels, ateliers et véhicules. Livré avec support mural, manomètre de contrôle et notice d'utilisation. Maintenance annuelle recommandée.",
  specs: [
  { label: 'Classe de feu', value: 'A / B / C' },
  { label: 'Capacité', value: '6 kg' },
  { label: 'Norme', value: 'EN 3-7' },
  { label: 'Livré avec', value: 'Support mural' }],

  price: 45000,
  quoteOnly: false,
  unit: 'Pièce',
  stock: 27,
  lowStockThreshold: 10,
  images: [IMG_SECU, IMG_PRO],
  status: 'published',
  featured: true,
  createdAt: '2026-07-08'
},
{
  id: 'p-9',
  slug: 'cone-de-signalisation-750mm',
  name: 'Cône de signalisation 750 mm',
  sku: 'SEC-CON-012',
  categorySlug: 'securite',
  subCategory: 'Balisage & signalisation',
  shortDescription:
  'Cône PVC souple avec bandes rétro-réfléchissantes, base lestée.',
  description:
  "Cône de balisage en PVC souple résistant aux chocs et aux UV. Deux bandes rétro-réfléchissantes garantissent une visibilité optimale de nuit. Base large lestée assurant une bonne stabilité, même en extérieur venté.",
  specs: [
  { label: 'Hauteur', value: '750 mm' },
  { label: 'Matière', value: 'PVC souple' },
  { label: 'Bandes', value: '2 bandes rétro-réfléchissantes' },
  { label: 'Poids', value: '3,2 kg' }],

  price: 15000,
  quoteOnly: false,
  unit: 'Pièce',
  stock: 210,
  lowStockThreshold: 40,
  images: [IMG_SECU],
  status: 'published',
  featured: false,
  createdAt: '2026-03-05'
},
{
  id: 'p-10',
  slug: 'trousse-de-premiers-secours',
  name: 'Trousse de premiers secours',
  sku: 'SEC-SEC-077',
  categorySlug: 'securite',
  subCategory: 'Secourisme',
  shortDescription:
  'Trousse complète 10 personnes, valise murale avec compartiments.',
  description:
  "Trousse de premiers secours destinée aux ateliers, bureaux et véhicules d'entreprise. Valise murale rigide compartimentée contenant pansements, compresses, bandes, désinfectant, gants et couverture de survie.",
  specs: [
  { label: 'Capacité', value: '10 personnes' },
  { label: 'Contenu', value: '45 éléments' },
  { label: 'Fixation', value: 'Murale ou transportable' }],

  price: 32000,
  quoteOnly: false,
  unit: 'Pièce',
  stock: 6,
  lowStockThreshold: 10,
  images: [IMG_SECU, IMG_PRO],
  status: 'published',
  featured: false,
  createdAt: '2026-06-01'
},
{
  id: 'p-11',
  slug: 'projecteur-de-chantier-led-50w',
  name: 'Projecteur de chantier LED 50 W',
  sku: 'PRO-ECL-190',
  categorySlug: 'equipements-professionnels',
  subCategory: 'Éclairage',
  shortDescription:
  'Projecteur LED 50 W sur trépied, étanche IP65, câble 3 m.',
  description:
  "Projecteur de chantier à LED offrant un flux lumineux de 4 500 lumens pour l'éclairage de zones de travail. Corps aluminium à ailettes de refroidissement, verre trempé et joint silicone assurant une étanchéité IP65. Trépied télescopique inclus.",
  specs: [
  { label: 'Puissance', value: '50 W' },
  { label: 'Flux lumineux', value: '4 500 lm' },
  { label: 'Indice de protection', value: 'IP65' },
  { label: 'Trépied', value: 'Télescopique 1,8 m' }],

  price: 52000,
  quoteOnly: false,
  unit: 'Pièce',
  stock: 41,
  lowStockThreshold: 12,
  images: [IMG_PRO, IMG_HERO],
  status: 'published',
  featured: true,
  createdAt: '2026-07-30'
},
{
  id: 'p-12',
  slug: 'cle-dynamometrique-professionnelle',
  name: 'Clé dynamométrique professionnelle',
  sku: 'PRO-OUT-256',
  categorySlug: 'equipements-professionnels',
  subCategory: 'Outillage',
  shortDescription:
  'Clé dynamométrique 40-210 Nm, carré 1/2", livrée en coffret.',
  description:
  "Clé dynamométrique à déclenchement pour serrages contrôlés en atelier et maintenance. Précision ±3 %, réglage rapide par molette et verrouillage. Livrée en coffret avec certificat d'étalonnage.",
  specs: [
  { label: 'Plage', value: '40 - 210 Nm' },
  { label: 'Entraînement', value: 'Carré 1/2"' },
  { label: 'Précision', value: '± 3 %' },
  { label: 'Livré avec', value: 'Coffret + certificat' }],

  price: 89000,
  quoteOnly: false,
  unit: 'Pièce',
  stock: 15,
  lowStockThreshold: 5,
  images: [IMG_PRO],
  status: 'published',
  featured: false,
  createdAt: '2026-05-14'
}];


export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}