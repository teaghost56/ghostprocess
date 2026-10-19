# Ghostprocess — website

Static website (HTML + CSS + JavaScript, no framework, no build step).
Opens in VS Code, runs locally in one click, and can be hosted anywhere (Netlify, Vercel, GitHub Pages, cPanel…).

---

## 1. Run it locally in VS Code

1. Unzip the folder, then in VS Code: **File → Open Folder…** → choose `ghostprocess-website`.
2. VS Code proposes the recommended extensions (bottom-right popup) → **Install**. The important one is **Live Server**.
3. Open `index.html`, then click **Go Live** in the blue status bar at the bottom (or right-click the file → **Open with Live Server**).
4. The site opens at `http://127.0.0.1:5500`. Every time you save a file, the page reloads by itself.

Without Live Server, from the VS Code terminal (**Terminal → New Terminal**):

```bash
npm start                    # needs Node.js installed  → http://localhost:5500
# or
python -m http.server 5500   # needs Python installed  → http://localhost:5500
```

> Double-clicking `index.html` also works, but use a local server when you test the form.

---

## 2. Project structure

```
ghostprocess-website/
├── index.html                  ← home page (all sections, commented)
├── mentions-legales.html       ← legal notice (fill the orange boxes)
├── confidentialite.html        ← privacy policy (loi organique 2004-63)
├── 404.html                    ← "page not found"
├── assets/
│   ├── css/styles.css          ← all the design (colours at the top)
│   ├── js/config.js            ← ★ SETTINGS: webhook, WhatsApp number, e-mail, pilot seats
│   ├── js/demos.js             ← content of the animated demo console
│   ├── js/main.js              ← behaviour (menu, theme, filters, form…)
│   └── img/                    ← favicon, share image (og-image.png), phone icon
├── n8n/
│   └── Ghostprocess_Site_Formulaire.json   ← n8n workflow that receives the form
├── data/Leads_Site.csv         ← column headers for the Google Sheet
├── site.webmanifest, robots.txt, sitemap.xml
└── .vscode/                    ← recommended extensions + Live Server settings
```

---

## 3. What to edit, and where

| I want to change… | File | Where |
|---|---|---|
| Form destination, WhatsApp number, e-mail | `assets/js/config.js` | the whole file (5 values) |
| Pilot programme seats left | `assets/js/config.js` | `PILOT_SEATS_LEFT` |
| Texts, FAQ, sections | `index.html` | each section starts with a `<!-- ===== NAME ===== -->` comment |
| Wording under each solution ("Tarif sur devis personnalisé") | `index.html` | section `SOLUTIONS`, class `ask` |
| Demo conversations | `assets/js/demos.js` | one list per tab |
| Colours / fonts | `assets/css/styles.css` | `:root` at the top (`--accent` = brand green) |
| Navigation bar (cream background, CTA green, heights) | `assets/css/styles.css` | section `4. En-tête`, variables `--nav-*` and `--header-h-*` |
| Legal info (RNE, matricule fiscal, address, host) | `mentions-legales.html`, `confidentialite.html` | orange boxes `class="fill"` |
| Domain name (if not ghostprocess.net) | `index.html` (`canonical`, `og:`), `sitemap.xml`, `robots.txt` | search for `ghostprocess.net` |

**Tips in VS Code**
- `Ctrl+Shift+F` (Mac `Cmd+Shift+F`): search across all files, e.g. `GhostBook Pro`.
- `Ctrl+P` then type a file name to open it quickly.
- To add a use case: copy one `<article class="case">…</article>` block; `data-s` lists the sectors it shows in (`dist ecom serv compta voyage beaute`).
- To add a solution card: copy one `<article class="svc">…</article>` block; `data-besoin` on its link pre-selects the form option with the same `value`.

---

## 4. Connect the contact form (n8n)

The form sends a JSON to an n8n webhook, which saves the contact in Google Sheets and e-mails you.

1. In Google Sheets, create a tab named **`Leads_Site`** and paste the first line of `data/Leads_Site.csv` as headers.
2. In n8n: **Workflows → Import from file** → `n8n/Ghostprocess_Site_Formulaire.json`.
3. **Settings** node: put your notification e-mail.
4. **Enregistrer le contact**: select your Google Sheets credential and your spreadsheet (tab `Leads_Site`).
5. **Prévenir l'équipe**: select your Gmail credential.
6. Turn the workflow **Active**. Open the **Formulaire du site** node → copy the **Production URL**.
7. Paste it into `assets/js/config.js`:
   ```js
   WEBHOOK_URL: "https://YOUR-INSTANCE.app.n8n.cloud/webhook/ghostprocess-contact",
   ```
8. Test: fill the form on the local site → a new row appears in the sheet and you get an e-mail.

Built in:
- **Anti-spam**: hidden trap field + submissions faster than 3 seconds are ignored; n8n also discards entries without name/phone or with many links.
- **Phone numbers** with 8 digits become `216XXXXXXXX`, and the e-mail contains a direct WhatsApp link to the lead.
- **Campaign tracking**: share links like `https://ghostprocess.net/?utm_source=instagram&utm_campaign=bio`; the source is saved with the lead.
- **If n8n is down** or not connected yet, the visitor sees a message offering WhatsApp (pre-filled with what they typed) or e-mail. No lead is lost silently.
- Once the site is online, in the webhook node replace `Allowed Origins` `*` with `https://ghostprocess.net`.

> Note: your n8n Cloud trial is ending soon. When you move to another n8n (paid plan or self-hosted), re-import the workflow and update `WEBHOOK_URL`.

---

## 5. Put it online

Any static host works, since it's plain files.

- **Netlify** (simplest): app.netlify.com → **Add new site → Deploy manually** → drag the `ghostprocess-website` folder. Then **Domain settings** → add `ghostprocess.net`.
- **Vercel / Cloudflare Pages / GitHub Pages**: push the folder to a GitHub repo and import it; no build command, output folder = `/`.
- **cPanel / classic hosting**: upload the folder contents into `public_html`.

Before going live:
- [ ] `config.js`: `WEBHOOK_URL` and `WHATSAPP_NUMBER` filled
- [ ] Orange boxes filled in both legal pages, and their "Dernière mise à jour" date
- [ ] No prices on the site (they are sent only in personalised quotes)
- [ ] Test the form once from the live site
- [ ] Share the link on WhatsApp to check the preview image

---

## 6. Quality notes

- Responsive from 320 px phones to large screens, with a mobile menu.
- "Back to top" button: appears after scrolling, sits above the WhatsApp button.
- Light/dark theme (follows the device, button to switch; choice remembered).
- Accessible: keyboard navigation, visible focus, "skip to content" link, ARIA on tabs/menu/form, respects "reduce motion".
- SEO: title/description, Open Graph share image, structured data (`ProfessionalService`), `sitemap.xml`, `robots.txt`.
- No tracking cookies. Fonts load from Google Fonts; everything else is local.
- All demo data is fictitious and labelled as such; no invented testimonials or statistics.
