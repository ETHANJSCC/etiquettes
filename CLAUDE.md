# EtiqTool - contexte projet pour Claude Code

Ce fichier donne à une nouvelle session tout le contexte nécessaire pour
travailler efficacement sur ce projet sans redécouvrir (ni recasser) des
décisions déjà prises. Lis-le en entier avant de modifier quoi que ce soit.

## ⚠️ Objectif actuel : migration desktop → site web interne

**Le projet est en cours de migration.** La version actuelle est une
application de bureau Electron (Windows). L'objectif demandé est de la
transformer en **site web interne**, hébergé sur un serveur de l'entreprise
(intranet), utilisé depuis un navigateur par toute l'équipe support IT.

Lis la section **« Migration : ce qui change vraiment »** avant de commencer
à coder - plusieurs mécanismes actuels reposent sur des capacités Electron
(accès au système de fichiers, lancement de Word, identité Windows de
l'utilisateur) qui n'existent pas dans un navigateur et doivent être
repensés, pas simplement copiés.

## Vue d'ensemble (contexte métier, inchangé par la migration)

EtiqTool est un outil pour le support informatique de **Wienerberger
France**. Il remplace un ancien processus manuel sous Word pour imprimer des
étiquettes d'inventaire (une par machine : Nom, Modèle, Numéro de série, QR
code) sur des planches A4 autocollantes **Avery L6011** (27 étiquettes/feuille,
3 colonnes × 9 rangées).

Utilisateur principal : un technicien du support IT, non-développeur mais
capable de suivre des instructions techniques. Toute communication est en
**français**. Dépôt : `ETHANJSCC/etiquettes`, branche de travail :
`claude/inventory-label-app-9tvs4s`.

## Migration : ce qui change vraiment

### Ce qui doit rester identique (logique métier, à réutiliser telle quelle)
- La géométrie exacte de la planche (`utils/constants.ts`) - validée par un
  vrai test d'impression papier, ne pas recalculer.
- Le principe du **gabarit d'étiquette unique** (`utils/labelTemplate.ts`) :
  une seule définition du rendu HTML/CSS d'une étiquette, réutilisée pour
  l'aperçu ET l'impression/export. Ce principe est encore plus important côté
  web : le HTML généré doit rester strictement identique à ce que le
  navigateur affiche et imprime.
- QR fixe (pas dynamique), polices Calibri (barres) / Arial (champs),
  comportement de sélection (clic simple = isolé, Ctrl+clic = multi),
  génération du document Word (`utils/wordDocument.ts`, librairie `docx` -
  celle-ci tourne très bien côté navigateur ou côté serveur, aucun changement
  requis).
- Aucun tiret allongé (- ni -), commentaires sobres sans « style IA ».

### Ce qui casse et doit être repensé (pas juste copié)

1. **« Imprimer via Word » (ouverture automatique dans Word).** Actuellement :
   le processus principal Electron écrit un fichier `.docx` temporaire et
   l'ouvre avec `shell.openPath` (l'app Word associée s'ouvre directement,
   prête pour Ctrl+P). **Un navigateur ne peut pas lancer une application
   locale.** L'équivalent web : télécharger le `.docx` (comme c'est déjà fait
   pour « Enregistrer en Word »), puis l'utilisateur l'ouvre lui-même. C'est
   une régression d'UX assumée à documenter clairement pour l'utilisateur,
   pas un problème à contourner par un hack fragile.

2. **Impression à l'échelle 100% forcée.** Electron pilotait
   `webContents.print`/`printToPDF` avec une échelle forcée. Dans un
   navigateur, c'est `window.print()` (CSS `@page` + `@media print`), et
   l'échelle dépend des réglages d'impression du navigateur/pilote -
   impossible à forcer à 100% depuis la page. Il faudra probablement garder
   l'avertissement (déjà existant pour l'export PDF) mais l'étendre à
   l'impression directe navigateur, et insister sur « Taille réelle / 100% »
   dans les instructions utilisateur.

