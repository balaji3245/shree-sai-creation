import productRepository from '../repositories/product.repository.js';
import ProductModel from '../models/product.model.js';
import { ValidationError } from '../utilities/apiResponse.js';
import { slugify, ensureUniqueSlug } from '../utilities/slugify.js';
import { rupeesToPaise, paiseToRupees } from '../utilities/money.js';

function csvEscape(value) {
  if (value == null) return '';
  const s = String(value);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function parseCsvLine(line) {
  const result = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      result.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  result.push(cur);
  return result;
}

function parseCsv(text) {
  const lines = text
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .filter((l) => l.trim().length);
  if (!lines.length) return [];
  const headers = parseCsvLine(lines[0]).map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const cols = parseCsvLine(line);
    const row = {};
    headers.forEach((h, i) => {
      row[h] = cols[i] ?? '';
    });
    return row;
  });
}

class ProductCsvService {
  async exportCsv({ status } = {}) {
    const filter = {};
    if (status) filter.status = status;

    const products = await productRepository.findMany(filter, {
      limit: 5000,
      sort: { createdAt: -1 },
    });

    const headers = [
      'name',
      'slug',
      'sku',
      'price',
      'compareAtPrice',
      'stock',
      'status',
      'productType',
      'shortDescription',
      'hsnCode',
      'numberOfLights',
      'dimmable',
      'isFeatured',
      'isBestSeller',
      'isNewArrival',
    ];

    const rows = [headers.join(',')];
    for (const p of products) {
      const v =
        p.variants?.find((x) => x.isDefault) || p.variants?.[0] || {};
      rows.push(
        [
          csvEscape(p.name),
          csvEscape(p.slug),
          csvEscape(v.sku),
          csvEscape(paiseToRupees(v.priceInPaise)),
          csvEscape(paiseToRupees(v.compareAtPriceInPaise)),
          csvEscape(v.stock),
          csvEscape(p.status),
          csvEscape(p.productType),
          csvEscape(p.shortDescription),
          csvEscape(p.hsnCode),
          csvEscape(p.numberOfLights),
          csvEscape(p.dimmable),
          csvEscape(p.isFeatured),
          csvEscape(p.isBestSeller),
          csvEscape(p.isNewArrival),
        ].join(',')
      );
    }

    return rows.join('\n');
  }

  async importCsv(csvText) {
    const rows = parseCsv(csvText);
    if (!rows.length) throw new ValidationError('CSV has no data rows');

    const results = { created: 0, updated: 0, errors: [] };
    const existingSlugs = (await productRepository.listSlugs()).map((p) => p.slug);

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        const name = row.name?.trim();
        const sku = row.sku?.trim()?.toUpperCase();
        if (!name || !sku) {
          throw new Error('name and sku required');
        }

        const price = Number(row.price);
        if (Number.isNaN(price)) throw new Error('invalid price');

        const existingBySku = await productRepository.findByVariantSku(sku);
        if (existingBySku) {
          // Update default/matching variant price+stock
          const product = await productRepository.findById(existingBySku._id);
          const variant = product.variants.find((v) => v.sku === sku);
          if (variant) {
            variant.priceInPaise = rupeesToPaise(price);
            if (row.compareAtPrice) {
              variant.compareAtPriceInPaise = rupeesToPaise(row.compareAtPrice);
            }
            if (row.stock !== '' && row.stock != null) {
              variant.stock = Number(row.stock);
            }
            product.fromPriceInPaise = Math.min(
              ...product.variants.map((v) => v.priceInPaise)
            );
            product.totalStock = product.variants
              .filter((v) => v.trackInventory)
              .reduce((s, v) => s + v.stock, 0);
            if (row.status) product.status = row.status;
            if (row.shortDescription) product.shortDescription = row.shortDescription;
            await productRepository.save(product);
            results.updated += 1;
          }
          continue;
        }

        const baseSlug = slugify(row.slug || name);
        const slug = ensureUniqueSlug(baseSlug, existingSlugs);
        existingSlugs.push(slug);

        await ProductModel.create({
          name,
          slug,
          status: row.status || 'draft',
          productType: row.productType || 'chandelier',
          shortDescription: row.shortDescription || '',
          hsnCode: row.hsnCode || '9405',
          numberOfLights: row.numberOfLights ? Number(row.numberOfLights) : null,
          dimmable: String(row.dimmable).toLowerCase() === 'true',
          isFeatured: String(row.isFeatured).toLowerCase() === 'true',
          isBestSeller: String(row.isBestSeller).toLowerCase() === 'true',
          isNewArrival: String(row.isNewArrival).toLowerCase() === 'true',
          hasOnlyDefaultVariant: true,
          fromPriceInPaise: rupeesToPaise(price),
          totalStock: Number(row.stock || 0),
          variants: [
            {
              title: 'Default',
              sku,
              priceInPaise: rupeesToPaise(price),
              compareAtPriceInPaise: row.compareAtPrice
                ? rupeesToPaise(row.compareAtPrice)
                : null,
              stock: Number(row.stock || 0),
              isDefault: true,
              isActive: true,
              options: {},
            },
          ],
          publishedAt: row.status === 'published' ? new Date() : null,
        });
        results.created += 1;
      } catch (err) {
        results.errors.push({ row: i + 2, message: err.message });
      }
    }

    return results;
  }

  async setRelatedProducts(productId, relatedProductIds = []) {
    const product = await productRepository.findById(productId);
    if (!product) throw new ValidationError('Product not found');

    const ids = relatedProductIds.filter((id) => String(id) !== String(productId));
    const updated = await productRepository.updateById(productId, {
      $set: { relatedProductIds: ids },
    });
    return { product: updated };
  }
}

export default new ProductCsvService();
