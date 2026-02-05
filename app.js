// ============================================
// E-Learning Quiz - Main Application Logic
// ============================================

let currentQuestion = 0;
let userAnswers = [];
let shuffledQuestions = [];

// Initialize the app
function init() {
    // Keep questions in chapter order (no shuffle)
    shuffledQuestions = [...questions];
    userAnswers = new Array(shuffledQuestions.length).fill(null);
    document.getElementById('total-questions').textContent = shuffledQuestions.length;
}

// Start the quiz
function startQuiz() {
    init();
    showPage('quiz');
    loadQuestion(0);
}

// Show specific page
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Load a question
function loadQuestion(index) {
    currentQuestion = index;
    const q = shuffledQuestions[index];

    // Update progress
    document.getElementById('current-question').textContent = index + 1;
    document.getElementById('progress-fill').style.width = `${((index + 1) / shuffledQuestions.length) * 100}%`;
    document.getElementById('chapter-indicator').textContent = `บทที่ ${q.chapter}`;

    // Update question
    document.getElementById('question-number').textContent = `ข้อที่ ${index + 1}`;
    document.getElementById('question-text').textContent = q.question;

    // Update options
    const optionsContainer = document.getElementById('options-container');
    const labels = ['ก', 'ข', 'ค', 'ง'];

    optionsContainer.innerHTML = q.options.map((opt, i) => `
        <button class="option-btn ${userAnswers[index] === i ? 'selected' : ''}" 
                onclick="selectOption(${i})" 
                data-index="${i}">
            <span class="option-label">${labels[i]}</span>
            <span class="option-text">${opt}</span>
        </button>
    `).join('');

    // Hide explanation initially
    document.getElementById('explanation-box').classList.remove('show');

    // If already answered, show result
    if (userAnswers[index] !== null) {
        showAnswerResult(index);
    }

    // Update navigation
    updateNavigation();
}

// Select an option
function selectOption(optionIndex) {
    if (userAnswers[currentQuestion] !== null) return; // Already answered

    userAnswers[currentQuestion] = optionIndex;
    showAnswerResult(currentQuestion);
}

// Show answer result
function showAnswerResult(questionIndex) {
    const q = shuffledQuestions[questionIndex];
    const userAnswer = userAnswers[questionIndex];
    const options = document.querySelectorAll('.option-btn');

    options.forEach((btn, i) => {
        btn.classList.add('disabled');
        if (i === q.answer) {
            btn.classList.add('correct');
        } else if (i === userAnswer && userAnswer !== q.answer) {
            btn.classList.add('wrong');
        }
    });

    // Show explanation
    document.getElementById('explanation-text').textContent = q.explanation;
    document.getElementById('explanation-box').classList.add('show');

    updateNavigation();
}

// Update navigation buttons
function updateNavigation() {
    const prevBtn = document.getElementById('btn-prev');
    const nextBtn = document.getElementById('btn-next');
    const submitBtn = document.getElementById('btn-submit');

    prevBtn.disabled = currentQuestion === 0;

    if (currentQuestion === shuffledQuestions.length - 1) {
        nextBtn.style.display = 'none';
        // Show submit if all answered
        const allAnswered = userAnswers.every(a => a !== null);
        submitBtn.classList.toggle('show', allAnswered);
    } else {
        nextBtn.style.display = 'block';
        submitBtn.classList.remove('show');
    }
}

// Previous question
function prevQuestion() {
    if (currentQuestion > 0) {
        loadQuestion(currentQuestion - 1);
    }
}

// Next question
function nextQuestion() {
    if (currentQuestion < shuffledQuestions.length - 1) {
        loadQuestion(currentQuestion + 1);
    }
}

// Submit quiz
function submitQuiz() {
    calculateResults();
    showPage('result');
}

// Calculate results
function calculateResults() {
    let correctCount = 0;
    let chapterScores = {};

    // Initialize chapter scores
    for (let i = 1; i <= 5; i++) {
        chapterScores[i] = { correct: 0, total: 0 };
    }

    // Calculate scores
    shuffledQuestions.forEach((q, i) => {
        chapterScores[q.chapter].total++;
        if (userAnswers[i] === q.answer) {
            correctCount++;
            chapterScores[q.chapter].correct++;
        }
    });

    const total = shuffledQuestions.length;
    const percent = Math.round((correctCount / total) * 100);

    // Update result display
    document.getElementById('score-number').textContent = correctCount;
    document.getElementById('score-percent').textContent = `${percent}%`;

    // Determine grade
    const gradeEl = document.getElementById('score-grade');
    const iconEl = document.getElementById('result-icon');

    if (percent >= 80) {
        gradeEl.textContent = 'ยอดเยี่ยม';
        gradeEl.className = 'score-grade excellent';
        iconEl.textContent = '🎉';
    } else if (percent >= 60) {
        gradeEl.textContent = 'ดี';
        gradeEl.className = 'score-grade good';
        iconEl.textContent = '😊';
    } else if (percent >= 50) {
        gradeEl.textContent = 'ผ่าน';
        gradeEl.className = 'score-grade pass';
        iconEl.textContent = '😅';
    } else {
        gradeEl.textContent = 'ต้องปรับปรุง';
        gradeEl.className = 'score-grade fail';
        iconEl.textContent = '😢';
    }

    // Chapter scores
    const chapterNames = [
        'วิวัฒนาการของแมลง',
        'อาณาจักรสิ่งมีชีวิต',
        'การเปลี่ยนแปลงรูปร่าง',
        'การจัดจำแนกแมลง',
        'สัณฐานวิทยาแมลง'
    ];

    const chapterScoresEl = document.getElementById('chapter-scores');
    chapterScoresEl.innerHTML = Object.entries(chapterScores).map(([ch, score]) => `
        <div class="chapter-score-item">
            <span class="chapter-name">บทที่ ${ch}: ${chapterNames[ch - 1]}</span>
            <span class="chapter-result">${score.correct}/${score.total}</span>
        </div>
    `).join('');
}

// View detailed answers
function viewAnswers() {
    const reviewContainer = document.getElementById('review-container');
    const labels = ['ก', 'ข', 'ค', 'ง'];

    reviewContainer.innerHTML = shuffledQuestions.map((q, i) => {
        const userAnswer = userAnswers[i];
        const isCorrect = userAnswer === q.answer;

        return `
            <div class="review-item ${isCorrect ? 'correct-answer' : 'wrong-answer'}">
                <div class="review-question-header">
                    <span class="review-question-num">ข้อ ${i + 1} (บทที่ ${q.chapter})</span>
                    <span class="review-status ${isCorrect ? 'correct' : 'wrong'}">
                        ${isCorrect ? '✓ ถูก' : '✗ ผิด'}
                    </span>
                </div>
                <p class="review-question-text">${q.question}</p>
                <div class="review-options">
                    ${q.options.map((opt, j) => `
                        <div class="review-option ${j === userAnswer ? 'user-selected' : ''} ${j === q.answer ? 'correct-option' : ''}">
                            <strong>${labels[j]}.</strong> ${opt}
                            ${j === q.answer ? ' ✓' : ''}
                            ${j === userAnswer && j !== q.answer ? ' (คุณตอบ)' : ''}
                        </div>
                    `).join('')}
                </div>
                <div class="review-explanation">
                    💡 ${q.explanation}
                </div>
            </div>
        `;
    }).join('');

    showPage('review');
}

// Back to result
function backToResult() {
    showPage('result');
}

// Restart quiz
function restartQuiz() {
    showPage('landing');
}
