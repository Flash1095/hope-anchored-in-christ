/**
 * Hope Anchored in Christ — on-site Stripe checkout backend (DRAFT, not deployed)
 * -------------------------------------------------------------------------------
 * Cloudflare Worker (free tier). One Worker, three routes:
 *
 *   GET  /config                -> Stripe publishable key + sellable catalog
 *   POST /create-payment-intent -> validate the order, quote live Printify
 *                                  shipping, create a Stripe PaymentIntent
 *   POST /webhook               -> verify Stripe's signature, then create the
 *                                  Printify order when payment succeeds
 *
 * Secrets are NEVER in this file. They come from Worker environment variables
 * (set in the Cloudflare dashboard or with `wrangler secret put`):
 *
 *   STRIPE_SECRET_KEY       Stripe secret key (sk_test_... / sk_live_...)
 *   STRIPE_WEBHOOK_SECRET   Webhook signing secret (whsec_...) from the Stripe
 *                           webhook endpoint that points at /webhook
 *   PRINTIFY_API_TOKEN      Printify personal access token (orders.write scope)
 *   PRINTIFY_SHOP_ID        Printify shop id (29694687)
 *
 * Non-secret setting (plain env var, see wrangler.toml):
 *
 *   STRIPE_PUBLISHABLE_KEY  Stripe publishable key (pk_test_... / pk_live_...)
 *
 * Design notes:
 * - The server NEVER trusts an amount from the browser. Prices come from the
 *   CATALOG below (checked against the live Printify product on 2026-11-10);
 *   shipping comes from Printify's own quote for the buyer's address.
 * - Orders are created in Printify with status "on-hold". They are NOT sent
 *   to production by this Worker. Whether they then wait for a human or go
 *   automatically is controlled by the shop's "Order approval" setting in
 *   the Printify dashboard (Settings -> Orders). Keep it on Manual while
 *   the shop is new. See README.md.
 * - Idempotency without KV: the Printify order id is written back into the
 *   Stripe PaymentIntent's metadata (metadata.printify_order_id) after the
 *   order is created, and the webhook checks that field first. Printify's
 *   external_id is also the PaymentIntent id, so a duplicate create is
 *   rejected by Printify with HTTP 409 and we recover by looking the order
 *   up. Honest limitation: if two webhook deliveries ran at the exact same
 *   moment, both could pass the metadata check; the 409 + lookup is the
 *   backstop. Stripe retries are normally sequential, so this is fine.
 */

/* ------------------------------------------------------------------ */
/* Catalog — ground truth from the live Printify product, 2026-11-10  */
/* Product: "Look at the Birds of the Air Crewneck Sweatshirt"        */
/* Printify product id 6af3e044b13d725413071601, provider 99,          */
/* blueprint 49 (Gildan 18000). Prices are the RETAIL prices in       */
/* cents, exactly as set in Printify. Only the 34 enabled + available */
/* variants are listed. The 6 unavailable sizes (4XL/5XL in Sand,     */
/* Light Pink, Light Blue) are deliberately absent and can never be    */
/* sold through this checkout. If prices change in Printify, update    */
/* this table to match BEFORE going live again.                        */
/* ------------------------------------------------------------------ */
const PRODUCT = {
  printifyProductId: "6af3e044b13d725413071601",
  title: "Look at the Birds of the Air Crewneck Sweatshirt",
  providerId: 99,
  blueprintId: 49,
  image:
    "https://images-api.printify.com/mockup/6af3e044b13d725413071601/25458/98502/look-at-the-birds-of-the-air-crewneck-sweatshirt.jpg?camera_label=front",
};

