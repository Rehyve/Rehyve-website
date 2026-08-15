# reHyve

Marketing site for reHyve — performance nutrition. Live at https://rehyve.com

| Path | Purpose |
|---|---|
| `index.html` | Home page |
| `checkout.html` | Payment options, 5-image product gallery |
| `join/index.html` | Event landing page — the flyer QR code destination |
| `assets/partners/` | Partner logos (andPeople) |

## The flyer QR code

The event QR points to **https://rehyve.com/join**, served by `join/index.html`.
Do not rename or delete that folder — printed flyers depend on that exact path.
To change where scanners land later, edit the contents of that file.

### Current event

andPeople × Blue Tokai wellness session. Coupon code shown on screen after
signup is **ANDPEOPLE15** — change it in two places in `join/index.html`:
the `id="codeText"` element and the offer wording above it.

### After the event

Either revert `join/index.html` to a plain signup page, or point it at the next
event. The QR keeps working either way.

## Stock status

Checkout is in out-of-stock mode. To re-enable payments, open `checkout.html`
and set `const IN_STOCK = true;` near the bottom. Also replace the placeholder
UPI ID (`rehyve@upi`) and add the payment QR image.
