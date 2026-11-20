// FinanzKit – Rechenkern gegen erfundene SuSa-/OPOS-/Kontoauszugsdateien (Audit Lauf 3, C23/C24).
// Nur erfundene Zahlen – im Repo stehen nie Zahlen des Büros. Lädt die Abschnitte „Kontenzuordnung“ bis „Ordner öffnen“ und
// „Daten aufbereiten“ bis „Diagramme“ aus index.html in eine eigene V8-Sitzung (ohne Browser).
// node tests/rechnen.cjs
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const stueck = (von, bis) => { const a = html.indexOf(von), b = html.indexOf(bis, a); assert.ok(a > 0 && b > a, 'Abschnitt fehlt: ' + von); return html.slice(a, b); };
function sitzung(){
  const c = vm.createContext({ console, Intl, Map, Set, Math, Number, String, JSON, isFinite, parseFloat, parseInt, Date });
  vm.runInContext(stueck('/* ====================== Kontenzuordnung', '/* ====================== Ordner öffnen') +
    stueck('/* ====================== Daten aufbereiten', '/* ====================== Diagramme') +
    '\nglobalThis.T = { Z, aufbereiten, werte, fixkosten, tilgungRegel, zahl, csvLesen, gruppeVon, reset: () => { W = new Map(); } };', c);
  return c.T;
}
let n = 0; const ok = (name, fn) => { fn(); n++; console.log('OK ' + name); };
const KOPF = 'Monat;Konto;Bezeichnung;Soll_Monat;Haben_Monat;Soll_kum;Haben_kum;Saldo;S_H;Quelle';
const susa = (monat, zeilen) => [KOPF, ...zeilen.map(z => [monat, ...z].join(';'))].join('\r\n');
// erfunden: Umsatz 4400, Personal 6020, Miete 6310, Labor 6303, Darlehen 3560, Bank 1800, Forderungen 1200
const jan = susa('2026-01', [['4400', 'Erlöse', '0,00', '10.000,00', '0,00', '10.000,00', '10.000,00', 'H', 'test'], ['6020', 'Gehälter', '4.000,00', '0,00', '4.000,00', '0,00', '4.000,00', 'S', 'test'],
  ['6310', 'Miete', '1.000,00', '0,00', '1.000,00', '0,00', '1.000,00', 'S', 'test'], ['6303', 'Fremdleistungen', '500,50', '0,00', '500,50', '0,00', '500,50', 'S', 'test'],
  ['3560', 'Darlehen', '1.000,00', '0,00', '1.000,00', '20.000,00', '19.000,00', 'H', 'test'], ['1800', 'Bank', '0,00', '0,00', '0,00', '0,00', '30.000,00', 'S', 'test'], ['1200', 'Forderungen', '0,00', '0,00', '0,00', '0,00', '2.500,00', 'S', 'test']]);
const feb = susa('2026-02', [['4400', 'Erlöse', '0,00', '8.000,00', '0,00', '18.000,00', '18.000,00', 'H', 'test'], ['6020', 'Gehälter', '4.000,00', '0,00', '8.000,00', '0,00', '8.000,00', 'S', 'test'],
  ['6310', 'Miete', '1.000,00', '0,00', '2.000,00', '0,00', '2.000,00', 'S', 'test'], ['3560', 'Darlehen', '9.000,00', '0,00', '10.000,00', '20.000,00', '10.000,00', 'H', 'test'],
  ['1800', 'Bank', '0,00', '0,00', '0,00', '0,00', '25.000,00', 'S', 'test']]);
const mar = susa('2026-03', [['3560', 'Darlehen', '1.000,00', '0,00', '11.000,00', '20.000,00', '9.000,00', 'H', 'test'], ['1800', 'Bank', '0,00', '0,00', '0,00', '0,00', '24.000,00', 'S', 'test']]);
const datei = (name, text, geaendert = 1) => ({ name, text, geaendert });
function geladen(dateien){
  const T = sitzung();
  T.Z.dateien = { susa: [], opos: [], bank: [], ...dateien }; T.reset(); T.aufbereiten(); T.reset();
  return T;
}

