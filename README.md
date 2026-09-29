# Emotion Wheel

A static site: open `index.html` in a browser, or upload the folder to any static host.

## Adding content

Everything lives in `js/data.js`.

- **Descriptions** are in `EMOTIONS`, next to each emotion name.
- **Insight, formula, regulate text, video, audio** go in `CONTENT`, keyed by the emotion id
  (`happy`, `happy/content`, `happy/content/joyful`). Anything missing falls back to the
  parent emotion, and the page shows a small "From Happy" tag when it does.
- **F / M versions:** put overrides under `f:` or `m:`, for example
  `f: { video: 'videos/happy-f.mp4' }`.

## Media

- Videos go in `videos/` (MP4, H.264). Set `video: 'videos/happy.mp4'` for the emotion.
- Audio: "Nature sound" and "Brown noise" are generated in the browser, so they need no files
  or licences. Happy also gets a soft generated melody (`audio: { music: true }`).
  To use a real recording instead, drop a royalty-free track (for example CC0 from
  freesound.org or a track under the Pixabay Content License) into `audio/` and set
  `audio: { src: 'audio/happy.mp3' }`.
