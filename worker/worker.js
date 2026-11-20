/**
 * Hope Anchored in Christ — on-site Stripe checkout backend
 * ---------------------------------------------------------
 * Cloudflare Worker (free tier). One Worker, three routes:
 *
 *   GET  /config                -> Stripe publishable key + sellable catalog
 *   POST /create-payment-intent -> validate the cart (one or more lines),
 *                                  quote live Printify shipping for the
 *                                  whole order, create a Stripe
 *                                  PaymentIntent. The old single-item body
 *                                  is still accepted.
 *   POST /webhook               -> verify Stripe's signature, then create
 *                                  ONE Printify order with every line when
 *                                  payment succeeds
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
 * - The server NEVER trusts an amount from the browser. Prices come LIVE
 *   from Printify at checkout time (see fetchPrintifyProduct /
 *   liveVariants): the variant's retail price, colour, size and
 *   availability are read from the shop's own product data on every
 *   checkout, so a price change or a new variant in Printify is picked
 *   up with no code change. The only product data hardcoded here is the
 *   list of Printify product ids this checkout is allowed to sell
 *   (SELLABLE_PRODUCT_IDS) — the server must control which products can
 *   be bought. Shipping comes from Printify's own quote for the buyer's
 *   address.
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
/* Sellable products — the ONLY hardcoded product data left.           */
/* One Printify product id per product the checkout may sell.          */
/* Everything else — title, colours, sizes, prices, availability —    */
/* comes live from Printify on every checkout (see liveVariants), so   */
/* a price change or a new variant in Printify needs no code change.   */
/* To sell a new product: add its Printify product id here (and its    */
/* store.json entry on the site).                                      */
/* ------------------------------------------------------------------ */
const SELLABLE_PRODUCT_IDS = [
  "6af3e044b13d725413071601", // "Look at the Birds of the Air Crewneck Sweatshirt"
  "6aff566d0e0ec6c28205ccf1", // "My Identity Is in Christ Christian Faith T-Shirt"
  "6affc66913e72c2c980a1624", // "Let Your Light Shine Christian Faith T-Shirt"
];

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
/* Printify: live product fetch + variant mapping                      */
/* GET /v1/shops/{shop_id}/products/{product_id}.json                 */
/* Printify requires a User-Agent header on every API request, and     */
/* Workers' fetch sends none by default, so every Printify call in    */
/* this file sets it.                                                  */
/* ------------------------------------------------------------------ */
const PRINTIFY_USER_AGENT = "HopeAnchoredInChrist/1.0";

/* Every outbound call gets a hard timeout: a hung provider must never
   hold the checkout open. AbortController + setTimeout is used (not
   AbortSignal.timeout) so the cutoff is explicit. Callers pass
   timeoutMs inside the options object; it is stripped before fetch. */
