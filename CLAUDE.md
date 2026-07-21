# EtiqTool — contexte projet pour Claude Code

Ce fichier donne à une nouvelle session tout le contexte nécessaire pour
travailler efficacement sur ce projet sans redécouvrir (ni recasser) des
décisions déjà prises. Lis-le en entier avant de modifier quoi que ce soit,
en particulier la section **Pièges déjà rencontrés**.

## Vue d'ensemble

EtiqTool est une application de bureau Windows (Electron) pour le support
informatique de **Wienerberger France**. Elle remplace un ancien processus
manuel sous Word pour imprimer des étiquettes d'inventaire (une par machine :
Nom, Modèle, Numéro de série, QR code) sur des planches A4 autocollantes
**Avery L6011** (27 étiquettes/feuille, 3 colonnes × 9 rangées).

Utilisateur principal : un technicien du support IT, non-développeur mais
capable de suivre des instructions techniques (compilation, PowerShell...).
Toute communication utilisateur est en **français**. Il teste les builds
lui-même sur un PC Windows réel (pas dans ce sandbox).

Dépôt : `ETHANJSCC/etiquettes`, branche de travail :
`claude/inventory-label-app-9tvs4s`.

## Pile technique

- Electron 43, contextIsolation + sandbox activés, nodeIntegration désactivé
- React 18 + TypeScript strict
- Vite 7 via electron-vite 5
- Material UI 6
- electron-builder 26 (packaging Windows : NSIS + portable)
- `docx` (génération de documents Word), chargé en import dynamique (code
  splitting) pour ne pas alourdir le démarrage
- Aucun routeur (react-router a été retiré) : navigation par état React simple
  entre les 2 pages (Éditeur / Paramètres), voir `AppLayout.tsx`

`npm audit` doit rester à **0 vulnérabilité**. Si une dépendance est mise à
jour, revérifier.

## Architecture

```
src/
├── main/          Processus principal Electron (Node)
│   ├── index.ts        Fenêtre, CSP, enregistrement des handlers IPC
│   ├── printing.ts      Impression / export PDF / ouverture dans Word
│   ├── settingsStore.ts Persistance JSON des réglages de planche
│   ├── sitesStore.ts    Persistance JSON des sites (fonctionnalité AD, voir plus bas)
│   └── ad.ts             Requête Active Directory via PowerShell (voir plus bas)
├── preload/        Pont contextBridge (aucune API Node exposée directement)
├── shared/         Types + logique pure partagés main/preload/renderer
│   ├── types.ts          Modèle de domaine + contrat IPC (SOURCE UNIQUE)
│   └── computerName.ts   Calcul pur du prochain nom de machine (testé isolément)
└── renderer/src/
    ├── components/   Composants réutilisables (LabelCard, LabelSheet, LabelForm,
    │                 PrintActions, SitesManager, SuggestNameDialog, ConfirmDialog...)
    ├── pages/        EditorPage (planche + saisie), SettingsPage (calibrage,
    │                 apparence, sites)
    ├── hooks/        useLabels (état + sélection), useSettings, useSites,
    │                 useThemeMode, useAppContext (contexte global React)
    ├── services/     Appels vers window.etiquettes (impression, export, sites, AD)
    ├── utils/        constants.ts (géométrie Avery), layout.ts, labelTemplate.ts,
    │                 sheetHtml.ts, wordDocument.ts, qrImage.ts, deviceTypes.ts
    └── types/        Réexport des types partagés + types UI (LabelBox, Selection)
```

**Principe central : un seul gabarit d'étiquette.** `utils/labelTemplate.ts`
(`renderLabelInner` + `LABEL_CSS`) est la SEULE définition du rendu d'une
étiquette. Il est utilisé à la fois par l'aperçu React (`LabelCard`) et par le
HTML généré pour l'impression/PDF (`sheetHtml.ts`). Ne jamais dupliquer ce
balisage ailleurs : écran et impression doivent rester strictement identiques.

## Concepts métier à connaître absolument

