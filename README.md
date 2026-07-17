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
- **Impression précise** : seules les étiquettes renseignées sont imprimées ;
  toutes les autres positions restent blanches (impression sur feuille entamée).
  L'impression est forcée à l'échelle 100 % pour un alignement au millimètre.
- **Export PDF ou Word** (au choix) au format A4 exact.
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
        │   └── useAppContext.ts     Contexte applicatif (routeur)
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
- **Sécurité** : `contextIsolation` activé, `nodeIntegration` désactivé, aucune
  ressource distante. La seule surface exposée au renderer est l'API typée
  `window.etiquettes` (impression, PDF, Word, paramètres).

### Impression au plus juste

Un décalage de quelques millimètres provient presque toujours d'une **mise à
l'échelle à l'impression**. Pour un alignement parfait :

1. Depuis l'application, le bouton **Imprimer** force déjà l'échelle 100 %.
2. Si vous imprimez le **PDF** depuis un lecteur (Adobe, Edge…), choisissez
   **« Taille réelle »** / **100 %** (jamais « Ajuster » ou « Réduire »).
3. L'**export Word** est souvent le plus fidèle : Word imprime le tableau à sa
   taille exacte, sans mise à l'échelle.
4. S'il reste un léger décalage propre à une imprimante, ajustez les marges dans
   **Paramètres** (les valeurs sont conservées entre deux sessions).
```
