# Licence des données : CC-BY 4.0

Les fichiers du dossier **`partage/`** sont publiés sous
**[Creative Commons Attribution 4.0 International (CC-BY 4.0)](https://creativecommons.org/licenses/by/4.0/deed.fr)**.

> Texte légal complet : <https://creativecommons.org/licenses/by/4.0/legalcode.fr>

## Attribution

En cas de réutilisation, créditer :

> Zonage d'agglomération — contributeurs de *WME Naming Auditor*
> (https://github.com/DrSlump34/WME-Naming-Auditor-Partage), CC-BY 4.0.

## Ce que ces données sont — et ne sont pas

Un fichier de partage contient trois choses, et **seulement** celles-là :

1. des **polygones** (géométrie d'agglomération, sommets `[lon, lat]`) tracés à
   la main par les éditeurs ;
2. des déclarations **« commune sans agglomération »** (un code INSEE marqué) ;
3. un **label** par polygone — un simple **repère textuel** pour reconnaître la
   zone dans l'outil.

⚠️ **Ce ne sont pas des noms de commune Waze, et le partage n'en crée aucun.**
Le label d'un polygone **n'a aucun effet sur le nommage des segments** : c'est
une étiquette de repérage. Le script, lui, applique aux segments des communes
**qui existent déjà** — le nom INSEE pour l'agglomération, une *City* WME
**choisie dans la liste existante** pour un village rattaché. Il **ne crée
jamais** de commune. Ce dépôt ne redistribue donc aucune donnée de nommage
Waze : uniquement de la géométrie et des repères.

## Pourquoi CC-BY et pas ODbL

Les tracés dérivent de sources **permissives** — panneaux EB10/EB20 (jeu
« signalisation VMA » de l'État, Licence Ouverte 2.0) et contours communaux
Admin Express IGN / COG INSEE (Licence Ouverte) — plus le jugement de
l'éditeur. Aucune donnée **ODbL** en amont. Publier sous ODbL (licence virale
d'OpenStreetMap) contaminerait toute réutilisation ; **CC-BY** garde ces
géométries librement réutilisables, avec la seule contrainte d'attribution.

## Sources en amont (pour mémoire)

| Source | Licence |
|---|---|
| Panneaux EB10/EB20 (signalisation VMA, DSR) | Licence Ouverte 2.0 |
| Contours communaux Admin Express IGN + COG INSEE | Licence Ouverte |
| Imagerie satellite (repère visuel au tracé) | propriétaire — non redistribuée, seule la géométrie tracée est conservée |
