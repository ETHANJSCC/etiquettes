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

La disposition a été extraite automatiquement du modèle `ETIQUETTES.docx`
fourni (conversion : 1 pouce = 1440 twips = 25,4 mm) et reproduite fidèlement.

| Élément                     | Valeur relevée         | En millimètres |
| --------------------------- | ---------------------- | -------------- |
| Format de page              | 11905 × 16837 twips    | 210 × 297 (A4) |
| Grille                      | 3 colonnes × 9 rangées | **27 étiquettes / feuille** |
| Largeur d'une étiquette     | 3600 twips             | 63,50 mm       |
| Hauteur d'une étiquette     | 1679 twips             | 29,62 mm       |
| Espacement horizontal       | 144 twips              | 2,54 mm        |
| Espacement vertical         | 0                      | 0 mm (rangées jointives) |
| Marge haute                 | 856 twips              | 15,10 mm       |
| Marges gauche / droite      | 408 twips (retrait −15)| ≈ 6,9 / 7,2 mm |

**Mise en page d'une étiquette** (identique au modèle) :

- barre noire supérieure : « wienerberger France » (blanc, gras, centré) ;
- corps : QR code (avec le logo « W » Wienerberger) à gauche, puis trois lignes
  `Nom :`, `Modèle :`, `S/N :` à droite ;
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
- **QR code généré automatiquement** encodant les informations de la machine.
- **Impression précise** : seules les étiquettes renseignées sont imprimées ;
  toutes les autres positions restent blanches (impression sur feuille entamée).
- **Export PDF** au format A4 exact.
- **Paramètres** : recalibrage des marges, espacements et dimensions, avec
  aperçu en direct. Les réglages sont persistés sur le disque.
- **Boutons pratiques** : « Sélectionner la prochaine étiquette » (prochaine
  position libre), « Tout sélectionner », « Tout désélectionner »,
  « Réinitialiser la planche ».

---

## Pile technique

- [Electron](https://www.electronjs.org/) — application de bureau
- [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) (mode **strict**)
- [Vite](https://vitejs.dev/) via [electron-vite](https://electron-vite.org/)
- [Material UI](https://mui.com/) — interface sobre et professionnelle
- [electron-builder](https://www.electron.build/) — packaging Windows
- [qrcode-generator](https://www.npmjs.com/package/qrcode-generator) — QR codes hors ligne

Aucun accès réseau n'est requis à l'exécution : tout est embarqué.

---

## Architecture du projet

```
src/
├── main/                  Processus principal Electron
│   ├── index.ts             Fenêtre + enregistrement des canaux IPC
│   ├── printing.ts          Impression et export PDF (printToPDF)
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
        │   ├── PrintActions.tsx     Boutons Imprimer / Exporter PDF
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
        │   └── useAppContext.ts     Contexte applicatif (routeur)
        ├── services/        Accès aux fonctions du processus principal
        │   ├── printService.ts      Construction HTML + impression / PDF
        │   └── settingsService.ts   Normalisation + persistance
        ├── types/           Types du renderer (réexporte le domaine)
        ├── utils/           Fonctions pures
        │   ├── constants.ts         Valeurs par défaut (issues du modèle Word)
        │   ├── layout.ts            Calcul des positions (mm)
        │   ├── qrcode.ts            Génération SVG du QR code
        │   ├── labelTemplate.ts     Gabarit UNIQUE d'une étiquette (aperçu + impression)
        │   └── sheetHtml.ts         Construction du HTML A4 imprimable
        ├── App.tsx          Composant racine (thème, routeur, état global)
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

Depuis une machine **Windows** :

```bash
npm install
npm run build:win
```

Le résultat est un **exécutable unique et portable** dans le dossier `release/` :

- `Etiquettes Inventaire-1.0.0.exe` — **aucune installation** : il suffit de
  double-cliquer pour lancer l'application. Ne nécessite pas de droits
  administrateur et peut être copié où l'on veut (poste, clé USB, partage
  réseau).

Au premier lancement, l'exécutable s'auto-extrait dans un dossier temporaire.
Les paramètres de calibrage sont conservés dans
`%APPDATA%\Etiquettes Inventaire\` d'un lancement à l'autre.

Pour obtenir à la place un dossier décompressé (utile en développement) :

```bash
npm run build:unpacked   # release/win-unpacked/ (exe + fichiers annexes)
```

> La première compilation télécharge le binaire Electron et les outils de
> packaging depuis Internet ; une connexion est donc nécessaire à ce stade.

---

## Notes de conception

- **Précision d'impression** : le HTML de la planche est dimensionné en
  millimètres avec `@page { size: A4; margin: 0 }`. L'impression et l'export PDF
  passent par une fenêtre masquée dédiée dans le processus principal
  (`webContents.printToPDF` / `webContents.print`), garantissant une sortie A4
  au millimètre, indépendante de l'affichage.
- **Impression sur feuille entamée** : `buildSheetHtml` ne génère que les
  étiquettes renseignées ; les autres positions n'existent pas dans le document
  imprimé et restent parfaitement blanches.
- **Sécurité** : `contextIsolation` activé, `nodeIntegration` désactivé, aucune
  ressource distante. La seule surface exposée au renderer est l'API typée
  `window.etiquettes` (impression, PDF, paramètres).
- **Recalibrage** : si l'impression est légèrement décalée sur une imprimante
  donnée, ajustez les marges / dimensions dans **Paramètres** ; les valeurs sont
  conservées entre deux sessions.
```
