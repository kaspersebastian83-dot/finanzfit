# Änderungen

## 0.1.1 – 20. November 2026 (Audit Lauf 3)

- Kein Link mehr auf die Rückmeldung-App (C14): Rückmeldungen liegen im Archivordner und sind für alle lesbar. Stattdessen im Menü „Mehr …“: Probleme direkt an Basti, ohne Zahlen, ohne Screenshots.
- Kontostände (`bank/`, C23): dieselbe Bank für denselben Monat in zwei Dateien (z. B. `kontostaende-LAPTOP.csv` als OneDrive-Konfliktkopie) wurde addiert und verdoppelte „Bank + Kasse“. Jetzt gilt die neuere Datei, „Daten & Prüfung“ nennt beide. Mehrere Banken in einer Datei werden weiter addiert.
- Tests (C24): `tests/rechnen.cjs` mit erfundenen Zahlen, CI bei jedem PR und auf `main`.

## 0.1.0 – 9. November 2026

- Erste Fassung: Ordner „Finanzen“ öffnen (oder nur ansehen per Hochladen), SuSa- und OPOS-Monatsdateien einlesen.
- Kennzahlen: Umsatz, Kosten, Ergebnis (wie BWA), Laborquote, Fixkosten je Monat, Bank + Kasse gegen die Untergrenze.
- Diagramme: Umsatz/Kosten je Monat oder Quartal, Liquidität mit Untergrenze, offene Forderungen nach Alter.
- Auffälligkeiten, Kosten nach Gruppen mit Einzelkonten, Daten & Prüfung, Kontenzuordnung.
- Einstellungen (rote Linien) in `einstellungen.json` im Datenordner; Lesemodus für den Laptop.
