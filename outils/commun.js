'use strict';
// Fonctions partagees par les outils (valider, construire-index, decouper).
// Node pur, aucune dependance.

const FORMAT = 'wme-userscript-prefs/1';
const SCRIPT = 'wme-naming-auditor';
const SCHEMAS_CONNUS = [1];

// Nom officiel des departements, aligne sur le userscript.
const DEPARTEMENTS = {
  '01': 'Ain', '02': 'Aisne', '03': 'Allier', '04': 'Alpes-de-Haute-Provence',
  '05': 'Hautes-Alpes', '06': 'Alpes-Maritimes', '07': 'Ardeche', '08': 'Ardennes',
  '09': 'Ariege', '10': 'Aube', '11': 'Aude', '12': 'Aveyron', '13': 'Bouches-du-Rhone',
  '14': 'Calvados', '15': 'Cantal', '16': 'Charente', '17': 'Charente-Maritime',
  '18': 'Cher', '19': 'Correze', '21': "Cote-d'Or", '22': "Cotes-d'Armor",
  '23': 'Creuse', '24': 'Dordogne', '25': 'Doubs', '26': 'Drome', '27': 'Eure',
  '28': 'Eure-et-Loir', '29': 'Finistere', '2A': 'Corse-du-Sud', '2B': 'Haute-Corse',
  '30': 'Gard', '31': 'Haute-Garonne', '32': 'Gers', '33': 'Gironde', '34': 'Herault',
  '35': 'Ille-et-Vilaine', '36': 'Indre', '37': 'Indre-et-Loire', '38': 'Isere',
  '39': 'Jura', '40': 'Landes', '41': 'Loir-et-Cher', '42': 'Loire', '43': 'Haute-Loire',
  '44': 'Loire-Atlantique', '45': 'Loiret', '46': 'Lot', '47': 'Lot-et-Garonne',
  '48': 'Lozere', '49': 'Maine-et-Loire', '50': 'Manche', '51': 'Marne', '52': 'Haute-Marne',
  '53': 'Mayenne', '54': 'Meurthe-et-Moselle', '55': 'Meuse', '56': 'Morbihan',
  '57': 'Moselle', '58': 'Nievre', '59': 'Nord', '60': 'Oise', '61': 'Orne',
  '62': 'Pas-de-Calais', '63': 'Puy-de-Dome', '64': 'Pyrenees-Atlantiques',
  '65': 'Hautes-Pyrenees', '66': 'Pyrenees-Orientales', '67': 'Bas-Rhin', '68': 'Haut-Rhin',
  '69': 'Rhone', '70': 'Haute-Saone', '71': 'Saone-et-Loire', '72': 'Sarthe',
  '73': 'Savoie', '74': 'Haute-Savoie', '75': 'Paris', '76': 'Seine-Maritime',
  '77': 'Seine-et-Marne', '78': 'Yvelines', '79': 'Deux-Sevres', '80': 'Somme',
  '81': 'Tarn', '82': 'Tarn-et-Garonne', '83': 'Var', '84': 'Vaucluse', '85': 'Vendee',
  '86': 'Vienne', '87': 'Haute-Vienne', '88': 'Vosges', '89': 'Yonne',
  '90': 'Territoire de Belfort', '91': 'Essonne', '92': 'Hauts-de-Seine',
  '93': 'Seine-Saint-Denis', '94': 'Val-de-Marne', '95': "Val-d'Oise",
  '971': 'Guadeloupe', '972': 'Martinique', '973': 'Guyane', '974': 'La Reunion',
  '976': 'Mayotte'
};

// Departement d'un code INSEE. Corse sur 2 (2A/2B), Outre-mer sur 3 (97x/98x),
// tout le reste sur 2 — meme regle que le userscript.
function depDeInsee(code) {
  const c = String(code);
  if (/^2[AB]/i.test(c)) return c.slice(0, 2).toUpperCase();
  if (/^9[78]/.test(c)) return c.slice(0, 3);
  return c.slice(0, 2);
}

// Emprise large couvrant metropole + DOM-TOM. Sert a reperer un [lat,lon]
// inverse ou une coordonnee aberrante, pas a delimiter finement.
const LON_MIN = -63, LON_MAX = 56, LAT_MIN = -25, LAT_MAX = 52;

function estCoord(p) {
  return Array.isArray(p) && p.length >= 2 &&
    Number.isFinite(p[0]) && Number.isFinite(p[1]) &&
    p[0] >= LON_MIN && p[0] <= LON_MAX && p[1] >= LAT_MIN && p[1] <= LAT_MAX;
}

function anneauFerme(ring) {
  const a = ring[0], b = ring[ring.length - 1];
  return Math.abs(a[0] - b[0]) < 1e-9 && Math.abs(a[1] - b[1]) < 1e-9;
}

