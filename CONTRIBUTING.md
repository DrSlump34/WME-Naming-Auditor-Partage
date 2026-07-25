# Contribuer au partage

Merci de partager ton zonage ! Voici comment déposer ou compléter un
département sans casser celui des autres.

## 1. Exporter depuis le script

Dans WME Agglo Naming → **☰ Données** → **Réglages** → **« Sauvegarde &
partage »** → **⬇️ Exporter**. Tu obtiens un fichier
`wme-agglo-naming-partage-AAAA-MM-JJ.json` qui contient **toutes** tes communes,
tous départements confondus, avec :

- `payload.agglos` : tes polygones, par code INSEE ;
- `payload.sansAgglo` : tes communes déclarées « sans agglomération ».

Les coches « traité » ne sont **pas** dans l'export : c'est voulu, elles
restent personnelles.

## 2. Découper par département

Un fichier du dépôt = **un seul département**. Le département se lit sur les
deux (ou trois) premiers caractères du code INSEE :

| Code INSEE | Département |
|---|---|
| `11069` | `11` (Aude) |
| `2A004` | `2A` (Corse-du-Sud) |
| `97411` | `974` (La Réunion) |

L'outil fait le tri pour toi :

```bash
node outils/decouper.js  wme-agglo-naming-partage-2026-07-25.json
```

Il écrit un `partage/dep-<DEP>.json` par département présent dans ton export,
en **fusionnant** avec l'existant du dépôt sans écraser les communes déjà là
(même règle que l'import côté script : on n'ajoute que les absentes).

> Pas envie d'utiliser l'outil ? Tu peux éditer `partage/dep-<DEP>.json` à la
> main : garde l'enveloppe, ne mets dans `payload.agglos` / `payload.sansAgglo`
> que des codes INSEE de **ce** département.

## 3. Ouvrir une pull request

1. *Fork* du dépôt, une branche par contribution.
2. Commit des `partage/dep-*.json` modifiés **et** de `index.json` régénéré
   (`node outils/construire-index.js`).
3. Ouvre la PR. La vérification automatique (`node outils/valider.js`) contrôle
   le format ; si elle passe au vert, un mainteneur fusionne.

## Ce que la vérification exige

- Enveloppe correcte : `format`, `script: "wme-agglo-naming"`, `schema` connu.
- Chaque code INSEE du fichier appartient bien au département du nom de fichier.
- Chaque polygone a un `ring` fermé d'au moins 4 sommets `[lon, lat]`
  plausibles, un `label`, un `rattache` booléen.
- **Aucun `payload.traites`** (données personnelles).
- Aucun code INSEE présent dans deux fichiers à la fois.

## Bonnes manières

- **Ne remplace pas** le polygone d'un autre sans raison : si tu améliores un
  tracé existant, dis-le dans la PR.
- Un polygone doit **coller aux panneaux d'entrée d'agglomération** (les
  sommets passent par eux) et englober le bâti — pas un rond approximatif.
- Le nom d'un village rattaché se choisit parmi les villes que Waze connaît.
