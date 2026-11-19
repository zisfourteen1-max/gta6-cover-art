# Sunset Cover Maker

[![Competition](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![Rank](https://make.fun/badge/gta6-cover-art-01/zisfourteen1-max/gta6-cover-art/rank.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![Reward](https://make.fun/badge/gta6-cover-art-01/zisfourteen1-max/gta6-cover-art/reward.svg)](https://make.fun/bounty/gta6-cover-art-01)

Turn your own photos into a bold sunset poster cover — the multi-panel poster look with big slanted caption lettering and a Vice City sunset or neon colour grade — and export it as a PNG to share. Everything runs offline in the browser: photos are read on your own machine and never uploaded anywhere.

## What it does

- **Your photos, up to 3:** pick a photo per panel from the file picker, drag-and-drop onto a panel, or try one of the two built-in sample photos with one click.
- **Crop and position each photo:** drag a photo inside the cover to reposition it, zoom with a slider, and switch between Fill and Fit per panel. One button copies the first photo into all three panels.
- **Three layouts:** Hero + Two (one big panel, two stacked), Triptych (three equal vertical panels), and Single Poster (one big panel with a caption band).
- **Caption:** a main title (up to 40 characters) in huge bold condensed capitals with a dark outline and drop shadow, slightly slanted, plus a widely-spaced subtitle — in white, yellow, pink, or cyan.
- **Three colour grades:** Vice City Sunset (orange to pink to purple), Neon Night (cyan and magenta on dark), and Golden Hour (warm gold), applied as gradient overlays and a tint over the photos.
- **Hand-drawn decorations:** a sun disc with horizontal slits, palm tree silhouettes, a halftone dot pattern in the corners, thin neon frame lines, and a vignette — all drawn by the app's own canvas code, with a toggle to turn them off.
- **Three post sizes:** 1080 × 1080, 1080 × 1350, and 1920 × 1080. Export PNG downloads the cover at exactly the chosen size.

All lettering uses generic system font families and all decoration is the app's own code — no borrowed logos, artwork, or game fonts.

## Run it

```sh
node serve.ts
```

Then open <http://localhost:8080> in a desktop browser. No build step, no network requests: the app is plain static files under `app/`.

## Screenshots

`shots.json` defines four deterministic scenes (`?shot=cover` for a cover alone, `?shot=editor` for the full editor with a sample photo loaded); `screenshots/` holds the rendered results.

---

Built for the [make.fun](https://make.fun/?ref=hzxjewxt) bounty — referral code `hzxjewxt`.