- **Géométrie de la planche** (`utils/constants.ts`) : marges 15,3mm (haut/bas)
  et 7,25mm (gauche/droite), pas 66mm horizontal / 29,6mm vertical, étiquette
  63,5×29,6mm. Ce sont les valeurs **officielles Avery L6011**, confirmées par
  un vrai test d'impression papier chez l'utilisateur (marges validées
  "parfaites"). Un premier jeu de valeurs, déduit approximativement d'un
  tableau Word, s'est révélé légèrement faux — **ne jamais revenir à un calcul
  approximatif**, ces constantes sont la référence.
- **`SETTINGS_VERSION`** : incrémentée quand les valeurs par défaut changent
  significativement, pour que d'anciens réglages persistés (potentiellement
  une ancienne calibration fausse) soient ignorés au profit des nouveaux
  défauts. Si tu changes `DEFAULT_SETTINGS` de façon significative,
  incrémente cette constante.
- **QR code fixe, pas dynamique.** Le QR (logo « W » Wienerberger) est une
  image PNG embarquée en base64 (`utils/qrImage.ts`), **identique sur toutes
  les étiquettes**, quel que soit leur contenu. Une version antérieure
  générait un QR différent par étiquette (encodant Nom/Modèle/S/N) — c'était
  une erreur, corrigée explicitement à la demande de l'utilisateur. Ne pas
  réintroduire de génération dynamique de QR.
- **Polices** : barres noires (haut/bas) en **Calibri**, champs
  Nom/Modèle/S/N en **Arial** (tailles 11pt/8pt/9pt). Appliquées
  explicitement partout (HTML ET document Word) — sans ça, Word retombe sur
  Times New Roman par défaut.
- **Sélection des étiquettes** : clic simple = sélectionne **uniquement**
  cette étiquette (édition isolée) ; **Ctrl+clic** = ajoute/retire de la
  sélection (pour appliquer le même contenu à plusieurs). C'est un correctif
  volontaire : avant, chaque clic ajoutait à la sélection, donc modifier une
  2ᵉ étiquette modifiait aussi la 1ʳᵉ. Ne pas régresser sur ce comportement.
- **Impression** : l'action principale est **« Imprimer via Word »**
  (génère un `.docx` et l'ouvre dans Word via `shell.openPath`, l'utilisateur
  fait Ctrl+P lui-même) — demandé explicitement pour garder les habitudes
  d'impression Word de l'équipe, et parce que Word n'applique aucune mise à
  l'échelle (contrairement aux lecteurs PDF qui réduisent souvent à ~96%,
  d'où l'avertissement affiché avant un export PDF). Une « impression rapide »
  via Electron existe aussi en option secondaire (échelle forcée à 100%).
- **Impression sur feuille entamée** : seules les étiquettes renseignées sont
  générées (HTML, PDF ou Word) ; les positions vides ne sont jamais rendues,
  donc restent blanches à l'impression.

## Pièges déjà rencontrés (ne pas recréer ces bugs)

1. **winCodeSign / droits admin.** electron-builder téléchargeait un outil de
   signature (`winCodeSign`) contenant des liens symboliques macOS, dont
   l'extraction échouait sous Windows sans droits admin (`EPERM`). Corrigé
   par `signExecutable: false` dans `electron-builder.yml` (nécessite
   electron-builder v26+, qui utilise `resedit` en JS pur pour l'icône/les
   métadonnées à la place). **Ne jamais réactiver la signature de code** sans
   être conscient que ça réintroduit ce téléchargement.
2. **Cache `winpackager`/NSIS corrompu.** Une erreur `EPERM: rename` sur
   `%LOCALAPPDATA%\electron-builder\Cache` peut survenir (build interrompu,
   antivirus). Le script `fix-build-cache.bat` vide ce cache.
3. **`.exe` portable qui plante / erreur `ffmpeg.dll introuvable`.** Le format
   portable réextrait l'app dans un dossier temporaire à chaque lancement. Un
   `unpackDirName` **fixe** faisait qu'un double-clic pendant une extraction
   lente (ou une extraction interrompue) laissait un dossier à moitié extrait,
   réutilisé (et donc cassé) à tous les lancements suivants. **Corrigé en
   retirant `unpackDirName`** de `electron-builder.yml` (laisser
   electron-builder générer un dossier par build/version).