// variantId -> { color, size, priceCents }
const CATALOG = {
  // White — S to 5XL
  25396: { color: "White", size: "S", priceCents: 3499 },
  25427: { color: "White", size: "M", priceCents: 3499 },
  25458: { color: "White", size: "L", priceCents: 3499 },
  25489: { color: "White", size: "XL", priceCents: 3499 },
  25520: { color: "White", size: "2XL", priceCents: 3499 },
  25551: { color: "White", size: "3XL", priceCents: 4299 },
  25582: { color: "White", size: "4XL", priceCents: 4599 },
  25613: { color: "White", size: "5XL", priceCents: 4599 },
  // Sport Grey — S to 5XL
  25395: { color: "Sport Grey", size: "S", priceCents: 3499 },
  25426: { color: "Sport Grey", size: "M", priceCents: 3499 },
  25457: { color: "Sport Grey", size: "L", priceCents: 3499 },
  25488: { color: "Sport Grey", size: "XL", priceCents: 3499 },
  25519: { color: "Sport Grey", size: "2XL", priceCents: 3499 },
  25550: { color: "Sport Grey", size: "3XL", priceCents: 4299 },
  25581: { color: "Sport Grey", size: "4XL", priceCents: 4599 },
  25612: { color: "Sport Grey", size: "5XL", priceCents: 4599 },
  // Sand — S to 3XL only (provider does not stock 4XL/5XL)
  25394: { color: "Sand", size: "S", priceCents: 3499 },
  25425: { color: "Sand", size: "M", priceCents: 3499 },
  25456: { color: "Sand", size: "L", priceCents: 3499 },
  25487: { color: "Sand", size: "XL", priceCents: 3499 },
  25518: { color: "Sand", size: "2XL", priceCents: 3499 },
  25549: { color: "Sand", size: "3XL", priceCents: 4299 },
  // Light Pink — S to 3XL only
  25386: { color: "Light Pink", size: "S", priceCents: 3499 },
  25417: { color: "Light Pink", size: "M", priceCents: 3499 },
  25448: { color: "Light Pink", size: "L", priceCents: 3499 },
  25479: { color: "Light Pink", size: "XL", priceCents: 3499 },
  25510: { color: "Light Pink", size: "2XL", priceCents: 3499 },
  25541: { color: "Light Pink", size: "3XL", priceCents: 4299 },
  // Light Blue — S to 3XL only
  25385: { color: "Light Blue", size: "S", priceCents: 3499 },
  25416: { color: "Light Blue", size: "M", priceCents: 3499 },
  25447: { color: "Light Blue", size: "L", priceCents: 3499 },
  25478: { color: "Light Blue", size: "XL", priceCents: 3499 },
  25509: { color: "Light Blue", size: "2XL", priceCents: 3499 },
  25540: { color: "Light Blue", size: "3XL", priceCents: 4299 },
};

const MAX_QUANTITY = 10; // sanity cap per order
const FLAT_SHIPPING_CENTS = 699; // fallback only, when Printify's quote fails
const CURRENCY = "usd";

// The only site allowed to call this Worker from a browser. The localhost
// entries are for local testing only — remove them if the Worker ever
// serves real traffic from anywhere else.
const ALLOWED_ORIGINS = [
  "https://flash1095.github.io",
  "http://localhost:8000",
  "http://localhost:3000",
  "http://127.0.0.1:8000",
];

function corsHeaders(request) {
  const origin = request.headers.get("Origin") || "";
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Stripe-Signature",
    "Access-Control-Max-Age": "86400",
  };
}

function jsonResponse(request, body, status) {
  return new Response(JSON.stringify(body), {
    status: status || 200,
    headers: Object.assign(
      { "Content-Type": "application/json" },
      corsHeaders(request)
    ),
  });
}

function errorResponse(request, status, message) {
  return jsonResponse(request, { error: message }, status);
}

/* ------------------------------------------------------------------ */
/* GET /config                                                         */
/* ------------------------------------------------------------------ */
function handleConfig(env) {
  const variants = Object.keys(CATALOG)
    .map(function (id) {
      return {
        variantId: Number(id),
        color: CATALOG[id].color,
        size: CATALOG[id].size,
        priceCents: CATALOG[id].priceCents,
      };
    })
    .sort(function (a, b) {
      if (a.color !== b.color) return a.color < b.color ? -1 : 1;
      return a.priceCents - b.priceCents || a.variantId - b.variantId;
    });
  return {
    stripePublishableKey: env.STRIPE_PUBLISHABLE_KEY || "",
    product: {
      printifyProductId: PRODUCT.printifyProductId,
      title: PRODUCT.title,
      image: PRODUCT.image,
    },
    variants: variants,
    maxQuantity: MAX_QUANTITY,
    currency: CURRENCY,
  };
}

/* ------------------------------------------------------------------ */
/* Address validation (shared by the payment-intent route)             */
/* ------------------------------------------------------------------ */
function validateAddress(a) {
  if (!a || typeof a !== "object") return "Shipping address is missing.";
  const need = ["firstName", "lastName", "email", "country", "address1", "city", "zip"];
  for (const key of need) {
    if (!a[key] || String(a[key]).trim() === "") return "Shipping field '" + key + "' is required.";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(a.email).trim())) {
    return "A valid email address is required (for the receipt and shipping updates).";
  }
  if (!/^[A-Za-z]{2}$/.test(String(a.country).trim())) {
    return "Country must be a 2-letter code (US, CA, GB, ...).";
  }
  return null;
}

