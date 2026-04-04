// Check authentication
checkAuth();

// Display user info
const user = getUser();
if (user) {
    document.getElementById('user-name').textContent = user.name;
    if (user.isAdmin) {
        document.getElementById('admin-link').innerHTML = '<a href="admin.html">Admin Panel</a>';
    }
}

// Get video ID from URL
const urlParams = new URLSearchParams(window.location.search);
const videoId = urlParams.get('id');

if (!videoId) {
    window.location.href = 'home.html';
}

// Load and display video
async function loadVideo() {
    try {
        const token = getToken();
        const response = await fetch(`http://localhost:5000/api/videos/${videoId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch video');
        }
        
        const video = await response.json();
        displayVideo(video);
    } catch (error) {
        console.error('Error loading video:', error);
        document.getElementById('player-wrapper').innerHTML = `
            <div class="empty-state">
                <h3>Error Loading Video</h3>
                <p>Unable to load this video. Please try again later.</p>
                <button class="btn btn-primary" onclick="window.location.href='home.html'">Back to Home</button>
            </div>
        `;
    }
}

// Display video player
function displayVideo(video) {
    const wrapper = document.getElementById('player-wrapper');
    
    wrapper.innerHTML = `
        <div class="player-container">
            <div class="video-player-wrapper" id="video-wrapper">
                <video id="video-player" class="video-player">
                    <source src="${video.videoUrl}" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
                
                <div class="player-controls" id="player-controls">
                    <div class="progress-bar" id="progress-bar">
                        <div class="progress-filled" id="progress-filled"></div>
                    </div>
                    
                    <div class="controls-bottom">
                        <div class="controls-left">
                            <button class="control-btn" id="play-pause-btn">▶</button>
                            <button class="control-btn" id="mute-btn">🔊</button>
                            <input type="range" class="volume-slider" id="volume-slider" min="0" max="100" value="100">
                            <span id="time-display" style="color: white; font-size: 14px; margin-left: 10px;">0:00 / 0:00</span>
                        </div>
                        
                        <div class="controls-right">
                            <select class="speed-select" id="speed-select">
                                <option value="0.5">0.5x</option>
                                <option value="0.75">0.75x</option>
                                <option value="1" selected>1x</option>
                                <option value="1.25">1.25x</option>
                                <option value="1.5">1.5x</option>
                                <option value="2">2x</option>
                            </select>
                            <button class="control-btn" id="fullscreen-btn">⛶</button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="video-details">
                <h1>${video.title}</h1>
                <p>${video.description}</p>
                
                <div class="video-stats">
                    <div class="stat-item">
                        <span>📁</span>
                        <span class="genre-badge">${video.genre}</span>
                    </div>
                    <div class="stat-item">
                        <span>⏱</span>
                        <span>${video.duration}</span>
                    </div>
                    <div class="stat-item">
                        <span>👁</span>
                        <span>${video.views.toLocaleString()} views</span>
                    </div>
                    <div class="stat-item">
                        <span>📅</span>
                        <span>${new Date(video.uploadDate).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    initializePlayer();
}

// Initialize video player controls
function initializePlayer() {
    const videoPlayer = document.getElementById('video-player');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const muteBtn = document.getElementById('mute-btn');
    const volumeSlider = document.getElementById('volume-slider');
    const speedSelect = document.getElementById('speed-select');
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const progressBar = document.getElementById('progress-bar');
    const progressFilled = document.getElementById('progress-filled');
    const timeDisplay = document.getElementById('time-display');
    
    // Play/Pause
    playPauseBtn.addEventListener('click', () => {
        if (videoPlayer.paused) {
            videoPlayer.play();
            playPauseBtn.textContent = '⏸';
        } else {
            videoPlayer.pause();
            playPauseBtn.textContent = '▶';
        }
    });
    
    // Click on video to play/pause
    videoPlayer.addEventListener('click', () => {
        playPauseBtn.click();
    });
    
    // Mute/Unmute
    muteBtn.addEventListener('click', () => {
        videoPlayer.muted = !videoPlayer.muted;
        muteBtn.textContent = videoPlayer.muted ? '🔇' : '🔊';
        volumeSlider.value = videoPlayer.muted ? 0 : videoPlayer.volume * 100;
    });
    
    // Volume control
    volumeSlider.addEventListener('input', (e) => {
        const volume = e.target.value / 100;
        videoPlayer.volume = volume;
        videoPlayer.muted = volume === 0;
        muteBtn.textContent = volume === 0 ? '🔇' : '🔊';
    });
    
    // Playback speed
    speedSelect.addEventListener('change', (e) => {
        videoPlayer.playbackRate = parseFloat(e.target.value);
    });
    
    // Fullscreen
    fullscreenBtn.addEventListener('click', () => {
        const videoWrapper = document.getElementById('video-wrapper');
        if (!document.fullscreenElement) {
            if (videoWrapper.requestFullscreen) {
                videoWrapper.requestFullscreen();
            } else if (videoWrapper.webkitRequestFullscreen) {
                videoWrapper.webkitRequestFullscreen();
            } else if (videoWrapper.msRequestFullscreen) {
                videoWrapper.msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    });
    
    // Progress bar
    videoPlayer.addEventListener('timeupdate', () => {
        const percent = (videoPlayer.currentTime / videoPlayer.duration) * 100;
        progressFilled.style.width = `${percent}%`;
        
        // Update time display
        const currentTime = formatTime(videoPlayer.currentTime);
        const duration = formatTime(videoPlayer.duration);
        timeDisplay.textContent = `${currentTime} / ${duration}`;
    });
    
    // Seek
    progressBar.addEventListener('click', (e) => {
        const rect = progressBar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        videoPlayer.currentTime = percent * videoPlayer.duration;
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        switch(e.key) {
            case ' ':
            case 'k':
                e.preventDefault();
                playPauseBtn.click();
                break;
            case 'f':
                fullscreenBtn.click();
                break;
            case 'm':
                muteBtn.click();
                break;
            case 'ArrowLeft':
                videoPlayer.currentTime -= 5;
                break;
            case 'ArrowRight':
                videoPlayer.currentTime += 5;
                break;
            case 'ArrowUp':
                e.preventDefault();
                videoPlayer.volume = Math.min(1, videoPlayer.volume + 0.1);
                volumeSlider.value = videoPlayer.volume * 100;
                break;
            case 'ArrowDown':
                e.preventDefault();
                videoPlayer.volume = Math.max(0, videoPlayer.volume - 0.1);
                volumeSlider.value = videoPlayer.volume * 100;
                break;
        }
    });
    
    // Auto-hide controls
    let controlsTimeout;
    const videoWrapper = document.getElementById('video-wrapper');
    const playerControls = document.getElementById('player-controls');
    
    videoWrapper.addEventListener('mousemove', () => {
        playerControls.style.opacity = '1';
        clearTimeout(controlsTimeout);
        
        if (!videoPlayer.paused) {
            controlsTimeout = setTimeout(() => {
                playerControls.style.opacity = '0';
            }, 3000);
        }
    });
    
    videoWrapper.addEventListener('mouseleave', () => {
        if (!videoPlayer.paused) {
            playerControls.style.opacity = '0';
        }
    });
    
    videoPlayer.addEventListener('play', () => {
        controlsTimeout = setTimeout(() => {
            playerControls.style.opacity = '0';
        }, 3000);
    });
    
    videoPlayer.addEventListener('pause', () => {
        playerControls.style.opacity = '1';
        clearTimeout(controlsTimeout);
    });
}

// Format time (seconds to MM:SS)
function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Load video on page load
loadVideo();