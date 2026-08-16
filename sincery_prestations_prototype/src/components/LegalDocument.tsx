import React from 'react';
import { PageHero } from './PageHero';
import { useSeo } from '../utils/seo';

export interface LegalSection {
  heading: string;
  paragraphs: string[];
}

export function LegalDocument({
  title,
  description,
  updatedAt,
  sections





}: {title: string;description: string;updatedAt: string;sections: LegalSection[];}) {
  useSeo(`${title} | Sincery Prestations`, description);

  return (
    <>
      <PageHero title={title} crumbs={[{ label: title }]} />
      <div className="mx-auto max-w-3xl px-6 py-8">
        <p className="text-sm text-black/45">Dernière mise à jour : {updatedAt}</p>
        <div className="mt-6 space-y-8">
          {sections.map((section) =>
          <section key={section.heading}>
              <h2 className="text-lg font-semibold text-black/90">
                {section.heading}
              </h2>
              {section.paragraphs.map((paragraph, index) =>
            <p key={index} className="mt-2 text-base text-black/65">
                  {paragraph}
                </p>
            )}
            </section>
          )}
        </div>
      </div>
    </>);

}