// Printify's address_to shape, from the same address object.
function printifyAddress(a) {
  const out = {
    first_name: String(a.firstName).trim(),
    last_name: String(a.lastName).trim(),
    email: String(a.email).trim(),
    country: String(a.country).trim().toUpperCase(),
    region: String(a.region || "").trim(),
    address1: String(a.address1).trim(),
    city: String(a.city).trim(),
    zip: String(a.zip).trim(),
  };
  if (a.address2 && String(a.address2).trim() !== "") {
    out.address2 = String(a.address2).trim();
  }
  if (a.phone && String(a.phone).trim() !== "") {
    out.phone = String(a.phone).trim();
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Printify: live shipping quote                                       */
/* POST /v1/shops/{shop_id}/orders/shipping.json                       */
/* Body: { line_items, address_to } ->                                 */
/*   { standard: { cost }, priority: {...}, express: {...}, ... }      */
/* All costs are integer cents.                                        */
/* ------------------------------------------------------------------ */
async function quoteShipping(env, variantId, quantity, address) {
  const url =
    "https://api.printify.com/v1/shops/" +
    encodeURIComponent(env.PRINTIFY_SHOP_ID) +
    "/orders/shipping.json";
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + env.PRINTIFY_API_TOKEN,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      line_items: [
        {
          product_id: PRODUCT.printifyProductId,
          variant_id: variantId,
          quantity: quantity,
        },
      ],
      address_to: printifyAddress(address),
    }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  // "standard" is shipping method 1, the one the order will use.
  if (data && data.standard && Number.isInteger(data.standard.cost)) {
    return data.standard.cost;
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* Stripe: create a PaymentIntent (form-encoded, as Stripe expects)    */
/* ------------------------------------------------------------------ */
async function createPaymentIntent(env, amountCents, orderMeta) {
  const body = new URLSearchParams();
  body.set("amount", String(amountCents));
  body.set("currency", CURRENCY);
  body.set("automatic_payment_methods[enabled]", "true");
  body.set("description", PRODUCT.title + " — Hope Anchored in Christ");
  body.set("metadata[order]", JSON.stringify(orderMeta));
  body.set("metadata[printify_product_id]", PRODUCT.printifyProductId);
  const res = await fetch("https://api.stripe.com/v1/payment_intents", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + env.STRIPE_SECRET_KEY,
      "Content-Type": "application/x-www-form-urlencoded",
      "Stripe-Version": "2024-06-20",
    },
    body: body.toString(),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error("Stripe error: " + (data.error && data.error.message ? data.error.message : res.status));
  }
  return data;
}

/* ------------------------------------------------------------------ */
/* POST /create-payment-intent                                         */
/* Body: { variantId, quantity, address }                              */
/* The amount is computed HERE from the server catalog + a live        */
/* Printify shipping quote. Anything the browser sends about price     */
/* is ignored.                                                         */
/* ------------------------------------------------------------------ */
async function handleCreatePaymentIntent(request, env) {
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return errorResponse(request, 400, "Request body must be JSON.");
  }

  const variantId = Number(body.variantId);
  const item = CATALOG[variantId];
  if (!item) {
    return errorResponse(request, 400, "That color/size combination is not sold.");
  }
  const quantity = Number(body.quantity);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
    return errorResponse(request, 400, "Quantity must be between 1 and " + MAX_QUANTITY + ".");
  }
  const addressError = validateAddress(body.address);
  if (addressError) return errorResponse(request, 400, addressError);
  const address = body.address;

  const productCents = item.priceCents * quantity;

  // Live shipping quote from Printify for this exact order + address.
  let shippingCents = null;
  let shippingEstimated = false;
  try {
    shippingCents = await quoteShipping(env, variantId, quantity, address);
  } catch (e) {
    shippingCents = null; // fall through to the flat fallback below
  }
  if (shippingCents === null) {
    shippingCents = FLAT_SHIPPING_CENTS;
    shippingEstimated = true; // the page must show this as an estimate
  }

  const amountCents = productCents + shippingCents;

  // What the webhook needs to create the Printify order. Kept small:
  // Stripe metadata values are limited to 500 characters each.
  const orderMeta = {
    variant_id: variantId,
    qty: quantity,
    first: String(address.firstName).trim(),
    last: String(address.lastName).trim(),
    email: String(address.email).trim(),
    phone: String(address.phone || "").trim(),
    country: String(address.country).trim().toUpperCase(),
    region: String(address.region || "").trim(),
    address1: String(address.address1).trim(),
    address2: String(address.address2 || "").trim(),
    city: String(address.city).trim(),
    zip: String(address.zip).trim(),
  };

  let pi;
  try {
    pi = await createPaymentIntent(env, amountCents, orderMeta);
  } catch (e) {
    return errorResponse(request, 502, "Could not start the payment. Please try again.");
  }

  return jsonResponse(request, {
    clientSecret: pi.client_secret,
    paymentIntentId: pi.id,
    productCents: productCents,
    shippingCents: shippingCents,
    shippingEstimated: shippingEstimated,
    amountCents: amountCents,
    currency: CURRENCY,
  });
}

