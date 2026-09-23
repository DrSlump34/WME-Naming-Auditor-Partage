# WME Naming Auditor — partage communautaire

Zonage d'agglomération partagé pour le userscript **WME Naming Auditor** : les
**polygones d'agglomération** tracés par les éditeurs et les communes déclarées
**« sans agglomération »**, regroupés par département, pour que personne n'ait à
retracer ce qu'un autre a déjà fait.

> Ce dépôt ne contient **pas** de code d'édition. C'est un jeu de **données de
> travail** que le script sait importer. Les coches « traité » sont
> personnelles et ne sont **jamais** partagées ici.

## Importer un département dans le script

1. Ouvre WME Naming Auditor → onglet **☰ Données** → **Réglages** → section
   **« Sauvegarde & partage »**.
2. Colle l'URL *raw* du fichier de ton département dans **« Importer depuis une
   URL »**, puis clique **🌐 Importer depuis l'URL**.

L'URL suit toujours ce motif :

```
https://raw.githubusercontent.com/DrSlump34/WME-Naming-Auditor-Partage/main/partage/dep-<DEP>.json
```

Exemple pour l'Aude : `.../partage/dep-11.json`

**L'import n'écrase jamais ton travail** : une commune que tu as déjà tracée
localement n'est pas touchée, seules les communes absentes de chez toi sont
ajoutées. Tu peux donc importer sans crainte, puis compléter.

La liste des départements couverts est dans [`index.json`](index.json).

## Contribuer

Tu as tracé des agglomérations que tu veux partager ? Voir
**[CONTRIBUTING.md](CONTRIBUTING.md)**. En deux mots : tu exportes depuis le
script, tu déposes ton fichier dans `partage/dep-<DEP>.json`, tu ouvres une
*pull request*. Une vérification automatique contrôle le format avant fusion.

## Format d'un fichier

Chaque `partage/dep-<DEP>.json` est l'**enveloppe exportée par le script**,
telle quelle — voir [`modele.json`](modele.json) pour le gabarit commenté :

```json
{
  "format": "wme-userscript-prefs/1",
  "script": "wme-naming-auditor",
  "scriptName": "WME Naming Auditor",
  "schema": 1,
  "savedAt": "2026-07-25T12:00:00.000Z",
  "payload": {
    "agglos":   { "<code INSEE>": [ { "id": "...", "label": "...", "rattache": false, "ring": [[lon,lat], …] } ] },
    "sansAgglo":{ "<code INSEE>": true },
    "hameaux":  { "<code INSEE>": [ { "lon": 2.40, "lat": 43.19 } ] }
  }
}
```

- `ring` : anneau de sommets `[longitude, latitude]`, **fermé** (le dernier
  point égale le premier), au moins 4 points.
- `rattache` : `true` pour un village rattaché (la ville appliquée devient
  « Village (Commune) »).
- `label` : simple étiquette de repérage, elle n'entre pas dans l'analyse.
- `hameaux` : les secteurs de panneaux d'entrée **déclarés hameau** — un point
  `{ lon, lat }` par secteur. Un hameau ou un lieu-dit reste **hors
  agglomération, même panneauté** (règle votée en 2026, wiki *Nommage des
  segments* v52). Une liste vide veut dire « tout annulé » et n'apporte rien.
- ⚠️ **`payload.traites` est interdit ici** : les coches « traité » sont
  personnelles. La vérification rejette tout fichier qui en contient.

## Vérifier en local

```bash
node outils/valider.js           # contrôle tous les partage/dep-*.json
node outils/construire-index.js  # régénère index.json
```

## Licence

- **Outils** (`outils/`) : MIT — voir [LICENSE](LICENSE).
- **Données** (`partage/`) : **CC-BY 4.0** — voir
  **[DONNEES-LICENCE.md](DONNEES-LICENCE.md)** (attribution + périmètre exact).

Les fichiers de partage contiennent de la **géométrie** (polygones), des
déclarations « sans agglo » et un **label de repérage** — jamais des noms de
commune Waze. Le script applique aux segments des communes **existantes** ; il
n'en crée aucune, et le label d'un polygone n'a aucun effet sur le nommage.
