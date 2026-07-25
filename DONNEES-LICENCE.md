# Licence des données — À ARRÊTER

⚠️ **Ce point n'est pas tranché.** Ne déposez pas de tracés dans `partage/`
avant que la coordination FR ait fixé la licence : une fois publiées sous une
mauvaise licence, les données sont difficiles à reprendre.

## Le problème

Un polygone d'agglomération de ce dépôt est une **création des éditeurs** :
tracé à la main en s'appuyant sur

- les **panneaux EB10/EB20** (jeu « signalisation routière VMA » du Ministère
  de l'Intérieur, **Licence Ouverte 2.0** — permissive) ;
- les **contours communaux** Admin Express IGN / COG INSEE (Licence Ouverte
  également) ;
- l'**imagerie satellite** (Google / Airbus, propriétaire — mais seule la
  géométrie tracée est conservée, pas l'image) ;
- le **jugement de l'éditeur**.

Ces tracés servent ensuite à écrire des noms de ville dans **Waze**. La
question — comme pour toute donnée géographique communautaire — est de savoir
sous quelle licence ce dépôt les redistribue.

## Options à considérer

| Licence | Idée | À vérifier |
|---|---|---|
| **CC0 / domaine public** | Aucune contrainte, réutilisation totale | Accord des contributeurs |
| **CC-BY 4.0** | Réutilisation libre avec attribution | Attribution collective possible ? |
| **ODbL** | Compatible OpenStreetMap, « share-alike » | Viralité — voir la note ci-dessous |

⚠️ **Piège ODbL** : c'est la licence d'OpenStreetMap, virale. Si l'objectif est
justement de **ne pas** dépendre de données ODbL (comme le script évite les
contours OSM au profit d'Admin Express), publier ces tracés en ODbL les rendrait
inutilisables ailleurs sans contamination. À peser.

## Décision

**À prendre par la coordination FR** (idéalement avec l'avis de Sebiseba, auteur
de Draw Borders France, qui a déjà tranché des questions voisines). Une fois
choisie, remplacer ce fichier par le texte de la licence retenue et l'annoncer
dans le README.
