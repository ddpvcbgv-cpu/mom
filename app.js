// State Management
let currentStoryIndex = -1;
let currentPageIndex = 0;

// DOM Elements
const sidebar = document.getElementById('sidebar');
const storyList = document.getElementById('story-list');
const toggleMenuBtn = document.getElementById('toggle-menu');
const pageContent = document.getElementById('page-content');
const storyTitleDisplay = document.getElementById('story-title-display');
const pageNumber = document.getElementById('page-number');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const pageCard = document.getElementById('page-card');
const closeSidebarBtn = document.getElementById('close-sidebar');

// Initialize Story List
function initStoryList() {
    STORIES.forEach((story, index) => {
        const item = document.createElement('div');
        item.className = 'story-item';
        item.innerText = `[${story.week}] ${story.title}`;
        item.onclick = () => selectStory(index);
        storyList.appendChild(item);
    });
}

// Select a Story
function selectStory(index) {
    if (currentStoryIndex === index) {
        sidebar.classList.remove('active');
        return;
    }

    currentStoryIndex = index;
    currentPageIndex = 0;

    // Update active class in sidebar
    const items = document.querySelectorAll('.story-item');
    items.forEach((item, i) => {
        if (i === index) item.classList.add('active');
        else item.classList.remove('active');
    });

    // Close sidebar on mobile/small screens after selection
    sidebar.classList.remove('active');

    renderPage();
}

// Render Page Content with Fade Animation
function renderPage() {
    if (currentStoryIndex === -1) return;

    // Start Fade Out
    pageContent.classList.add('fade-out');

    // Wait for fade out to complete before updating content
    setTimeout(() => {
        const story = STORIES[currentStoryIndex];
        const totalPages = story.content.length;

        // Update UI
        storyTitleDisplay.innerText = `[${story.week}] ${story.title}`;

        // Split content into sentences and wrap them
        const text = story.content[currentPageIndex];
        // Improved regex to include smart quotes (”, “, etc.) and prevent them from being orphaned
        const sentences = text.match(/[^.!?]+[.!?]+[”"’'」〉)]*|[^.!?]+$/g) || [text];

        pageContent.innerHTML = '';
        sentences.forEach(sentence => {
            const trimmed = sentence.trim();
            if (trimmed) {
                const span = document.createElement('span');
                span.className = 'sentence';
                span.innerText = trimmed;
                pageContent.appendChild(span);
            }
        });

        pageNumber.innerText = `${currentPageIndex + 1} / ${totalPages}`;

        // Update Buttons
        prevBtn.disabled = currentPageIndex === 0;
        nextBtn.disabled = currentPageIndex === totalPages - 1;

        // Scroll reader to top
        document.querySelector('.book-view').scrollTop = 0;

        // Start Fade In
        pageContent.classList.remove('fade-out');
    }, 300); // Matches CSS transition speed
}

// Navigation Events
prevBtn.onclick = () => {
    if (currentPageIndex > 0) {
        currentPageIndex--;
        renderPage();
    }
};

nextBtn.onclick = () => {
    const story = STORIES[currentStoryIndex];
    if (currentPageIndex < story.content.length - 1) {
        currentPageIndex++;
        renderPage();
    }
};

// Sidebar Toggle
toggleMenuBtn.onclick = () => {
    sidebar.classList.toggle('active');
};

closeSidebarBtn.onclick = () => {
    sidebar.classList.remove('active');
};

// Start the app
initStoryList();

// Load the first story by default
selectStory(0);