/**
 * Verifie une enveloppe deja parsee. `depAttendu` (optionnel) : si fourni, tous
 * les codes INSEE doivent appartenir a ce departement.
 * Rend { erreurs: string[], communes: string[], nbAgglos, nbSansAgglo, nbHameaux }.
 */
function verifierEnveloppe(obj, depAttendu) {
  const err = [];
  const communes = new Set();
  let nbAgglos = 0, nbSansAgglo = 0, nbHameaux = 0;

  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
    return { erreurs: ['ce n\'est pas un objet JSON'], communes: [], nbAgglos: 0, nbSansAgglo: 0, nbHameaux: 0 };
  }
  if (obj.format !== FORMAT) err.push(`format attendu "${FORMAT}", trouve "${obj.format}"`);
  if (obj.script !== SCRIPT) err.push(`script attendu "${SCRIPT}", trouve "${obj.script}" (fichier d'un autre outil ?)`);
  if (!SCHEMAS_CONNUS.includes(obj.schema)) err.push(`schema inconnu : ${obj.schema}`);

  const p = obj.payload;
  if (p === null || typeof p !== 'object' || Array.isArray(p)) {
    err.push('payload absent ou invalide');
    return { erreurs: err, communes: [], nbAgglos: 0, nbSansAgglo: 0, nbHameaux: 0 };
  }
  if ('traites' in p) err.push('payload.traites present : les coches « traite » sont personnelles et INTERDITES dans le partage');

  const cadre = (code, o) => {
    if (!/^(2[AB]|\d{2,3})\d{2,3}$/i.test(String(code))) err.push(`code INSEE improbable : "${code}"`);
    if (depAttendu && depDeInsee(code) !== depAttendu)
      err.push(`code "${code}" (dep ${depDeInsee(code)}) hors du departement ${depAttendu} du fichier`);
    communes.add(String(code));
  };

  const agglos = p.agglos || {};
  if (typeof agglos !== 'object' || Array.isArray(agglos)) err.push('payload.agglos doit etre un objet');
  else for (const [code, liste] of Object.entries(agglos)) {
    cadre(code, 'agglo');
    if (!Array.isArray(liste)) { err.push(`agglos["${code}"] doit etre un tableau`); continue; }
    liste.forEach((a, i) => {
      const ou = `agglos["${code}"][${i}]`;
      nbAgglos++;
      if (a === null || typeof a !== 'object') { err.push(`${ou} n'est pas un objet`); return; }
      if (typeof a.label !== 'string' || !a.label.trim()) err.push(`${ou}.label manquant`);
      if (typeof a.rattache !== 'boolean') err.push(`${ou}.rattache doit etre un booleen`);
      if (!Array.isArray(a.ring) || a.ring.length < 4) { err.push(`${ou}.ring doit compter au moins 4 sommets`); return; }
      const mauvais = a.ring.findIndex(pt => !estCoord(pt));
      if (mauvais >= 0) err.push(`${ou}.ring[${mauvais}] : coordonnee [lon,lat] invalide ou hors zone (lat/lon inverses ?)`);
      else if (!anneauFerme(a.ring)) err.push(`${ou}.ring n'est pas ferme (le dernier point doit egaler le premier)`);
    });
  }

  const sans = p.sansAgglo || {};
  if (typeof sans !== 'object' || Array.isArray(sans)) err.push('payload.sansAgglo doit etre un objet');
  else for (const [code, v] of Object.entries(sans)) {
    cadre(code, 'sans');
    nbSansAgglo++;
    if (v !== true) err.push(`sansAgglo["${code}"] doit valoir true`);
  }

  // Secteurs d'entrees declares HAMEAU (WNA 2.49.03) : le hameau reste hors
  // agglomeration meme panneaute (vote t411162, wiki « Nommage des segments »
  // v52). Un point { lon, lat } par secteur ; une liste vide = « tout annule ».
  const ham = p.hameaux || {};
  if (typeof ham !== 'object' || Array.isArray(ham)) err.push('payload.hameaux doit etre un objet');
  else for (const [code, liste] of Object.entries(ham)) {
    cadre(code, 'hameau');
    if (!Array.isArray(liste)) { err.push(`hameaux["${code}"] doit etre un tableau`); continue; }
    liste.forEach((h, i) => {
      nbHameaux++;
      if (!h || typeof h !== 'object' || !estCoord([h.lon, h.lat]))
        err.push(`hameaux["${code}"][${i}] : point { lon, lat } invalide ou hors zone (lat/lon inverses ?)`);
    });
  }

  return { erreurs: err, communes: [...communes], nbAgglos, nbSansAgglo, nbHameaux };
}

module.exports = { FORMAT, SCRIPT, SCHEMAS_CONNUS, DEPARTEMENTS, depDeInsee, verifierEnveloppe };
