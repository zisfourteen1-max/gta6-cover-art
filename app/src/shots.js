// Fixed scenes for screenshots: ?shot=cover shows the cover alone with
// the controls hidden; ?shot=editor shows the full editor with a sample
// photo loaded. Query keys: photo (pier/boulevard), caption, subtitle,
// layout (hero/triptych/single), grade (sunset/neon/golden), size
// (square/portrait/wide), colour (a CSS colour) and decorations (0/1).
// window.__shotReady is set once the scene has painted.
export async function runShot(shot, query, app) {
  const { state, SIZES, loadImage, redraw, setPanelPhoto } = app;
  if (shot === 'cover') document.body.classList.add('shot-cover');
  if (query.get('layout')) state.layout = query.get('layout');
  if (query.get('grade')) state.grade = query.get('grade');
  if (query.get('size') && SIZES[query.get('size')]) state.sizeKey = query.get('size');
  if (query.get('colour')) state.titleColor = query.get('colour');
  if (query.get('decorations') === '0') state.decorations = false;
  state.title = query.get('caption') ?? 'Sunset Heist';
  state.subtitle = query.get('subtitle') ?? 'Vice City Nights';
  const titleInput = document.getElementById('title');
  const subtitleInput = document.getElementById('subtitle');
  if (titleInput) titleInput.value = state.title;
  if (subtitleInput) subtitleInput.value = state.subtitle;
  const photo = query.get('photo') ?? 'pier';
  await setPanelPhoto(0, `samples/${photo}.jpg`);
  // A second sample fills the right-hand panels so multi-panel covers
  // photograph well even from a single ?shot= URL.
  const other = photo === 'pier' ? 'boulevard' : 'pier';
  try {
    await setPanelPhoto(1, `samples/${other}.jpg`);
    await setPanelPhoto(2, `samples/${photo}.jpg`);
  } catch { /* one photo is enough for a cover */ }
  state.selected = 0;
  redraw();
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  window.__shotReady = true;
}
