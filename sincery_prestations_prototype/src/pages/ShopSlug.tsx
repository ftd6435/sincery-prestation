import React from 'react';
import { useParams } from 'react-router-dom';
import { getCategory } from '../data/categories';
import { getProduct } from '../data/products';
import { Shop } from './Shop';
import { ProductDetail, ProductNotFound } from './ProductDetail';

/**
 * Resolves /boutique/[slug] to either a category listing or a product sheet,
 * matching the sitemap where both live under the same segment.
 */
export function ShopSlug() {
  const { slug = '' } = useParams();
  const category = getCategory(slug);
  if (category) return <Shop categorySlug={slug} />;

  const product = getProduct(slug);
  if (product) return <ProductDetail product={product} />;

  return <ProductNotFound />;
}