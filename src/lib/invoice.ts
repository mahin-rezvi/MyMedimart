import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { formatPrice } from "./utils";
import { Order } from "./db/types";
import { getStoreContact } from "./email";

export function getInvoiceNumber(order: Order): string {
  const storedInvoiceNo = (order as any).invoice_no || (order.shipping_address as any)?.invoiceNo;
  if (storedInvoiceNo) return String(storedInvoiceNo);
  return `INV-${String(order.id).slice(0, 8).toUpperCase()}`;
}

export async function createInvoicePdf(order: Order): Promise<Buffer> {
  const store = getStoreContact();
  const invoiceNo = getInvoiceNumber(order);
  const orderNumber = (order.shipping_address as any)?.orderNumber || String(order.id).slice(0, 8).toUpperCase();
  const customer = (order.shipping_address as any) ?? {};
  const items = Array.isArray(order.items) ? order.items : [];
  const createdAt = order.created_at ? new Date(order.created_at) : new Date();
  const subtotal = Number((order.shipping_address as any)?.subtotal ?? order.total_price ?? 0) - Number((order.shipping_address as any)?.shippingCost ?? 0);
  const shippingCost = Number((order.shipping_address as any)?.shippingCost ?? 0);
  const totalAmount = Number(order.total_price ?? (order.shipping_address as any)?.totalAmount ?? 0);
  const paymentMethod = (order.shipping_address as any)?.paymentMethod || "Unknown";

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const { width, height } = page.getSize();

  const margin = 50;
  let y = height - margin;

  page.drawText(store.name, { x: margin, y, size: 20, font: helveticaBold });
  y -= 28;
  page.drawText(store.address, { x: margin, y, size: 10, font: helvetica, color: rgb(0.4, 0.4, 0.4) });
  y -= 14;
  page.drawText(`Phone: ${store.phone}`, { x: margin, y, size: 10, font: helvetica, color: rgb(0.4, 0.4, 0.4) });

  page.drawText("Invoice", { x: width - margin - 120, y: height - margin, size: 18, font: helveticaBold });
  y -= 40;
  page.drawText(`Invoice #: ${invoiceNo}`, { x: margin, y, size: 10, font: helvetica });
  y -= 14;
  page.drawText(`Order #: ${orderNumber}`, { x: margin, y, size: 10, font: helvetica });
  y -= 14;
  page.drawText(`Date: ${createdAt.toLocaleDateString("en-BD")}`, { x: margin, y, size: 10, font: helvetica });

  y -= 26;
  page.drawText("Bill To:", { x: margin, y, size: 12, font: helveticaBold });
  y -= 16;
  page.drawText(customer.fullName || "Customer", { x: margin, y, size: 10, font: helvetica });
  y -= 14;
  if (customer.email) {
    page.drawText(String(customer.email), { x: margin, y, size: 10, font: helvetica });
    y -= 14;
  }
  if (customer.phone) {
    page.drawText(String(customer.phone), { x: margin, y, size: 10, font: helvetica });
    y -= 14;
  }
  if (customer.street) {
    page.drawText(String(customer.street), { x: margin, y, size: 10, font: helvetica });
    y -= 14;
  }
  const cityLine = [customer.area, customer.city].filter(Boolean).join(", ");
  if (cityLine) {
    page.drawText(cityLine, { x: margin, y, size: 10, font: helvetica });
    y -= 14;
  }

  y -= 12;
  page.drawText("Items", { x: margin, y, size: 12, font: helveticaBold });
  y -= 18;

  items.forEach((item: any) => {
    const itemLabel = `${item.name}${item.variant ? ` (${item.variant})` : ""}`;
    const itemAmount = formatPrice(Number(item.price ?? 0) * Number(item.qty ?? 1));
    page.drawText(itemLabel, { x: margin, y, size: 10, font: helvetica });
    page.drawText(itemAmount, { x: width - margin - 100, y, size: 10, font: helvetica });
    y -= 14;
    if (item.qty) {
      page.drawText(`Qty: ${item.qty}`, { x: margin + 10, y, size: 9, font: helvetica, color: rgb(0.4, 0.4, 0.4) });
      y -= 12;
    }
    y -= 6;
  });

  y -= 6;
  page.drawText("Subtotal", { x: margin, y, size: 10, font: helveticaBold });
  page.drawText(formatPrice(subtotal), { x: width - margin - 100, y, size: 10, font: helvetica });
  y -= 14;
  page.drawText("Shipping", { x: margin, y, size: 10, font: helveticaBold });
  page.drawText(formatPrice(shippingCost), { x: width - margin - 100, y, size: 10, font: helvetica });
  y -= 14;
  page.drawText("Total", { x: margin, y, size: 12, font: helveticaBold });
  page.drawText(formatPrice(totalAmount), { x: width - margin - 100, y, size: 12, font: helveticaBold });

  y -= 28;
  page.drawText(`Payment Method: ${paymentMethod}`, { x: margin, y, size: 10, font: helvetica });
  y -= 14;
  page.drawText(`Website: ${store.appUrl}`, { x: margin, y, size: 10, font: helvetica });

  y -= 28;
  page.drawText("Thank you for shopping with us.", { x: margin, y, size: 9, font: helvetica, color: rgb(0.4, 0.4, 0.4) });

  const bytes = await pdfDoc.save();
  return Buffer.from(bytes);
}