async function fetchWithTimeout(url, options) {
  const ms = (options && options.timeoutMs) || 10000;
  const opts = { ...options };
  delete opts.timeoutMs;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...opts, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/* Fetch one product live from Printify. Returns the product JSON, null
   when Printify says it does not exist (404), and throws on a network /
   timeout failure or any other non-OK status, so callers can tell
   "gone" apart from "unreachable". */
async function fetchPrintifyProduct(env, productId) {
  const url =
    "https://api.printify.com/v1/shops/" +
    encodeURIComponent(env.PRINTIFY_SHOP_ID) +
    "/products/" +
    encodeURIComponent(productId) +
    ".json";
  const res = await fetchWithTimeout(url, {
    timeoutMs: 10000,
    headers: {
      Authorization: "Bearer " + env.PRINTIFY_API_TOKEN,
      "User-Agent": PRINTIFY_USER_AGENT,
    },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Printify product fetch HTTP " + res.status);
  return res.json();
}

/* Sellable variants of a live Printify product, as
   [{ variantId, color, size, priceCents }], sorted like the old catalog
   (colour, then price, then id). Only variants that are enabled AND
   available are listed — the same rule the old hardcoded catalog used.
   A product's options list the size and colour values by id; each
   variant names its two option ids. They are resolved by option TYPE,
   not position, so a blueprint that orders them differently still
   works. price is Printify's retail price, in integer cents. */
function liveVariants(product) {
  const byId = {};
  (product.options || []).forEach(function (opt) {
    (opt.values || []).forEach(function (v) {
      byId[v.id] = { type: opt.type, title: v.title };
    });
  });
  const out = [];
  (product.variants || []).forEach(function (v) {
    if (!v.is_enabled || !v.is_available) return;
    if (!Number.isInteger(v.price)) return;
    let color = null;
    let size = null;
    (v.options || []).forEach(function (id) {
      const o = byId[id];
      if (!o) return;
      if (o.type === "color") color = o.title;
      if (o.type === "size") size = o.title;
    });
    if (!color || !size) return; // a variant we cannot describe is not sold
    out.push({
      variantId: v.id,
      color: color,
      size: size,
      priceCents: v.price,
    });
  });
  out.sort(function (a, b) {
    if (a.color !== b.color) return a.color < b.color ? -1 : 1;
    return a.priceCents - b.priceCents || a.variantId - b.variantId;
  });
  return out;
}

/* One sellable variant of a live product, or null. */
function liveVariant(product, variantId) {
  const list = liveVariants(product);
  for (const v of list) {
    if (v.variantId === variantId) return v;
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* GET /config                                                         */
/* Live from Printify: every sellable product with its current         */
/* variants and prices. The legacy `product` / `variants` fields      */
/* (first product only) stay so a browser running the previous         */
/* checkout.js keeps working until the site push lands.                */
/* ------------------------------------------------------------------ */
async function handleConfig(request, env) {
  const products = [];
  for (const productId of SELLABLE_PRODUCT_IDS) {
    let product;
    try {
      product = await fetchPrintifyProduct(env, productId);
    } catch (e) {
      continue; // unreachable product: leave it out rather than fail all
    }
    if (!product) continue; // deleted in Printify: not sold
    const variants = liveVariants(product);
    if (!variants.length) continue; // nothing sellable on it right now
    products.push({
      printifyProductId: product.id,
      title: product.title,
      image: (product.images && product.images[0] && product.images[0].src) || "",
      variants: variants,
    });
  }
  if (!products.length) {
    return errorResponse(request, 502, "Could not reach the store. Please try again.");
  }
  const first = products[0];
  return jsonResponse(request, {
    stripePublishableKey: env.STRIPE_PUBLISHABLE_KEY || "",
    product: {
      printifyProductId: first.printifyProductId,
      title: first.title,
      image: first.image,
    },
    variants: first.variants,
    products: products,
    maxQuantity: MAX_QUANTITY,
    currency: CURRENCY,
  });
}

/* ------------------------------------------------------------------ */
/* Address validation (shared by the payment-intent route)             */
/* ------------------------------------------------------------------ */
function validateAddress(a) {
  if (!a || typeof a !== "object") return "Shipping address is missing.";
  const need = ["firstName", "lastName", "email", "country", "address1", "city", "zip", "phone"];
  // Note: phone is required because Printify's shipping quote (and order
  // creation) rejects an address without one — HTTP 400 "The address
  // to.phone field is required." Without it every quote falls back to the
  // flat $6.99 estimate and the store eats the real shipping cost.
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
async function quoteShipping(env, lineItems, address) {
  const url =
    "https://api.printify.com/v1/shops/" +
    encodeURIComponent(env.PRINTIFY_SHOP_ID) +
    "/orders/shipping.json";
  let res;
  try {
    res = await fetchWithTimeout(url, {
      timeoutMs: 10000,
      method: "POST",
      headers: {
        Authorization: "Bearer " + env.PRINTIFY_API_TOKEN,
        "Content-Type": "application/json",
        "User-Agent": PRINTIFY_USER_AGENT,
      },
      body: JSON.stringify({
        line_items: lineItems.map(function (it) {
          return {
            product_id: it.productId,
            variant_id: it.variantId,
            quantity: it.quantity,
          };
        }),
        address_to: printifyAddress(address),
      }),
      // Never let a hung quote hold the checkout open: fail fast to the
      // flat estimated fallback instead of a ~40s wait.
    });
  } catch (e) {
    return { cents: null, status: "threw:" + (e && e.name ? e.name : "fetch") };
  }
  if (!res.ok) return { cents: null, status: res.status };
  const data = await res.json();
  // "standard" is shipping method 1, the one the order will use.
  // Printify's shape varies: a bare number, or an object with a cost.
  if (data && Number.isInteger(data.standard)) {
    return { cents: data.standard, status: res.status };
  }
  if (data && data.standard && Number.isInteger(data.standard.cost)) {
    return { cents: data.standard.cost, status: res.status };
  }
  // Diagnostic: report the response shape so a mismatch can be fixed.
  const keys = data && typeof data === "object" ? Object.keys(data) : [];
  return {
    cents: null,
    status:
      "no-standard:" +
      keys.join(",") +
      "|std=" +
      JSON.stringify(data ? data.standard : null),
  };
}

/* ------------------------------------------------------------------ */
/* Stripe: create a PaymentIntent (form-encoded, as Stripe expects)    */
/* ------------------------------------------------------------------ */
async function createPaymentIntent(env, amountCents, orderMeta, productId, description) {
  const body = new URLSearchParams();
  body.set("amount", String(amountCents));
  body.set("currency", CURRENCY);
  body.set("automatic_payment_methods[enabled]", "true");
  body.set("description", description);
  body.set("metadata[order]", JSON.stringify(orderMeta));
  body.set("metadata[printify_product_id]", productId);
  const res = await fetchWithTimeout("https://api.stripe.com/v1/payment_intents", {
    timeoutMs: 15000,
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
/* Body: { items: [{ productId, variantId, quantity }], address }      */
/* The old single-item body { productId, variantId, quantity,         */
/* address } is still accepted, so a browser running the previous      */
/* checkout.js keeps working until the site push lands. The amount is  */
/* computed HERE from live Printify lookups + a live Printify shipping */
/* quote for the whole order. Anything the browser sends about price   */
/* is ignored.                                                         */
/* ------------------------------------------------------------------ */
async function handleCreatePaymentIntent(request, env) {
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return errorResponse(request, 400, "Request body must be JSON.");
  }

  // Normalize to an items list. The browser sends the Printify product
  // ids from /config. An older browser that sends the single-item shape
  // gets one line, defaulting to the first sellable product when it
  // sends no product id at all.
  let items = [];
  if (Array.isArray(body.items) && body.items.length) {
    items = body.items.map(function (it) {
      return {
        productId: it && it.productId ? String(it.productId) : "",
        variantId: Number(it && it.variantId),
        quantity: Number(it && it.quantity),
      };
    });
  } else if (body.productId || body.variantId) {
    items = [{
      productId: body.productId ? String(body.productId) : SELLABLE_PRODUCT_IDS[0],
      variantId: Number(body.variantId),
      quantity: Number(body.quantity),
    }];
  }
  if (!items.length) {
    return errorResponse(request, 400, "Your cart is empty.");
  }
  let totalQty = 0;
  for (const it of items) {
    if (SELLABLE_PRODUCT_IDS.indexOf(it.productId) === -1) {
      return errorResponse(request, 400, "That product is not sold here.");
    }
    if (!Number.isInteger(it.quantity) || it.quantity < 1 || it.quantity > MAX_QUANTITY) {
      return errorResponse(request, 400, "Quantity must be between 1 and " + MAX_QUANTITY + ".");
    }
    totalQty += it.quantity;
  }
  if (totalQty < 1 || totalQty > MAX_QUANTITY) {
    return errorResponse(request, 400, "An order holds at most " + MAX_QUANTITY + " items.");
  }
  const addressError = validateAddress(body.address);
  if (addressError) return errorResponse(request, 400, addressError);
  const address = body.address;

  // Live price + availability from Printify for EVERY line. An unknown
  // or unavailable variant is refused outright. Products are fetched
  // once each, even when several lines share one.
  const productsById = {};
  let productCents = 0;
  for (const it of items) {
    let product = productsById[it.productId];
    if (!product) {
      try {
        product = await fetchPrintifyProduct(env, it.productId);
      } catch (e) {
        return errorResponse(request, 502, "Could not reach the store. Please try again.");
      }
      if (!product) {
        return errorResponse(request, 400, "That product is not sold here.");
      }
      productsById[it.productId] = product;
    }
    const variant = liveVariant(product, it.variantId);
    if (!variant) {
      return errorResponse(request, 400, "That color/size combination is not sold.");
    }
    productCents += variant.priceCents * it.quantity;
  }

  // Live shipping quote from Printify for this exact order + address.
  let shippingCents = null;
  let shippingEstimated = false;
  let printifyStatus = null;
  try {
    const quote = await quoteShipping(env, items, address);
    shippingCents = quote.cents;
    printifyStatus = quote.status;
  } catch (e) {
    shippingCents = null; // fall through to the flat fallback below
    printifyStatus = "threw";
  }
  if (shippingCents === null) {
    shippingCents = FLAT_SHIPPING_CENTS;
    shippingEstimated = true; // the page must show this as an estimate
  }

  const amountCents = productCents + shippingCents;

  // What the webhook needs to create the Printify order. Kept small:
  // Stripe metadata values are limited to 500 characters each. The
  // items ride as one compact string, "productId:variantId:qty" per
  // line joined by "|"; the address fields stay exactly as before.
  const orderMeta = {
    items: items.map(function (it) {
      return it.productId + ":" + it.variantId + ":" + it.quantity;
    }).join("|"),
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

  const description = totalQty + (totalQty === 1 ? " item" : " items") + " — Hope Anchored in Christ";
  let pi;
  try {
    pi = await createPaymentIntent(env, amountCents, orderMeta, items[0].productId, description);
  } catch (e) {
    return errorResponse(request, 502, "Could not start the payment. Please try again.");
  }

  return jsonResponse(request, {
    clientSecret: pi.client_secret,
    paymentIntentId: pi.id,
    productCents: productCents,
    shippingCents: shippingCents,
    shippingEstimated: shippingEstimated,
    printifyStatus: printifyStatus,
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
  const res = await fetchWithTimeout(
    "https://api.stripe.com/v1/payment_intents/" + encodeURIComponent(paymentIntentId),
    {
      timeoutMs: 15000,
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
async function createPrintifyOrder(env, paymentIntentId, orderMeta, lineItems) {
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
  const res = await fetchWithTimeout(url, {
    timeoutMs: 15000,
    method: "POST",
    headers: {
      Authorization: "Bearer " + env.PRINTIFY_API_TOKEN,
      "Content-Type": "application/json",
      "User-Agent": PRINTIFY_USER_AGENT,
    },
    body: JSON.stringify({
      external_id: "hac-" + paymentIntentId,
      label: "Hope Anchored — " + paymentIntentId,
      line_items: lineItems.map(function (it) {
        return {
          product_id: it.productId,
          variant_id: it.variantId,
          quantity: it.quantity,
        };
      }),
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
  const res = await fetchWithTimeout(url, {
    timeoutMs: 15000,
    headers: {
      Authorization: "Bearer " + env.PRINTIFY_API_TOKEN,
      "User-Agent": PRINTIFY_USER_AGENT,
    },
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

  // Order lines: the compact "productId:variantId:qty" encoding, one
  // line per item joined by "|". Older PaymentIntents (pre-cart) carry
  // a single variant_id + qty instead — read those as one line.
  const webhookProductId = String(metadata.printify_product_id || "");
  let orderItems = [];
  if (orderMeta.items && typeof orderMeta.items === "string") {
    for (const part of orderMeta.items.split("|")) {
      const bits = part.split(":");
      if (bits.length !== 3) continue;
      orderItems.push({
        productId: bits[0],
        variantId: Number(bits[1]),
        quantity: Number(bits[2]),
      });
    }
  }
  if (!orderItems.length && orderMeta.variant_id) {
    orderItems = [{
      productId: webhookProductId,
      variantId: Number(orderMeta.variant_id),
      quantity: Number(orderMeta.qty) || 1,
    }];
  }
  if (!orderItems.length) {
    return errorResponse(request, 400, "PaymentIntent has no order lines.");
  }

  // Every variant must still exist and be enabled in Printify — checked
  // live, not against a table, so a product pulled from Printify after
  // the payment cannot be ordered. A Printify outage here is a 502 so
  // Stripe retries; a genuinely unknown variant is a 400 (no retry —
  // the payment was taken and the order needs a human). Availability
  // is deliberately NOT required here: the order creation itself is the
  // real test, and stock can flicker between payment and delivery.
  for (const it of orderItems) {
    if (SELLABLE_PRODUCT_IDS.indexOf(it.productId) === -1) {
      return errorResponse(request, 400, "PaymentIntent names a product that is not sold here.");
    }
  }
  const liveProducts = {};
  for (const it of orderItems) {
    if (liveProducts[it.productId]) continue;
    let liveProduct;
    try {
      liveProduct = await fetchPrintifyProduct(env, it.productId);
    } catch (e) {
      return errorResponse(request, 502, "Could not reach Printify. Stripe will retry.");
    }
    if (!liveProduct) {
      return errorResponse(request, 400, "PaymentIntent names a product that is not sold here.");
    }
    liveProducts[it.productId] = liveProduct;
  }
  for (const it of orderItems) {
    const live = (liveProducts[it.productId].variants || []).find(function (v) {
      return v.id === it.variantId;
    });
    if (!live || !live.is_enabled) {
      return errorResponse(request, 400, "Order metadata names an unknown variant.");
    }
  }

  const externalId = "hac-" + pi.id;
  let created;
  try {
    created = await createPrintifyOrder(env, pi.id, orderMeta, orderItems);
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
      return handleConfig(request, env);
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
