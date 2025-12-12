Le repo est géré avec Turborepo, ce qui permet un développement rapide à travers plusieurs packages.

## Pour commencer

### A. Pour lancer le projet sans avoir besoin d'installer localement `pnpm`, vous pouvez exécuter `pnpm` via `npx` 

npx -y pnpm@10 install
npx -y pnpm@10 dev

Ces commandes fonctionnent comme si `pnpm` était installé.

### B. Si vous préférez installer `pnpm` localement/globalement

- Installer globalement :

npm install -g pnpm
pnpm install
pnpm dev

# Informations de base sur la structure

## Packages

### `web`

Le package `web` est une application Next.js utilisant Tailwind CSS v4 et Shadcn. Il inclut une page d’exemple avec un bouton provenant du package `ui`.

### `db`

Le package `db` inclut Prisma pour les opérations de base de données. Il contient un schéma d’exemple ainsi qu’une commande `prisma` pour générer le client de base de données.

### `ui`

Le package `ui` contient un ensemble de composants React réutilisables construits avec Tailwind CSS v4. Il inclut un composant bouton d’exemple.

### `types`

Le package `types` contient les types TypeScript pour tout le monorepo. Il inclut des types pour les packages `web`, `db` et `ui`.

## Développement

Le repo est géré avec Turborepo, permettant un développement rapide et efficace à travers l’ensemble des packages.  
La commande `pnpm run dev` démarre le serveur de développement pour tous les packages.

Pour ajouter un nouveau composant Shadcn, vous pouvez exécuter la commande suivante :

```bash
pnpm dlx shadcn add <component-name> -c packages/ui
