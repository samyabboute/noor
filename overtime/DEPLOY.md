# Mettre Overtime en ligne (sans accès IT, sans SSO)

Ce guide met Overtime sur une vraie adresse web (`https://…vercel.app`) en **~15 minutes**, uniquement avec des comptes gratuits que tu crées toi-même. Pas besoin d'Azure, d'Entra ID ni de droits administrateur.

> ⚠️ **À lire avant :** l'application contiendra les noms et adresses e-mail de tes collègues (importés depuis les DL). Héberger ces données sur un compte personnel, hors de l'infrastructure de l'entreprise, nécessite normalement l'accord de ton manager / de l'IT / de la protection des données. Montre-leur l'application et ce guide avant de l'ouvrir à toute l'équipe. Les données restent en Europe (Francfort) et **ne sont jamais dans le code source** (le dépôt GitHub est public).

---

## Comment on se connecte (mode « code d'accès »)

Pas de SSO. Trois codes, un par rôle, que tu choisis :

| Rôle | Code | Qui le reçoit |
|---|---|---|
| Agent | `ACCESS_CODE_AGENT` | tous les agents (par exemple dans le message Teams de l'équipe) |
| Monitoring | `ACCESS_CODE_MONITORING` | seulement l'équipe Monitoring |
| Management | `ACCESS_CODE_MANAGEMENT` | seulement le management |

1. La personne entre le code de son rôle.
2. Elle choisit son nom dans la liste. Les agents viennent des DL importées. Le premier Monitoring s'ajoute lui-même avec son nom et son e-mail.
3. À la première connexion, elle choisit un **PIN personnel de 4 à 8 chiffres**. Ensuite, le PIN est demandé à chaque connexion.

Après 5 PIN faux, le compte est bloqué 15 minutes. Si quelqu'un oublie son PIN, Monitoring le réinitialise en un clic (Recipients → Reset). Un agent ne peut jamais s'ajouter tout seul : il doit être dans une DL.

---

## Étape 1 — Créer le projet sur Vercel (5 min)

1. Va sur **https://vercel.com/signup** et connecte-toi avec **GitHub**.
2. **Add New… → Project → Import** le dépôt **`samyabboute/noor`**.
3. Avant de cliquer sur Deploy :
   - **Root Directory** : clique sur *Edit* et choisis **`overtime`** (important : sinon c'est Maison Noor qui est déployé).
   - Framework : **Next.js** (détecté automatiquement).
4. Ouvre **Environment Variables** et ajoute :

| Nom | Valeur |
|---|---|
| `AUTH_SECRET` | une longue chaîne aléatoire, par exemple générée sur https://generate-secret.vercel.app/32 |
| `ACCESS_CODE_AGENT` | ton code agents, par exemple `peak-agents-7314` |
| `ACCESS_CODE_MONITORING` | un autre code, plus long, par exemple `monitoring-kra-58201` |
| `ACCESS_CODE_MANAGEMENT` | un troisième code |
| `DEFAULT_AGENT_LANGUAGE` | `fr` (langue de l'e-mail de confirmation ; chaque agent peut la changer dans *Profile*) |

5. Clique sur **Deploy**. Le premier déploiement fonctionne déjà, mais sans base de données : il ne faut pas encore l'utiliser.

## Étape 2 — Ajouter la base de données (3 min)

1. Dans ton projet Vercel, ouvre l'onglet **Storage → Create Database → Neon (Postgres)**.
2. Région : **Frankfurt (eu-central-1)**. Plan : **Free**.
3. **Connect** au projet `overtime`, pour tous les environnements.
   → Vercel ajoute automatiquement `DATABASE_URL`. Overtime crée sa table tout seul au premier lancement.
4. Onglet **Deployments → ⋯ → Redeploy** pour prendre en compte la base.

## Étape 3 — Branche de production

Vercel déploie la branche par défaut du dépôt. Overtime est sur la branche **`claude/gallant-bell-976z9s`**. Deux options :
- **Settings → Git → Production Branch** = `claude/gallant-bell-976z9s`, ou
- fusionne cette branche dans ta branche principale.

## Étape 4 — Première connexion et import des DL (5 min)

1. Ouvre l'adresse `https://<ton-projet>.vercel.app`.
2. Entre le **code Monitoring**, puis *« I'm not on the list »*, puis ton nom et ton e-mail, puis choisis ton PIN.
   (Si tu n'es pas Monitoring toi-même, fais cette étape avec quelqu'un du Monitoring, ou ajoute-toi puis ajoute-le dans *Distribution lists → Monitoring & management*.)
3. **Distribution lists → Import a list**, puis glisse **DL_RBC_KRK.docx**. Répète pour **DL_RSM_KRK.docx** et **DL_BM_KRK.docx**.
   - On peut aussi coller directement la liste des membres copiée depuis Outlook.
   - Les adresses des DL (facultatives) servent au bouton *Announce in Outlook*.
4. Ajoute les autres collègues du Monitoring (ils seront en CC des confirmations) et du Management.
5. Dans **Settings → Environment Variables**, ajoute `NEXT_PUBLIC_APP_URL` = ton adresse Vercel, puis redéploie. Ce lien apparaît dans les e-mails.

C'est prêt : partage l'adresse et le **code agents** avec l'équipe.

---

## Mettre à jour une DL

Quand la DL change dans Outlook : **Distribution lists → la DL → Update members**, puis dépose le nouvel export. Les nouveaux agents sont ajoutés. Ceux qui ne sont plus dans aucune DL ne peuvent plus se connecter, mais leur historique est conservé.

## Changer un code d'accès

Vercel → **Settings → Environment Variables** → modifie le code → **Redeploy**. Les sessions déjà ouvertes restent valides jusqu'à 12 h. Les PIN personnels ne changent pas.

## Plus tard : SSO Microsoft

Si l'IT accepte un jour de créer une *App registration* Entra ID, il suffit d'ajouter `AZURE_AD_CLIENT_ID`, `AZURE_AD_CLIENT_SECRET` et `AZURE_AD_TENANT_ID`. Overtime passe alors automatiquement en connexion Microsoft. Voir le README.

## Limites à connaître

- Vercel *Hobby* (gratuit) est prévu pour un usage personnel. Pour un usage officiel durable, l'idéal est que l'IT héberge l'application (c'est une application Next.js standard), ou de passer au plan Pro.
- Les codes d'accès sont partagés : quelqu'un qui a le code agents voit la liste des noms. Le PIN personnel empêche ensuite de se connecter à la place d'un collègue qui a déjà choisi le sien. Et de toute façon, la confirmation officielle part de **la propre boîte Outlook** de l'agent.