/* ------------------------------------------------------------------ */
/* Stripe webhook signature verification (HMAC SHA-256, Web Crypto)    */
/* Header: "t=<timestamp>,v1=<hex>[,v1=<hex>...]"                       */
/* Signed payload: "<timestamp>.<raw body>". Rejects stale (>5 min)    */
/* timestamps the way Stripe's own libraries do.                       */
/* ------------------------------------------------------------------ */
function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}

function constantTimeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

async function verifyStripeSignature(rawBody, header, secret) {
  if (!header || !secret) return false;
  let timestamp = null;
  const signatures = [];
  for (const part of header.split(",")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    const k = part.slice(0, eq).trim();
    const v = part.slice(eq + 1).trim();
    if (k === "t") timestamp = v;
    if (k === "v1") signatures.push(v);
  }
  if (!timestamp || signatures.length === 0) return false;
  // Reject replays / stale deliveries (Stripe tolerance is 5 minutes).
  const ageSeconds = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(ageSeconds) || ageSeconds > 300) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signed = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(timestamp + "." + rawBody)
  );
  const expected = new Uint8Array(signed);
  for (const sig of signatures) {
    try {
      if (constantTimeEqual(expected, hexToBytes(sig))) return true;
    } catch (e) {
      // malformed hex in the header — try the next signature
    }
  }
  return false;
}

/* ------------------------------------------------------------------ */
/* Stripe: update a PaymentIntent's metadata (for the idempotency mark) */
/* ------------------------------------------------------------------ */
async function setPaymentIntentMetadata(env, paymentIntentId, metadata) {
  const body = new URLSearchParams();
  for (const key of Object.keys(metadata)) {
    body.set("metadata[" + key + "]", metadata[key]);
  }
  const res = await fetch(
    "https://api.stripe.com/v1/payment_intents/" + encodeURIComponent(paymentIntentId),
    {
      method: "POST",
      headers: {
        Authorization: "Bearer " + env.STRIPE_SECRET_KEY,
        "Content-Type": "application/x-www-form-urlencoded",
        "Stripe-Version": "2024-06-20",
      },
      body: body.toString(),
    }
  );
  return res.ok;
}

/* ------------------------------------------------------------------ */
/* Printify: create the fulfillment order (status "on-hold")           */
/* The order is NOT sent to production here. It waits in Printify     */
/* for manual approval (or the shop's auto-approval setting — see      */
/* README.md). No charge happens until it goes to production.          */
/* ------------------------------------------------------------------ */
async function createPrintifyOrder(env, paymentIntentId, orderMeta) {
  const url =
    "https://api.printify.com/v1/shops/" +
    encodeURIComponent(env.PRINTIFY_SHOP_ID) +
    "/orders.json";
  const address = {
    firstName: orderMeta.first,
    lastName: orderMeta.last,
    email: orderMeta.email,
    phone: orderMeta.phone,
    country: orderMeta.country,
    region: orderMeta.region,
    address1: orderMeta.address1,
    address2: orderMeta.address2,
    city: orderMeta.city,
    zip: orderMeta.zip,
  };
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + env.PRINTIFY_API_TOKEN,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      external_id: "hac-" + paymentIntentId,
      label: "Hope Anchored — " + paymentIntentId,
      line_items: [
        {
          product_id: PRODUCT.printifyProductId,
          variant_id: orderMeta.variant_id,
          quantity: orderMeta.qty,
        },
      ],
      shipping_method: 1, // 1 = standard
      send_shipping_notification: true,
      address_to: printifyAddress(address),
    }),
  });
  const data = await res.json();
  return { status: res.status, ok: res.ok, data: data };
}

