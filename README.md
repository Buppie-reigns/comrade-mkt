# MMUST Market — starter website

A responsive front-end prototype for a campus marketplace serving Masinde Muliro University students.

## Files
- `index.html` — page structure
- `styles.css` — responsive styling
- `script.js` — sample listings, search, category/condition filters and a local-only listing demo

## Run locally
Open `index.html` in a browser. No build tools are required.

## Publish with GitHub Pages
1. Create a GitHub repository named `mmust-market`.
2. Upload `index.html`, `styles.css`, `script.js`, and this README to the repository root.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Choose branch `main` and folder `/ (root)`, then save.
6. Wait for the published URL shown in the Pages section.

## Important prototype limitations
This is a front-end preview only. The sample listings and listings added through the form are held in browser memory and disappear when the page is refreshed. Login, permanent product storage, seller messaging, identity verification, M-Pesa checkout, escrow custody, refunds and dispute handling are not implemented. Do not accept real payments through this prototype.

## Planned production architecture
- GitHub repository + GitHub Pages (or another supported frontend host)
- Supabase Auth, Postgres and Storage for student accounts, listings and product photos
- A vetted, appropriately authorised payment/escrow provider for any held funds and seller payouts
- Server-side transaction state machine, audit logs, webhook verification, dispute/refund workflow and admin controls

Before real escrow transactions, confirm the provider's regulatory status, custody model, settlement terms, KYC requirements, fees, refund/dispute process and applicable Kenyan legal obligations. Do not collect or hold customer funds in an ordinary personal/business account as a workaround.
