/**
 * eSewa ePay v2 integration.
 *
 * Docs: https://developer.esewa.com.np/pages/Epay#epay-v2
 *
 * Flow: build signed form fields → browser auto-submits a POST form to
 * eSewa's hosted payment page → eSewa redirects back to successUrl (with a
 * base64-encoded `data` query param) or failureUrl → we independently
 * verify via eSewa's own status-check endpoint before trusting the result
 * (the redirect alone is not proof of payment — anyone could hit
 * successUrl directly with a crafted `data` value).
 *
 * Sandbox works out of the box using eSewa's publicly documented UAT
 * merchant (product code "EPAYTEST") — no signup needed to test the flow.
 * Going live requires your own merchant account from
 * https://merchant.esewa.com.np, with ESEWA_PRODUCT_CODE and
 * ESEWA_SECRET_KEY set to your real credentials and ESEWA_MODE=production.
 */

const UAT_SECRET_KEY = "8gBm/:&EnhH.1/q"; // eSewa's publicly documented UAT test secret

function isProduction(): boolean {
  return process.env.ESEWA_MODE === "production";
}

function productCode(): string {
  return process.env.ESEWA_PRODUCT_CODE || "EPAYTEST";
}

function secretKey(): string {
  return process.env.ESEWA_SECRET_KEY || UAT_SECRET_KEY;
}

export function esewaFormUrl(): string {
  return isProduction()
    ? "https://epay.esewa.com.np/api/epay/main/v2/form"
    : "https://rc-epay.esewa.com.np/api/epay/main/v2/form";
}

function statusCheckUrl(): string {
  return isProduction()
    ? "https://epay.esewa.com.np/api/epay/transaction/status/"
    : "https://rc.esewa.com.np/api/epay/transaction/status/";
}

async function hmacSha256Base64(message: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
  ]);
  const sigBuffer = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return Buffer.from(sigBuffer).toString("base64");
}

export type EsewaFormFields = {
  amount: string;
  tax_amount: string;
  total_amount: string;
  transaction_uuid: string;
  product_code: string;
  product_service_charge: string;
  product_delivery_charge: string;
  success_url: string;
  failure_url: string;
  signed_field_names: string;
  signature: string;
};

/** Builds the exact field set + signature eSewa's hosted form expects. */
export async function buildEsewaFormFields(params: {
  amountNpr: number;
  transactionUuid: string;
  successUrl: string;
  failureUrl: string;
}): Promise<EsewaFormFields> {
  const amount = String(params.amountNpr);
  const totalAmount = amount; // no separate tax/service/delivery charges for this use case
  const signedFieldNames = "total_amount,transaction_uuid,product_code";
  // Signature message field ORDER must exactly match signed_field_names, comma-separated, no spaces.
  const message = `total_amount=${totalAmount},transaction_uuid=${params.transactionUuid},product_code=${productCode()}`;
  const signature = await hmacSha256Base64(message, secretKey());

  return {
    amount,
    tax_amount: "0",
    total_amount: totalAmount,
    transaction_uuid: params.transactionUuid,
    product_code: productCode(),
    product_service_charge: "0",
    product_delivery_charge: "0",
    success_url: params.successUrl,
    failure_url: params.failureUrl,
    signed_field_names: signedFieldNames,
    signature,
  };
}

export type EsewaCallbackData = {
  transaction_code: string;
  status: string;
  total_amount: string;
  transaction_uuid: string;
  product_code: string;
  signed_field_names: string;
  signature: string;
};

/** Decodes the base64 `data` query param eSewa appends to success/failure redirects. */
export function decodeEsewaCallbackData(base64Data: string): EsewaCallbackData | null {
  try {
    return JSON.parse(Buffer.from(base64Data, "base64").toString("utf-8"));
  } catch {
    return null;
  }
}

/** Verifies the callback's own signature matches what we'd expect — a first check, not the final word (see verifyEsewaTransactionStatus). */
export async function verifyEsewaCallbackSignature(data: EsewaCallbackData): Promise<boolean> {
  const fields = data.signed_field_names.split(",");
  const message = fields.map((f) => `${f}=${(data as unknown as Record<string, string>)[f]}`).join(",");
  const expected = await hmacSha256Base64(message, secretKey());
  return expected === data.signature;
}

/**
 * The authoritative check: asks eSewa's own servers directly whether this
 * transaction actually completed, rather than trusting the redirect. This
 * is the step that actually determines whether a reservation gets marked
 * paid.
 */
export async function verifyEsewaTransactionStatus(params: {
  transactionUuid: string;
  totalAmount: number;
}): Promise<{ complete: boolean; status: string }> {
  const url = new URL(statusCheckUrl());
  url.searchParams.set("product_code", productCode());
  url.searchParams.set("total_amount", String(params.totalAmount));
  url.searchParams.set("transaction_uuid", params.transactionUuid);

  const res = await fetch(url.toString());
  if (!res.ok) return { complete: false, status: "STATUS_CHECK_FAILED" };
  const body = (await res.json()) as { status?: string };
  return { complete: body.status === "COMPLETE", status: body.status ?? "UNKNOWN" };
}
