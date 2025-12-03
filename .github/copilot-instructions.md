
---

## 🟢 **Phase 1 — MVP : Gestion des habitudes et utilisateurs**

### US1. En tant qu'utilisateur, je veux créer un compte et me connecter pour accéder à mes habitudes.
**Critères d'acceptation :**
- [ ] Un formulaire d'inscription permet de créer un compte avec email/mot de passe
- [ ] Un formulaire de connexion permet de s'authentifier
- [ ] Les mots de passe sont hashés et stockés de manière sécurisée
- [ ] Une session est maintenue après connexion
- [ ] Un message d'erreur s'affiche en cas d'identifiants incorrects
- [ ] L'utilisateur est redirigé vers son dashboard après connexion réussie

### US2. En tant qu'utilisateur, je veux créer une habitude avec un emoji, un nom, une fréquence (quotidienne/hebdomadaire) et un type (bonne/mauvaise) pour personnaliser mes routines.
**Critères d'acceptation :**
- [ ] Un formulaire permet de saisir le nom de l'habitude (max 50 caractères)
- [ ] Un sélecteur d'emoji permet de choisir parmi une liste prédéfinie
- [ ] Un bouton radio permet de choisir entre "quotidienne" et "hebdomadaire"
- [ ] Un bouton radio permet de choisir entre "bonne habitude" et "mauvaise habitude"
- [ ] L'habitude est sauvegardée en base avec tous les champs requis
- [ ] Un message de confirmation s'affiche après création (toast)
- [ ] La validation côté client empêche la soumission de champs vides

### US3. En tant qu'utilisateur, je veux cocher mes habitudes chaque jour/semaine pour suivre ma progression.
**Critères d'acceptation :**
- [ ] Une liste des habitudes du jour/semaine s'affiche sur le dashboard
- [ ] Chaque habitude a une case à cocher cliquable
- [ ] Le clic sur une case marque l'habitude comme accomplie pour la période
- [x] L'état "coché" est stocké en base de données
- [x] L'interface se met à jour immédiatement après le clic
- [x] Les habitudes déjà cochées restent cochées au rechargement de la page
- [x] Un indicateur visuel distingue les habitudes accomplies des non-accomplies
- [x] Chaque complétion de l'habitude est stockée en base de données

### US4. En tant qu'utilisateur, je veux voir mes habitudes sur un calendrier avec des pastilles pour visualiser mes progrès.
**Critères d'acceptation :**
- [x] Un calendrier mensuel affiche tous les jours du mois
- [x] Chaque jour contient des pastilles colorées représentant les habitudes
- [x] Couleur verte pour les habitudes accomplies
- [x] Couleur rouge pour les habitudes manquées
- [x] Couleur grise pour les habitudes du jour
- [x] Au clic sur un jour, détail des habitudes de ce jour
- [x] Navigation entre les mois précédent/suivant

### US5. En tant qu'utilisateur, je veux voir mes streaks (séries de jours réussis) pour rester motivé.
**Critères d'acceptation :**
- [ ] Affichage du streak actuel pour chaque habitude
- [ ] Affichage du meilleur streak historique
- [ ] Le streak se remet à zéro si l'habitude est manquée
- [ ] La couleur de l'habitude change en fonction du nombre de complétions
- [ ] Un graphique montre l'évolution du streak dans le temps

