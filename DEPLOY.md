# Déploiement — Maison Noor

Le repo est une app **Next.js 14** prête à déployer. Recommandé : **Vercel** (créé par l'équipe Next.js,
zéro config). Netlify fonctionne aussi.

---

## Option A — Vercel (recommandé, ~3 min)

1. Va sur **https://vercel.com/new** et connecte-toi avec **GitHub**.
2. **Import Git Repository** → choisis **`samyabboute/noor`**.
   - Si Vercel demande d'installer l'app Vercel sur GitHub, autorise l'accès à `noor`.
3. Vercel détecte automatiquement **Next.js** — ne change rien :
   - Framework Preset : **Next.js**
   - Build Command : `next build` (auto)
   - Output : auto
   - Install Command : `npm install` (auto)
4. **Important — branche de production :** comme le dépôt n'a pas encore de branche `main`,
   ouvre **Settings → Git → Production Branch** et mets :
   ```
   claude/maison-noor-luxury-ecommerce-rn94ye
   ```
   (ou renomme cette branche en `main` sur GitHub avant l'import — voir Option C).
5. Clique **Deploy**. Après ~1 min tu obtiens une URL type **`noor-xxxx.vercel.app`**.
6. (Optionnel) **Settings → Domains** → branche ton domaine (`maisonnoor.pl`).

Aucune variable d'environnement n'est requise pour cette version (panier/checkout sont des démos front-end).

---

## Option B — Netlify

1. **https://app.netlify.com** → **Add new site → Import an existing project** → GitHub → `samyabboute/noor`.
2. Netlify détecte Next.js (plugin `@netlify/plugin-nextjs` auto). Build command `next build`.
3. Définis la **Branch to deploy** = `claude/maison-noor-luxury-ecommerce-rn94ye`.
4. **Deploy site**.

---

## Option C — pour avoir une vraie branche `main` (propre pour la prod)

Sur GitHub → repo `noor` → onglet **Branches** → renomme
`claude/maison-noor-luxury-ecommerce-rn94ye` en **`main`**, ou définis-la comme **default branch**
(icône ⇄ / « Set as default »). Ensuite Vercel/Netlify prennent `main` automatiquement.

---

## Vérifier en local avant de déployer

```bash
npm install
npm run build && npm run start   # http://localhost:3000
```
