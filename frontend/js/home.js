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

let allVideos = [];
let searchTimeout;

// Load all videos and organize by genre
async function loadVideos() {
    try {
        const token = getToken();
        const response = await fetch('http://localhost:5000/api/videos', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch videos');
        }
        
        allVideos = await response.json();
        displayVideosByGenre(allVideos);
    } catch (error) {
        console.error('Error loading videos:', error);
        document.getElementById('genres-container').innerHTML = `
            <div class="empty-state">
                <h3>Error Loading Videos</h3>
                <p>Unable to load videos. Please try again later.</p>
            </div>
        `;
    }
}

// Display videos organized by genre
function displayVideosByGenre(videos) {
    const container = document.getElementById('genres-container');
    
    if (videos.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No Videos Available Yet</h3>
                <p>Go to the Admin Panel to add your first video!</p>
                ${user && user.isAdmin ? '<button class="btn btn-primary" onclick="window.location.href=\'admin.html\'">Go to Admin Panel</button>' : ''}
            </div>
        `;
        return;
    }
    
    // Group videos by genre
    const videosByGenre = {};
    videos.forEach(video => {
        if (!videosByGenre[video.genre]) {
            videosByGenre[video.genre] = [];
        }
        videosByGenre[video.genre].push(video);
    });
    
    // Create HTML for each genre section
    let html = '';
    Object.keys(videosByGenre).sort().forEach(genre => {
        const genreVideos = videosByGenre[genre];
        
        html += `
            <div class="genre-section">
                <h2 class="section-title">
                    ${genre}
                    <a href="category.html?genre=${encodeURIComponent(genre)}" 
                       style="font-size: 14px; color: var(--accent-beige); text-decoration: none; margin-left: auto; font-family: var(--font-body);">
                        View All →
                    </a>
                </h2>
                <div class="video-grid">
        `;
        
        // Show first 6 videos of each genre
        genreVideos.slice(0, 6).forEach(video => {
            html += createVideoCard(video);
        });
        
        html += `
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Create video card HTML
function createVideoCard(video) {
    return `
        <div class="video-card" onclick="window.location.href='player.html?id=${video._id}'">
            <img src="${video.thumbnail}" 
                 alt="${video.title}" 
                 class="video-thumbnail"
                 onerror="this.src='https://via.placeholder.com/400x225/1B3C53/D2C1B6?text=No+Thumbnail'">
            <div class="video-info">
                <h3 class="video-title">${video.title}</h3>
                <div class="video-meta">
                    <span class="video-duration">${video.duration}</span>
                    <span class="video-views">👁 ${video.views.toLocaleString()} views</span>
                </div>
                <span class="genre-badge">${video.genre}</span>
            </div>
        </div>
    `;
}

// Search functionality
document.getElementById('search-input').addEventListener('input', (e) => {
    const query = e.target.value.trim();
    
    // Clear previous timeout
    clearTimeout(searchTimeout);
    
    // If search is empty, show all videos by genre
    if (query.length === 0) {
        document.getElementById('search-results').style.display = 'none';
        displayVideosByGenre(allVideos);
        return;
    }
    
    // Debounce search
    searchTimeout = setTimeout(() => {
        if (query.length >= 2) {
            performSearch(query);
        }
    }, 300);
});

// Perform search
async function performSearch(query) {
    try {
        const token = getToken();
        const response = await fetch(`http://localhost:5000/api/videos/search?q=${encodeURIComponent(query)}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Search failed');
        }
        
        const results = await response.json();
        displaySearchResults(results, query);
    } catch (error) {
        console.error('Search error:', error);
        // If search fails, do local search
        const localResults = allVideos.filter(video => 
            video.title.toLowerCase().includes(query.toLowerCase()) ||
            video.description.toLowerCase().includes(query.toLowerCase())
        );
        displaySearchResults(localResults, query);
    }
}

// Display search results
function displaySearchResults(results, query) {
    const searchResultsDiv = document.getElementById('search-results');
    const searchGrid = document.getElementById('search-grid');
    
    // Hide genre sections
    const genresContainer = document.getElementById('genres-container');
    genresContainer.style.display = 'none';
    
    // Show search results
    searchResultsDiv.style.display = 'block';
    
    if (results.length === 0) {
        searchGrid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <h3>No Results Found</h3>
                <p>No videos match your search for "${query}"</p>
            </div>
        `;
        return;
    }
    
    searchGrid.innerHTML = results.map(video => createVideoCard(video)).join('');
}

// Load videos on page load
loadVideos();