### US6. En tant qu'utilisateur, je veux pouvoir rattraper les oublis du jour précédent au démarrage d'un nouveau jour.
**Critères d'acceptation :**
- [X] À la première connexion du jour, popup de rattrapage si habitudes manquées
- [X] Liste des habitudes non cochées de la veille
- [X] Possibilité de cocher rétroactivement (jusqu'à 24h)
- [X] Option "Ignorer" pour accepter l'échec
- [X] Le rattrapage maintient le streak en cours


---

## 🟡 **Phase 2 — Gamification & immersion**

### US8. En tant qu'utilisateur, je veux gagner de l'XP en accomplissant mes habitudes pour faire progresser mon niveau.
**Critères d'acceptation :**
- [ ] Chaque habitude accomplie rapporte des points d'XP 
- [ ] Barre de progression XP visible sur le profil utilisateur
- [ ] Passage au niveau suivant avec notification visuelle
- [ ] Formule de progression exponentielle (niveau n = n² × 100 XP)
- [ ] Bonus XP pour les streaks (×1.5 à partir de 7 jours)
- [ ] Historique des gains d'XP consultable

### US9. En tant qu'utilisateur, je veux voir mon hérisson grandir à chaque niveau pour visualiser ma progression.
**Critères d'acceptation :**
- [ ] 5 stades de croissance du hérisson (bébé → adulte)
- [ ] Changement visuel automatique à chaque passage de niveau
- [ ] Animation de transition entre les stades
- [ ] Sauvegarde de l'état actuel du hérisson
- [ ] Possibility de voir l'évolution passée dans une galerie

### US10. En tant qu'utilisateur, je veux nourrir mon hérisson quand je réussis mes tâches pour renforcer la sensation de récompense.
**Critères d'acceptation :**
- [ ] Bouton des glands partent de l'habitude pour aller au hérisson quand on coche une habitude
- [ ] Animation de nourriture vers le hérisson

### US11. En tant qu'utilisateur, je veux débloquer des éléments de décor à certains niveaux pour personnaliser l'environnement.
**Critères d'acceptation :**
- [ ] Catalogue d'éléments débloqués par niveau (arbres, fleurs, rochers)
- [ ] Interface de placement pour positionner les éléments
- [ ] Sauvegarde de la configuration du décor
- [ ] Preview avant placement définitif
- [ ] Limite d'éléments par type pour éviter le chaos visuel
- [ ] Possibilité de supprimer/déplacer les éléments placés

### US12. En tant qu'utilisateur, je veux associer une tâche à un élément du décor pour lier mes habitudes à la croissance du monde virtuel.
**Critères d'acceptation :**
- [ ] Lors de la création d'habitude, sélection d'un élément de décor associé
- [ ] L'élément grandit/fleurit quand l'habitude est accomplie
- [ ] États visuels dégradés si l'habitude est négligée
- [ ] Lien visible entre habitude et élément (tooltip/highlight)
- [ ] Possibilité de changer l'association après création
- [ ] Animation spéciale lors de l'accomplissement de l'habitude liée

### US13. En tant qu'utilisateur, je veux un graphique pour visualiser ma productivité sur une période.
**Critères d'acceptation :**
- [ ] Graphique en barres par semaine/mois montrant le % de réussite
- [ ] Courbe d'évolution de l'XP dans le temps
- [ ] Filtrage par habitude spécifique ou vue globale
- [ ] Légende claire et tooltips informatifs
- [ ] Export des données en CSV
- [ ] Comparaison entre périodes (mois actuel vs précédent)

### US14. En tant qu'utilisateur, je veux voir le nombre total de réalisations de mes principales habitudes.
**Critères d'acceptation :**
- [ ] Compteurs affichés sur chaque habitude (ex: "127 fois accomplie")
- [ ] Podium des 3 habitudes les plus accomplies
- [ ] Statistiques détaillées : total, moyenne par semaine, taux de réussite
- [ ] Badge "Centurion" à 100 accomplissements
- [ ] Historique mensuel des accomplissements
- [ ] Partage des statistiques (capture d'écran générée)

---

## 🟠 **Phase 3 — Compétition & multijoueur**

### US15. En tant qu'utilisateur, je veux me comparer à d'autres joueurs dans un classement pour me motiver.
**Critères d'acceptation :**
- [ ] Classement mondial basé sur l'XP total ou le niveau
- [ ] Position de l'utilisateur affiché dans le classement
- [ ] Top 10 visible avec pseudonymes et niveaux
- [ ] Filtre par période (semaine, mois, all-time)
- [ ] Anonymisation des données sensibles (seuls pseudos et XP)
- [ ] Mise à jour temps réel du classement
- [ ] Badge spécial pour le top 3

### US16. En tant qu'utilisateur, je veux voir les meilleurs joueurs et leurs hérissons pour trouver de l'inspiration.
**Critères d'acceptation :**
- [ ] Galerie des hérissons du top 10 avec leur environnement
- [ ] Informations publiques : niveau, nombre d'habitudes, streaks record
- [ ] Possibilité de "suivre" un joueur inspirant
- [ ] Tags des habitudes populaires chez les top players
- [ ] Profils publics consultables (si opt-in du joueur)
- [ ] Système de "likes" sur les environnements créatifs

### US17. En tant qu'utilisateur, je veux lancer une phase de focus (style Pomodoro) pour gagner des points en me concentrant.
**Critères d'acceptation :**
- [ ] Timer configurable (15, 25, 45 minutes)
- [ ] Interface minimaliste de focus avec chrono
- [ ] Blocage des notifications pendant la session
- [ ] Association optionnelle à une habitude spécifique
- [ ] Gain d'XP bonus proportionnel à la durée (25min = 50 XP)
- [ ] Historique des sessions de focus accomplies
- [ ] Pause/reprise avec pénalité d'XP si interruption

### US18. En tant qu'utilisateur, je veux gagner des récompenses supplémentaires lors des phases de focus.
**Critères d'acceptation :**
- [ ] Nourriture spéciale débloquée après sessions de focus
- [ ] Multiplicateur d'XP temporaire (×2 pendant 1h après focus)
- [ ] Éléments de décor exclusifs aux sessions de focus (cristaux, etc.)
- [ ] Badge "Concentration" après 10 sessions réussies
- [ ] Streaks de focus avec récompenses escaladées
- [ ] Animation spéciale du hérisson pendant les sessions

### US19. En tant que nouvel utilisateur, je veux pouvoir arriver sur une landing page pour comprendre le principe de l'application.
**Critères d'acceptation :**
- [ ] Hero section expliquant le concept en une phrase claire
- [ ] Démonstration visuelle avec captures d'écran de l'app
- [ ] Section des 3 phases de développement (MVP → Gamification → Compétition)
- [ ] Témoignages d'utilisateurs fictifs mais crédibles
- [ ] Call-to-action clair vers l'inscription
- [ ] Version responsive adaptée mobile/desktop
- [ ] Temps de chargement < 3 secondes
- [ ] SEO optimisé avec meta tags appropriés

---

---

## Dépendances du projet

### Dépendances principales (package.json)

- **next 15.6.0-canary.6** : Framework React pour le rendu côté serveur et la génération statique
- **react** / **react-dom** : Bibliothèques de base pour l’UI
- **tailwindcss** / **@tailwindcss/forms** / **postcss** / **autoprefixer** : Pour le design et le style
- **next-auth** : Authentification
- **bcrypt** / **bcryptjs** : Hashage des mots de passe
- **postgres** : Connexion à la base de données PostgreSQL
- **zod** : Validation de schéma
- **clsx** : Gestion conditionnelle des classes CSS
- **use-debounce** : Gestion des délais en UI
- **typescript** : Typage statique

### Dépendances de développement

- **eslint** / **eslint-config-next** : Linting
- **@types/** : Typages pour TypeScript

---

## Base de données

- **PostgreSQL** : Utilisée via la librairie `postgres`.
- La connexion se fait avec la variable d'environnement `POSTGRES_URL`.
- Les tables principales utilisées :
  - **users** : Utilisateurs (id, name, email, password)

Les types TypeScript des données sont définis dans `app/lib/definitions.ts`.
Les requêtes SQL sont réalisées dans `app/lib/data.ts`.
Les actions serveur (CRUD utilisateurs, authentification) sont dans `app/lib/actions.ts`.

### Tables implémentées pour le MVP Habit Tracker
- ✅ **habits** : Table des habitudes (id, user_id, name, emoji, type, frequency, creation_date, isActive)
- ✅ **habit_logs** : Historique des réalisations (id, habit_id, user_id, date, completed)
- ✅ **user_progress** : Progression utilisateur (id, user_id, level, xp, hedgehogState, lastLoginDate, bestStreak)

---

## 🎯 **Récapitulatif des fonctionnalités implémentées**

### ✅ **PHASE 1 - MVP COMPLET** 
- **Authentification** : NextAuth avec hash bcrypt, sessions, redirections
- **Gestion des habitudes** : CRUD complet, formulaires, validation Zod
- **Dashboard interactif** : Liste mobile, toggle optimiste, modales de création/édition
- **Calendrier US4** : Visualisation mensuelle avec pastilles colorées, détails par jour, navigation mois
- **Navigation mobile-first** : Bottom nav avec 3 onglets (Dashboard/Calendrier/Profil)
- **Rattrapage US6** : Modal pour récupérer les habitudes manquées du jour précédent
- **Mode debug US7** : Menu temporel pour avancer les jours et tester
- **Base de données** : Prisma + PostgreSQL avec relations et soft delete
- **Profil utilisateur** : Statistiques complètes (niveau, XP, streaks, complétions)

### ✅ **PHASE 2 - GAMIFICATION (PARTIEL)**
- **Hérisson interactif** : Affichage avec score dynamique, environnement 3D
- **Animation des glands** : Trajectoire fluide et linéaire vers le compteur
- **Bouton nourrir** : Interaction avec animation des particules
- **Graphiques** : Tracking des performances avec barres de progression
- **Images optimisées** : Composant Next.js Image pour gland.webp

### ⏳ **EN COURS DE DÉVELOPPEMENT**
- Système XP et niveaux
- Streaks et statistiques détaillées
- Éléments de décor déblocables
- Mode debug temporel

### 📱 **Interface utilisateur**
- **Design** : Style enfantin avec couleurs primaires, formes arrondies
- **Responsive** : Navigation mobile avec sidenav adaptative
- **Animations** : Transitions fluides, feedback visuel immédiat
- **Accessibilité** : Images avec alt, focus clavier, contraste élevé

---

## 📚 **GUIDE DE FONCTIONNEMENT DE L'APPLICATION**

### 🏗️ **Architecture générale**

Habit Hisson est une application web full-stack construite avec :
- **Framework** : Next.js 15 (App Router) avec React 19
- **Base de données** : PostgreSQL (Neon) + Prisma ORM
- **Authentification** : NextAuth.js avec credentials provider
- **Styling** : Tailwind CSS v4 avec thème personnalisé Orange/Beige
- **Monorepo** : TurboRepo avec packages partagés

### 📁 **Structure du projet**

```
HabitHisson/
├── apps/
│   └── web/                    # Application Next.js principale
│       ├── app/                # App Router (Next.js 15)
│       │   ├── auth/           # Pages d'authentification (signin/signup)
│       │   ├── dashboard/      # Dashboard principal (liste habitudes)
│       │   ├── layout.tsx      # Layout racine avec providers
│       │   └── page.tsx        # Page d'accueil
│       ├── components/         # Composants React réutilisables
│       │   ├── catch-up-modal.tsx      # Modal de rattrapage US6
│       │   ├── create-habit-form.tsx   # Formulaire création habitude
│       │   └── debug-time-menu.tsx     # Menu debug temporel US7
│       └── lib/                # Logique métier et utilitaires
│           ├── actions.ts              # Actions serveur utilisateurs
│           ├── auth.ts                 # Configuration NextAuth
│           ├── habit-actions.ts        # Actions serveur habitudes
│           └── debug-time-context.tsx  # Contexte React pour date simulée
├── packages/
│   ├── db/                     # Package Prisma partagé
│   │   └── prisma/
│   │       └── schema.prisma   # Schéma de base de données
│   └── ui/                     # Package UI partagé
│       └── src/styles/
│           └── globals.css     # Styles Tailwind globaux
```

### 🗄️ **Schéma de base de données**

#### **Table User**
```typescript
{
  id: number              // PK, auto-increment
  email: string           // Unique, pour connexion
  name: string            // Nom affiché
  password: string        // Hash bcrypt
  level: number           // Niveau de gamification (default: 1)
  xp: number             // Points d'expérience (glands)
  hedgehogState: string   // État du hérisson: baby/child/teen/adult/elder
  profilePublic: boolean  // Profil public pour US16 (default: false)
  createdAt: DateTime
  updatedAt: DateTime
}
```

#### **Table Habit**
```typescript
{
  id: number              // PK
  userId: number          // FK → User
  name: string            // Nom de l'habitude (max 50 caractères)
  emoji: string           // Emoji représentant l'habitude
  type: HabitType         // GOOD | BAD
  frequency: Frequency    // DAILY | WEEKLY
  isActive: boolean       // Soft delete (default: true)
  decorationId?: number   // FK → DecorationItem (US12)
  createdAt: DateTime
  updatedAt: DateTime
}
```

#### **Table HabitLog**
```typescript
{
  id: number              // PK
  habitId: number         // FK → Habit
  userId: number          // FK → User
  date: Date              // Date de la complétion (uniquement la date, pas l'heure)
  completed: boolean      // True = fait, False = manqué
  createdAt: DateTime     // Timestamp de création (pour tracking rattrapage)
  
  // Contraintes
  @@unique([habitId, date])  // Un seul log par habitude par jour
  @@index([userId, date])
  @@index([habitId, date, completed])  // Pour calcul des streaks
}
```

#### **Table UserProgress**
```typescript
{
  id: number              // PK
  userId: number          // FK → User (unique)
  totalXp: number         // XP total accumulé
  currentLevel: number    // Niveau actuel
  bestStreak: number      // Meilleur streak historique
  lastLoginDate?: Date    // Dernière connexion (pour US6)
  lastActivity?: Date
  createdAt: DateTime
  updatedAt: DateTime
}
```

### 🔄 **Flux de données principaux**

#### **1. Authentification (US1)**

```mermaid
User → /auth/signin → NextAuth → bcrypt.compare() → Session JWT → Redirect /dashboard
```

**Fichiers impliqués :**
- `apps/web/app/auth/signin/page.tsx` : Page de connexion
- `apps/web/lib/auth.ts` : Configuration NextAuth
- `apps/web/lib/actions.ts` : Action `createUser()` pour inscription

**Variables d'environnement :**
- `AUTH_SECRET` : Secret pour signer les tokens JWT
- `DATABASE_URL` : Connection string PostgreSQL

#### **2. Tracking des habitudes (US3)**

```mermaid
Dashboard → getUserHabits() → Prisma Query → Habits + HabitLogs (today)
User clicks checkbox → toggleHabit() → Upsert HabitLog → Revalidate
```

**Logique de toggle :**
```typescript
// apps/web/lib/habit-actions.ts - toggleHabit()
1. Vérifier si HabitLog existe pour (habitId, date)
2. Si existe → Toggle completed (true ↔ false)
3. Si n'existe pas → Créer avec completed=true
4. Revalidate /dashboard pour rafraîchir l'UI
```

**Mise à jour optimiste :**
```typescript
// apps/web/app/dashboard/page.tsx
1. Update local state immédiatement (UI réactive)
2. Appel action serveur en background
3. Si erreur → Rollback du state local
```

#### **3. Rattrapage des oublis (US6)**

```mermaid
User lands on dashboard → checkIfShouldShowCatchUp()
  → lastLoginDate < today ?
    → getMissedHabitsFromYesterday()
    → Show CatchUpModal
```

**Logique de détection :**
```typescript
// apps/web/lib/habit-actions.ts - checkIfShouldShowCatchUp()
1. Récupérer UserProgress.lastLoginDate
2. Si lastLoginDate === hier → return true
3. Update lastLoginDate = aujourd'hui
4. Frontend affiche la modal si true + habitudes manquées
```

**Rattrapage :**
```typescript
// catchUpHabit(habitId)
1. Créer/Update HabitLog pour HIER avec completed=true
2. Le streak n'est pas cassé car l'habitude est maintenant "complétée"
```

#### **4. Mode debug temporel (US7)**

```mermaid
DebugTimeContext → localStorage.debug_date → useCurrentDate()
  → Toutes les vues utilisent cette date
  → Actions serveur reçoivent la date simulée
```

**Activation :**
```bash
# .env ou .env.local
NEXT_PUBLIC_DEBUG_MODE=true
NODE_ENV=development
```

**Utilisation dans les composants :**
```typescript
import { useCurrentDate } from '@/lib/debug-time-context'

const today = useCurrentDate() // Date réelle OU simulée
```

### 🎨 **Thème et styles**

#### **Configuration Tailwind 4**

**Fichier** : `packages/ui/src/styles/globals.css`

**Palette de couleurs :**
```css
:root {
  --background: #FFF8F0;      /* Beige chaud */
  --foreground: #3A2E26;      /* Marron foncé */
  --primary: #FF8544;         /* Orange vif */
  --secondary: #FFD4B8;       /* Orange pâle */
  --success: #5FB878;         /* Vert */
  --destructive: #E85D4A;     /* Rouge orangé */
  --border: #E8D4C0;          /* Beige bordures */
  --input: #F7EDE3;           /* Beige inputs */
}
```

**Classes custom importantes :**
- `.btn-primary` : Boutons principaux orange avec hover scale
- `.btn-secondary` : Boutons secondaires beige avec bordure
- `.habit-card` : Carte d'habitude avec hover et bordure
- `.animate-hedgehog-bounce` : Animation du hérisson (translateY)
- `.animate-acorn-fall` : Animation des glands qui tombent

### 🔐 **Sécurité**

1. **Mots de passe** : Hash bcrypt avec salt automatique
2. **Sessions** : JWT signés avec `AUTH_SECRET`
3. **Actions serveur** : Toutes vérifiées avec `await auth()`
4. **SQL Injection** : Protégé par Prisma (prepared statements)
5. **XSS** : React escape automatiquement les variables

### 🐛 **Debugging et développement**

#### **Activer le mode debug**

1. Dé-commenter dans `.env` :
```bash
NEXT_PUBLIC_DEBUG_MODE=true
```

2. Redémarrer le serveur :
```bash
pnpm dev
```

3. Le menu flottant ⏱️ apparaît en bas à droite

#### **Prisma Studio**

Visualiser la base de données :
```bash
cd packages/db
npx prisma studio
```

Ouvre `http://localhost:5555` avec interface graphique pour voir/éditer les données.

#### **Logs utiles**

```typescript
// Dans les actions serveur
console.log('User habits:', habits)

// Dans les composants
console.log('Toggle habit:', habitId, 'completed:', isCompleted)
```

### 🚀 **Déploiement**

#### **Variables d'environnement requises**

```bash
# Production
DATABASE_URL=postgresql://...           # Neon PostgreSQL
AUTH_SECRET=xxx                         # Générer avec `openssl rand -base64 32`
NODE_ENV=production

# Ne PAS définir NEXT_PUBLIC_DEBUG_MODE en production
```

#### **Commandes**

```bash
# Build
pnpm build

# Démarrer en production
pnpm start

# Migrations Prisma
cd packages/db
npx prisma migrate deploy
npx prisma generate
```

### 📊 **Formules et calculs**

#### **Système XP (US8)**

```typescript
// XP requis pour level N
requiredXP = N² × 100

// Exemples
Level 1 → 2: 100 XP
Level 2 → 3: 400 XP
Level 3 → 4: 900 XP
Level 10: 10,000 XP
```

#### **Bonus streaks**

```typescript
// Multiplicateur XP selon streak
if (streak >= 7) {
  xpEarned = baseXP × 1.5
}
```

#### **Calcul des streaks**

```sql
-- Requête conceptuelle (à implémenter)
SELECT habitId, COUNT(*) as streak
FROM HabitLog
WHERE completed = true
  AND date >= (CURRENT_DATE - INTERVAL '30 days')
GROUP BY habitId, 
  (date - ROW_NUMBER() OVER (PARTITION BY habitId ORDER BY date))
ORDER BY streak DESC
```

### 🎮 **Prochaines étapes recommandées**

1. **US4** - Calendrier avec pastilles historiques
2. **US5** - Calcul et affichage des streaks
3. **US8** - Système XP complet avec animations
4. **US9** - Évolution visuelle du hérisson (5 stades)
5. **US10** - Animation de nourriture du hérisson

### 🤝 **Contribution**

Pour ajouter une nouvelle fonctionnalité :

1. Créer une branche : `git checkout -b feature/us-XX`
2. Implémenter les actions serveur dans `lib/habit-actions.ts`
3. Créer le composant UI dans `components/`
4. Intégrer dans `app/dashboard/page.tsx`
5. Tester avec le mode debug activé
6. Commit avec message descriptif : `feat(US-XX): Description`

---

**Dernière mise à jour** : 2 décembre 2025
**Version** : MVP + US3 + US6 + US7 (partiel)
**Auteur** : Équipe Habit Hisson 🦔

