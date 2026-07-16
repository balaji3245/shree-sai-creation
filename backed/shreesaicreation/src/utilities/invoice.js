import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import PDFDocument from 'pdfkit';
import { paiseToRupees } from './money.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const invoiceDir = path.join(__dirname, '../../uploads/invoices');

if (!fs.existsSync(invoiceDir)) {
  fs.mkdirSync(invoiceDir, { recursive: true });
}

export async function generateInvoicePdf(order, storeSettings = {}) {
  const filename = `${order.orderNumber}.pdf`;
  const filepath = path.join(invoiceDir, filename);

  await new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);

    const storeName = storeSettings.storeName || 'Shree Sai Creation';
    doc.fontSize(18).text(storeName, { align: 'left' });
    doc.fontSize(10).fillColor('#666').text('Tax Invoice / Order Receipt');
    doc.moveDown();
    doc.fillColor('#000');

    doc.fontSize(12).text(`Order: ${order.orderNumber}`);
    doc.text(`Date: ${new Date(order.paidAt || order.createdAt).toLocaleString('en-IN')}`);
    doc.text(`Status: ${order.status}`);
    if (storeSettings.gstin) doc.text(`GSTIN: ${storeSettings.gstin}`);
    doc.moveDown();

    const addr = order.shippingAddress || {};
    doc.fontSize(11).text('Ship To:', { underline: true });
    doc.fontSize(10).text(addr.fullName || '');
    doc.text([addr.line1, addr.line2].filter(Boolean).join(', '));
    doc.text(`${addr.city || ''}, ${addr.state || ''} ${addr.pincode || ''}`);
    doc.text(`Phone: ${addr.phone || ''}`);
    doc.moveDown();

    doc.fontSize(11).text('Items', { underline: true });
    doc.moveDown(0.5);

    for (const item of order.items || []) {
      doc
        .fontSize(10)
        .text(
          `${item.productName} (${item.variantTitle}) × ${item.quantity} — ₹${paiseToRupees(item.lineTotalInPaise)?.toFixed(2)}`
        );
      doc.fontSize(8).fillColor('#666').text(`SKU: ${item.sku} | HSN: ${item.hsnCode || '9405'}`);
      doc.fillColor('#000');
    }

    doc.moveDown();
    doc.fontSize(10).text(`Subtotal: ₹${paiseToRupees(order.subtotalInPaise)?.toFixed(2)}`);
    if (order.discountInPaise) {
      doc.text(`Discount: -₹${paiseToRupees(order.discountInPaise)?.toFixed(2)}`);
    }
    doc.text(`Shipping: ₹${paiseToRupees(order.shippingInPaise)?.toFixed(2)}`);
    doc.text(`Tax (incl.): ₹${paiseToRupees(order.taxInPaise)?.toFixed(2)}`);
    doc.fontSize(12).text(`Grand Total: ₹${paiseToRupees(order.grandTotalInPaise)?.toFixed(2)}`, {
      underline: true,
    });

    doc.end();
    stream.on('finish', resolve);
    stream.on('error', reject);
  });

  return {
    key: `invoices/${filename}`,
    filename,
    filepath,
  };
}
