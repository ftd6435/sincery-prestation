import React from 'react';
import { LegalDocument } from '../components/LegalDocument';
import { company } from '../data/company';

export function LegalNotice() {
  return (
    <LegalDocument
      title="Mentions légales"
      description="Mentions légales du site Sincery Prestations : éditeur, hébergeur, propriété intellectuelle et responsabilité."
      updatedAt="1er août 2026"
      sections={[
      {
        heading: 'Éditeur du site',
        paragraphs: [
        `${company.name} — vente d’équipements professionnels, EPI, accessoires pour engins et matériel de sécurité.`,
        `Adresse : ${company.address}. Téléphone : ${company.phone}. Email : ${company.email}.`]

      },
      {
        heading: 'Hébergement',
        paragraphs: [
        'Le site est hébergé sur une infrastructure professionnelle sécurisée. Les coordonnées de l’hébergeur sont communiquées sur simple demande écrite.']

      },
      {
        heading: 'Propriété intellectuelle',
        paragraphs: [
        'L’ensemble des contenus du site (textes, visuels, logos, fiches produits) est protégé. Toute reproduction, même partielle, est interdite sans autorisation écrite préalable.']

      },
      {
        heading: 'Responsabilité',
        paragraphs: [
        'Les informations techniques publiées sont fournies à titre indicatif et ne se substituent pas aux notices des fabricants. Sincery Prestations ne saurait être tenue responsable d’un usage non conforme des équipements distribués.']

      }]
      } />);


}