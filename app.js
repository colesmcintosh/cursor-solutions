// Configuration
const VIDEOS_PER_PAGE = 15; // 5 columns x 3 rows
const CURSOR_LOGO = 'https://mintlify.s3.us-west-1.amazonaws.com/cursor/images/logo/app-logo.svg';

// State
let currentPage = 1;
let filteredVideos = [];

// Fisher-Yates shuffle algorithm
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Initialize with shuffled videos
function initializeVideos() {
    filteredVideos = shuffleArray([...videos]);
    displayVideos();
}

// DOM Elements
const videoGrid = document.getElementById('videoGrid');
const paginationContainer = document.getElementById('pagination');
const searchInput = document.getElementById('searchInput');

// Functions
function validateImageUrl(url) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
    });
}

async function getThumbnailUrl(video) {
    if (!video.thumbnails) return CURSOR_LOGO;
    
    // Try each thumbnail quality in order
    const qualities = ['maxres', 'hq', 'mq', 'sd', 'default'];
    for (const quality of qualities) {
        const url = video.thumbnails[quality];
        if (url && await validateImageUrl(url)) {
            return url;
        }
    }
    
    // If no thumbnail works, use Cursor logo
    return CURSOR_LOGO;
}

function truncateTitle(title, maxLength = 60) {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength).trim() + '...';
}

function createVideoCard(video) {
    const card = document.createElement('div');
    card.className = 'video-card';
    
    // Create placeholder first
    card.innerHTML = `
        <div class="aspect-w-16">
            <div class="w-full h-[140px] flex items-center justify-center">
                <img 
                    src="${CURSOR_LOGO}"
                    alt="${video.title}"
                    class="w-12 h-12 opacity-30"
                >
            </div>
            <div class="tag-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <circle cx="7" cy="7" r="2" stroke="white" stroke-width="2"/>
                </svg>
            </div>
            <div class="tag-tooltip">
                <div class="tag-container">
                    ${video.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            </div>
        </div>
        <div class="p-3 pb-4 flex flex-col flex-1">
            <a 
                href="${video.link}" 
                target="_blank"
                class="title-link"
                title="${video.title}"
            >
                <h3 class="text-sm font-medium hover:text-white transition-colors">${truncateTitle(video.title)}</h3>
            </a>
            <div class="mt-auto flex justify-end">
                <a 
                    href="${video.link}" 
                    target="_blank"
                    class="watch-button"
                >
                    Watch Video
                </a>
            </div>
        </div>
    `;
    
    // Try to load actual thumbnail
    getThumbnailUrl(video).then(thumbnailUrl => {
        const thumbnailContainer = card.querySelector('.aspect-w-16');
        if (thumbnailUrl !== CURSOR_LOGO) {
            const tagIcon = thumbnailContainer.querySelector('.tag-icon');
            const tagTooltip = thumbnailContainer.querySelector('.tag-tooltip');
            thumbnailContainer.innerHTML = `
                <a href="${video.link}" target="_blank" class="block w-full h-full">
                    <img 
                        src="${thumbnailUrl}"
                        alt="${video.title}"
                        class="w-full h-[140px] object-cover hover:opacity-75 transition-opacity"
                        onerror="this.onerror=null; this.src='${CURSOR_LOGO}'; this.className='w-12 h-12 opacity-30 m-auto';"
                    >
                </a>
                <div class="tag-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <circle cx="7" cy="7" r="2" stroke="white" stroke-width="2"/>
                    </svg>
                </div>
                <div class="tag-tooltip">
                    <div class="tag-container">
                        ${video.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                </div>
            `;
        }
    });
    
    return card;
}

function displayVideos() {
    const startIndex = (currentPage - 1) * VIDEOS_PER_PAGE;
    const endIndex = startIndex + VIDEOS_PER_PAGE;
    const videosToDisplay = filteredVideos.slice(startIndex, endIndex);
    
    // Clear current videos
    videoGrid.innerHTML = '';
    
    // Add new videos
    videosToDisplay.forEach(video => {
        videoGrid.appendChild(createVideoCard(video));
    });
    
    updatePagination();
}

function updatePagination() {
    const totalPages = Math.ceil(filteredVideos.length / VIDEOS_PER_PAGE);
    paginationContainer.innerHTML = '';
    
    // Previous button
    if (totalPages > 1) {
        const prevButton = createPaginationButton('Previous', currentPage > 1);
        prevButton.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                displayVideos();
            }
        });
        paginationContainer.appendChild(prevButton);
    }
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = createPaginationButton(i, true, i === currentPage);
        pageButton.addEventListener('click', () => {
            currentPage = i;
            displayVideos();
        });
        paginationContainer.appendChild(pageButton);
    }
    
    // Next button
    if (totalPages > 1) {
        const nextButton = createPaginationButton('Next', currentPage < totalPages);
        nextButton.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                displayVideos();
            }
        });
        paginationContainer.appendChild(nextButton);
    }
}

function createPaginationButton(text, enabled, isActive = false) {
    const button = document.createElement('button');
    button.innerText = text;
    button.className = `
        pagination-button
        px-6 py-2 rounded-md font-medium tracking-tight
        ${isActive ? 'active' : 'text-brand-neutrals-400'}
        ${enabled ? 'cursor-pointer hover:shadow-sm' : 'cursor-not-allowed opacity-50'}
    `;
    return button;
}

function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    // When searching, shuffle the filtered results
    filteredVideos = shuffleArray(
        videos.filter(video => 
            video.title.toLowerCase().includes(searchTerm)
        )
    );
    currentPage = 1;
    displayVideos();
}

// Event Listeners
searchInput.addEventListener('input', handleSearch);

// Initial display with shuffled videos
initializeVideos(); 