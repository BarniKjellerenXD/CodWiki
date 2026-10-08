"""Create small reading previews; original puzzle plates remain available to enlarge."""
import json
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from PIL import Image, ImageOps
root = Path(__file__).resolve().parents[1]
manifest = json.loads((root / 'app/data/remainingImages.json').read_text(encoding='utf-8'))
assets = {a['id']: a for a in json.loads((root / 'docs/remaining-games/assets.json').read_text(encoding='utf-8'))['assets']}
out = root / 'docs/remaining-games/assets/previews'
out.mkdir(exist_ok=True)
def prepare(item):
    asset = assets[item['id']]
    source = root / 'docs/remaining-games' / asset['localPath']
    target = out / (asset['id'] + '.webp')
    if target.exists(): return target.stat().st_size
    with Image.open(source) as original:
        preview = ImageOps.exif_transpose(original).convert('RGB')
        preview.thumbnail((960, 960), Image.Resampling.LANCZOS)
        preview.save(target, 'WEBP', quality=84, method=4)
    return target.stat().st_size
with ThreadPoolExecutor(max_workers=4) as workers:
    sizes = list(workers.map(prepare, manifest['assets']))
print(f"Prepared {len(sizes)} previews: {sum(sizes) / 1024 / 1024:.1f} MiB; originals {manifest['bytes'] / 1024 / 1024:.1f} MiB")
