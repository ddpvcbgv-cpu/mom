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
const ttsBtn = document.getElementById('tts-btn');

// Speech Synthesis State
let synth = window.speechSynthesis;
let isSpeaking = false;
let currentUtterance = null;

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

// Stop Speech Synthesis
function stopSpeech() {
    if (synth.speaking) {
        synth.cancel();
    }
    isSpeaking = false;
    if (ttsBtn) {
        ttsBtn.innerText = '🔊 이야기 듣기';
        ttsBtn.classList.remove('playing');
    }
    // Remove all highlights
    document.querySelectorAll('.sentence').forEach(s => s.classList.remove('reading'));
}

// Speak Page Content
function speakPage() {
    if (isSpeaking) {
        stopSpeech();
        return;
    }

    const sentences = document.querySelectorAll('.sentence');
    if (sentences.length === 0) return;

    isSpeaking = true;
    ttsBtn.innerText = '⏹ 듣기 중지';
    ttsBtn.classList.add('playing');

    let currentIdx = 0;

    function speakNext() {
        if (!isSpeaking || currentIdx >= sentences.length) {
            stopSpeech();
            return;
        }

        const sentenceEl = sentences[currentIdx];
        const textToSpeak = sentenceEl.innerText;

        // Visual Highlight
        sentences.forEach(s => s.classList.remove('reading'));
        sentenceEl.classList.add('reading');

        // Ensure the highlighted sentence is visible
        sentenceEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

        currentUtterance = new SpeechSynthesisUtterance(textToSpeak);

        // Find a warm Korean female voice if available
        const voices = synth.getVoices();
        const koVoice = voices.find(v => v.lang.includes('ko-KR') && (v.name.includes('Google') || v.name.includes('Yuna') || v.name.includes('Heami')));
        if (koVoice) currentUtterance.voice = koVoice;

        currentUtterance.rate = 0.9; // Slightly slower for better senior understanding
        currentUtterance.pitch = 1.0;

        currentUtterance.onend = () => {
            currentIdx++;
            speakNext();
        };

        currentUtterance.onerror = () => {
            stopSpeech();
        };

        synth.speak(currentUtterance);
    }

    speakNext();
}

// Select a Story
function selectStory(index) {
    stopSpeech();
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

    stopSpeech();

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
    stopSpeech();
    if (currentPageIndex > 0) {
        currentPageIndex--;
        renderPage();
    }
};

nextBtn.onclick = () => {
    stopSpeech();
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

if (ttsBtn) {
    ttsBtn.onclick = () => {
        speakPage();
    };
}

// Start the app
initStoryList();

// Load the first story by default
selectStory(0);
