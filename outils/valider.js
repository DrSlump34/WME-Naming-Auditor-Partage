'use strict';
// Valide tous les partage/dep-<DEP>.json : format, coherence dep/INSEE,
// polygones bien formes, aucun traite, aucun code INSEE en double entre
// fichiers. Sortie lisible, code de sortie 1 s'il reste une erreur.
//
//   node outils/valider.js
//
// Aucune dependance : tourne tel quel dans la CI GitHub.

const fs = require('fs');
const path = require('path');
const { DEPARTEMENTS, depDeInsee, verifierEnveloppe } = require('./commun');

const DOSSIER = path.join(__dirname, '..', 'partage');

function main() {
  let fichiers = [];
  try {
    fichiers = fs.readdirSync(DOSSIER)
      .filter(f => /^dep-.+\.json$/i.test(f))   // les _modele/_exemple sont ignores
      .sort();
  } catch (e) {
    console.error('Impossible de lire ' + DOSSIER + ' : ' + e.message);
    process.exit(1);
  }

  if (!fichiers.length) {
    console.log('Aucun fichier partage/dep-*.json — rien a valider (depot vide, c\'est normal au demarrage).');
    return;
  }

  let total = 0;
  const communeVersFichier = new Map();   // detection des doublons entre fichiers

  for (const f of fichiers) {
    const chemin = path.join(DOSSIER, f);
    const m = f.match(/^dep-(2[AB]|\d{2,3})\.json$/i);
    if (!m) { erreur(f, 'nom de fichier attendu : dep-<DEP>.json (ex. dep-11.json, dep-2A.json, dep-974.json)'); total++; continue; }
    const dep = m[1].toUpperCase();
    if (!DEPARTEMENTS[dep]) { erreur(f, `departement "${dep}" inconnu`); total++; continue; }

    let obj;
    try { obj = JSON.parse(fs.readFileSync(chemin, 'utf8')); }
    catch (e) { erreur(f, 'JSON illisible : ' + e.message); total++; continue; }

    const r = verifierEnveloppe(obj, dep);
    r.erreurs.forEach(msg => erreur(f, msg));
    total += r.erreurs.length;

    // Un code INSEE ne doit vivre que dans un seul fichier.
    for (const code of r.communes) {
      if (communeVersFichier.has(code) && communeVersFichier.get(code) !== f) {
        erreur(f, `code "${code}" deja present dans ${communeVersFichier.get(code)}`);
        total++;
      } else communeVersFichier.set(code, f);
    }

    if (!r.erreurs.length) {
      console.log(`  ok  ${f} — ${DEPARTEMENTS[dep]} : ${r.nbAgglos} polygone(s), ${r.nbSansAgglo} « sans agglo »`);
    }
  }

  console.log('');
  if (total) { console.error(`${total} erreur(s) sur ${fichiers.length} fichier(s).`); process.exit(1); }
  console.log(`Tout est valide : ${fichiers.length} fichier(s), ${communeVersFichier.size} commune(s).`);
}

function erreur(fichier, msg) { console.error(`  ERREUR  ${fichier} : ${msg}`); }

main();
