"""Relink a saved Premiere project to corrected title plates, preserving its edit.

Render premiere-type-plates.tsx and premiere-study-title.tsx into the assets folder
first. The source stays intact; the new project keeps all sequences and effect keys.
"""
import argparse
import gzip
import hashlib
import json
from pathlib import Path
import uuid
import xml.etree.ElementTree as ET

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--source', type=Path, required=True)
parser.add_argument('--output', type=Path, required=True)
parser.add_argument('--assets', type=Path, required=True)
args = parser.parse_args()
source, output, assets = args.source.resolve(), args.output.resolve(), args.assets.resolve()
if output.exists():
    raise FileExistsError(f'Refusing to replace an existing project: {output}')
original = source.read_bytes()
root = ET.fromstring(gzip.decompress(original))
sequence_data = [ET.tostring(x) for x in root.findall('Sequence')]
keyframes = [ET.tostring(x) for x in root if x.tag.endswith('ComponentParam')]
changes = []
for media in root.findall('Media'):
    old = media.findtext('FilePath')
    if not old or not old.endswith('.png'):
        continue
    old_path = Path(old)
    if not any(p in old_path.parts for p in ('animated-type', 'current-study')):
        continue
    replacement = assets / old_path.name
    if not replacement.is_file():
        continue
    # The full-frame transparent plates retain the source's dimensions, so all
    # native position, scale, opacity and blur keys remain usable without changes.
    from PIL import Image
    assert Image.open(replacement).size == Image.open(old_path).size == (1920, 1080)
    for tag in ('FilePath', 'ActualMediaFilePath'):
        for node in media.findall(tag):
            node.text = str(replacement)
    for node in media.findall('RelativePath'):
        import os
        node.text = './' + os.path.relpath(replacement, output.parent)
    if media.find('FileKey') is not None:
        media.find('FileKey').text = str(uuid.uuid4())
    if media.find('CCFileModTime') is not None:
        media.find('CCFileModTime').text = str(int(replacement.stat().st_mtime * 1_000_000))
    changes.append({'old': str(old_path), 'new': str(replacement)})
assert len(changes) >= 62, f'Expected the title plates; found only {len(changes)} matches'
for node in root.iter('project.settings.lastknowngoodprojectpath'):
    node.text = str(output)
assert sequence_data == [ET.tostring(x) for x in root.findall('Sequence')]
assert keyframes == [ET.tostring(x) for x in root if x.tag.endswith('ComponentParam')]
output.parent.mkdir(parents=True, exist_ok=True)
output.write_bytes(gzip.compress(ET.tostring(root, encoding='utf-8', xml_declaration=True)))
assert source.read_bytes() == original
saved = ET.fromstring(gzip.decompress(output.read_bytes()))
assert sequence_data == [ET.tostring(x) for x in saved.findall('Sequence')]
assert keyframes == [ET.tostring(x) for x in saved if x.tag.endswith('ComponentParam')]
missing = sorted({x.findtext('FilePath') for x in saved.findall('Media')
                  if x.findtext('FilePath') and not Path(x.findtext('FilePath')).is_file()})
report = {'source': str(source), 'source_sha256': hashlib.sha256(original).hexdigest(),
          'output': str(output), 'updated_title_media': len(changes),
          'sequences_preserved': len(sequence_data), 'component_parameters_preserved': len(keyframes),
          'missing_media': missing, 'replacements': changes}
output.with_suffix('.verification.json').write_text(json.dumps(report, indent=2))
print(json.dumps({k: v for k, v in report.items() if k != 'replacements'}, indent=2))
