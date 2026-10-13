# Blinca – customer website redesign (prototype)

A working, static prototype of the redesigned customer side. Same logo and colours as the live site.
No build step and no backend needed.

## Run it
- Double-click `index.html`, or
- serve the folder: `npx serve .` or `python3 -m http.server` (recommended — real browsers then load the bundled font too).

## Pages
| File | What it shows |
|---|---|
| `index.html` | **New home (v2)**: greeting + big search + shortcut buttons, “pick up where you left off” cart, mood tiles, deal tickets with live countdown, trending top 5, kitchens tabbed Open now / Opening later / Favourites with Schedule order |
| `home-classic.html` | Previous home: hero, cuisines, offers, popular dishes, order again, sticky filter bar, All filters drawer |
| `restaurant.html?slug=blinca-demo` | Restaurant: cover + stats, delivery/pick-up toggle, offer strip, **menu rail with scroll-spy**, menu search + diet chips, Popular, dish grid, **live side cart**, item popup, opening hours |
| `restaurant.html?slug=sushi-sakura` | Closed restaurant state (other slugs: grona-greken, pizzeria-vesuvio, bangkok-street, burger-bror, kebab-huset) |
| `checkout.html` | 5 numbered steps, saved/new addresses, schedule time, phone with country code, promo codes, place order |
| `info.html?page=account` | Account: profile, orders, favourites, addresses (`&tab=orders` etc.) |
| `info.html?page=help` | Help centre (also: about, how, contact, terms, privacy) |
| `login.html` | Log in / create account |
| `404.html` | Page not found |

Cart drawer, address picker, new-address form and search sheet open from the header on every page.
On phones there's a bottom tab bar, a floating **View cart** bar and bottom sheets.

## Try these
- Promo codes in the cart or checkout: `HELG` (free delivery over 199 kr), `FORSTA20` (20 %), `STUDENT15` (Tuesdays only), `LUNCH10` (10 % until 15:00).
- Choose the **Jobb** address at checkout to see the "we don't deliver here" state.
- Account → *Reset demo data* restores the sample cart, orders and user.

## Design system (in `assets/css/styles.css`)
- Buttons: `.btn` + `.btn-sm` (36px) / default (44px) / `.btn-lg` (52px); variants `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.btn-link`.
- One `.chip`, one `.stepper` + `.add-round`, one `.field`, one `.card`, `.tag` (`.veg`, `.hot`, `.good`).
- Tokens in `:root`. Only weights 400 / 600 / 700.

## Files
- `assets/js/data.js` – restaurants, menus, add-ons, offers (replace with your API data)
- `assets/js/store.js` – cart, address, language, user, favourites, orders (localStorage, keys `blinca.v1.*`)
- `assets/js/i18n.js` – every string in English and Swedish
- `assets/js/components.js` – header, footer, drawers, modals, cart, add control, item popup
- `assets/js/home2.js` – new home page · `home.js` – classic home
- `assets/js/restaurant.js`, `checkout.js`, `info.js`, `login.js`, `notfound.js` – one per page

Login here is a front-end mock (it only stores a name/email locally). Keep your real `auth.js` when you merge.
Food photos are cropped from your own screenshots; dishes without a photo show the plate placeholder.
Font: Google Sans (SIL Open Font License, see `assets/fonts/OFL.txt`).
