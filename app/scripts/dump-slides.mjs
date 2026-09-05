// Dev helper: dumps every text-bearing object of every published Storyline slide
// so the content mapping in extract-content.mjs can be written against real ids.
import fs from 'node:fs';
import path from 'node:path';

const SRC = path.resolve(import.meta.dirname, '../../html5/data/js');

export function readSlide(id) {
  const raw = fs.readFileSync(path.join(SRC, `${id}.js`), 'utf8').replace(/^﻿/, '');
  const m = raw.match(/^window\.globalProvideData\('slide',\s*'([\s\S]*)'\)\s*;?\s*$/);
  if (!m) throw new Error(`${id}: not a slide payload`);
  return JSON.parse(eval(`'${m[1]}'`));
}

export function textObjects(slide) {
  const out = [];
  slide.slideLayers.forEach((layer, li) => {
    const walk = (objs) => {
      for (const ob of objs ?? []) {
        const alt = ob.data?.vectorData?.altText;
        if (typeof alt === 'string' && alt.trim()) {
          out.push({ layer: li, layerId: layer.id ?? 'base', id: ob.id, text: alt });
        }
        walk(ob.objects);
        for (const st of ob.states ?? []) walk(st.objects);
      }
    };
    walk(layer.objects);
  });
  return out;
}

if (process.argv[2]) {
  const slide = readSlide(process.argv[2]);
  console.log(`# ${process.argv[2]}  "${slide.title}"  layers=${slide.slideLayers.length}`);
  for (const o of textObjects(slide)) {
    console.log(`[L${o.layer}:${o.layerId}] ${o.id}  ${JSON.stringify(o.text)}`);
  }
}
