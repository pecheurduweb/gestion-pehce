# Journal de concours de pêche

Application monopage (SPA) construite avec React et Vite pour encoder et analyser vos concours de pêche personnels avec Cloud Firestore.

## Fonctionnalités principales

- Formulaire complet d'encodage d'un concours avec météo simulée, lignes dynamiques et stratégie d'amorçage.
- Tableau de bord avec filtres par lieu et type de prise, pagination et statistiques (poids moyen, lieu favori, taux de victoires de secteur).
- Vue détaillée en modal pour consulter toutes les informations d'un concours.
- Interface sombre moderne avec icônes thématiques.

## Prérequis

- [Node.js](https://nodejs.org/) 18 ou supérieur.
- Un projet Firebase configuré avec Cloud Firestore.

## Installation

```bash
npm install
```

### Configuration Firebase

1. Copiez `.env.example` vers `.env.local`.
2. Renseignez vos paramètres Firebase :

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

## Développement

```bash
npm run dev
```

L'application est disponible sur `http://localhost:5173`.

## Build de production

```bash
npm run build
```

Vous pouvez prévisualiser le build avec :

```bash
npm run preview
```

## Déploiement sur Firebase Hosting

1. Configurez Firebase Hosting (`firebase init hosting`) dans ce dossier.
2. Construisez le projet : `npm run build`.
3. Déployez : `firebase deploy`.

## Structure du projet

```
├── src
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   ├── firebase.ts
│   ├── types.ts
│   ├── services
│   │   └── weatherService.ts
│   └── components
│       ├── ContestForm.tsx
│       ├── ContestDashboard.tsx
│       └── ContestDetailModal.tsx
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Licence

Projet destiné à un usage personnel.
