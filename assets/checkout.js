/* ------------------------------------------------------------------
 * Hope Anchored in Christ — on-site checkout + cart (LIVE on the Store
 * page since v283; cart added v353)
 * ------------------------------------------------------------------
 * Site-side half of the Stripe + Printify checkout. Written in the same
 * style as assets/app.js (var / function / string concat).
 *
 * What it does:
 *   1. Fetches the catalog + Stripe publishable key from the Worker
 *      (GET {CHECKOUT_API_URL}/config) — one source of truth, so the
 *      prices on the page always match the server.
 *   2. Keeps the shopper's cart in localStorage ("hac_cart_v1") and the
 *      header Cart count badge in sync with it.
 *   3. Opens a cart checkout overlay (hacOpenCartCheckout): an order
 *      summary of every cart item + shipping address, then a Stripe
 *      Payment Element for the whole cart. The Worker prices every
 *      line live from Printify and creates ONE Printify order (on-hold)
 *      when the payment succeeds. The cart is cleared only after a
 *      successful payment.
 *   4. Resolves live variants for a store product
 *      (hacProductVariants) so the product page shows the colours,
 *      sizes and prices Printify has right now.
 *
 * Requires Stripe.js on the page:
 *   <script src="https://js.stripe.com/v3"></script>
 * It has its own local HTML escaper (hacEsc): app.js's escaper lives
 * inside its IIFE and is not a global, so checkout.js cannot use it.
 * ------------------------------------------------------------------ */

// Worker URL: the deployed checkout Worker (see worker.js).
var CHECKOUT_API_URL = "https://hope-anchored-checkout.hopeanchoredinchrist.workers.dev";

function hacMoney(cents) {
  return "$" + (cents / 100).toFixed(2);
}

