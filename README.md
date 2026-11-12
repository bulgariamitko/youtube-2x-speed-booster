# YouTube 2x Speed Booster

A Chrome extension that automatically sets YouTube videos to play at 2x speed.

## Features

- Automatically sets all YouTube videos to 2x speed
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

## Customization

To change the playback speed, modify the `TARGET_SPEED` constant in `content.js`:

```javascript
const TARGET_SPEED = 2.0; // Change this to your desired speed
```

## Permissions

- `activeTab` - Required to access and modify YouTube pages
