export const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "ON_THE_WAY",
  "DELIVERED",
  "CANCELLED",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_META: Record<
  OrderStatus,
  { label: string; className: string; description: string }
> = {
  PENDING: {
    label: "Pending",
    className: "status-pending",
    description: "Waiting for admin review",
  },
  CONFIRMED: {
    label: "Confirmed",
    className: "status-confirmed",
    description: "Order accepted and reserved",
  },
  PROCESSING: {
    label: "Processing",
    className: "status-processing",
    description: "Items are being prepared",
  },
  ON_THE_WAY: {
    label: "On the way",
    className: "status-on-the-way",
    description: "Order has left for delivery",
  },
  DELIVERED: {
    label: "Delivered",
    className: "status-delivered",
    description: "Customer received the order",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "status-cancelled",
    description: "Order was cancelled",
  },
};

export function normalizeOrderStatus(status?: string | null): OrderStatus {
  const value = String(status ?? "PENDING").trim().toUpperCase().replaceAll("-", "_");
  if (value === "SHIPPED" || value === "OUT_FOR_DELIVERY" || value === "ON_THE_WAY") {
    return "ON_THE_WAY";
  }
  if (value === "CANCELED") return "CANCELLED";
  return ORDER_STATUSES.includes(value as OrderStatus) ? (value as OrderStatus) : "PENDING";
}

export function isOrderStatus(value: string): value is OrderStatus {
  return ORDER_STATUSES.includes(normalizeOrderStatus(value));
}