ok('Zahlen: deutsches Format, Tausenderpunkt, leer', () => {
  const T = sitzung();
  for (const [ein, aus] of [['1.234,56', 1234.56], ['1.000', 1000], ['-12,5', -12.5], ['', 0], ['0,00', 0], ['12', 12], ['1.234.567,89', 1234567.89]]) assert.equal(T.zahl(ein), aus, ein);
});

ok('SuSa: Umsatz, Kosten nach Gruppen, Ergebnis, Bank; Monatswerte passen zu den kumulierten', () => {
  const T = geladen({ susa: [datei('susa/2026-01.csv', jan), datei('susa/2026-02.csv', feb)] });
  assert.deepEqual([...T.Z.monate], ['2026-01', '2026-02']);
  const w = T.werte('2026-01');
  assert.equal(w.umsatz, 10000); assert.equal(w.g.personal, 4000); assert.equal(w.g.raum, 1000); assert.equal(w.g.labor, 500.5);
  assert.equal(w.kosten, 5500.5); assert.equal(w.ergebnis, 4499.5); assert.equal(w.bank, 30000); assert.equal(w.bankQuelle, 'Buchsaldo'); assert.equal(w.ford, 2500);
  assert.ok(T.Z.pruefung.some(p => /Monatswerte und kumulierte Werte passen/.test(p.text)));
  assert.equal(T.gruppeVon(6303), 'labor'); assert.equal(T.gruppeVon(6310), 'raum');
});

ok('SuSa: genaue Monatsdatei geht vor Sammeldatei', () => {
  const falsch = jan.replace('10.000,00;0,00;10.000,00;10.000,00', '99.000,00;0,00;99.000,00;99.000,00');
  const T = geladen({ susa: [datei('susa/2026-sammel.csv', falsch, 9), datei('susa/2026-01.csv', jan, 1)] });
  assert.equal(T.werte('2026-01').umsatz, 10000);
});

ok('Tilgung: Median der Soll-Buchungen, Einmalzahlung nur unter Auffälligkeiten', () => {
  const T = geladen({ susa: [datei('susa/2026-01.csv', jan), datei('susa/2026-02.csv', feb), datei('susa/2026-03.csv', mar)] });
  const t = T.tilgungRegel(['2026-01', '2026-02', '2026-03']);
  assert.equal(t.summe, 1000);   // Median aus 1.000, 9.000, 1.000
  assert.deepEqual(JSON.parse(JSON.stringify(t.einmal.map(e => [e.konto, e.m, e.wert]))), [[3560, '2026-02', 9000]]);
});

ok('C23: Kontostand je Monat und Bank nur einmal – Konfliktkopie verdoppelt nicht, wird gemeldet', () => {
  const bank = 'Monat;Bank;Saldo\r\n2026-01;Sparkasse;20.000,00\r\n2026-01;Volksbank;5.000,00\r\n2026-02;Sparkasse;18.000,00';
  const T1 = geladen({ susa: [datei('susa/2026-01.csv', jan), datei('susa/2026-02.csv', feb)], bank: [datei('bank/kontostaende.csv', bank)] });
  assert.equal(T1.werte('2026-01').bank, 25000, 'zwei Banken in einer Datei werden addiert');
  assert.equal(T1.werte('2026-01').bankQuelle, 'Kontoauszug');
  const T2 = geladen({ susa: [datei('susa/2026-01.csv', jan), datei('susa/2026-02.csv', feb)],
    bank: [datei('bank/kontostaende.csv', bank, 1), datei('bank/kontostaende-LAPTOP.csv', bank.replace('20.000,00', '21.000,00'), 2)] });
  assert.equal(T2.werte('2026-01').bank, 26000, 'je Monat und Bank gilt die neueste Datei – nicht die Summe beider');
  assert.equal(T2.werte('2026-02').bank, 18000);
  assert.ok(T2.Z.pruefung.some(p => p.art === 'warn' && /kontostaende-LAPTOP\.csv/.test(p.text) && /kontostaende\.csv/.test(p.text)), 'doppelte Angabe gemeldet');
});

ok('C14: kein Link auf die Rückmeldung-App (Einträge wären für alle im Büro lesbar)', () => {
  assert.ok(!/rueckmeldung/i.test(html), 'Link auf ../rueckmeldung/ gefunden');
  assert.match(html, /direkt an Basti – <b>ohne Zahlen, ohne Screenshots<\/b>/);
});

console.log(`${n} Prüfungen Rechenkern bestanden`);
