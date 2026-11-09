# FinanzKit

Finanz-Dashboard des Büros – Teil der Büro-App-Suite **Spektron**, aber außerhalb des Projekt-Ablaufs (wie SpesenKit und BüroKit).

**App öffnen:** https://kaspersebastian83-dot.github.io/finanzfit/ · Version **0.1.0** (Änderungen in `CHANGELOG.md`)

## Was die App zeigt

- Umsatz und Kosten je Monat oder Quartal, mit Vorjahresvergleich, sobald die Vorjahresmonate geladen sind
- Ergebnis wie „Vorläufiges Ergebnis“ der DATEV-BWA (vor Partner-Entnahmen)
- Fixkosten je Monat (Ø der letzten 12 Monate) und die **Kassen-Untergrenze** (Standard: 3 Monate Fixkosten)
- Liquidität: Bank + Kasse je Monatsende gegen die Untergrenze, offene Forderungen nach Alter, größte offene Posten (Kunden und Labore)
- Auffälligkeiten (z. B. Personalkosten deutlich unter dem üblichen Monat, Einmalzahlungen auf Darlehen)
- Kosten nach Gruppen (SKR04) mit allen Einzelkonten

Noch Platzhalter: Marge je Auftragsart, Umsatzanteil je Kunde – kommen mit dem MOS'aik-Export und BelegKit.

## Daten – nie im Repo

Die App liest nur den geteilten OneDrive-Ordner **„Finanzen“** (Basti, Benjamin, Brigitte). Es gibt keine Verbindung ins Internet (Content-Security-Policy ohne `connect-src`). Das Repo enthält **keine Zahlen**; `.gitignore` sperrt CSV, PDF, Excel und JSON.

```
Finanzen/
  finanzkit/
    susa/JJJJ-MM.csv          Summen- und Saldenliste je Monat (Pflicht)
    opos/JJJJ-MM.csv          offene Posten je Monat
    bank/kontostaende.csv     optional: Monat;Bank;Saldo laut Kontoauszug
    steuerbuero/JJJJ-MM_bwa.pdf
    mosaik/ labore/ vertraege/
    einstellungen.json        rote Linien – legt FinanzKit an
```

**SuSa-CSV** (Semikolon, Dezimalkomma): `Monat;Konto;Bezeichnung;Soll_Monat;Haben_Monat;Soll_kum;Haben_kum;Saldo;S_H;Quelle`
**OPOS-CSV:** `Stand;Seite;Konto;Name;RechnungsNr;Datum;Faellig;Offen;Tage_lt_Liste;Quelle` (Seite = Debitor/Kreditor, Offen positiv)

Liegen für einen Monat mehrere Dateien vor, gilt `JJJJ-MM.csv` vor einer Sammeldatei, sonst die neueste.

## Terminal und Laptop

- **Terminal = Eingabe:** Einstellungen werden in `einstellungen.json` im Ordner gespeichert.
- **Laptop = Lesemodus:** nur ansehen, damit OneDrive keine Konfliktkopien anlegt. Umschalten oben rechts.
- Ohne Ordnerzugriff (anderer Browser): „Nur ansehen (Ordner hochladen)“ – speichert nichts.

## Kontenzuordnung (SKR04)

Umsatz 4000–4799 (ohne 46xx) · sonstige Erträge 4600–4699, 4800–4999, 7000–7299 · Labor/Fremdleistungen 6303, 5900–5999 · Personal 6000–6199 · Raum 6300–6389 · Versicherungen 6400–6439 · Wartung/IT 6440–6499 · Fahrzeuge 6500–6599, 7685 · Reise/Werbung 6600–6699 · Verwaltung 6700–6859 · Zinsen 7300–7399 · Abschreibungen 6200–6299 · Sonstiges/neutral 6390–6399, 6860–6999, 7400–7999.
Bank + Kasse 1460–1469, 1600–1899 · Forderungen 1200–1229 · Verbindlichkeiten 3300–3349 · Darlehen 3150–3199, 3500–3599 · Partner-Entnahmen 2100–2199.

Tilgung in den Fixkosten = je Darlehenskonto der **Median** der monatlichen Soll-Buchungen (regelmäßige Rate); Einmalzahlungen stehen unter „Auffälligkeiten“.

## Entwicklung

Alles steht in `index.html` (Vanilla JS, keine Abhängigkeiten, `APP_VERSION`). Getestet mit Chrome/Edge.
