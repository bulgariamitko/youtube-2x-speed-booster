// YouTube 2x Speed Booster Content Script

// Configuration
const TARGET_SPEED = 2.0;
const PROCESSED_VIDEOS = new WeakSet();

function setVideoSpeed() {
    const videos = document.getElementsByTagName('video');

    for (let video of videos) {
        // Skip if we've already processed this video
        if (PROCESSED_VIDEOS.has(video)) {
            continue;
        }

        // Mark video as processed
        PROCESSED_VIDEOS.add(video);

        // Set initial speed
        if (video.readyState >= 1) {
            video.playbackRate = TARGET_SPEED;
        }

        // Handle video loading
        video.addEventListener('loadedmetadata', function () {
            video.playbackRate = TARGET_SPEED;
        });

        // Handle video starting
        video.addEventListener('play', function () {
            if (video.playbackRate !== TARGET_SPEED) {
                video.playbackRate = TARGET_SPEED;
            }
        });

        // Prevent manual speed changes from reverting
        video.addEventListener('ratechange', function () {
            // Small delay to allow YouTube's own speed changes
            setTimeout(() => {
                if (video.playbackRate !== TARGET_SPEED) {
                    video.playbackRate = TARGET_SPEED;
                }
            }, 100);
        });

        // Handle dynamically loaded videos
        video.addEventListener('loadstart', function () {
            setTimeout(() => {
                video.playbackRate = TARGET_SPEED;
            }, 100);
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

// Also check periodically for new videos (fallback)
setInterval(() => {
    setVideoSpeed();
}, 3000);

console.log('YouTube 2x Speed Booster loaded');