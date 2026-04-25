import { api } from "./api";

export type SubscriptionStatus = "ACTIVE" | "PAST_DUE" | "CANCELED" | "INACTIVE";

export interface SubscriptionResponse {
  status: SubscriptionStatus;
  currentPeriodEnd: string | null;
  stripeSubscriptionId: string | null;
}

export async function getSubscription(): Promise<SubscriptionResponse | null> {
  try {
    const res = await api.get<{ data: SubscriptionResponse }>("/payments/subscription");
    return res.data.data;
  } catch {
    return null;
  }
}

export async function createCheckout(): Promise<string> {
  const res = await api.post<{ data: { url: string } }>("/payments/checkout");
  return res.data.data.url;
}

export async function createPortal(): Promise<string> {
  const res = await api.post<{ data: { url: string } }>("/payments/portal");
  return res.data.data.url;
}