// If Printify says 409 (duplicate external_id), the order already exists.
// Find it in the recent orders list by the external_id we stored.
async function findPrintifyOrderByExternalId(env, externalId) {
  const url =
    "https://api.printify.com/v1/shops/" +
    encodeURIComponent(env.PRINTIFY_SHOP_ID) +
    "/orders.json?limit=100";
  const res = await fetch(url, {
    headers: { Authorization: "Bearer " + env.PRINTIFY_API_TOKEN },
  });
  if (!res.ok) return null;
  const data = await res.json();
  const orders = (data && data.data) || [];
  for (const order of orders) {
    if (order && order.metadata && order.metadata.shop_order_id === externalId) {
      return order;
    }
    if (order && order.external_id === externalId) return order;
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* POST /webhook                                                       */
/* ------------------------------------------------------------------ */
async function handleWebhook(request, env) {
  const rawBody = await request.text();
  const signature = request.headers.get("Stripe-Signature") || "";
  const valid = await verifyStripeSignature(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);
  if (!valid) {
    return errorResponse(request, 400, "Invalid webhook signature.");
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch (e) {
    return errorResponse(request, 400, "Webhook body is not valid JSON.");
  }

  // Acknowledge everything else; we only act on successful payments.
  if (event.type !== "payment_intent.succeeded") {
    return jsonResponse(request, { received: true, ignored: event.type });
  }

  const pi = event.data && event.data.object ? event.data.object : null;
  if (!pi || !pi.id) {
    return errorResponse(request, 400, "Webhook event has no PaymentIntent.");
  }
  const metadata = pi.metadata || {};

  // Idempotency check: did an earlier delivery already create this order?
  if (metadata.printify_order_id) {
    return jsonResponse(request, {
      received: true,
      duplicate: true,
      printifyOrderId: metadata.printify_order_id,
    });
  }

  let orderMeta;
  try {
    orderMeta = JSON.parse(metadata.order || "");
  } catch (e) {
    // Nothing sensible to retry: the PaymentIntent carries no order.
    return errorResponse(request, 400, "PaymentIntent has no order metadata.");
  }
  if (!CATALOG[Number(orderMeta.variant_id)]) {
    return errorResponse(request, 400, "Order metadata names an unknown variant.");
  }

  const externalId = "hac-" + pi.id;
  let created;
  try {
    created = await createPrintifyOrder(env, pi.id, orderMeta);
  } catch (e) {
    // Transient network failure — 502 so Stripe retries the delivery.
    return errorResponse(request, 502, "Could not reach Printify. Stripe will retry.");
  }

  if (created.ok) {
    const printifyOrderId = created.data && created.data.id ? String(created.data.id) : "";
    // Record the idempotency mark so a retried delivery does not order twice.
    await setPaymentIntentMetadata(env, pi.id, { printify_order_id: printifyOrderId });
    return jsonResponse(request, { received: true, printifyOrderId: printifyOrderId });
  }

  if (created.status === 409) {
    // Duplicate external_id: the order exists already (an earlier delivery
    // created it but the metadata write did not land). Recover it.
    const existing = await findPrintifyOrderByExternalId(env, externalId);
    if (existing && existing.id) {
      await setPaymentIntentMetadata(env, pi.id, { printify_order_id: String(existing.id) });
      return jsonResponse(request, {
        received: true,
        duplicate: true,
        printifyOrderId: String(existing.id),
      });
    }
    return errorResponse(request, 502, "Printify reported a duplicate order but it could not be found. Stripe will retry.");
  }

  // Any other Printify error: 502 so Stripe retries the delivery.
  return errorResponse(
    request,
    502,
    "Printify refused the order (HTTP " + created.status + "). Stripe will retry."
  );
}

/* ------------------------------------------------------------------ */
/* Router                                                              */
/* ------------------------------------------------------------------ */
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(request) });
    }

    if (url.pathname === "/config" && request.method === "GET") {
      return jsonResponse(request, handleConfig(env));
    }

    if (url.pathname === "/create-payment-intent" && request.method === "POST") {
      return handleCreatePaymentIntent(request, env);
    }

    if (url.pathname === "/webhook" && request.method === "POST") {
      return handleWebhook(request, env);
    }

    return errorResponse(request, 404, "Not found.");
  },
};
