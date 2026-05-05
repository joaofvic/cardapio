export type OrderStatus =
  | "pending"
  | "preparing"
  | "delivery"
  | "completed"
  | "cancelled";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pendente",
  preparing: "Preparando",
  delivery: "Em Rota",
  completed: "Concluído",
  cancelled: "Cancelado",
};

const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["preparing", "cancelled"],
  preparing: ["delivery", "cancelled"],
  delivery: ["completed"],
  completed: [],
  cancelled: [],
};

export function getNextStatuses(current: OrderStatus): OrderStatus[] {
  return ALLOWED_TRANSITIONS[current] ?? [];
}

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  if (from === to) return true;
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}
