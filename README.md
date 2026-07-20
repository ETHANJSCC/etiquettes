# Étiquettes Inventaire — Wienerberger France

Application de bureau (Windows) destinée au support informatique pour imprimer
des **étiquettes d'inventaire** sur des planches A4 autocollantes, sans plus
jamais ouvrir Word.

L'utilisateur voit une représentation graphique fidèle de la feuille A4,
sélectionne les emplacements à imprimer (y compris sur une feuille déjà
entamée), saisit les informations, puis imprime ou exporte en PDF. Les
positions non renseignées restent totalement vides.

---

## Sommaire

- [Analyse du modèle Word](#analyse-du-modèle-word)
- [Fonctionnalités](#fonctionnalités)
- [Pile technique](#pile-technique)
- [Architecture du projet](#architecture-du-projet)
- [Démarrage](#démarrage)
- [Compilation Windows](#compilation-windows)
- [Notes de conception](#notes-de-conception)

---

## Analyse du modèle Word

La mise en page reproduit la planche **Avery L6011 / LP27/63** (référence
officielle des feuilles utilisées), pour un alignement au plus juste.

| Élément                     | Valeur exacte (Avery L6011) |
| --------------------------- | --------------------------- |
| Format de page              | 210 × 297 mm (A4)           |
| Grille                      | 3 colonnes × 9 rangées — **27 étiquettes / feuille** |
| Étiquette                   | 63,5 × 29,6 mm              |
| Espacement horizontal       | 2,5 mm (pas de 66,0 mm)     |
| Espacement vertical         | 0 mm (rangées jointives, pas de 29,6 mm) |
| Marges haute / basse        | 15,3 mm                     |
| Marges gauche / droite      | 7,25 mm                     |

> Contrôle : 7,25 + 3×63,5 + 2×2,5 + 7,25 = 210 mm ; 15,3 + 9×29,6 + 15,3 = 297 mm.

**Mise en page d'une étiquette** (identique au modèle Word) :

- barre noire supérieure : « wienerberger France » (blanc, gras, centré) ;
- corps : QR code fixe (logo « W » Wienerberger, identique sur toutes les
  étiquettes) à gauche, puis trois lignes `Nom :`, `Modèle :`, `S/N :` à droite ;
- barre noire inférieure : « Helpdesk - Scannez moi ».

Ces valeurs constituent les paramètres par défaut ; elles restent recalibrables
depuis la page **Paramètres**.

---

## Fonctionnalités

- **Aperçu A4 fidèle** : chaque étiquette est un rectangle positionné au
  millimètre, aux proportions exactes du modèle.
- **Sélection multiple** : clic pour sélectionner / désélectionner une ou
  plusieurs étiquettes, mises en évidence visuellement.
- **Saisie appliquée en direct** : les champs Nom, Modèle et Numéro de série
  sont appliqués simultanément à toutes les étiquettes sélectionnées.
- **QR code fixe de l'entreprise** (logo « W » Wienerberger, renvoi vers le
  Helpdesk) : strictement identique sur toutes les étiquettes.
- **Police fidèle au modèle Word** : Calibri, 11 pt (barres), 8 pt (libellés),
  9 pt (valeurs).
- **Impression précise** : seules les étiquettes renseignées sont imprimées ;
  toutes les autres positions restent blanches (impression sur feuille entamée).
- **« Imprimer via Word »** (action principale) : ouvre la planche directement
  dans Word, pour conserver le flux d'impression habituel (Ctrl+P, choix du
  support et de l'imprimante).
- **Export PDF ou Word**, plus une **impression rapide** (sans Word) en option.
- **Paramètres** : recalibrage des marges, espacements et dimensions, avec
  aperçu en direct. Les réglages sont persistés sur le disque.
- **Boutons pratiques** : « Sélectionner la prochaine étiquette » (prochaine
  position libre), « Tout sélectionner », « Tout désélectionner »,
  « Réinitialiser la planche ».

---

## Pile technique

- [Electron 43](https://www.electronjs.org/) — application de bureau (runtime à jour, sans CVE connue)
- [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) (mode **strict**)
- [Vite 7](https://vitejs.dev/) via [electron-vite 5](https://electron-vite.org/)
- [Material UI](https://mui.com/) — interface sobre et professionnelle
- [electron-builder 26](https://www.electron.build/) — packaging Windows (NSIS + portable)
- [docx](https://www.npmjs.com/package/docx) — génération des documents Word

Aucun accès réseau n'est requis à l'exécution : tout est embarqué (QR compris).

---

## Architecture du projet

```
src/
├── main/                  Processus principal Electron
│   ├── index.ts             Fenêtre + enregistrement des canaux IPC
│   ├── printing.ts          Impression, export PDF (printToPDF) et sauvegarde Word
│   └── settingsStore.ts     Persistance des paramètres (JSON userData)
├── preload/               Pont sécurisé (contextBridge)
│   ├── index.ts             Expose window.etiquettes
│   └── index.d.ts           Typage global de l'API
├── shared/                Code partagé main ⇄ preload ⇄ renderer
│   └── types.ts             Modèle de domaine + contrat IPC (source unique)
└── renderer/              Application React
    └── src/
        ├── components/      Composants réutilisables
        │   ├── LabelCard.tsx        Étiquette cliquable de l'aperçu
        │   ├── LabelSheet.tsx       Planche A4 mise à l'échelle
        │   ├── LabelForm.tsx        Formulaire de saisie
        │   ├── SelectionToolbar.tsx Actions de sélection
        │   ├── PrintActions.tsx     Boutons Imprimer / Exporter (PDF ou Word)
        │   ├── NumberField.tsx      Champ numérique (mm)
        │   ├── ConfirmDialog.tsx    Dialogue de confirmation
        │   └── AppLayout.tsx        Ossature + navigation
        ├── pages/           Pages
        │   ├── EditorPage.tsx       Éditeur principal
        │   └── SettingsPage.tsx     Paramètres / recalibrage
        ├── hooks/           Hooks personnalisés
        │   ├── useLabels.ts         État des étiquettes + sélection
        │   ├── useSettings.ts       Chargement / persistance des réglages
        │   ├── useElementSize.ts    Mesure d'élément (mise à l'échelle)
        │   └── useAppContext.ts     Contexte applicatif (état partagé)
        ├── services/        Accès aux fonctions du processus principal
        │   ├── printService.ts      Construction HTML/Word + impression / export
        │   └── settingsService.ts   Normalisation, versionnage + persistance
        ├── types/           Types du renderer (réexporte le domaine)
        ├── utils/           Fonctions pures
        │   ├── constants.ts         Valeurs par défaut (Avery L6011)
        │   ├── layout.ts            Calcul des positions (mm)
        │   ├── qrImage.ts           QR fixe de l'entreprise (image embarquée)
        │   ├── labelTemplate.ts     Gabarit UNIQUE d'une étiquette (aperçu + impression)
        │   ├── sheetHtml.ts         Construction du HTML A4 imprimable
        │   └── wordDocument.ts      Génération du document Word (.docx)
        ├── App.tsx          Composant racine (thème, contexte, état global)
        ├── theme.ts         Thème Material UI
        └── main.tsx         Point d'entrée du renderer
```

### Principe anti-duplication

Le rendu d'une étiquette est défini **une seule fois** dans
`utils/labelTemplate.ts` (`renderLabelInner` + `LABEL_CSS`) et réutilisé à la
fois par l'aperçu React (`LabelCard`) et par le HTML d'impression
(`sheetHtml.ts`). L'écran et l'impression sont donc strictement identiques.

---

## Démarrage

Prérequis : Node.js 18+ (développé avec Node 22).

```bash
npm install      # installe les dépendances
npm run dev      # lance l'application en mode développement
```

Autres scripts utiles :

```bash
npm run typecheck   # vérification TypeScript stricte (main + renderer)
npm run build       # typecheck + bundling de production
```

---

## Compilation Windows

Depuis une machine **Windows** (ou en double-cliquant sur `build-windows.bat`) :

```bash
npm install
npm run dist        # installeur NSIS + version portable, en une commande
```

Le dossier `release/` contient alors **les deux formats de distribution** :

- **`Etiquettes Inventaire-1.0.0-Installeur.exe`** — installeur **en un clic**
  (moins de 30 s), **sans droits administrateur** (installation par
  utilisateur), avec raccourcis Bureau et menu Démarrer. **Format recommandé.**
- **`Etiquettes Inventaire-1.0.0-Portable.exe`** — à lancer **sans installation**
  (clé USB, partage réseau…).

Une fois généré, chaque `.exe` est **autonome** : l'utilisateur final n'installe
**rien** (ni Node.js, ni dépendances). Les paramètres de calibrage sont conservés
dans `%APPDATA%\Etiquettes Inventaire\`.

> **Build sans administrateur ni erreur.** La signature de code est désactivée
> (`signExecutable: false`) : electron-builder ne télécharge plus l'outil
> `winCodeSign`, ce qui supprime l'erreur de liens symboliques qui obligeait
> auparavant à lancer le build en administrateur. L'icône et les métadonnées de
> l'exécutable restent appliquées (via `resedit`, en JavaScript pur).

> La première compilation télécharge le binaire Electron depuis Internet ; une
> connexion est donc nécessaire à ce stade uniquement.

---

## Notes de conception

- **Précision d'impression** : la géométrie par défaut correspond à la
  spécification officielle Avery L6011. Le HTML de la planche est dimensionné en
  millimètres avec `@page { size: 210mm 297mm; margin: 0 }`, et l'impression est
  forcée à l'échelle 100 %. L'impression et l'export PDF passent par une fenêtre
  masquée dédiée dans le processus principal (`webContents.printToPDF` /
  `webContents.print`), pour une sortie A4 au millimètre.
- **Impression sur feuille entamée** : seules les étiquettes renseignées sont
  générées ; les autres positions restent parfaitement blanches (aussi bien en
  PDF qu'en Word).
- **QR fixe** : le QR de l'entreprise est embarqué en image (base64) et réutilisé
  à l'identique sur chaque étiquette — il ne dépend pas du contenu saisi.
- **Sécurité** (configuration durcie, distribuable en entreprise) :
  - `contextIsolation` **activé**, bac à sable (`sandbox`) **activé**,
    `nodeIntegration` **désactivé** ;
  - **Content-Security-Policy** stricte en production, aucune ressource distante ;
  - navigation hors application bloquée, liens externes ouverts dans le navigateur ;
  - seule surface exposée au renderer : l'API typée `window.etiquettes`
    (impression, PDF, Word, paramètres) — aucune API Node accessible directement.
- **Performances** (pour rester léger sur des postes modestes) :
  - accélération GPU et calcul d'occlusion Windows désactivés (l'interface est
    statique : le rendu logiciel suffit et évite une surcharge CPU/GPU) ;
  - la librairie Word (`docx`) est chargée **à la demande** (import dynamique) :
    le démarrage ne charge que ~470 Ko de JavaScript (le reste, ~370 Ko, n'est
    lu que lors d'un export Word) ;
  - correcteur orthographique désactivé (inutile pour des références d'inventaire) ;
  - application sans boucle ni minuterie : consommation nulle au repos ;
  - build de production optimisé (minification, tree-shaking, code-splitting).
- **Zéro vulnérabilité** connue (`npm audit`) : dépendances à jour, aucune
  dépendance inutilisée.

### Impression au plus juste

Un décalage de quelques millimètres provient presque toujours d'une **mise à
l'échelle à l'impression**. Pour un alignement parfait :

1. Privilégiez **« Imprimer via Word »** : la planche s'ouvre dans Word et
   s'imprime à sa taille exacte, sans mise à l'échelle (flux habituel Ctrl+P).
2. L'**impression rapide** (sans Word) force déjà l'échelle à 100 %.
3. Si vous imprimez un **PDF** depuis un lecteur (Adobe, Edge…), choisissez
   **« Taille réelle »** / **100 %** (jamais « Ajuster » ou « Réduire »).
4. S'il reste un léger décalage propre à une imprimante, ajustez les marges dans
   **Paramètres** (les valeurs sont conservées entre deux sessions).
```
