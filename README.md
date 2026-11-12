# YouTube 2x Speed Booster

A Chrome extension that automatically sets YouTube videos to play at 2x speed, while music videos always play at normal (1x) speed.

## Features

- Automatically sets YouTube videos to 2x speed
- Music videos always play at normal 1x speed
- Works with dynamically loaded videos
- Handles YouTube's single-page application navigation
- Prevents manual speed changes from reverting
- Lightweight and efficient

## Installation

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked" button
4. Select the folder containing this extension
5. The extension will be loaded and active

## Files

- `manifest.json` - Extension configuration and permissions
- `content.js` - Main script that handles video speed modification

## How it works

The extension uses:

- Content scripts to inject JavaScript into YouTube pages
- MutationObserver to detect new videos being loaded
- Event listeners to maintain 2x speed across video state changes
- URL change detection for YouTube's SPA navigation

## Music video detection

A video is treated as music (played at 1x) when:

- It is on YouTube Music (`music.youtube.com`), or
- YouTube's player data lists its category as **Music**, or (as a fallback)
- The description has a Music section, the channel has the Official Artist Channel badge, or the channel name ends in `- Topic` or `VEVO`

The content script runs in the page's `MAIN` world so it can read the player's video category.

## Customization

To change the playback speed, modify the `TARGET_SPEED` constant in `content.js`:

```javascript
const TARGET_SPEED = 2.0; // Change this to your desired speed
const MUSIC_SPEED = 1.0;  // Speed for music videos
```

## Permissions

- `activeTab` - Required to access and modify YouTube pages
