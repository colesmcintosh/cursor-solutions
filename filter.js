// Get all unique tags from videos
const getAllTags = () => {
    const tagSet = new Set();
    videos.forEach(video => {
        video.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
};

// Initialize filter state
let selectedTags = new Set();
let isFiltering = false;

// Filter videos based on selected tags and search term
function filterVideos() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    let results = videos;
    
    // Apply search filter
    if (searchTerm) {
        results = results.filter(video => 
            video.title.toLowerCase().includes(searchTerm)
        );
    }
    
    // Apply tag filter
    if (isFiltering && selectedTags.size > 0) {
        results = results.filter(video => 
            video.tags.some(tag => selectedTags.has(tag))
        );
    }
    
    return shuffleArray([...results]);
}

// Populate tags in the modal
const populateTagsList = () => {
    const tagsList = document.getElementById('tagsList');
    const allTags = getAllTags();
    
    tagsList.innerHTML = allTags.map(tag => `
        <div class="tag-checkbox ${selectedTags.has(tag) ? 'selected' : ''}" data-tag="${tag}">
            <input type="checkbox" id="tag-${tag}" value="${tag}" 
                ${selectedTags.has(tag) ? 'checked' : ''}>
            <label for="tag-${tag}">${tag}</label>
        </div>
    `).join('');

    // Add event listeners to tag containers
    tagsList.querySelectorAll('.tag-checkbox').forEach(container => {
        container.addEventListener('click', (e) => {
            const checkbox = container.querySelector('input[type="checkbox"]');
            const tag = container.dataset.tag;
            
            // Toggle checkbox state
            checkbox.checked = !checkbox.checked;
            container.classList.toggle('selected');
            
            // Update selected tags
            if (checkbox.checked) {
                selectedTags.add(tag);
            } else {
                selectedTags.delete(tag);
            }
            
            // Prevent checkbox click from triggering twice
            e.preventDefault();
        });
    });
};

// Modal functionality
const modal = document.getElementById('filterModal');
const filterButton = document.getElementById('filterButton');
const closeButton = document.querySelector('.close-modal');
const applyButton = document.getElementById('applyFilters');
const clearButton = document.getElementById('clearFilters');

// Show modal
filterButton.addEventListener('click', () => {
    modal.classList.add('active');
    populateTagsList();
});

// Close modal when clicking outside
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.remove('active');
    }
});

// Close modal with close button
closeButton.addEventListener('click', () => {
    modal.classList.remove('active');
});

// Apply filters
applyButton.addEventListener('click', () => {
    isFiltering = selectedTags.size > 0;
    filteredVideos = filterVideos();
    currentPage = 1;
    displayVideos();
    modal.classList.remove('active');
    
    // Update filter button appearance
    filterButton.classList.toggle('active', isFiltering);
    filterButton.style.borderColor = isFiltering ? 'white' : '';
});

// Clear filters
clearButton.addEventListener('click', () => {
    selectedTags.clear();
    isFiltering = false;
    filterButton.style.borderColor = '';
    filterButton.classList.remove('active');
    
    // Reset to current search results
    filteredVideos = filterVideos();
    currentPage = 1;
    displayVideos();
    
    // Update UI to show cleared state
    document.querySelectorAll('.tag-checkbox').forEach(container => {
        container.classList.remove('selected');
        container.querySelector('input[type="checkbox"]').checked = false;
    });
});

// Override the search handler to work with tags
searchInput.removeEventListener('input', handleSearch);
searchInput.addEventListener('input', (event) => {
    filteredVideos = filterVideos();
    currentPage = 1;
    displayVideos();
}); 