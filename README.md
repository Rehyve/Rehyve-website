# reHyve

Marketing site for reHyve — performance nutrition.

| File | Purpose |
|---|---|
| `index.html` | Home page (self-contained: CSS and images inlined) |
| `checkout.html` | Payment options page with 5-image product gallery |
| `styles.css` / `script.js` | Legacy stylesheet and script from the original build |
| `assets/` | Logo and product photography |

## Viewing locally

Open `index.html`, or run `python -m http.server 8000` and visit http://localhost:8000

## Stock status

Checkout is in out-of-stock mode. To re-enable payments, open `checkout.html`
and set the flag near the bottom:

```js
const IN_STOCK = true;
```

Also replace the placeholder UPI ID (`rehyve@upi`) and add the payment QR image.
