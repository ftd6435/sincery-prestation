import React from 'react';
import { Link } from 'react-router-dom';
import {
  BoxesIcon,
  FileTextIcon,
  MailIcon,
  NewspaperIcon,
  PackageIcon } from
'lucide-react';
import { AdminCard, AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';
import {
  adminOrders,
  adminQuotes,
  contactMessages,
  orderStatusLabels,
  orderStatusTones,
  quoteStatusLabels,
  quoteStatusTones } from
'../../data/admin';
import { products } from '../../data/products';
import { articles } from '../../data/news';
import { formatShortDate } from '../../utils/format';
import { useSeo } from '../../utils/seo';

export function Dashboard() {
  useSeo(
    'Tableau de bord | Administration Sincery Prestations',
    'Vue d’ensemble de l’activité : produits, commandes, devis, messages et actualités.'
  );

  const stats = [
  {
    label: 'Produits',
    value: 245,
    icon: PackageIcon,
    to: '/admin/produits'
  },
  { label: 'Commandes', value: 32, icon: BoxesIcon, to: '/admin/commandes' },
  {
    label: 'Demandes de devis',
    value: 18,
    icon: FileTextIcon,
    to: '/admin/devis'
  },
  { label: 'Messages', value: 12, icon: MailIcon, to: '/admin/messages' },
  {
    label: 'Actualités',
    value: 24,
    icon: NewspaperIcon,
    to: '/admin/actualites'
  }];


  const lowStock = products.filter(
    (p) => p.stock <= p.lowStockThreshold
  );

  return (
    <>
      <AdminPageHeader
        title="Tableau de bord"
        description={`Activité au ${formatShortDate('2026-08-09')} — ${articles.length} articles publiés sur le site.`} />
      

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map((stat) =>
        <Link
          key={stat.label}
          to={stat.to}
          className="rounded-lg border border-line bg-white p-4 shadow-card transition-shadow hover:shadow-hover">
          
            <span className="flex h-10 w-10 items-center justify-center rounded-full inset-panel text-brand">
              <stat.icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <p className="mt-3 text-2xl font-bold text-black/90">
              {stat.value}
            </p>
            <p className="text-sm text-black/65">{stat.label}</p>
          </Link>
        )}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <AdminCard>
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <h2 className="text-lg font-semibold text-black/90">
              Dernières commandes
            </h2>
            <Link
              to="/admin/commandes"
              className="text-base font-semibold text-brand hover:text-brand-dark">
              
              Tout voir
            </Link>
          </div>
          <ul className="divide-y divide-line">
            {adminOrders.slice(0, 4).map((order) =>
            <li
              key={order.id}
              className="flex items-center justify-between gap-3 px-4 py-3">
              
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-black/90">
                    {order.reference}
                  </p>
                  <p className="truncate text-sm text-black/65">
                    {order.customer} · {order.company}
                  </p>
                </div>
                <StatusBadge tone={orderStatusTones[order.status]}>
                  {orderStatusLabels[order.status]}
                </StatusBadge>
              </li>
            )}
          </ul>
        </AdminCard>

        <AdminCard>
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <h2 className="text-lg font-semibold text-black/90">
              Dernières demandes de devis
            </h2>
            <Link
              to="/admin/devis"
              className="text-base font-semibold text-brand hover:text-brand-dark">
              
              Tout voir
            </Link>
          </div>
          <ul className="divide-y divide-line">
            {adminQuotes.slice(0, 4).map((quote) =>
            <li
              key={quote.id}
              className="flex items-center justify-between gap-3 px-4 py-3">
              
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-black/90">
                    {quote.reference}
                  </p>
                  <p className="truncate text-sm text-black/65">
                    {quote.customer} · {quote.itemCount} produits
                  </p>
                </div>
                <StatusBadge tone={quoteStatusTones[quote.status]}>
                  {quoteStatusLabels[quote.status]}
                </StatusBadge>
              </li>
            )}
          </ul>
        </AdminCard>

        <AdminCard>
          <div className="border-b border-line px-4 py-3">
            <h2 className="text-lg font-semibold text-black/90">
              Alertes de stock
            </h2>
          </div>
          <ul className="divide-y divide-line">
            {lowStock.map((product) =>
            <li
              key={product.id}
              className="flex items-center justify-between gap-3 px-4 py-3">
              
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-black/90">
                    {product.name}
                  </p>
                  <p className="text-sm text-black/65">Réf. {product.sku}</p>
                </div>
                <StatusBadge tone={product.stock === 0 ? 'danger' : 'warning'}>
                  {product.stock === 0 ?
                'Rupture' :
                `${product.stock} en stock`}
                </StatusBadge>
              </li>
            )}
          </ul>
        </AdminCard>

        <AdminCard>
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <h2 className="text-lg font-semibold text-black/90">
              Messages récents
            </h2>
            <Link
              to="/admin/messages"
              className="text-base font-semibold text-brand hover:text-brand-dark">
              
              Tout voir
            </Link>
          </div>
          <ul className="divide-y divide-line">
            {contactMessages.map((message) =>
            <li key={message.id} className="px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-base font-semibold text-black/90">
                    {message.subject}
                  </p>
                  <span className="shrink-0 text-sm text-black/45">
                    {formatShortDate(message.date)}
                  </span>
                </div>
                <p className="truncate text-sm text-black/65">
                  {message.name} · {message.email}
                </p>
              </li>
            )}
          </ul>
        </AdminCard>
      </div>
    </>);

}