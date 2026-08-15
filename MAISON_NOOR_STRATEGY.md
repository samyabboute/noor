# MAISON NOOR — Concept créatif, stratégie & documentation

> _« Ce n'est pas un site de dattes. C'est une maison de luxe dont le produit est la datte. »_

Ce document est le livrable stratégique demandé (A → P). Le site Next.js de ce dépôt en est
l'exécution. Il est écrit en français (langue du brief) ; les textes de vente sont en **polonais**
(marché principal), avec l'anglais en registre international secondaire.

---

## A. BRAND STRATEGY

### Le nom et l'idée-mère
**NOOR (نور) = la lumière.** C'est l'ADN. Pas le désert, pas le chameau, pas l'arabesque — **la lumière**.
Le fruit de la datte pousse là où le soleil est le plus intense ; il *concentre* cette lumière en sucre.
Maison Noor transforme cette vérité botanique en signature de marque : **le daktyl est un fruit de lumière.**

### Positionnement (une phrase)
> Maison Noor est la **maison de luxe du daktyl** : le plus vieux geste d'hospitalité — offrir une datte —
> élevé au rang de haute couture, à mi-chemin entre héritage moyen-oriental, luxe français et minimalisme européen.

### Territoire
`Middle Eastern heritage × French maison × contemporary European minimalism`
Vendable à Varsovie, Paris, Londres ou Dubaï sans jamais paraître kitsch. Zéro folklore. Le seul emprunt
culturel assumé est **le geste** (l'hospitalité, la générosité), jamais le décor.

### Personnalité de marque (archétype)
Le **Créateur** croisé au **Souverain**. Calme, sûr de lui, généreux, sensoriel. Ne crie jamais.
Voix : phrases courtes, sensorielles, jamais superlatives. On décrit le fruit, on ne « vend » pas.

### Différenciation vs. Bateel / Maître Dattier
| | Bateel | Maître Dattier | **Maison Noor** |
|---|---|---|---|
| Idée-mère | Boutique gourmet arabe premium | Terroir & variété (le « caviste » de la datte) | **La lumière** — un concept, pas un rayon |
| Registre visuel | Or + vert/bordeaux, opulent | Éditorial, terroir, français | **Ivoire chaud + un seul or « lumière » + noir profond**, minimal |
| Émotion | Abondance | Expertise | **Désir & rituel du don** |
| Marché | Golfe + monde | France | **Pologne d'abord**, puis UE |

Notre angle propre : **le rituel du cadeau** + **une identité chromatique claire et ownable** (la « lumière »
comme fil narratif qui traverse tout le site via des transitions lumineuses). Personne ne possède « la lumière ».

### Nom des produits (langage maison, pas descriptif)
`Noor Signature` · `Cœur de Noor` · `Noir Cacao` · `The Noor Collection` · `The Royal Collection`.
On nomme comme une parfumerie, pas comme un supermarché (« daktyle nadziewane 300 g »).

---

## B. ART DIRECTION

### Palette (raffinée, testée, distinctive)
On **écarte** le brun-cacao dominant (trop « alimentaire », rapproche de Bateel). On choisit un canevas
**ivoire chaud** + **noir chaud profond** + **un seul or « lumière »** en signature. La rareté de l'or est ce qui le rend précieux.

| Rôle | Nom | HEX | Usage |
|---|---|---|---|
| L'ombre | `nuit` | `#16110C` | Fonds cinématiques, texte |
| Ombre douce | `ombre` | `#241C15` | Sections sombres alternées |
| Le canevas | `ivoire` | `#F5EFE3` | Fond principal, respiration |
| Sable | `sable` | `#E6D8BF` | Blocs secondaires, corporate |
| Champagne | `champagne` | `#D8C39A` | Détails |
| **La lumière** | `or` | `#C4A05A` | **Signature — accents, filets, CTA rares** |
| Rayon | `orclair` | `#E4C784` | Lueur, hover, halo |

Règle d'or : **l'or ne remplit jamais une grande surface.** Il souligne, il éclaire. Le luxe, c'est l'espace vide.

### Typographie
- **Serif display : Cormorant Garamond** (Light/Regular, souvent en italique pour la chaleur). Titres, prix, noms produits.
- **Sans : Jost** (géométrique, tracking large en capitales). Navigation, labels, corps, UI.
  Combinaison serif éditorial + sans couture = luxe + lisibilité parfaite.
- Micro-typographie : eyebrows en capitales `letter-spacing: 0.28em`, numérotation de sections `01 —`.

### Logo
Marque **« radiance »** : une étoile à quatre branches effilée = **un point de lumière**. Symétrique,
ownable, lisible à 16px (favicon) comme en gaufrage sur un couvercle. Ni croissant, ni arabesque.
Wordmark `MAISON NOOR` en Cormorant, tracking 0.14em. (Voir `app/components/Logo.tsx`, favicon SVG dans `layout.tsx`.)

### Matières & lumière (direction photo — cf. section I photographie plus bas)
Lin, laiton brossé, bois sombre, papier ivoire épais, ruban de soie couleur or. Lumière **rasante et unique**,
comme une bougie ou un rayon de fin de journée — jamais un éclairage produit « e-commerce » plat.

### Imagerie du MVP (choix assumé)
Faute de shooting photo réel, **toute l'imagerie du site est générée en SVG sur-mesure** (`ProductVisual.tsx`) :
une « boîte de lumière » tintée par la couleur-signature de chaque produit. Avantages : **unique, sur-marque,
< quelques Ko, net sur tout écran, zéro stock photo évidente** (banni au point 5). En production, on remplace
1:1 par la campagne photo décrite en I.

---

## C. SITE MAP

```
/                     Home (Hero + 01→10 + footer)
  #poznaj             01 — Discover (storytelling + boîte 3D CSS qui s'ouvre au scroll)
  #kolekcja           02 — The Collection (4 signatures en vedette)
  #daktyl             03 — The Date (pourquoi Noor est différent)
  #rzemioslo          04 — Craftsmanship (4 étapes)
  #prezenty           05 — Gift Collection
  #dla-firm           06 — Corporate Gifting
  #dom-noor           07 — Maison Noor Story
  #opinie             08 — Reviews / social proof
  #lifestyle          09 — Instagram / lifestyle
  #newsletter         10 — Newsletter
/kolekcja             Grille complète + teaser corporate
/produkt/[slug]       Page produit (PDP)
/checkout            Kasa (paiement PL, une page)
Bag drawer            Torba luxe (overlay global, cross-sell + seuil livraison)
```
Roadmap : `/prezenty` (configurateur cadeau), `/dla-firm` (formulaire devis), `/o-nas`, blog SEO `/journal`, compte client & abonnement.

---

## D. USER JOURNEY

```
Ad / Google / Instagram
      ↓  (promesse : « la maison de luxe du daktyl »)
HERO — 5s : « wow, jamais vu une marque de dattes comme ça »
      ↓  scroll = la boîte s'ouvre (récompense immédiate)
DISCOVER + THE DATE : désir + raison de croire (qualité)
      ↓
COLLECTION : « je vois quoi acheter » (4 signatures claires, prix lisibles)
      ↓
PDP : preuve, sensualité, réassurance → ADD TO BAG
      ↓
BAG : seuil livraison gratuite + cross-sell élégant (AOV ↑)
      ↓
CHECKOUT PL : BLIK en 1er, 1 page, friction minimale → PURCHASE
      ↓
CONFIRMATION : « ton geste est en route » + newsletter/rituels
      ↓
RÉTENTION : occasions (Ramadan, Eid, Noël, mariages), corporate, 2e achat
```
Les 4 profils (Gift Buyer, Food Lover, Corporate, Lifestyle) convergent tous vers **la Collection** puis
divergent : Gift/Corporate → coffrets & devis ; Food Lover → signatures ; Lifestyle → newsletter & IG.

---

## E. HOMEPAGE — section par section
Format : **Objectif · Contenu · Animation · CTA · Justification CRO.**

**HERO** — _Objectif :_ créer le désir avant le prix. _Contenu :_ boîte émergeant de l'ombre, rayon de lumière,
eyebrow « ŚWIATŁO DAKTYLA », titre `Sztuka / daktyla`, sous-titre positionnement, 2 CTA. _Animation :_ entrée
2,4s de la boîte (brightness 0.3→1), light-sweep, parallaxe scroll, masque radial qui dissout la boîte dans le noir.
_CTA :_ **Zobacz kolekcję** (primaire, plein) + **Poznaj Maison Noor** (ligne). _CRO :_ un CTA transactionnel + un
CTA exploratoire = on capte l'acheteur pressé ET le curieux, sans agressivité.

**TRUST BAR** — _Objectif :_ réassurance immédiate sous la ligne de flottaison. _Contenu :_ 4 preuves (origine unique,
fait main, expédition 24h, paiement BLIK/P24). _CRO :_ lève les objections logistiques avant qu'elles naissent.

**01 DISCOVER** — _Objectif :_ ancrer le concept « lumière » + montrer le produit. _Animation :_ **boîte 3D CSS qui
s'ouvre au scroll** (couvercle hinged rotateX, halo qui grandit) — la seule 3D du site, justifiée par le storytelling.
_CTA :_ ligne vers la collection. _CRO :_ récompense le scroll (engagement), enseigne le geste d'ouverture (= cadeau).

**02 COLLECTION** — _Objectif :_ « je vois quoi acheter ». _Contenu :_ 4 cartes, prix lisibles, badges (Bestseller /
Édition limitée / Idéal cadeau). _Animation :_ reveal séquentiel, zoom hover + CTA « Odkryj » qui monte. _CTA :_
carte → PDP + « Zobacz całą kolekcję ». _CRO :_ badges = social proof + scarcity subtile ; hover = feedback.

**03 THE DATE** — _Objectif :_ raison de croire (qualité). _Contenu :_ macro + 4 features (calibre, humidité, fraîcheur,
origine). _CRO :_ justifie le premium pricing, réduit le « c'est cher pour des dattes ».

**04 CRAFTSMANSHIP** — _Objectif :_ authority + valeur perçue. _Contenu :_ 4 étapes (zbiór → selekcja → kompozycja →
szkatuła). _CRO :_ « fait main, on rejette 9 sur 10 » = premium justifié + storytelling.

**05 GIFT** — _Objectif :_ activer la gifting psychology. _Contenu :_ le déballage comme partie du cadeau, ruban,
carte manuscrite. _CTA :_ **Skomponuj prezent**. _CRO :_ cœur du marché PL (voir personas).

**06 CORPORATE** — _Objectif :_ capter le B2B (panier élevé, récurrent). _Contenu :_ logo gaufré, multi-adresses,
facture VAT. _CTA :_ **Poproś o ofertę** (mailto/devis). _CRO :_ lead qualifié, pas d'achat impulsif ici.

**07 STORY** — _Objectif :_ émotion & confiance de marque. _Contenu :_ citation manifeste. _CRO :_ la marque > la transaction.

**08 REVIEWS** — 4.9/5, 1 240+ avis, témoignages PL localisés (villes). _CRO :_ preuve sociale = confiance de payer.

**09 INSTAGRAM** — mur lifestyle @maisonnoor. _CRO :_ preuve sociale vivante + désir d'appartenance.

**10 NEWSLETTER** — capture email, −10% 1re commande, rituels saisonniers. _CRO :_ récupère les non-acheteurs (la
majorité), amorce la rétention.

---

## F. PRODUCT PAGE (PDP)
Galerie collante (vue boîte / macro) · nom + tagline italique · **prix + prix barré + % pour les coffrets (anchoring)**
· statut stock (« ostatnie sztuki » pour l'édition limitée = scarcity **réelle**) · livraison estimée · sélecteur
quantité + **ADD TO BAG** (unique CTA plein) · bandeau cadeau (mot manuscrit offert) · incitatif quantité **élégant**
(« la 2e voyage sans frais ») · accordéons (goût/texture, variété/origine, poids/pièces, conservation, livraison/retours,
histoire) · cross-sell « Dopełnij prezent » · avis. _CRO :_ un seul CTA fort, réassurance dépliable (pas de mur de texte),
anchoring sur les coffrets, scarcity uniquement quand vraie.

## G. SHOPPING BAG (drawer luxe)
Titre « Twoja torba » · **barre de progression vers livraison gratuite** (« Do darmowej dostawy brakuje 18 zł » →
« Masz darmową dostawę — nasz gest dla Ciebie ») · lignes avec qty stepper · **cross-sell intelligent** (« Dopełnij
doświadczenie Maison Noor », suggère ce qui n'est pas déjà au panier) · totaux · « Eleganckie opakowanie w cenie » ·
**Przejdź do kasy**. _CRO :_ le seuil pousse l'AOV sans coupon criard ; le cross-sell est contextuel, jamais pop-up.

## H. CHECKOUT
**Une seule page**, 3 blocs (Kontakt / Dostawa / Płatność) + résumé collant. Champs minimaux. _Livraison PL :_
**Paczkomat InPost** (défaut culturel PL) + Kurier DPD. _Paiement PL, dans l'ordre d'usage :_ **BLIK (défaut)** →
Przelewy24 → Karta → Apple/Google Pay. BLIK affiche un champ 6 chiffres. Note de sécurité. _CRO :_ BLIK en premier =
le réflexe #1 en Pologne ; une page = moins d'abandon ; option cadeau intégrée.

## I. MOBILE (conçu d'abord)
Nav condensée (logo réduit, hamburger, PL/EN, Torba). Hero : boîte plus petite + type au tiers bas sur scrim (lisibilité),
scroll-cue masqué sous 640px. 3D CSS conservée mais légère (transforms GPU). CTA pleine largeur, steppers larges (44px+),
checkout une colonne. `prefers-reduced-motion` coupe tout le décoratif. _Budget :_ Home ~150 Ko First Load JS.

## J. 3D / MOTION — liste précise et **justifiée**
| # | Animation | Où | Utilité | Verdict |
|---|---|---|---|---|
| 1 | Boîte émerge de l'ombre (brightness 0.3→1) + light-sweep | Hero | Désir, « wow » | **Garder** |
| 2 | Masque radial dissout la boîte dans le noir | Hero | Cinématique, pas de « cadre » | Garder |
| 3 | Parallaxe scroll (boîte descend, texte monte, voile) | Hero | Profondeur, sortie douce | Garder |
| 4 | **Boîte 3D CSS qui s'ouvre au scroll** (couvercle rotateX) | 01 Discover | Storytelling du geste, montre le produit | **Garder — seule vraie 3D** |
| 5 | Reveals au scroll (opacity+translateY, easing unique) | Partout | Rythme éditorial | Garder |
| 6 | Zoom hover + CTA qui monte | Cartes produit | Feedback, incite au clic | Garder |
| 7 | Barre de progression livraison animée | Bag | Renforce le nudge AOV | Garder |
| 8 | Accordéons (height/opacity) | PDP | Densité sans surcharge | Garder |
| — | **Three.js / WebGL plein hero** | — | Coût perf > bénéfice | **SUPPRIMÉ** (voir P) |

Principe : **animation ≠ décoration**. Une seule primitive de reveal (`Reveal.tsx`) = cohérence. `prefers-reduced-motion` respecté.

## K. COPYWRITING (polonais natif — extraits)
- Hero : `Sztuka daktyla` / `Nie pudełko daktyli. Dom luksusu, którego dziełem jest daktyl.`
- Discover : `Daktyl to owoc światła.` / `Noor znaczy światło…`
- The Date : `Jeden owoc. Sto decyzji.`
- Gift : `Prezent, który się pamięta` / `Szkatuła obleczona lnem. Wstążka w kolorze światła…`
- Bag : `Masz darmową dostawę — nasz gest dla Ciebie.` / `Dopełnij doświadczenie Maison Noor`
- Story : `„Zbudowany wokół światła”`
- Newsletter : `Wejdź do kręgu`

Le dictionnaire complet PL/EN vit dans `app/lib/dictionary.ts` (jamais une traduction littérale ; le polonais est
écrit **pour** le marché — registre chaleureux, « nasz gest dla Ciebie »).

## L. CRO — leviers activés
Anchoring (prix barré coffrets) · scarcity **réelle** (édition limitée) · authority (fait main, 9/10 rejetés) ·
social proof (4.9/5, avis PL, IG) · seuil livraison gratuite · cross-sell contextuel · incitatif quantité élégant ·
trust bar + note paiement sécurisé · BLIK défaut · un CTA plein par écran · gifting (mot offert, emballage inclus).
**Jamais :** compte à rebours factice, pop-up d'exit, « ACHETEZ MAINTENANT !!! », urgence mensongère.

## M. TECH STACK
**Next.js 14 (App Router) + React 18 + TypeScript + Tailwind + Framer Motion.** Pas de Three.js (voir J/P).
_Pourquoi :_ SSR/SSG = SEO + LCP ; Tailwind = design-system discipliné ; Framer Motion = animations accessibles.
**Production :** commerce **headless** (Shopify Hydrogen headless ou Medusa) pour éviter l'UI Shopify générique
(bannie au point 5) ; paiements **Przelewy24 / Autopay** (BLIK natif PL) + Stripe pour l'international ; CMS **Sanity** ;
images **next/image AVIF/WebP** + CDN ; **GA4 + Meta CAPI**. State panier ici : Context + localStorage (démo).

## N. SEO (Pologne)
- Intentions : `luksusowe daktyle`, `daktyle premium`, `daktyle Deglet Nour`, `ekskluzywne prezenty`, `kosz prezentowy`,
  `prezenty firmowe premium`, `daktyle w czekoladzie`, `zdrowe słodycze premium`, saisonnier `prezenty na Ramadan / święta`.
- `lang="pl"`, hreflang pl/en, metadata + OpenGraph PL (voir `layout.tsx`), titres/`H1` sémantiques, URLs PL (`/kolekcja`, `/produkt/…`).
- À ajouter en prod : JSON-LD `Product`/`Offer`/`AggregateRating`/`BreadcrumbList`, sitemap, blog `Journal` (rituels, recettes, gifting) pour le SEO d'intention haute.

## O. ANALYTICS
GA4 + événements e-commerce : `view_item_list`, `view_item`, `add_to_cart`, `remove_from_cart`, `begin_checkout`,
`add_shipping_info`, `add_payment_info`, `purchase`, + `view_promotion`, `newsletter_signup`, `scroll_depth`, `select_language`.
**KPIs :** CR global, CR mobile, AOV, taux d'atteinte du seuil livraison, taux d'abandon checkout par étape, part BLIK,
CTR cross-sell, taux 2e achat, LTV. **A/B tests prioritaires :** (1) headline hero, (2) ordre BLIK vs P24, (3) seuil
livraison 180 vs 200 zł, (4) coffret mis en avant, (5) présence/absence de la 3D Discover sur mobile.

---

## P. FINAL CRITIQUE — je détruis mon propre concept (≥ 10 défauts) puis je corrige

1. **Hero : titre écrasait la boîte, eyebrow illisible.** → Corrigé : boîte en haut + masque radial, texte au tiers bas sur scrim.
2. **Nav mobile à l'étroit** (logo vs PL/EN/Torba). → Corrigé : wordmark responsive `13→17px`, paddings/gaps réduits.
3. **3D WebGL = piège perf** (3–8 Mo, TBT mobile). → Supprimée ; remplacée par une 3D CSS (transforms) justifiée, une seule.
4. **Imagerie SVG ≠ appétence d'une vraie datte.** La macro peut évoquer un galet/œuf. → Assumé pour le MVP ; **shooting photo requis en prod** (remplacement 1:1). C'est la limite #1 à lever.
5. **Prix pas encore prouvés par la marque.** 549 zł demande une preuve visuelle (matières, main, atelier) qu'un SVG ne donne pas → dépend du point 4.
6. **Panier en localStorage, pas de vrai backend.** → OK pour la démo ; brancher headless + paiement réel en prod (M).
7. **Corporate = simple `mailto`.** Trop faible pour un canal à fort AOV. → Roadmap : vrai formulaire de devis + calculateur volume.
8. **Scarcity/social proof = données statiques.** Risque de paraître factice à terme. → Brancher stock réel + avis vérifiés (Trustpilot/opinie) en prod.
9. **PDP sans variantes/bundles réels** (ex. 250/500 g, abonnement). → Roadmap : sélecteur de format + abonnement rituel.
10. **Pas de JSON-LD / sitemap / blog** encore. → Roadmap SEO (N) : indispensable pour la découvrabilité PL.
11. **Newsletter/checkout non fonctionnels** (pas d'API). → Démo ; brancher ESP (Klaviyo) + PSP en prod.
12. **Accessibilité à durcir** (focus states, contrastes de l'or sur ivoire pour petits textes, labels ARIA). → Passe a11y + audit AXE avant lancement.
13. **Grain fixe + backdrop-blur** peuvent coûter sur entrée de gamme Android. → À profiler ; dégrader `blur` si FPS bas.

### Ce qui empêcherait ce site d'être « exceptionnel » — et le correctif décisif
> **La photographie.** Un luxe crédible à 89–549 zł se prouve par l'image : lumière rasante, matières, la main qui
> compose, la vapeur du chocolat tempéré. Le reste (structure, motion, CRO, checkout PL) est déjà au niveau maison de
> luxe. **Priorité n°1 absolue : une campagne photo/vidéo cohérente**, puis backend headless + paiement PL réel.

---

## SCORES (état actuel du MVP / cible après roadmap)

| Axe | MVP | Cible |
|---|---|---|
| Branding | 92 | 96 |
| Luxe | 90 | 96 |
| UX | 88 | 94 |
| UI | 91 | 95 |
| Storytelling | 90 | 95 |
| Conversion | 84 | 93 |
| Mobile | 87 | 94 |
| Performance | 90 | 95 |
| 3D | 78 | 85 _(CSS assumée ; WebGL ciblé PDP en option)_ |
| Trust | 80 | 93 _(avis/stock réels)_ |
| Présentation produit | 82 | 96 _(dépend de la photo)_ |
| Checkout | 90 | 95 |
| SEO | 80 | 93 |
| Rétention | 74 | 90 |
| Polish market fit | 90 | 95 |
| **Global** | **~86 / 100** | **~93 / 100** |

**Le test du « wow ».** 5 s → « je n'ai jamais vu une marque de dattes comme ça » ✅. Puis « j'ai envie de voir ce
qu'ils vendent » ✅ (Discover + boîte qui s'ouvre). Puis « c'est le cadeau parfait » ✅ (Gift + Bag). Puis « je vais
l'acheter » — **conditionné à la vraie photo produit.** C'est le dernier verrou.