// Local HTML escaper, same escaping as the site's own helper. It must
// live here because app.js wraps everything in an IIFE, so the site's
// helper is not a global and this file cannot reach it.
function hacEsc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* Store product name -> Printify product id. The Worker sells by
 * Printify id, and /config lists products by their PRINTIFY title —
 * which does not always match the store name (the tee is "Unisex Heavy
 * Cotton Tee" in Printify but "My Identity Is in Christ Christian
 * Faith T-Shirt" on the site). Matching by title would silently hand
 * the tee shopper the sweatshirt's colours, sizes and prices, so the
 * id is mapped here by store name instead. If a product is renamed in
 * store.json, update its key here. */
var HAC_PRODUCT_IDS = {
  "Look at the Birds of the Air Crewneck Sweatshirt": "6af3e044b13d725413071601",
  "My Identity Is in Christ Christian Faith T-Shirt": "6aff566d0e0ec6c28205ccf1"
};

// Countries the checkout offers. Printify ships to many more; extend this
// list by adding entries — the Worker passes the code straight through
// to Printify's shipping quote.
var HAC_COUNTRIES = [
  ["US", "United States"], ["CA", "Canada"], ["GB", "United Kingdom"],
  ["IE", "Ireland"], ["AU", "Australia"], ["NZ", "New Zealand"],
  ["DE", "Germany"], ["FR", "France"], ["NL", "Netherlands"],
  ["BE", "Belgium"], ["AT", "Austria"], ["CH", "Switzerland"],
  ["ES", "Spain"], ["IT", "Italy"], ["PT", "Portugal"],
  ["SE", "Sweden"], ["NO", "Norway"], ["DK", "Denmark"], ["FI", "Finland"],
  ["JP", "Japan"], ["MX", "Mexico"], ["BR", "Brazil"]
];

var hacConfig = null;   // the /config response, fetched once
var hacVariants = []; // variants of the product most recently resolved by hacProductVariants (live from /config)
var hacStripe = null;   // Stripe(publishableKey)
var hacElements = null; // Stripe Elements for the current PaymentIntent
var hacPaymentElement = null; // the mounted Payment Element (unmounted before re-mounting)
var hacCurrent = null;  // { amountCents, address } for the payment in progress

function hacFetchConfig(cb) {
  if (hacConfig) return cb(null, hacConfig);
  fetch(CHECKOUT_API_URL + "/config").then(function (r) {
    if (!r.ok) throw new Error("config HTTP " + r.status);
    return r.json();
  }).then(function (json) {
    hacConfig = json;
    cb(null, json);
  }).catch(function (e) {
    cb(new Error("Could not reach the checkout service (" + (e && e.message ? e.message : "network error") + "). Please try again."));
  });
}

/* Find a /config product entry for a store product name: by the
 * Printify id map first, then by title as a fallback. */
function hacFindProductEntry(cfg, productName) {
  var entry = null;
  var id = HAC_PRODUCT_IDS[productName];
  if (cfg.products) {
    cfg.products.forEach(function (e) {
      if (id && e.printifyProductId === id) entry = e;
    });
    if (!entry) {
      cfg.products.forEach(function (e) {
        if (e.title === productName) entry = e;
      });
    }
  }
  return entry;
}

function hacFindVariant(entry, color, size) {
  var found = null;
  if (!entry || !entry.variants) return null;
  entry.variants.forEach(function (v) {
    if (v.color === color && v.size === size) found = v;
  });
  return found;
}

/* Live variants for one store product. Sets the shared hacVariants so
 * hacSizesForColor / hacVariantId / hacVariantPrice answer for this
 * product, and calls back with (err, entry, cfg). */
function hacProductVariants(productName, cb) {
  hacFetchConfig(function (err, cfg) {
    if (err) return cb(err);
    var entry = hacFindProductEntry(cfg, productName);
    if (!entry) return cb(new Error("This item is not available right now. Please try again later."));
    hacVariants = entry.variants || [];
    if (!hacVariants.length) return cb(new Error("This item is not available right now. Please try again later."));
    cb(null, entry, cfg);
  });
}

function hacSizesForColor(color) {
  var sizes = [];
  hacVariants.forEach(function (v) {
    if (v.color === color) sizes.push(v);
  });
  // S, M, L, XL, 2XL, 3XL, 4XL, 5XL order
  var order = ["S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"];
  sizes.sort(function (a, b) { return order.indexOf(a.size) - order.indexOf(b.size); });
  return sizes;
}

function hacVariantId(color, size) {
  var found = null;
  hacVariants.forEach(function (v) {
    if (v.color === color && v.size === size) found = v.variantId;
  });
  return found;
}

function hacVariantPrice(color, size) {
  var price = 0;
  hacVariants.forEach(function (v) {
    if (v.color === color && v.size === size) price = v.priceCents;
  });
  return price;
}

/* ------------------------------------------------------------------
 * Cart state — localStorage "hac_cart_v1".
 * An item is { name, color, size, qty, image, priceCents }.
 * priceCents is the live price at the moment the item was added (the
 * Worker re-prices everything live at checkout, so the cart total is
 * always re-checked before any payment). Same name + colour + size
 * merges into one line. At most 10 items per order (the Worker's cap).
 * ------------------------------------------------------------------ */
var HAC_CART_KEY = "hac_cart_v1";
var HAC_CART_MAX_ITEMS = 10;

function hacCartLoad() {
  try {
    var raw = localStorage.getItem(HAC_CART_KEY);
    if (!raw) return [];
    var items = JSON.parse(raw);
    if (!Array.isArray(items)) return [];
    return items.filter(function (it) {
      return it && typeof it.name === "string" && typeof it.color === "string" &&
        typeof it.size === "string" && it.qty > 0;
    });
  } catch (e) {
    return [];
  }
}

function hacCartSave(items) {
  try { localStorage.setItem(HAC_CART_KEY, JSON.stringify(items)); } catch (e) {}
  hacUpdateCartCount();
}

function hacCartTotalQty(items) {
  var n = 0;
  (items || []).forEach(function (it) { n += it.qty || 0; });
  return n;
}

function hacCartCount() {
  return hacCartTotalQty(hacCartLoad());
}

/* Add one line (or merge into an existing line). Returns
 * { added, lineQty }: added may be less than asked when the 10-item
 * order cap is reached, and 0 when the cart is already full. */
function hacCartAdd(item) {
  var items = hacCartLoad();
  var qty = Math.max(1, Math.min(10, parseInt(item.qty, 10) || 1));
  var room = HAC_CART_MAX_ITEMS - hacCartTotalQty(items);
  if (room <= 0) return { added: 0, lineQty: 0 };
  var add = Math.min(qty, room);
  var existing = null;
  items.forEach(function (it) {
    if (it.name === item.name && it.color === item.color && it.size === item.size) existing = it;
  });
  if (existing) {
    existing.qty = Math.min(10, existing.qty + add);
    if (existing.qty > HAC_CART_MAX_ITEMS) existing.qty = HAC_CART_MAX_ITEMS;
    hacCartSave(items);
    return { added: add, lineQty: existing.qty };
  }
  items.push({
    name: item.name, color: item.color, size: item.size,
    qty: add, image: item.image || "", priceCents: item.priceCents || 0
  });
  hacCartSave(items);
  return { added: add, lineQty: add };
}

function hacCartSetQty(index, qty) {
  var items = hacCartLoad();
  if (index < 0 || index >= items.length) return items;
  if (!qty || qty < 1) {
    items.splice(index, 1);
  } else {
    items[index].qty = Math.max(1, Math.min(10, qty));
    // A line change must not push the whole order over the 10-item cap.
    var total = hacCartTotalQty(items);
    if (total > HAC_CART_MAX_ITEMS) {
      items[index].qty -= (total - HAC_CART_MAX_ITEMS);
      if (items[index].qty < 1) items.splice(index, 1);
    }
  }
  hacCartSave(items);
  return items;
}

function hacCartRemove(index) {
  var items = hacCartLoad();
  if (index >= 0 && index < items.length) items.splice(index, 1);
  hacCartSave(items);
  return items;
}

function hacCartClear() {
  hacCartSave([]);
}

/* Header Cart count badge (#navCartCount in index.html). Hidden when
 * the cart is empty. Safe to call before the page has finished
 * loading — the nav is above this script in the document. */
function hacUpdateCartCount() {
  var badge = document.getElementById("navCartCount");
  if (!badge) return;
  var n = hacCartCount();
  badge.textContent = String(n);
  badge.hidden = (n === 0);
}
hacUpdateCartCount();

/* ------------------------------------------------------------------
 * Cart checkout overlay — hacOpenCartCheckout()
 * Step 1: order summary (every cart item) + shipping address.
 * Step 2: full summary (items, shipping, total) + Stripe Payment
 *         Element + Pay button.
 * Step 3: success screen. The cart is cleared ONLY on success.
 * The Worker prices every line live from Printify and creates ONE
 * Printify order (on-hold) from the payment webhook.
 * ------------------------------------------------------------------ */
function hacAddressFieldsHtml(countryOptions) {
  return "<h4>Ship to</h4>" +
    "<p><input id='hacFirst' placeholder='First name' autocomplete='given-name'></p>" +
    "<p><input id='hacLast' placeholder='Last name' autocomplete='family-name'></p>" +
    "<p><input id='hacEmail' type='email' placeholder='Email (for your receipt)' autocomplete='email'></p>" +
    "<p><input id='hacPhone' type='tel' placeholder='Phone (needed for shipping)' autocomplete='tel'></p>" +
    "<p><input id='hacAddress1' placeholder='Street address' autocomplete='address-line1'></p>" +
    "<p><input id='hacAddress2' placeholder='Apt / suite (optional)' autocomplete='address-line2'></p>" +
    "<p><input id='hacCity' placeholder='City' autocomplete='address-level2'> " +
    "<input id='hacRegion' placeholder='State / region' autocomplete='address-level1' style='width:9em'></p>" +
    "<p><input id='hacZip' placeholder='ZIP / postcode' autocomplete='postal-code' style='width:9em'> " +
    "<select id='hacCountry'>" + countryOptions + "</select></p>";
}

function hacReadAddress() {
  var address = {
    firstName: document.getElementById("hacFirst").value.trim(),
    lastName: document.getElementById("hacLast").value.trim(),
    email: document.getElementById("hacEmail").value.trim(),
    phone: document.getElementById("hacPhone").value.trim(),
    address1: document.getElementById("hacAddress1").value.trim(),
    address2: document.getElementById("hacAddress2").value.trim(),
    city: document.getElementById("hacCity").value.trim(),
    region: document.getElementById("hacRegion").value.trim(),
    zip: document.getElementById("hacZip").value.trim(),
    country: document.getElementById("hacCountry").value,
  };
  var missing = ["firstName", "lastName", "email", "phone", "address1", "city", "zip"].filter(function (k) { return !address[k]; });
  return { address: address, missing: missing };
}

function hacOpenCartCheckout() {
  var cartItems = hacCartLoad();
  if (!cartItems.length) {
    alert("Your cart is empty.");
    return;
  }
  hacFetchConfig(function (err, cfg) {
    if (err) {
      alert(err.message);
      return;
    }
    if (typeof Stripe === "undefined") { alert("The payment service did not load. Please try again."); return; }
    hacStripe = Stripe(cfg.stripePublishableKey);
    hacCurrent = null;

    /* Resolve every cart line to a live Printify variant. A line whose
     * colour/size is gone in Printify stops the checkout with a clear
     * error naming the item — no PaymentIntent is created. */
    var resolved = [];
    var unavailable = [];
    cartItems.forEach(function (it) {
      var entry = hacFindProductEntry(cfg, it.name);
      var variant = hacFindVariant(entry, it.color, it.size);
      if (!variant) {
        unavailable.push(it.name + " — " + it.color + ", size " + it.size);
        return;
      }
      resolved.push({
        name: it.name, color: it.color, size: it.size, qty: it.qty,
        image: it.image || "",
        productId: entry.printifyProductId,
        variantId: variant.variantId,
        priceCents: variant.priceCents
      });
    });
    if (unavailable.length) {
      alert("Sorry — this is no longer available, so it cannot be checked out:\n" + unavailable.join("\n") + "\nPlease remove it from your cart and try again.");
      return;
    }

    var itemsTotal = 0;
    resolved.forEach(function (r) { itemsTotal += r.priceCents * r.qty; });

    var countryOptions = HAC_COUNTRIES.map(function (c) {
      return "<option value='" + c[0] + "'" + (c[0] === "US" ? " selected" : "") + ">" + hacEsc(c[1]) + "</option>";
    }).join("");

    var summaryRows = resolved.map(function (r) {
      var thumb = r.image ? "<img src='" + hacEsc(r.image) + "' alt='' style='width:48px;height:48px;object-fit:cover;border-radius:6px;vertical-align:middle;margin-right:8px'>" : "";
      return "<p>" + thumb + hacEsc(r.name) + " — " + hacEsc(r.color) + ", " + hacEsc(r.size) + " × " + r.qty +
        "<br><span style='margin-left:56px'>" + hacMoney(r.priceCents * r.qty) + "</span></p>";
    }).join("");

    var html = "<div class='checkout-overlay' id='hacOverlay'>" +
      "<div class='card checkout-box'>" +
      "<p style='text-align:right;margin:0'><button class='chip' id='hacClose' type='button'>Close ✕</button></p>" +
      "<h3>Checkout</h3>" +
      "<div id='hacStep1'>" +
      "<h4>Your order</h4>" + summaryRows +
      "<p>Items: <strong>" + hacMoney(itemsTotal) + "</strong><br><span class='snippet'>Shipping calculated at the next step.</span></p>" +
      hacAddressFieldsHtml(countryOptions) +
      "<p><button class='btn' id='hacToPayment' type='button'>Continue to payment</button></p>" +
      "</div>" +
      "<div id='hacStep2' style='display:none'>" +
      "<div id='hacSummary'></div>" +
      "<div id='hacPaymentElement'></div>" +
      "<p><button class='btn' id='hacPay' type='button'>Pay</button> " +
      "<button class='chip' id='hacBack' type='button'>Back</button></p>" +
      "<p class='snippet'>By placing your order, you agree to our <a href='#/terms'>Terms &amp; Conditions</a> and <a href='#/store-policies'>Store Policies</a>.</p>" +
      "</div>" +
      "<div id='hacStep3' style='display:none'></div>" +
      "<p id='hacError' class='empty' style='display:none;color:#c2185b'></p>" +
      "</div></div>";

    var old = document.getElementById("hacOverlay");
    if (old) old.parentNode.removeChild(old);
    var wrap = document.createElement("div");
    wrap.innerHTML = html;
    document.body.appendChild(wrap.firstChild);

    function showError(msg) {
      var e = document.getElementById("hacError");
      e.style.display = "block";
      e.textContent = msg;
    }
    function clearError() {
      var e = document.getElementById("hacError");
      e.style.display = "none";
      e.textContent = "";
    }
    function closeOverlay() {
      var o = document.getElementById("hacOverlay");
      if (o) o.parentNode.removeChild(o);
    }

    document.getElementById("hacClose").addEventListener("click", closeOverlay);

    document.getElementById("hacBack").addEventListener("click", function () {
      document.getElementById("hacStep2").style.display = "none";
      document.getElementById("hacStep1").style.display = "block";
      clearError();
    });

    // Pay button: attached ONCE per overlay. It reads hacElements /
    // hacCurrent, which are (re)created each time step 2 is reached, so
    // going Back and changing the order cannot stack up handlers.
    document.getElementById("hacPay").addEventListener("click", function () {
      if (!hacElements || !hacCurrent) return;
      clearError();
      var payBtn = document.getElementById("hacPay");
      payBtn.disabled = true;
      payBtn.textContent = "Processing…";
      hacStripe.confirmPayment({
        elements: hacElements,
        confirmParams: {
          // Only used if a payment method needs a redirect (e.g. some
          // wallets). Cards complete on this page instead.
          return_url: window.location.href.split("#")[0] + "#/cart",
        },
        redirect: "if_required",
      }).then(function (result) {
        payBtn.disabled = false;
        payBtn.textContent = "Pay " + hacMoney(hacCurrent.amountCents);
        if (result.error) {
          showError(result.error.message || "The payment did not go through. Please check your card and try again.");
          return;
        }
        var pi = result.paymentIntent;
        var address = hacCurrent.address;
        document.getElementById("hacStep2").style.display = "none";
        var closeBtn = document.getElementById("hacClose");
        if (closeBtn) closeBtn.style.display = "none";
        var step3 = document.getElementById("hacStep3");
        step3.style.display = "block";
        if (pi && pi.status === "succeeded") {
          // Success: clear the cart only now that the payment went through —
          // a payment still being confirmed keeps the cart, so a failed
          // payment never loses the shopper's items.
          hacCartClear();
          step3.innerHTML = "<h4>Thank you — your order is in!</h4>" +
            "<p>Your payment went through. Your receipt is on its way to " + hacEsc(address.email) + ".</p>" +
            "<p>Your items are made to order: we send them to the printer now, and they ship to " +
            hacEsc(address.city) + ". We will email you when they are on their way.</p>" +
            "<p><button class='btn' id='hacDone' type='button'>Continue shopping</button></p>";
        } else {
          step3.innerHTML = "<h4>Payment received — finishing up</h4>" +
            "<p>Your payment is being confirmed. If anything needs attention we will email " +
            hacEsc(address.email) + ".</p>" +
            "<p><button class='btn' id='hacDone' type='button'>Continue shopping</button></p>";
        }
        document.getElementById("hacDone").addEventListener("click", function () {
          closeOverlay();
          location.hash = "#/store";
        });
      });
    });

    // Step 1 -> 2: create the PaymentIntent on the server, then mount
    // Stripe's Payment Element with the returned client secret.
    document.getElementById("hacToPayment").addEventListener("click", function () {
      clearError();
      var read = hacReadAddress();
      if (read.missing.length) { showError("Please fill in your name, email and full shipping address."); return; }
      var address = read.address;

      var btn = document.getElementById("hacToPayment");
      btn.disabled = true;
      btn.textContent = "Calculating shipping…";

      var payloadItems = resolved.map(function (r) {
        return { productId: r.productId, variantId: r.variantId, quantity: r.qty };
      });
      fetch(CHECKOUT_API_URL + "/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: payloadItems, address: address }),
      }).then(function (r) {
        return r.json().then(function (j) { return { ok: r.ok, body: j }; });
      }).then(function (res) {
        btn.disabled = false;
        btn.textContent = "Continue to payment";
        if (!res.ok) { showError(res.body.error || "Could not start the payment. Please try again."); return; }
        var b = res.body;
        hacCurrent = { amountCents: b.amountCents, address: address };
        var shipLine = b.shippingEstimated
          ? hacMoney(b.shippingCents) + " (estimated — we will confirm the exact shipping by email if it differs)"
          : hacMoney(b.shippingCents);
        document.getElementById("hacSummary").innerHTML =
          summaryRows +
          "<p>Items: " + hacMoney(b.productCents) + "<br>Shipping: " + shipLine +
          "<br><strong>Total: " + hacMoney(b.amountCents) + "</strong></p>";
        document.getElementById("hacStep1").style.display = "none";
        document.getElementById("hacStep2").style.display = "block";
        document.getElementById("hacPay").textContent = "Pay " + hacMoney(b.amountCents);

        hacElements = hacStripe.elements({ clientSecret: b.clientSecret });
        // Unmount any earlier Payment Element (e.g. the shopper went Back
        // and changed the order) before mounting the new one.
        if (hacPaymentElement) { hacPaymentElement.unmount(); hacPaymentElement = null; }
        hacPaymentElement = hacElements.create("payment");
        hacPaymentElement.mount("#hacPaymentElement");
      }).catch(function () {
        btn.disabled = false;
        btn.textContent = "Continue to payment";
        showError("Could not reach the checkout service. Please try again.");
      });
    });
  });
}
