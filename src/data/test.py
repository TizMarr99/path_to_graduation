import json
import re
from copy import deepcopy

INPUT = "categories.json"
OUTPUT = "categories.fixed.json"

# 1. Parole abbastanza sicure da correggere sempre quando sono parole isolate
SAFE_REPLACEMENTS = {
    "gia": "già",
    "piu": "più",
    "perche": "perché",
    "puo": "può",
    "cio": "ciò",
    "identita": "identità",
    "autorita": "autorità",
    "centralita": "centralità",
    "teatralita": "teatralità",
    "realta": "realtà",
    "faro": "farò",
}

# 2. Casi ambigui: correggili solo in pattern specifici
CONTEXTUAL_RULES = [
    # e → è solo quando è chiaramente verbo essere
    (r"\b[Ee] una frase\b", "È una frase"),
    (r"\be britannico\b", "è britannico"),
    (r"\be famosa\b", "è famosa"),
    (r"\be scozzese\b", "è scozzese"),
    (r"\be noto\b", "è noto"),
    (r"\be una singola\b", "è una singola"),
    (r"\be precedente\b", "è precedente"),
    (r"\be morale\b", "è morale"),
    (r"\be il denaro\b", "è il denaro"),
    (r"\be solo\b", "è solo"),
    (r"\be un uomo\b", "è un uomo"),
    (r"\be il pittore\b", "è il pittore"),
    (r"\be quello\b", "è quello"),
    (r"\be avventuroso\b", "è avventuroso"),
    (r"\be spaziale\b", "è spaziale"),
    (r"\be noto\b", "è noto"),
    (r"\be decisamente\b", "è decisamente"),
    (r"\be tagliente\b", "è tagliente"),
    (r"\be spesso\b", "è spesso"),

    # se → sé solo in locuzioni pronominali
    (r"\bdi se\b", "di sé"),
    (r"\bin se\b", "in sé"),

    # si → sì solo quando è risposta/affermazione, non pronome
    (r"\bpazienza si\b", "pazienza sì"),

    # li → lì solo quando indica luogo
    (r"\bsi nasconde li\b", "si nasconde lì"),
]

WORD_CHARS = r"A-Za-zÀ-ÖØ-öø-ÿ"


def replace_word(text, src, dst):
    """
    Sostituisce solo parole isolate.
    Evita di toccare parti di altre parole.
    """
    pattern = rf"(?<![{WORD_CHARS}]){re.escape(src)}(?![{WORD_CHARS}])"
    return re.sub(pattern, dst, text)


def fix_text(text):
    original = text

    for src, dst in SAFE_REPLACEMENTS.items():
        text = replace_word(text, src, dst)

    for pattern, replacement in CONTEXTUAL_RULES:
        text = re.sub(pattern, replacement, text)

    return text, text != original


def walk(value, path="$", changes=None):
    if changes is None:
        changes = []

    if isinstance(value, dict):
        return {
            key: walk(child, f"{path}.{key}", changes)
            for key, child in value.items()
        }

    if isinstance(value, list):
        return [
            walk(child, f"{path}[{index}]", changes)
            for index, child in enumerate(value)
        ]

    if isinstance(value, str):
        fixed, changed = fix_text(value)
        if changed:
            changes.append({
                "path": path,
                "before": value,
                "after": fixed,
            })
        return fixed

    return value


with open(INPUT, "r", encoding="utf-8") as f:
    data = json.load(f)

changes = []
fixed_data = walk(deepcopy(data), changes=changes)

with open(OUTPUT, "w", encoding="utf-8") as f:
    json.dump(fixed_data, f, ensure_ascii=False, indent=2)

with open("accent-report.json", "w", encoding="utf-8") as f:
    json.dump(changes, f, ensure_ascii=False, indent=2)

print(f"Creato: {OUTPUT}")
print(f"Modifiche proposte/applicate: {len(changes)}")
print("Report: accent-report.json")