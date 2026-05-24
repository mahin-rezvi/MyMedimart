import { Order } from "./db/types";
import { formatPrice } from "./utils";

const defaultTeamPhone = "01781452943";

function toBangladeshE164(phone: string): string {
  const digits = phone.replace(/\D/g, "");

  if (digits.startsWith("880")) return digits;
  if (digits.startsWith("0")) return `88${digits}`;
  if (digits.length === 10) return `880${digits}`;

  return digits;
}

function buildOrderMessage(order: Order): string {
  const shippingAddress = order.shipping_address ?? {};
  const items = Array.isArray(order.items) ? order.items : [];
  const orderNumber = shippingAddress.orderNumber ?? String(order.id).slice(0, 8).toUpperCase();
  const totalAmount = Number(order.total_price ?? shippingAddress.totalAmount ?? 0);
  const customerName = shippingAddress.fullName ?? "Customer";
  const customerPhone = shippingAddress.phone ?? "";
  const address = [shippingAddress.street, shippingAddress.area, shippingAddress.city]
    .filter(Boolean)
    .join(", ");
  const itemLines = items
    .map((item) => `- ${item.name}${item.variant ? ` (${item.variant})` : ""} x${item.qty}`)
    .join("\n");

  return [
    "New MediMart order",
    `Order: ${orderNumber}`,
    `Customer: ${customerName}`,
    `Phone: ${customerPhone}`,
    `Address: ${address || "Not provided"}`,
    `Payment: ${shippingAddress.paymentMethod ?? "Unknown"}`,
    `Total: ${formatPrice(totalAmount)}`,
    "",
    "Items:",
    itemLines || "- No items",
  ].join("\n");
}

export async function sendWhatsAppOrderNotification(order: Order): Promise<boolean> {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const apiVersion = process.env.WHATSAPP_API_VERSION || "v25.0";
  const recipient = toBangladeshE164(process.env.WHATSAPP_ORDER_PHONE || defaultTeamPhone);

  if (!accessToken || !phoneNumberId) {
    throw new Error("Missing WhatsApp configuration. Set WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID.");
  }

  const response = await fetch(`https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: recipient,
      type: "text",
      text: {
        preview_url: false,
        body: buildOrderMessage(order),
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`WhatsApp API failed with ${response.status}: ${errorBody}`);
  }

  return true;
}