3. **Export PDF.** Actuellement généré côté Electron via
   `webContents.printToPDF` (rendu Chromium natif, fidèle au pixel). Côté
   web : soit `window.print()` vers "Enregistrer en PDF" (dépend du
   navigateur), soit une génération PDF côté serveur (ex : Puppeteer/Playwright
   headless sur le serveur, qui recharge le même HTML de planche et
   l'imprime en PDF - reproduirait fidèlement le comportement actuel). À
   trancher selon si un serveur applicatif existe (voir plus bas).

4. **Persistance des réglages et des sites.** Actuellement : fichiers JSON
   dans `%APPDATA%` (par poste, via le processus principal Electron).
   Question ouverte pour un site web interne : réglages **partagés entre
   tous les utilisateurs** (stockés côté serveur, une seule source de vérité
   pour toute l'équipe) ou **par utilisateur/navigateur** (localStorage) ?
   Un outil de calibrage d'impression partagé par toute l'équipe suggère
   plutôt un stockage serveur - mais c'est une décision produit à valider
   avec l'utilisateur, pas à deviner.

5. **Suggestion de nom de machine via l'Active Directory - le point le plus
   délicat de la migration.** Actuellement (`main/ad.ts`) : le processus
   Electron shelle `powershell.exe` avec `[adsisearcher]`, exécuté avec
   l'**identité Windows du technicien connecté** (authentification Kerberos
   intégrée, aucun identifiant stocké). **Ce mécanisme ne peut pas survivre
   tel quel dans un modèle web** : un serveur web n'a pas de notion
   d'« utilisateur Windows actuellement connecté » côté client - il tourne
   avec sa propre identité de service, potentiellement pour des dizaines
   d'utilisateurs simultanés.
   Options à explorer côté serveur (à discuter avec l'utilisateur avant
   d'implémenter, ne pas choisir seul) :
   - Le serveur applicatif est lui-même joint au domaine et exécute la
     requête AD (PowerShell ou LDAP direct) avec **son propre compte de
     service** - nécessite qu'un compte AD dédié en lecture seule soit créé
     et ses identifiants stockés de façon sécurisée côté serveur (variable
     d'environnement, coffre-fort de secrets - jamais en dur dans le code).
   - Authentification intégrée Windows sur l'intranet lui-même (SSO/Kerberos
     via IIS par exemple), avec délégation vers l'AD - plus complexe à
     mettre en place, dépend de l'infrastructure déjà en place côté IT.
   - Dans tous les cas, la validation du préfixe (`^[A-Z0-9]{1,10}$`) et la
     transmission par variable d'environnement (jamais interpolée dans le
     script) doivent être conservées : c'est indépendant du modèle
     d'authentification.
   Cette fonctionnalité n'a de toute façon **jamais été testée contre un vrai
   domaine Windows**, migration ou pas - à garder en tête.

6. **Tout ce qui est spécifique à Electron/Node** (accès fichiers local,
   `child_process`, `contextBridge`, l'ensemble de `src/main/` et
   `src/preload/`) n'a pas d'équivalent direct dans un navigateur. Il faudra
   un vrai backend serveur (Node/Express ou équivalent) pour tout ce qui
   nécessite une exécution côté serveur (AD, génération PDF fidèle,
   persistance partagée) - le renderer React peut probablement être réutilisé
   presque tel quel comme SPA, mais tout `src/main/` est à réécrire comme API
   serveur, pas à porter tel quel.

### Décisions à prendre AVEC l'utilisateur avant de coder (ne pas deviner)

- Stack serveur souhaitée (Node/Express, autre ?) et infrastructure
  d'hébergement disponible (IIS ? un serveur Linux interne ? Docker ?).
- Authentification des utilisateurs sur le site interne lui-même (SSO
  d'entreprise, ou accès libre puisque déjà derrière le pare-feu ?).
- Stratégie d'accès à l'AD côté serveur (compte de service dédié ?
  délégation Kerberos ?).
- Réglages/sites partagés pour toute l'équipe, ou par utilisateur ?
- Le fait d'accepter la perte de l'ouverture automatique dans Word
  (remplacée par un téléchargement + ouverture manuelle) est-il acceptable ?

## Pile technique (application desktop actuelle)

- Electron 43, contextIsolation + sandbox activés, nodeIntegration désactivé
- React 18 + TypeScript strict
- Vite 7 via electron-vite 5
- Material UI 6
- electron-builder 26 (packaging Windows : NSIS + portable)
- `docx` (génération de documents Word), chargé en import dynamique
- Aucun routeur : navigation par état React simple entre 2 pages

`npm audit` doit rester à **0 vulnérabilité**.

## Architecture actuelle

```
src/
├── main/          Processus principal Electron (Node) - À REPENSER EN BACKEND WEB
│   ├── index.ts        Fenêtre, CSP, enregistrement des handlers IPC
│   ├── printing.ts      Impression / export PDF / ouverture dans Word
│   ├── settingsStore.ts Persistance JSON des réglages de planche
│   ├── sitesStore.ts    Persistance JSON des sites (fonctionnalité AD)
│   └── ad.ts             Requête Active Directory via PowerShell
├── preload/        Pont contextBridge - N'EXISTE PLUS COTÉ WEB
├── shared/         Types + logique pure, réutilisables tels quels
│   ├── types.ts          Modèle de domaine + contrat IPC (à adapter en API HTTP)
│   └── computerName.ts   Calcul pur du prochain nom de machine (réutilisable)
└── renderer/src/   Application React - BASE DU FUTUR SITE WEB
    ├── components/   LabelCard, LabelSheet, LabelForm, PrintActions,
    │                 SitesManager, SuggestNameDialog, ConfirmDialog...
    ├── pages/        EditorPage, SettingsPage
    ├── hooks/        useLabels, useSettings, useSites, useThemeMode, useAppContext
    ├── services/     Appels vers window.etiquettes - À REMPLACER PAR DES APPELS HTTP
    ├── utils/        constants.ts (géométrie Avery), layout.ts, labelTemplate.ts,
    │                 sheetHtml.ts, wordDocument.ts, qrImage.ts, deviceTypes.ts
    └── types/        Réexport des types partagés + types UI
```

**Principe central, valable quelle que soit la plateforme : un seul gabarit
d'étiquette.** `utils/labelTemplate.ts` (`renderLabelInner` + `LABEL_CSS`) est
la SEULE définition du rendu d'une étiquette, utilisée pour l'aperçu ET
l'impression. Ne jamais dupliquer ce balisage.

## Concepts métier à connaître absolument

- **Géométrie de la planche** (`utils/constants.ts`) : marges 15,3mm
  (haut/bas) et 7,25mm (gauche/droite), pas 66mm horizontal / 29,6mm
  vertical, étiquette 63,5×29,6mm. Valeurs **officielles Avery L6011**,
  confirmées par un vrai test d'impression papier. Ne jamais recalculer
  approximativement.
- **QR code fixe, pas dynamique** (`utils/qrImage.ts`) : identique sur toutes
  les étiquettes. Une version antérieure générait un QR différent par
  étiquette - c'était une erreur corrigée explicitement. Ne pas réintroduire.
- **Polices** : barres noires en **Calibri**, champs Nom/Modèle/S/N en
  **Arial** (11pt/8pt/9pt). Appliquées explicitement partout (HTML et Word).
- **Sélection** : clic simple = sélectionne uniquement cette étiquette ;
  Ctrl+clic = ajoute/retire de la sélection. Correctif volontaire, ne pas
  régresser.
- **Impression sur feuille entamée** : seules les étiquettes renseignées sont
  générées ; les positions vides restent blanches.

## Pièges déjà rencontrés côté packaging Electron (historique, obsolète si migration 100% web, mais utile si un jour on revient au desktop)

1. **winCodeSign / droits admin** → corrigé par `signExecutable: false`
   (electron-builder v26).
2. **Cache NSIS corrompu** (`EPERM`/`rename`) → `fix-build-cache.bat` vide
   `%LOCALAPPDATA%\electron-builder\Cache`.
3. **`.exe` portable qui plante** (`ffmpeg.dll introuvable`) → causé par un
   `unpackDirName` fixe réutilisant un dossier d'extraction parfois corrompu.
   Corrigé en le retirant de `electron-builder.yml`.
4. **L'installeur faisait planter `explorer.exe`** → l'icône `.ico` stockait
   les petites tailles en PNG compressé (format non garanti < 256px).
   Corrigée en régénérant au format BMP/DIB classique pour toutes les tailles.
5. **Renommage app → changement d'`appId`** (« Etiquettes Inventaire » →
   **EtiqTool**) : les anciennes installations ne sont pas remplacées
   automatiquement (appId différent), à désinstaller manuellement une fois.
6. **Aucun tiret allongé** (- ni -) : uniquement des tirets simples, partout.
7. **Pas de « trace IA » visible dans le code** : commentaires sobres, style
   développeur normal. Les commits Git portent un footer `Co-Authored-By:
   Claude` ajouté automatiquement par le harness (indépendant du code).

## Déploiement actuel (application desktop, avant migration)

- Distribution manuelle via un partage réseau (pas de SCCM/Intune, pas
  d'auto-updater) - choix explicite de l'utilisateur.
- Deux formats : installeur NSIS (recommandé, `perMachine: false`, sans
  droits admin) et portable.
- Version affichée en bas de la page Paramètres pour suivre les déploiements.

## Commandes (application desktop actuelle)

```bash
npm install                # ELECTRON_SKIP_BINARY_DOWNLOAD=1 npm install en sandbox sans accès Windows
npm run dev                # mode développement (electron-vite)
npm run typecheck          # tsc strict, main + renderer
npm run build              # typecheck + bundling production
npm run dist                # génère installeur NSIS + portable dans release/
```

Scripts Windows à double-clic : `build-windows.bat` (install + build),
`fix-build-cache.bat` (vide le cache electron-builder en cas d'erreur).

## Conventions de code (valables quelle que soit la plateforme)

- TypeScript strict partout.
- Commentaires en français, uniquement pour le POURQUOI non-évident.
- Pas de tirets allongés, jamais.
- Ne pas ajouter d'abstraction ni de configurabilité non demandée.
- Ne pas deviner les décisions d'architecture serveur/auth/stockage listées
  plus haut - les poser explicitement à l'utilisateur avant de coder.
