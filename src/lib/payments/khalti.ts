/**
 * Khalti ePayment (KPG v2) integration.
 *
 * Docs: https://docs.khalti.com/khalti-epayment/
 *
 * Flow: call initiate() server-side (needs the secret key) → redirect the
 * browser to the payment_url it returns → Khalti redirects back to
 * return_url with a `pidx` query param → we call lookup() server-side to
 * get the authoritative status. There's no webhook in KPG v2 and the
 * redirect's own query params are trivially forgeable, so lookup() is the
 * only step that should ever mark a reservation as paid.
 *
 * Unlike eSewa, Khalti has no public sandbox credentials — you need a free
 * account at https://test-admin.khalti.com (sandbox) or
 * https://admin.khalti.com (production) to get a secret key. Without
 * KHALTI_SECRET_KEY set, initiate() throws a clear error rather than
 * silently failing.
 */

function isProduction(): boolean {
  return process.env.KHALTI_MODE === "production";
}

function baseUrl(): string {
  return isProduction() ? "https://khalti.com" : "https://dev.khalti.com";
}

function secretKey(): string {
  const key = process.env.KHALTI_SECRET_KEY;
  if (!key) {
    throw new Error("KHALTI_SECRET_KEY is not set. Get one free at https://test-admin.khalti.com (sandbox) or https://admin.khalti.com (production).");
  }
  return key;
}

export type KhaltiInitiateResult = { pidx: string; payment_url: string };

export async function initiateKhaltiPayment(params: {
  amountNpr: number;
  purchaseOrderId: string;
  purchaseOrderName: string;
  returnUrl: string;
  websiteUrl: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
}): Promise<KhaltiInitiateResult> {
  const res = await fetch(`${baseUrl()}/api/v2/epayment/initiate/`, {
    method: "POST",
    headers: {
      Authorization: `key ${secretKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      return_url: params.returnUrl,
      website_url: params.websiteUrl,
      amount: params.amountNpr * 100, // Khalti's amount unit is paisa (1 NPR = 100 paisa)
      purchase_order_id: params.purchaseOrderId,
      purchase_order_name: params.purchaseOrderName,
      customer_info: {
        name: params.customerName,
        email: params.customerEmail,
        phone: params.customerPhone || undefined,
      },
    }),
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(body?.detail || body?.error_key || "Khalti initiate failed.");
  }
  return body as KhaltiInitiateResult;
}

export type KhaltiLookupResult = {
  pidx: string;
  status: "Completed" | "Pending" | "Expired" | "User canceled" | "Refunded" | string;
  total_amount: number;
  transaction_id: string | null;
};

/** The authoritative check — call this before ever marking a reservation as paid. */
export async function lookupKhaltiPayment(pidx: string): Promise<KhaltiLookupResult> {
  const res = await fetch(`${baseUrl()}/api/v2/epayment/lookup/`, {
    method: "POST",
    headers: {
      Authorization: `key ${secretKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ pidx }),
  });
  const body = await res.json();
  if (!res.ok) {
    throw new Error(body?.detail || "Khalti lookup failed.");
  }
  return body as KhaltiLookupResult;
}
