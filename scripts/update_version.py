#!/usr/bin/env python3
"""Versiona los recursos para que GitHub Pages no reutilice archivos antiguos."""

import hashlib
import json
import re
from pathlib import Path

root = Path(__file__).resolve().parents[1]
site = root / 'site'
index_path = site / 'index.html'
index = index_path.read_text(encoding='utf-8')
assets = ('styles.css', 'questions.js', 'app.js', 'refresh.js', 'taller-matematicas.pdf')

# Se elimina la versión anterior antes de calcular el hash para evitar ciclos.
canonical = re.sub(r'(<meta name="app-version" content=")[^"]*(">)', r'\1VERSION\2', index)
for asset in assets:
    canonical = re.sub(r'(\./' + re.escape(asset) + r')(?:\?v=[a-f0-9]+)?', r'\1', canonical)
digest = hashlib.sha256(canonical.encode('utf-8'))
for asset in assets:
    digest.update(asset.encode('utf-8'))
    digest.update((site / asset).read_bytes())
version = digest.hexdigest()[:12]
updated = canonical.replace('content="VERSION"', f'content="{version}"')
for asset in assets:
    updated = updated.replace(f'./{asset}', f'./{asset}?v={version}')
index_path.write_text(updated, encoding='utf-8')
(site / 'version.json').write_text(json.dumps({'version': version}) + '\n', encoding='utf-8')
print(f'Versión del sitio: {version}')
