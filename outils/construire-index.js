'use strict';
// Regenere index.json a partir des partage/dep-*.json : la liste des
// departements couverts, avec le compte de communes et l'URL raw a importer.
//
//   node outils/construire-index.js
//
// A relancer et committer a chaque ajout/mise a jour de departement.

const fs = require('fs');
const path = require('path');
const { DEPARTEMENTS, verifierEnveloppe } = require('./commun');

const RACINE = path.join(__dirname, '..');
const DOSSIER = path.join(RACINE, 'partage');
const BASE_RAW = 'https://raw.githubusercontent.com/DrSlump34/WME-Naming-Auditor-Partage/main/partage/';

// new Date() est fige a la seule fin d'estampiller l'index : la CI peut le
// regenerer, seul le contenu des departements est significatif pour un diff.
function main() {
  const fichiers = fs.existsSync(DOSSIER)
    ? fs.readdirSync(DOSSIER).filter(f => /^dep-.+\.json$/i.test(f)).sort()
    : [];

  const departements = {};
  for (const f of fichiers) {
    const dep = f.match(/^dep-(2[AB]|\d{2,3})\.json$/i)[1].toUpperCase();
    let obj; try { obj = JSON.parse(fs.readFileSync(path.join(DOSSIER, f), 'utf8')); } catch (e) { continue; }
    const r = verifierEnveloppe(obj, dep);
    departements[dep] = {
      nom: DEPARTEMENTS[dep] || '?',
      fichier: 'partage/' + f,
      url: BASE_RAW + f,
      communes: r.communes.length,
      polygones: r.nbAgglos,
      sansAgglo: r.nbSansAgglo
    };
  }

  const index = {
    depot: 'WME-Naming-Auditor-Partage',
    miseAJour: new Date().toISOString().slice(0, 10),
    nbDepartements: Object.keys(departements).length,
    departements
  };
  fs.writeFileSync(path.join(RACINE, 'index.json'), JSON.stringify(index, null, 2) + '\n');
  console.log(`index.json regenere : ${index.nbDepartements} departement(s).`);
}

main();
