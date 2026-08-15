# reHyve

Marketing site for reHyve — performance nutrition. Live at https://rehyve.com

| Path | Purpose |
|---|---|
| `index.html` | Home page |
| `checkout.html` | Payment options, 5-image product gallery |
| `join/index.html` | Prelaunch signup landing page (QR code destination) |
| `assets/` | Logo and product photography |

## The flyer QR code

The event QR points to **https://rehyve.com/join**. That path is served by
`join/index.html`. Do not rename or delete that folder — printed flyers depend
on it. To send scanners somewhere else later, edit that file rather than
changing the URL.

## Stock status

Checkout is in out-of-stock mode. To re-enable payments, open `checkout.html`
and set the flag near the bottom:

```js
const IN_STOCK = true;
```

Also replace the placeholder UPI ID (`rehyve@upi`) and add the payment QR image.
