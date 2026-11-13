"""
Scarica dal sito FIPAV i tornei di beach volley in programma in Lombardia
(da oggi fino a fine anno) e li salva in federali-lombardia.js,
il file che federali.html legge per la sezione "Tutta la Lombardia".

Uso:
    python tornei_lombardia.py               # da oggi al 31/12 dell'anno corrente
    python tornei_lombardia.py 2027-03-31    # da oggi a una data a scelta

Non serve installare nulla: usa solo la libreria standard di Python.
Gira anche da solo ogni mercoledì sera su GitHub (.github/workflows/tornei-lombardia.yml).
"""

import json
import re
import sys
import time
import urllib.request
from datetime import date
from pathlib import Path

# ---- Impostazioni -----------------------------------------------------------

BASE = "https://media.myvolley.net/public/json"   # da qui il sito FIPAV legge i dati
REGIONE = "LOMBARDIA"
PAUSA_SECONDI = 1.0          # attesa tra una richiesta e l'altra, per non pesare sul server
USER_AGENT = "TorneiLombardiaBot/1.0 (elenco tornei per sito amatoriale)"
FILE_USCITA = Path(__file__).resolve().parent / "federali-lombardia.js"

# Sigle delle province lombarde. Una provincia fuori elenco (nei dati FIPAV
# capita, es. "MARCONI" per Segrate) viene lasciata vuota.
PROVINCE = {
    "BERGAMO": "BG", "BRESCIA": "BS", "COMO": "CO", "CREMONA": "CR", "LECCO": "LC",
    "LODI": "LO", "MANTOVA": "MN", "MILANO": "MI", "MONZA E DELLA BRIANZA": "MB",
    "MONZA E BRIANZA": "MB", "PAVIA": "PV", "SONDRIO": "SO", "VARESE": "VA",
}


def scarica_json(percorso):
    """Scarica un file JSON da media.myvolley.net e lo restituisce come dizionario."""
    url = f"{BASE}/{percorso}"
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=30) as risposta:
        return json.load(risposta)


def tornei_della_pagina(dati):
    """Estrae i tornei di beach volley da una pagina di 'discipline.json'."""
    serie = dati.get("beach_volley", {}).get("serie", {})
    for categoria in serie.values():          # es. "Beach Volley"
        for genere in categoria.values():     # "F" / "M"
            for torneo in genere.get("codici", []):
                yield torneo


def livello(tipologia):
    """'Campionato Italiano per società Master 35 F' -> 'master35'; sconosciuto -> 'altro'."""
    t = tipologia.lower()
    m = re.search(r"(master|under)\s*(\d+)", t)
    if m:
        return m.group(1) + m.group(2)
    m = re.search(r"\b(beginner|bronze|silver|gold|platinum)", t)
    return m.group(1) if m else "altro"


def main():
    oggi = date.today().isoformat()
    fine = sys.argv[1] if len(sys.argv) > 1 else f"{date.today().year}-12-31"
    stagioni = range(int(oggi[:4]), int(fine[:4]) + 1)

    tornei = {}
    for stagione in stagioni:
        # 1) L'indice della stagione elenca le pagine e il periodo coperto da ciascuna:
        #    leggo solo quelle che arrivano almeno a oggi.
        try:
            indice = scarica_json(f"{stagione}/discipline.json")
        except urllib.error.HTTPError as e:
            print(f"Stagione {stagione}: indice non disponibile ({e.code}), salto")
            continue
        pagine = [p for p in indice["pages"] if p.get("a", "9999") >= oggi and p.get("da", "") <= fine]
        print(f"Stagione {stagione}: {len(pagine)} pagine da leggere su {len(indice['pages'])}")

        # 2) Leggo ogni pagina e tengo solo i tornei in Lombardia nel periodo.
        for pagina in pagine:
            time.sleep(PAUSA_SECONDI)
            dati = scarica_json(pagina["path_discipline"])
            for t in tornei_della_pagina(dati):
                inizio = t.get("data_inizio_iso", "")
                if t.get("regione", "").upper() != REGIONE or not (oggi <= inizio <= fine):
                    continue
                # Il file FIPAV ha la "à" di "società" rovinata (carattere �)
                tipologia = t.get("tipologia", "").replace("�", "à")
                tornei[t["codice"]] = {      # il codice evita i doppioni
                    "data": inizio,
                    "fine": t.get("data_fine_iso", "") or inizio,
                    "liv": livello(tipologia),
                    "gen": (t.get("genere", "") or "?")[0].upper(),   # F / M
                    "comune": t.get("comune", ""),
                    "prov": PROVINCE.get(t.get("provincia", "").upper(), ""),
                    "club": t.get("club", ""),
                    "tip": tipologia,
                    "codice": t["codice"],
                    "stagione": str(stagione),
                }
            print(f"  pagina {pagina['pagina']} letta - trovati finora: {len(tornei)}")

    elenco = sorted(tornei.values(), key=lambda t: (t["data"], t["comune"], t["club"], t["liv"], t["gen"]))

    # 3) Salvo il file per il sito (una riga per torneo, così le differenze su git si leggono bene).
    righe = ",\n".join("    " + json.dumps(t, ensure_ascii=False) for t in elenco)
    FILE_USCITA.write_text(
        "// Generato da tornei_lombardia.py: non modificare a mano.\n"
        "// Tornei di beach volley FIPAV in Lombardia (fonte: federvolley.it / myvolley.net).\n"
        f"window.LOMBARDIA_AGGIORNATO = '{oggi}';\n"
        f"window.TORNEI_LOMBARDIA = [\n{righe}\n];\n",
        encoding="utf-8",
    )
    print(f"Fatto: {len(elenco)} tornei salvati in {FILE_USCITA.name}")


if __name__ == "__main__":
    main()