4. **L'installeur faisait planter `explorer.exe`.** Cause trouvée : l'icône
   (`build/icon.ico`) stockait toutes les tailles (16 à 256px) en **PNG
   compressé**, un format non garanti pour les tailles < 256px et connu pour
   faire planter certains chemins de rendu d'icône de l'Explorateur. Corrigée
   en régénérant l'icône au format **BMP/DIB classique** (BITMAPINFOHEADER +
   masque XOR 32 bits + masque AND) pour toutes les tailles — le format
   d'icône Windows le plus ancien et le plus universellement supporté.
   Rendu visuel vérifié identique par décodage indépendant des pixels.
   **Ne jamais régénérer l'icône avec des entrées PNG pour des tailles autres
   que 256px.**
5. **Renommage app → changement d'`appId`.** L'app s'appelait
   « Etiquettes Inventaire » (`fr.wienerberger.etiquettes`), renommée en
   **EtiqTool** (`fr.wienerberger.etiqtool`). Un nouvel installeur EtiqTool ne
   remplace PAS une ancienne install « Etiquettes Inventaire » (appId
   différent = app différente aux yeux de Windows) : il faut la désinstaller
   manuellement une fois. En revanche, toutes les futures versions d'EtiqTool
   partagent le même appId, donc un nouvel installeur **remplace
   automatiquement** l'ancien (NSIS détecte l'installation existante via le
   registre et la remplace), sans double installation.
6. **Aucun tiret allongé (— ni –).** Demande explicite de l'utilisateur :
   uniquement des tirets simples (`-`), partout — code, UI, README, commits.
7. **Pas de « trace IA » visible dans le code.** Commentaires volontairement
   sobres, style développeur normal (pas de blocs explicatifs verbeux). Les
   messages de commit Git portent toujours un footer `Co-Authored-By: Claude`
   ajouté automatiquement par le harness — c'est indépendant du code et hors
   de mon contrôle direct ; si l'utilisateur veut un historique Git sans
   cette mention, la solution proposée est un squash-merge sur GitHub où il
   écrit lui-même le message final.

## Déploiement (choix assumés, ne pas reproposer sans qu'on demande)

- Distribution **manuelle** via un partage réseau (pas de SCCM/Intune, pas
  d'auto-updater) — choix explicite de l'utilisateur, pas une contrainte
  technique. Ne pas implémenter d'auto-update sans qu'il le redemande.
- Deux formats générés par `npm run dist` : **installeur NSIS** (recommandé,
  un clic, `perMachine: false` → aucun droit admin) et **portable** (usage
  secondaire, plus fragile par nature, voir piège n°3 ci-dessus).
- La version de l'app s'affiche en bas de la page Paramètres
  (`useAppVersion` + `app.getVersion()`), pour que le support puisse vérifier
  qui a quelle version pendant un déploiement manuel par équipe.

## Fonctionnalité en cours : suggestion de nom de machine via l'Active Directory

**Statut : implémentée et buildée avec succès, mais JAMAIS testée contre un
vrai domaine Windows** (ce sandbox n'a ni Windows ni AD). À vérifier en
priorité sur un poste réel avant de considérer la fonctionnalité fiable.
Au moment de la rédaction de ce fichier, ces changements sont **présents dans
l'arbre de travail mais pas encore commités** (vérifier `git status`).

Contexte métier : le support nomme les machines selon la convention
`PREFIXE_SITE + TYPE + NUMÉRO` (ex : `COHLT101` = Colomiers, Laptop, n°101).
Le prochain numéro libre = le plus grand numéro existant + 1 (pas le premier
trou disponible), sur 3 chiffres. Environ 15 sites, 2 types d'appareils fixes
(`LT` laptop, `PC` bureau — non configurables, en dur dans
`utils/deviceTypes.ts`).

Architecture ajoutée :
- `shared/computerName.ts` : `computeNextComputerName(prefix, existingNames)`,
  logique pure, testée manuellement (voir historique de session) mais sans
  suite de tests formelle dans le repo.
- `main/ad.ts` : interroge l'AD en shellant `powershell.exe` avec un script
  utilisant `[adsisearcher]` (ADSI, natif Windows, **aucune dépendance npm
  LDAP**). S'exécute avec l'identité Windows du technicien connecté
  (authentification Kerberos intégrée) — **aucun identifiant stocké ni géré
  par l'app**. Le préfixe est validé (`^[A-Z0-9]{1,10}$`) côté Node avant
  toute exécution, puis transmis via variable d'environnement (jamais
  interpolé dans le texte du script) : double protection contre l'injection.
- `main/sitesStore.ts` : persistance JSON séparée (`etiqtool-sites.json`)
  pour la liste des sites (nom + préfixe), gérée depuis Paramètres.
- UI : bouton « suggérer » (icône loupe) sur le champ Nom dans `LabelForm`,
  ouvre `SuggestNameDialog` (choix site + type, appel AD, application du nom
  suggéré à la sélection courante). Gestion des sites dans
  `SettingsPage` via `SitesManager` (ajout/suppression, validation du
  préfixe).

Si tu continues ce travail : commit/push si demandé, et surtout fais valider
par l'utilisateur un vrai test AD (réseau d'entreprise, poste joint au
domaine) avant de considérer que ça fonctionne en conditions réelles.

