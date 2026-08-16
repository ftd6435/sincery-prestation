import { LegalDocument } from '../components/LegalDocument';
import { company } from '../data/company';

export function PrivacyPolicy() {
  return (
    <LegalDocument
      title="Politique de confidentialité"
      description="Politique de confidentialité de Sincery Prestations : données collectées, finalités, durée de conservation et droits des utilisateurs."
      updatedAt="1er août 2026"
      sections={[
      {
        heading: 'Données collectées',
        paragraphs: [
        'Nous collectons uniquement les données nécessaires au traitement de vos demandes : nom et prénom, entreprise, téléphone, email, adresse de livraison et contenu des messages transmis via nos formulaires de contact, de devis et de commande.',
        'Aucune donnée bancaire n’est collectée : le site ne comporte pas de module de paiement en ligne.']

      },
      {
        heading: 'Finalités du traitement',
        paragraphs: [
        'Vos données sont utilisées pour établir vos devis, traiter vos commandes, répondre à vos demandes d’information et, le cas échéant, vous informer de nos actualités commerciales.']

      },
      {
        heading: 'Durée de conservation',
        paragraphs: [
        'Les données liées à une demande de devis sont conservées trois ans à compter du dernier contact. Les données liées à une commande sont conservées selon les obligations comptables et fiscales applicables.']

      },
      {
        heading: 'Vos droits',
        paragraphs: [
        `Vous disposez d’un droit d’accès, de rectification, d’effacement, de limitation et d’opposition sur vos données. Pour l’exercer, écrivez-nous à ${company.email}.`]

      },
      {
        heading: 'Cookies',
        paragraphs: [
        'Le site utilise des cookies techniques nécessaires à son fonctionnement, notamment pour conserver votre liste de sélection pendant votre visite, ainsi que des cookies de mesure d’audience anonymisés.']

      }]
      } />);


}
