// Sunset Cover Maker — editor wiring.
// Owns the page state (three panels, layout, grade, caption, size),
// the file pickers and drag-and-drop, dragging a photo inside the
// canvas to reposition it, and the PNG export. Shot scenes live in
// ./shots.js; the painting itself lives in ./cover.js.
import { drawCover, GRADES, LAYOUTS } from './cover.js';
import { runShot } from './shots.js';

export const SIZES = {
  square: { w: 1080, h: 1080, label: '1080 × 1080' },
  portrait: { w: 1080, h: 1350, label: '1080 × 1350' },
  wide: { w: 1920, h: 1080, label: '1920 × 1080' },
};

export const state = {
  panels: [
    { img: null, zoom: 1, ox: 0, oy: 0, fit: 'fill' },
    { img: null, zoom: 1, ox: 0, oy: 0, fit: 'fill' },
    { img: null, zoom: 1, ox: 0, oy: 0, fit: 'fill' },
  ],
  layout: 'hero',
  grade: 'sunset',
  title: 'Sunset Heist',
  subtitle: 'Vice City Nights',
  titleColor: '#ffffff',
  decorations: true,
  sizeKey: 'square',
  selected: 0,
};

const canvas = document.getElementById('cover');
const statusEl = document.getElementById('status');
const $ = (id) => document.getElementById(id);

export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not load image'));
    img.src = url;
  });
}

export function redraw() {
  const size = SIZES[state.sizeKey];
  if (canvas.width !== size.w || canvas.height !== size.h) {
    canvas.width = size.w;
    canvas.height = size.h;
  }
  drawCover(canvas, state);
  syncPanelCards();
}

function syncPanelCards() {
  state.panels.forEach((panel, i) => {
    const card = document.querySelector(`.panel-card[data-panel="${i}"]`);
    if (!card) return;
    card.classList.toggle('selected', state.selected === i);
    card.classList.toggle('has-photo', !!panel.img);
    const zoom = card.querySelector('.zoom');
    if (zoom && Number(zoom.value) !== Math.round(panel.zoom * 100)) zoom.value = Math.round(panel.zoom * 100);
    const fit = card.querySelector('.fit');
    if (fit && fit.value !== panel.fit) fit.value = panel.fit;
  });
}

async function setPanelPhoto(index, fileOrUrl) {
  const img = typeof fileOrUrl === 'string'
    ? await loadImage(fileOrUrl)
    : await loadImage(URL.createObjectURL(fileOrUrl));
  const panel = state.panels[index];
  panel.img = img;
  panel.zoom = 1;
  panel.ox = 0;
  panel.oy = 0;
  state.selected = index;
  redraw();
}

function buildPanelCards() {
  const host = $('panels');
  host.innerHTML = '';
  state.panels.forEach((panel, i) => {
    const card = document.createElement('div');
    card.className = 'panel-card';
    card.dataset.panel = String(i);
    card.innerHTML = `
      <div class="panel-head"><strong>Panel ${i + 1}</strong><span class="panel-state"></span></div>
      <label class="file-label">Choose photo
        <input type="file" accept="image/*" data-panel="${i}">
      </label>
      <label>Zoom <input class="zoom" type="range" min="100" max="300" value="100" data-panel="${i}"></label>
      <label>Fit
        <select class="fit" data-panel="${i}">
          <option value="fill">Fill</option>
          <option value="fit">Fit</option>
        </select>
      </label>
      <button type="button" class="sample-btn" data-sample="pier" data-panel="${i}">Try pier sample</button>
      <button type="button" class="sample-btn" data-sample="boulevard" data-panel="${i}">Try boulevard sample</button>`;
    host.appendChild(card);
  });
  host.querySelectorAll('input[type=file]').forEach((input) => {
    input.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try { await setPanelPhoto(Number(input.dataset.panel), file); }
      catch { statusEl.textContent = 'That file could not be read as a photo.'; }
    });
  });
  host.querySelectorAll('.zoom').forEach((slider) => {
    slider.addEventListener('input', () => {
      const panel = state.panels[Number(slider.dataset.panel)];
      panel.zoom = Number(slider.value) / 100;
      state.selected = Number(slider.dataset.panel);
      redraw();
    });
  });
  host.querySelectorAll('.fit').forEach((select) => {
    select.addEventListener('change', () => {
      const panel = state.panels[Number(select.dataset.panel)];
      panel.fit = select.value;
      state.selected = Number(select.dataset.panel);
      redraw();
    });
  });
  host.querySelectorAll('.sample-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      try { await setPanelPhoto(Number(btn.dataset.panel), `samples/${btn.dataset.sample}.jpg`); }
      catch { statusEl.textContent = 'Sample photo failed to load.'; }
    });
  });
  // Drag-and-drop onto a panel card.
  host.querySelectorAll('.panel-card').forEach((card) => {
    card.addEventListener('dragover', (e) => { e.preventDefault(); card.classList.add('drag-over'); });
    card.addEventListener('dragleave', () => card.classList.remove('drag-over'));
    card.addEventListener('drop', async (e) => {
      e.preventDefault();
      card.classList.remove('drag-over');
      const file = e.dataTransfer.files && e.dataTransfer.files[0];
      if (!file || !file.type.startsWith('image/')) return;
      try { await setPanelPhoto(Number(card.dataset.panel), file); }
      catch { statusEl.textContent = 'That file could not be read as a photo.'; }
    });
    card.addEventListener('click', (e) => {
      if (e.target.closest('input, select, button, label')) return;
      state.selected = Number(card.dataset.panel);
      redraw();
    });
  });
}

