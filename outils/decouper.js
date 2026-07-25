'use strict';
// Decoupe un export global du script (toutes communes, tous departements) en un
// partage/dep-<DEP>.json par departement, en FUSIONNANT avec l'existant du
// depot sans jamais ecraser une commune deja presente (meme regle que l'import
// cote script : on n'ajoute que les absentes).
//
//   node outils/decouper.js  mon-export.json
//
// Regenere ensuite index.json toi-meme (node outils/construire-index.js).

const fs = require('fs');
const path = require('path');
const { FORMAT, SCRIPT, depDeInsee, verifierEnveloppe, DEPARTEMENTS } = require('./commun');

const DOSSIER = path.join(__dirname, '..', 'partage');

function enveloppeVide() {
  return { format: FORMAT, script: SCRIPT, scriptName: 'WME Naming Auditor', schema: 1,
           savedAt: new Date().toISOString(), payload: { agglos: {}, sansAgglo: {} } };
}

function main() {
  const src = process.argv[2];
  if (!src) { console.error('Usage : node outils/decouper.js <export.json>'); process.exit(1); }

  let obj;
  try { obj = JSON.parse(fs.readFileSync(src, 'utf8')); }
  catch (e) { console.error('Lecture impossible : ' + e.message); process.exit(1); }

  // On valide l'export sans imposer de departement (il en couvre plusieurs).
  const r = verifierEnveloppe(obj);
  const bloquants = r.erreurs.filter(m => !/hors du departement/.test(m));
  if (bloquants.length) {
    console.error('Export refuse :'); bloquants.forEach(m => console.error('  - ' + m)); process.exit(1);
  }

  const agglos = obj.payload.agglos || {};
  const sans = obj.payload.sansAgglo || {};
  const parDep = {};
  const dossier = dep => (parDep[dep] = parDep[dep] || { agglos: {}, sans: {} });
  for (const [code, liste] of Object.entries(agglos)) dossier(depDeInsee(code)).agglos[code] = liste;
  for (const [code, v] of Object.entries(sans)) dossier(depDeInsee(code)).sans[code] = v;

  let ecrits = 0, ajoutsPoly = 0, ajoutsSans = 0;
  for (const [dep, apport] of Object.entries(parDep)) {
    if (!DEPARTEMENTS[dep]) { console.error(`  ignore : departement inconnu "${dep}"`); continue; }
    const chemin = path.join(DOSSIER, `dep-${dep}.json`);

    let cible = enveloppeVide();
    if (fs.existsSync(chemin)) {
      try { cible = JSON.parse(fs.readFileSync(chemin, 'utf8')); } catch (e) { /* on repart d'une enveloppe vide */ }
    }
    cible.payload = cible.payload || { agglos: {}, sansAgglo: {} };
    cible.payload.agglos = cible.payload.agglos || {};
    cible.payload.sansAgglo = cible.payload.sansAgglo || {};

    let ap = 0, as = 0;
    for (const [code, liste] of Object.entries(apport.agglos)) {
      const dejaLa = Array.isArray(cible.payload.agglos[code]) && cible.payload.agglos[code].length;
      if (!dejaLa) { cible.payload.agglos[code] = liste; ap++; }   // n'ajouter que les absentes
    }
    for (const code of Object.keys(apport.sans)) {
      if (!cible.payload.sansAgglo[code]) { cible.payload.sansAgglo[code] = true; as++; }
    }

    if (ap || as) {
      cible.format = FORMAT; cible.script = SCRIPT; cible.schema = 1;
      cible.savedAt = new Date().toISOString();
      fs.writeFileSync(chemin, JSON.stringify(cible, null, 2) + '\n');
      console.log(`  dep-${dep}.json (${DEPARTEMENTS[dep]}) : +${ap} polygone(s), +${as} « sans agglo »`);
      ecrits++; ajoutsPoly += ap; ajoutsSans += as;
    } else {
      console.log(`  dep-${dep}.json (${DEPARTEMENTS[dep]}) : rien de neuf (deja present)`);
    }
  }

  console.log(`\n${ecrits} fichier(s) ecrit(s) — ${ajoutsPoly} polygone(s) et ${ajoutsSans} « sans agglo » ajoutes.`);
  console.log('Pense a : node outils/construire-index.js');
}

main();
