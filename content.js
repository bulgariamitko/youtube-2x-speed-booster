// YouTube 2x Speed Booster Content Script
// Plays videos at 2x, except music videos, which always play at normal (1x) speed.
// Runs in the page's MAIN world so it can read YouTube's player data (video category).

// Configuration
const TARGET_SPEED = 2.0;
const MUSIC_SPEED = 1.0;
const PROCESSED_VIDEOS = new WeakSet();

function getCurrentVideoId() {
    try {
        const url = new URL(location.href);
        if (url.searchParams.get('v')) return url.searchParams.get('v');
        const shorts = url.pathname.match(/^\/shorts\/([^/?#]+)/);
        if (shorts) return shorts[1];
    } catch (e) { /* ignore */ }
    return null;
}

// Category from YouTube's own player data (most reliable signal)
function getCategoryFromPlayer() {
    try {
        const player = document.getElementById('movie_player');
        if (!player || typeof player.getPlayerResponse !== 'function') return null;
        const resp = player.getPlayerResponse();
        if (!resp) return null;
        // Make sure the data belongs to the current video, not the previous one
        const currentId = getCurrentVideoId();
        const respId = resp.videoDetails && resp.videoDetails.videoId;
        if (currentId && respId && currentId !== respId) return null;
        const mf = resp.microformat && resp.microformat.playerMicroformatRenderer;
        return (mf && mf.category) || null;
    } catch (e) {
        return null;
    }
}

function isMusicVideo() {
    // YouTube Music site: everything is music
    if (location.hostname === 'music.youtube.com') return true;

    const category = getCategoryFromPlayer();
    if (category) return category === 'Music';

    // Fallback heuristics from the watch page DOM
    const meta = document.querySelector('ytd-watch-metadata');
    if (meta) {
        // "Music" section in the description (licensed songs)
        if (meta.querySelector('ytd-video-description-music-section-renderer')) return true;
        // Official Artist Channel badge
        if (meta.querySelector('#owner .badge-style-type-verified-artist')) return true;
        // Auto-generated "Artist - Topic" channels and VEVO channels
        const channel = meta.querySelector('#owner #channel-name a');
        const name = channel ? channel.textContent.trim() : '';
        if (/ - Topic$/.test(name) || /VEVO$/i.test(name)) return true;
    }
    return false;
}

function getTargetSpeed() {
    return isMusicVideo() ? MUSIC_SPEED : TARGET_SPEED;
}

function applySpeed(video) {
    const speed = getTargetSpeed();
    if (video.playbackRate !== speed) {
        video.playbackRate = speed;
    }
}

function setVideoSpeed() {
    const videos = document.getElementsByTagName('video');

    for (let video of videos) {
        // Re-apply on every pass: YouTube reuses the same <video> element across
        // navigations, so the right speed can change (e.g. regular video -> music video)
        if (video.readyState >= 1) {
            applySpeed(video);
        }

        // Only attach listeners once per video element
        if (PROCESSED_VIDEOS.has(video)) {
            continue;
        }
        PROCESSED_VIDEOS.add(video);

        // Handle video loading
        video.addEventListener('loadedmetadata', function () {
            applySpeed(video);
        });

        // Handle video starting
        video.addEventListener('play', function () {
            applySpeed(video);
        });

        // Keep the desired speed if something changes it
        video.addEventListener('ratechange', function () {
            // Small delay to allow YouTube's own speed changes
            setTimeout(() => applySpeed(video), 100);
        });

        // Handle dynamically loaded videos
        video.addEventListener('loadstart', function () {
            setTimeout(() => applySpeed(video), 100);
        });
    }
}

// Initial setup with delay for page load
setTimeout(setVideoSpeed, 1000);

// Create an observer to handle dynamically added videos (YouTube SPA navigation)
const observer = new MutationObserver(function (mutations) {
    let shouldCheck = false;

    mutations.forEach(function (mutation) {
        if (mutation.addedNodes.length) {
            for (let node of mutation.addedNodes) {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    // Check if video elements were added
                    if (node.tagName === 'VIDEO' || node.querySelector('video')) {
                        shouldCheck = true;
                        break;
                    }
                }
            }
        }
    });

    if (shouldCheck) {
        // Delay to allow YouTube to initialize the video
        setTimeout(setVideoSpeed, 500);
    }
});

// Start observing the document
observer.observe(document.body, {
    childList: true,
    subtree: true
});

// Handle YouTube's single-page application navigation
let lastUrl = location.href;
new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
        lastUrl = url;
        // YouTube navigation detected, wait for video to load
        setTimeout(setVideoSpeed, 1500);
    }
}).observe(document, { subtree: true, childList: true });

// YouTube fires this when a navigation finishes and the new video's data is ready
document.addEventListener('yt-navigate-finish', () => {
    setVideoSpeed();
    setTimeout(setVideoSpeed, 500);
});
document.addEventListener('yt-page-data-updated', setVideoSpeed);

// Also check periodically (fallback; also catches category info that loads late)
setInterval(() => {
    setVideoSpeed();
}, 1000);

console.log('YouTube 2x Speed Booster loaded (music videos play at 1x)');