function buildOptionButtons(hostId, entries, current, onPick) {
  const host = $(hostId);
  host.innerHTML = '';
  entries.forEach(([key, label]) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = label;
    btn.dataset.value = key;
    btn.classList.toggle('active', key === current);
    btn.addEventListener('click', () => {
      onPick(key);
      host.querySelectorAll('button').forEach((b) => b.classList.toggle('active', b === btn));
    });
    host.appendChild(btn);
  });
}

function wireControls() {
  buildOptionButtons('layout-btns', Object.entries(LAYOUTS), state.layout, (key) => {
    state.layout = key;
    redraw();
  });
  buildOptionButtons('grade-btns', Object.entries(GRADES).map(([k, g]) => [k, g.name]), state.grade, (key) => {
    state.grade = key;
    redraw();
  });
  buildOptionButtons('size-btns', Object.entries(SIZES).map(([k, s]) => [k, s.label]), state.sizeKey, (key) => {
    state.sizeKey = key;
    redraw();
  });
  const colours = [
    ['#ffffff', 'White'], ['#ffd76a', 'Yellow'], ['#ff7ab8', 'Pink'], ['#37e6ff', 'Cyan'],
  ];
  buildOptionButtons('colour-btns', colours, state.titleColor, (key) => {
    state.titleColor = key;
    redraw();
  });

  $('title').addEventListener('input', (e) => { state.title = e.target.value; redraw(); });
  $('subtitle').addEventListener('input', (e) => { state.subtitle = e.target.value; redraw(); });
  $('decorations').addEventListener('change', (e) => { state.decorations = e.target.checked; redraw(); });

  $('fill-all').addEventListener('click', () => {
    const first = state.panels[0].img;
    if (!first) { statusEl.textContent = 'Load a photo into Panel 1 first, then fill all panels with it.'; return; }
    state.panels.forEach((panel) => {
      panel.img = first;
      panel.zoom = 1;
      panel.ox = 0;
      panel.oy = 0;
    });
    statusEl.textContent = 'Panel 1 photo now fills all three panels.';
    redraw();
  });

  $('export').addEventListener('click', () => {
    const size = SIZES[state.sizeKey];
    canvas.toBlob((blob) => {
      if (!blob) { statusEl.textContent = 'Export failed — please try again.'; return; }
      const name = `sunset-cover-${size.w}x${size.h}.png`;
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = name;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
      statusEl.textContent = `Saved ${name} (${size.w} × ${size.h} PNG).`;
      window.__exportedName = name;
      window.__exportedBlob = blob;
    }, 'image/png');
  });

  // Drag a photo inside the canvas to reposition it.
  let drag = null;
  canvas.addEventListener('pointerdown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    // Reuse the layout math from cover.js via a local copy of the rects.
    const gap = Math.round(Math.min(canvas.width, canvas.height) * 0.012);
    let rects;
    if (state.layout === 'triptych') {
      const pw = (canvas.width - gap * 2) / 3;
      rects = [0, 1, 2].map((i) => ({ x: i * (pw + gap), y: 0, w: pw, h: canvas.height }));
    } else if (state.layout === 'single') {
      rects = [{ x: 0, y: 0, w: canvas.width, h: canvas.height }];
    } else {
      const leftW = Math.round(canvas.width * 0.62);
      const rightW = canvas.width - leftW - gap;
      const halfH = (canvas.height - gap) / 2;
      rects = [
        { x: 0, y: 0, w: leftW, h: canvas.height },
        { x: leftW + gap, y: 0, w: rightW, h: halfH },
        { x: leftW + gap, y: halfH + gap, w: rightW, h: halfH },
      ];
    }
    const idx = rects.findIndex((r) => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h);
    if (idx === -1 || !state.panels[idx].img) return;
    state.selected = idx;
    drag = { idx, startX: x, startY: y, ox: state.panels[idx].ox, oy: state.panels[idx].oy };
    canvas.setPointerCapture(e.pointerId);
    redraw();
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    const panel = state.panels[drag.idx];
    panel.ox = drag.ox + (x - drag.startX);
    panel.oy = drag.oy + (y - drag.startY);
    redraw();
  });
  const endDrag = () => { drag = null; };
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);
}

buildPanelCards();
wireControls();

const params = new URLSearchParams(location.search);
const shot = params.get('shot');
if (shot) {
  runShot(shot, params, { state, SIZES, loadImage, redraw, setPanelPhoto });
} else {
  redraw();
}
