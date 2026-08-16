import React from 'react';
import { LegalDocument } from '../components/LegalDocument';

export function TermsAndConditions() {
  return (
    <LegalDocument
      title="Conditions générales"
      description="Conditions générales de vente et d’utilisation du site Sincery Prestations : devis, commandes sans paiement en ligne, livraison et garanties."
      updatedAt="1er août 2026"
      sections={[
      {
        heading: 'Objet',
        paragraphs: [
        'Les présentes conditions régissent l’utilisation du site et les relations commerciales entre Sincery Prestations et ses clients professionnels dans le cadre des demandes de devis et des commandes enregistrées via le site.']

      },
      {
        heading: 'Devis',
        paragraphs: [
        'Toute demande de devis fait l’objet d’un numéro de référence au format DEV-AAAA-NNNNNN. Le devis émis est valable trente jours à compter de sa date d’édition, sauf mention contraire.',
        'Les prix affichés sur le catalogue sont indicatifs et peuvent évoluer en fonction des quantités, des délais et des conditions d’approvisionnement.']

      },
      {
        heading: 'Commandes sans paiement en ligne',
        paragraphs: [
        'Le site ne comporte pas de module de paiement en ligne. Une commande enregistrée via le site constitue une demande ferme qui est confirmée par nos équipes après vérification de la disponibilité et des modalités de livraison.',
        'Les statuts de suivi sont : Nouvelle, En cours de traitement, Confirmée, Préparée, Livrée. Une commande peut être annulée avant préparation.']

      },
      {
        heading: 'Livraison',
        paragraphs: [
        'Les délais annoncés sont donnés à titre indicatif et courent à compter de la confirmation de commande. Le retrait au dépôt est possible pendant les horaires d’ouverture.']

      },
      {
        heading: 'Garanties et conformité',
        paragraphs: [
        'Les équipements de protection individuelle distribués sont conformes aux normes indiquées sur leur fiche produit. Les garanties constructeur s’appliquent dans les conditions prévues par chaque fabricant.']

      }]
      } />);


}