## Commandes

```bash
npm install                # dépendances (voir note sandbox ci-dessous)
npm run dev                # mode développement (electron-vite)
npm run typecheck          # tsc strict, main + renderer
npm run build              # typecheck + bundling production
npm run dist                # build:win — génère installeur NSIS + portable dans release/
```

Scripts Windows à double-clic (pour l'utilisateur non-développeur) :
- `build-windows.bat` : installe les dépendances puis lance `npm run dist`.
- `fix-build-cache.bat` : vide le cache electron-builder en cas d'erreur
  `EPERM`/`rename` au build.

## Contraintes de cet environnement sandbox (si tu développes ici)

- Pas de vraie machine Windows, pas de vrai AD/domaine : impossible de tester
  `main/ad.ts` en conditions réelles, ni de lancer réellement l'exécutable
  Electron packagé.
- Le téléchargement du binaire Electron est bloqué par la politique réseau du
  sandbox → utiliser `ELECTRON_SKIP_BINARY_DOWNLOAD=1 npm install` (suffisant
  pour build/typecheck, pas pour lancer l'app en GUI).
- Chromium (Playwright) est préinstallé : utile pour rendre visuellement le
  HTML généré (planche, aperçu React) via un petit serveur HTTP local +
  script Playwright, en mockant `window.etiquettes` dans `addInitScript`.
  C'est la méthode utilisée pour vérifier visuellement l'UI sans Electron.
- LibreOffice est présent mais cassé dans ce sandbox (échoue même sur un
  `.docx` valide connu) — ne pas chercher à corriger ça côté projet, ce n'est
  pas un bug de l'app.
- Pas de PIL/ImageMagick : la vérification de l'icône `.ico` a été faite via
  un script Python de décodage manuel du format ICO/BMP.

## Conventions de code

- TypeScript strict partout, alias `@shared` (main/preload/renderer) et
  `@renderer` (renderer uniquement).
- `src/shared/types.ts` est la source unique de vérité pour le modèle de
  domaine ET le contrat IPC (noms de canaux centralisés dans `IpcChannels`).
- Commentaires en français, uniquement pour le POURQUOI non-évident (jamais
  pour décrire ce que le code fait déjà de façon lisible).
- Pas de tirets allongés, jamais.
- Ne pas ajouter d'abstraction ni de configurabilité non demandée (ex : les
  types d'appareil LT/PC sont volontairement en dur, pas une liste
  éditable — l'utilisateur a été explicitement interrogé là-dessus).
