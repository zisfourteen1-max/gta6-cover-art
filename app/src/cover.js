// Sunset Cover Maker — cover painting.
// Everything here is drawn by hand on a 2D canvas: panel photos, colour
// grades, a slitted sun, palm silhouettes, halftone corners, neon frame
// lines, a vignette, and big slanted caption lettering. No borrowed art,
// no external fonts: lettering uses generic system font families only.

export const GRADES = {
  sunset: {
    name: 'Vice City Sunset',
    sky: ['#ff9a3c', '#ff5e78', '#a03d8f', '#4b2a6b'],
    tint: 'rgba(255, 110, 60, 0.20)',
    deep: 'rgba(120, 30, 90, 0.28)',
    sun: '#ffd76a',
    neon: '#ff5e9c',
    neon2: '#37e6ff',
  },
  neon: {
    name: 'Neon Night',
    sky: ['#0b1035', '#1b2a6b', '#7a1e6e', '#120a24'],
    tint: 'rgba(40, 200, 255, 0.16)',
    deep: 'rgba(255, 40, 160, 0.20)',
    sun: '#ff4fd8',
    neon: '#37e6ff',
    neon2: '#ff4fd8',
  },
  golden: {
    name: 'Golden Hour',
    sky: ['#ffe08a', '#ffb347', '#e87e2e', '#7a3b12'],
    tint: 'rgba(255, 190, 60, 0.22)',
    deep: 'rgba(180, 90, 10, 0.22)',
    sun: '#fff3b0',
    neon: '#ffc233',
    neon2: '#ff7a2e',
  },
};

export const LAYOUTS = {
  hero: 'Hero + Two',
  triptych: 'Triptych',
  single: 'Single Poster',
};

/** Panel rectangles for a layout, as fractions of the canvas size. */
export function panelRects(layout, w, h) {
  const gap = Math.round(Math.min(w, h) * 0.012);
  if (layout === 'triptych') {
    const pw = (w - gap * 2) / 3;
    return [
      { x: 0, y: 0, w: pw, h },
      { x: pw + gap, y: 0, w: pw, h },
      { x: (pw + gap) * 2, y: 0, w: pw, h },
    ];
  }
  if (layout === 'single') return [{ x: 0, y: 0, w, h }];
  const leftW = Math.round(w * 0.62);
  const rightW = w - leftW - gap;
  const halfH = (h - gap) / 2;
  return [
    { x: 0, y: 0, w: leftW, h },
    { x: leftW + gap, y: 0, w: rightW, h: halfH },
    { x: leftW + gap, y: halfH + gap, w: rightW, h: halfH },
  ];
}

