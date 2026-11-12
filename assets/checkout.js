/* ------------------------------------------------------------------
 * Hope Anchored in Christ — on-site checkout (LIVE on the Store page since v283)
 * ------------------------------------------------------------------
 * Site-side half of the Stripe + Printify checkout. Written in the same
 * style as assets/app.js (var / function / string concat) so it slots
 * straight into viewStore(). See checkout-notes.md for the exact hook.
 *
 * What it does:
 *   1. Fetches the catalog + Stripe publishable key from the Worker
 *      (GET {CHECKOUT_API_URL}/config) — one source of truth, so the
 *      prices on the page always match the server.
 *   2. Shows an overlay: color / size / quantity, shipping address.
 *   3. Asks the Worker for a PaymentIntent (POST /create-payment-intent).
 *      The amount is computed on the server, never in this file.
 *   4. Mounts Stripe's Payment Element and confirms the payment WITHOUT
 *      leaving the page (redirect: "if_required") and WITHOUT a new tab.
 *   5. Shows a success screen (the Printify order is made by the
 *      Worker's webhook, a few seconds later) or an error screen.
 *
 * Requires Stripe.js on the page:
 *   <script src="https://js.stripe.com/v3"></script>
 * (add it to index.html next to the app.js script tag — see notes.)
 * It has its own local HTML escaper (hacEsc): app.js's escaper lives
 * inside its IIFE and is not a global, so checkout.js cannot use it.
 *
 * The existing Pop-Up "Buy" link stays on the card as a fallback until
 * this checkout is proven live. Do not remove it yet.
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
    cb(new Error("Could not reach the checkout service (" + (e && e.message ? e.message : "network error") + "). Please try again, or use the Printify link below."));
  });
}

function hacSizesForColor(color) {
  var sizes = [];
  hacConfig.variants.forEach(function (v) {
    if (v.color === color) sizes.push(v);
  });
  // S, M, L, XL, 2XL, 3XL, 4XL, 5XL order
  var order = ["S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"];
  sizes.sort(function (a, b) { return order.indexOf(a.size) - order.indexOf(b.size); });
  return sizes;
}

function hacVariantId(color, size) {
  var found = null;
  hacConfig.variants.forEach(function (v) {
    if (v.color === color && v.size === size) found = v.variantId;
  });
  return found;
}

function hacVariantPrice(color, size) {
  var price = 0;
  hacConfig.variants.forEach(function (v) {
    if (v.color === color && v.size === size) price = v.priceCents;
  });
  return price;
}

/* Open the checkout overlay for one store.json product. */
function hacOpenCheckout(product) {
  hacFetchConfig(function (err, cfg) {
    if (err) {
      alert(err.message);
      var banner = document.createElement("div");
      banner.style.cssText = "position:fixed;left:12px;right:12px;top:12px;z-index:2000;background:#fff;border:2px solid #c2185b;border-radius:8px;padding:12px;font-size:15px";
      banner.textContent = err.message + " ";
      var x = document.createElement("button");
      x.textContent = "Close";
      x.addEventListener("click", function () { banner.parentNode.removeChild(banner); });
      banner.appendChild(x);
      document.body.appendChild(banner);
      return;
    }
    if (typeof Stripe === "undefined") { alert("The payment service did not load. Please try again, or use the Printify link below."); return; }
    hacStripe = Stripe(cfg.stripePublishableKey);
    hacCurrent = null;

    var colors = [];
    cfg.variants.forEach(function (v) {
      if (colors.indexOf(v.color) === -1) colors.push(v.color);
    });

    var colorOptions = colors.map(function (c) {
      return "<option value='" + hacEsc(c) + "'>" + hacEsc(c) + "</option>";
    }).join("");

    var countryOptions = HAC_COUNTRIES.map(function (c) {
      return "<option value='" + c[0] + "'" + (c[0] === "US" ? " selected" : "") + ">" + hacEsc(c[1]) + "</option>";
    }).join("");

    var html = "<div class='checkout-overlay' id='hacOverlay'>" +
      "<div class='card checkout-box'>" +
      "<p style='text-align:right;margin:0'><button class='chip' id='hacClose' type='button'>Close ✕</button></p>" +
      "<h3>" + hacEsc(product.name) + "</h3>" +
      (product.image ? "<img src='" + hacEsc(product.image) + "' alt='" + hacEsc(product.name) + "' style='max-width:220px'>" : "") +
      "<div id='hacStep1'>" +
      "<p><label>Colour<br><select id='hacColor'>" + colorOptions + "</select></label></p>" +
      "<p><label>Size<br><select id='hacSize'></select></label></p>" +
      "<p><label>Quantity<br><input id='hacQty' type='number' min='1' max='" + cfg.maxQuantity + "' value='1'></label></p>" +
      "<p id='hacUnitPrice' class='price'></p>" +
      "<h4>Ship to</h4>" +
      "<p><input id='hacFirst' placeholder='First name' autocomplete='given-name'></p>" +
      "<p><input id='hacLast' placeholder='Last name' autocomplete='family-name'></p>" +
      "<p><input id='hacEmail' type='email' placeholder='Email (for your receipt)' autocomplete='email'></p>" +
      "<p><input id='hacPhone' type='tel' placeholder='Phone (optional)' autocomplete='tel'></p>" +
      "<p><input id='hacAddress1' placeholder='Street address' autocomplete='address-line1'></p>" +
      "<p><input id='hacAddress2' placeholder='Apt / suite (optional)' autocomplete='address-line2'></p>" +
      "<p><input id='hacCity' placeholder='City' autocomplete='address-level2'> " +
      "<input id='hacRegion' placeholder='State / region' autocomplete='address-level1' style='width:9em'></p>" +
      "<p><input id='hacZip' placeholder='ZIP / postcode' autocomplete='postal-code' style='width:9em'> " +
      "<select id='hacCountry'>" + countryOptions + "</select></p>" +
      "<p><button class='btn' id='hacToPayment' type='button'>Continue to payment</button></p>" +
      "</div>" +
      "<div id='hacStep2' style='display:none'>" +
      "<div id='hacSummary'></div>" +
      "<div id='hacPaymentElement'></div>" +
      "<p><button class='btn' id='hacPay' type='button'>Pay</button> " +
      "<button class='chip' id='hacBack' type='button'>Back</button></p>" +
      "</div>" +
      "<div id='hacStep3' style='display:none'></div>" +
      "<p id='hacError' class='empty' style='display:none;color:#c2185b'></p>" +
      "</div></div>";

    var old = document.getElementById("hacOverlay");
    if (old) old.parentNode.removeChild(old);
    var wrap = document.createElement("div");
    wrap.innerHTML = html;
    document.body.appendChild(wrap.firstChild);

    function refreshSize() {
      var color = document.getElementById("hacColor").value;
      var sizes = hacSizesForColor(color);
      var sel = document.getElementById("hacSize");
      sel.innerHTML = sizes.map(function (v) {
        return "<option value='" + hacEsc(v.size) + "'>" + hacEsc(v.size) + " — " + hacMoney(v.priceCents) + "</option>";
      }).join("");
      refreshPrice();
    }
    function refreshPrice() {
      var color = document.getElementById("hacColor").value;
      var size = document.getElementById("hacSize").value;
      var qty = parseInt(document.getElementById("hacQty").value, 10) || 1;
      var unit = hacVariantPrice(color, size);
      document.getElementById("hacUnitPrice").textContent =
        hacMoney(unit) + " each" + (qty > 1 ? " — " + hacMoney(unit * qty) + " for " + qty : "") + " + shipping";
    }
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
    document.getElementById("hacColor").addEventListener("change", refreshSize);
    document.getElementById("hacSize").addEventListener("change", refreshPrice);
    document.getElementById("hacQty").addEventListener("input", refreshPrice);
    refreshSize();

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
          return_url: window.location.href.split("#")[0] + "#/store",
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
        var step3 = document.getElementById("hacStep3");
        step3.style.display = "block";
        if (pi && pi.status === "succeeded") {
          step3.innerHTML = "<h4>Thank you — your order is in!</h4>" +
            "<p>Your payment went through. Your receipt is on its way to " + hacEsc(address.email) + ".</p>" +
            "<p>Your sweatshirt is made to order: we send it to the printer now, and it ships to " +
            hacEsc(address.city) + ". We will email you when it is on its way.</p>" +
            "<p><button class='btn' id='hacDone' type='button'>Continue shopping</button></p>";
        } else {
          step3.innerHTML = "<h4>Payment received — finishing up</h4>" +
            "<p>Your payment is being confirmed. If anything needs attention we will email " +
            hacEsc(address.email) + ".</p>" +
            "<p><button class='btn' id='hacDone' type='button'>Continue shopping</button></p>";
        }
        document.getElementById("hacDone").addEventListener("click", closeOverlay);
      });
    });

    // Step 1 -> 2: create the PaymentIntent on the server, then mount
    // Stripe's Payment Element with the returned client secret.
    document.getElementById("hacToPayment").addEventListener("click", function () {
      clearError();
      var color = document.getElementById("hacColor").value;
      var size = document.getElementById("hacSize").value;
      var qty = parseInt(document.getElementById("hacQty").value, 10);
      var variantId = hacVariantId(color, size);
      if (!variantId) { showError("Please pick a colour and size."); return; }
      if (!qty || qty < 1 || qty > cfg.maxQuantity) { showError("Quantity must be 1 to " + cfg.maxQuantity + "."); return; }

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
      var missing = ["firstName", "lastName", "email", "address1", "city", "zip"].filter(function (k) { return !address[k]; });
      if (missing.length) { showError("Please fill in your name, email and full shipping address."); return; }

      var btn = document.getElementById("hacToPayment");
      btn.disabled = true;
      btn.textContent = "Calculating shipping…";

      fetch(CHECKOUT_API_URL + "/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId: variantId, quantity: qty, address: address }),
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
          "<p>" + hacEsc(product.name) + " — " + hacEsc(color) + ", " + hacEsc(size) + " × " + qty + "</p>" +
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
        showError("Could not reach the checkout service. Please try again, or use the Printify link below.");
      });
    });
  });
}

/* Call this at the end of viewStore()'s renderGrid() (see notes): it
 * wires every on-site Buy button on the Store page to the overlay. */
function hacWireStoreButtons(products) {
  var btns = document.querySelectorAll("[data-onsite-checkout]");
  btns.forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      var name = btn.getAttribute("data-onsite-checkout");
      var product = null;
      (products || []).forEach(function (p) {
        if (p.name === name) product = p;
      });
      if (product) hacOpenCheckout(product);
    });
  });
}