function drawPhotoInPanel(ctx, photo, rect, panel) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  if (!photo || !photo.img) {
    const g = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h);
    g.addColorStop(0, '#3a2350');
    g.addColorStop(1, '#1c1030');
    ctx.fillStyle = g;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.font = `600 ${Math.max(14, rect.w * 0.045)}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('Drop a photo here', rect.x + rect.w / 2, rect.y + rect.h / 2);
    ctx.restore();
    return;
  }
  const img = photo.img;
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  const zoom = panel.zoom || 1;
  let scale;
  if (panel.fit === 'fit') scale = Math.min(rect.w / iw, rect.h / ih) * zoom;
  else scale = Math.max(rect.w / iw, rect.h / ih) * zoom;
  const dw = iw * scale;
  const dh = ih * scale;
  const cx = rect.x + rect.w / 2 + (panel.ox || 0);
  const cy = rect.y + rect.h / 2 + (panel.oy || 0);
  ctx.fillStyle = '#140b22';
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.drawImage(img, cx - dw / 2, cy - dh / 2, dw, dh);
  ctx.restore();
}

function drawSlittedSun(ctx, grade, w, h) {
  // Small and high, near the top-right of the big panel's sky, so it
  // stays clear of the centred faces in the sample photos.
  const cx = w * 0.56;
  const cy = h * 0.13;
  const r = Math.min(w, h) * 0.075;
  ctx.save();
  ctx.globalAlpha = 0.92;
  ctx.fillStyle = grade.sun;
  ctx.shadowColor = grade.sun;
  ctx.shadowBlur = r * 0.35;
  const stripes = 8;
  for (let i = 0; i < stripes; i++) {
    const y0 = cy - r + (i * 2 * r) / stripes;
    const y1 = cy - r + ((i + 0.58) * 2 * r) / stripes;
    const ym = (y0 + y1) / 2;
    const dy = Math.abs(ym - cy);
    if (dy >= r) continue;
    const half = Math.sqrt(r * r - dy * dy);
    ctx.fillRect(cx - half, y0, half * 2, y1 - y0);
  }
  ctx.restore();
}

function drawPalm(ctx, x, y, s, lean, colour) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(lean);
  ctx.scale(s, s);
  ctx.strokeStyle = colour;
  ctx.fillStyle = colour;
  ctx.lineCap = 'round';
  // Trunk: a gentle curve made of short segments.
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(6, -55, -4, -110);
  ctx.stroke();
  // Fronds: seven arcs fanning out from the crown.
  ctx.lineWidth = 6;
  for (let i = 0; i < 7; i++) {
    const a = -Math.PI * (0.08 + i * 0.14);
    const ex = Math.cos(a) * 62;
    const ey = -110 + Math.sin(a) * 46;
    ctx.beginPath();
    ctx.moveTo(-4, -110);
    ctx.quadraticCurveTo(Math.cos(a) * 34, -118 + Math.sin(a) * 22, ex, ey + 16);
    ctx.stroke();
  }
  // Coconuts.
  ctx.beginPath();
  ctx.arc(2, -104, 5, 0, Math.PI * 2);
  ctx.arc(-8, -100, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawHalftone(ctx, w, h, colour) {
  ctx.save();
  ctx.fillStyle = colour;
  const step = Math.max(14, w * 0.016);
  for (const [ox, oy] of [[0, 0], [w, 0]]) {
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 7; col++) {
        const d = Math.hypot(row, col);
        const r = Math.max(0.6, (7 - d) * 0.55);
        const x = ox === 0 ? 12 + col * step : w - 12 - col * step;
        const y = oy === 0 ? 12 + row * step : h - 12 - row * step;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  ctx.restore();
}

function drawCaption(ctx, state, w, h) {
  const title = (state.title || '').trim().toUpperCase();
  const sub = (state.subtitle || '').trim().toUpperCase();
  const bandH = h * (state.layout === 'single' ? 0.24 : 0.20);
  const bandY = h - bandH;
  // Caption band: dark gradient so lettering reads over any photo.
  const bg = ctx.createLinearGradient(0, bandY - h * 0.06, 0, h);
  bg.addColorStop(0, 'rgba(10, 4, 24, 0)');
  bg.addColorStop(0.45, 'rgba(10, 4, 24, 0.72)');
  bg.addColorStop(1, 'rgba(10, 4, 24, 0.88)');
  ctx.fillStyle = bg;
  ctx.fillRect(0, bandY - h * 0.06, w, h - bandY + h * 0.06);
  if (!title && !sub) return;
  ctx.save();
  ctx.translate(w / 2, bandY + bandH * 0.52);
  ctx.rotate(-0.035);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  if (title) {
    let size = Math.min(h * 0.115, w * 0.16);
    const family = `'Arial Narrow', 'Helvetica Neue', Impact, 'Franklin Gothic Medium', sans-serif`;
    ctx.font = `900 ${size}px ${family}`;
    ctx.fontStretch = 'condensed';
    while (ctx.measureText(title).width > w * 0.92 && size > 18) {
      size -= 3;
      ctx.font = `900 ${size}px ${family}`;
    }
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(12, 4, 26, 0.95)';
    ctx.lineWidth = size * 0.16;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = size * 0.18;
    ctx.shadowOffsetY = size * 0.06;
    ctx.strokeText(title, 0, -bandH * 0.12);
    ctx.fillStyle = state.titleColor || '#ffffff';
    ctx.fillText(title, 0, -bandH * 0.12);
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
  }
  if (sub) {
    const size = Math.max(13, h * 0.028);
    ctx.font = `700 ${size}px system-ui, sans-serif`;
    try { ctx.letterSpacing = `${Math.round(size * 0.42)}px`; } catch { /* older canvas */ }
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.strokeStyle = 'rgba(12, 4, 26, 0.9)';
    ctx.lineWidth = Math.max(2, size * 0.14);
    const y = title ? bandH * 0.30 : 0;
    ctx.strokeText(sub, 0, y);
    ctx.fillText(sub, 0, y);
    try { ctx.letterSpacing = '0px'; } catch { /* older canvas */ }
  }
  ctx.restore();
}

/**
 * Paints the whole cover onto `canvas` from `state`:
 * { panels:[{img,zoom,ox,oy,fit}], layout, grade, title, subtitle,
 *   titleColor, decorations }.
 */
export function drawCover(canvas, state) {
  const ctx = canvas.getContext('2d');
  const { width: w, height: h } = canvas;
  const grade = GRADES[state.grade] || GRADES.sunset;
  // Sky base so gaps and empty panels still read as a sunset.
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  grade.sky.forEach((c, i) => sky.addColorStop(i / (grade.sky.length - 1), c));
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  const rects = panelRects(state.layout || 'hero', w, h);
  const panels = state.panels || [];
  rects.forEach((rect, i) => drawPhotoInPanel(ctx, panels[i] || null, rect, panels[i] || {}));

  // Colour grade: warm wash over the photos, deeper at the foot.
  ctx.fillStyle = grade.tint;
  ctx.fillRect(0, 0, w, h);
  const deep = ctx.createLinearGradient(0, h * 0.45, 0, h);
  deep.addColorStop(0, 'rgba(0,0,0,0)');
  deep.addColorStop(1, grade.deep);
  ctx.fillStyle = deep;
  ctx.fillRect(0, 0, w, h);

  if (state.decorations !== false) {
    drawSlittedSun(ctx, grade, w, h);
    const palmScale = Math.min(w, h) / 620;
    drawPalm(ctx, w * 0.06, h * 0.99, palmScale * 1.15, 0.10, 'rgba(16, 6, 28, 0.92)');
    drawPalm(ctx, w * 0.97, h * 0.99, palmScale * 0.9, -0.14, 'rgba(16, 6, 28, 0.92)');
    drawHalftone(ctx, w, h, 'rgba(255,255,255,0.55)');
    // Thin neon frame lines.
    const m = Math.round(Math.min(w, h) * 0.018);
    ctx.strokeStyle = grade.neon;
    ctx.lineWidth = Math.max(2, w * 0.004);
    ctx.strokeRect(m, m, w - m * 2, h - m * 2);
    ctx.strokeStyle = grade.neon2;
    ctx.lineWidth = Math.max(1, w * 0.0016);
    ctx.strokeRect(m * 1.9, m * 1.9, w - m * 3.8, h - m * 3.8);
  }

  // Vignette: darken the edges a touch.
  const vg = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.42, w / 2, h / 2, Math.max(w, h) * 0.75);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(8, 2, 18, 0.34)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, w, h);

  drawCaption(ctx, state, w, h);
}
