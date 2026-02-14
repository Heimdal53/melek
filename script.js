document.addEventListener('DOMContentLoaded', () => {
    // State management
    let currentLevel = 0;

    // DOM Elements
    const screens = {
        start: document.getElementById('screen-start'),
        level1: document.getElementById('screen-level-1'),
        level2: document.getElementById('screen-level-2'),
        level3: document.getElementById('screen-level-3'),
        level4: document.getElementById('screen-level-4'),
        victory: document.getElementById('screen-victory')
    };

    const btnStart = document.getElementById('btn-start');
    const btnRestart = document.getElementById('btn-restart');

    // --- Navigation Functions ---
    function showScreen(screenId) {
        // Hide all screens
        Object.values(screens).forEach(s => s.classList.remove('active'));
        // Show target screen
        if (screens[screenId]) screens[screenId].classList.add('active');
    }

    btnStart.addEventListener('click', () => {
        startLevel1();
    });

    btnRestart.addEventListener('click', () => {
        location.reload();
    });

    // --- Level 1: The Chase logic ---
    const btnChase = document.getElementById('btn-chase');
    const chaseArea = document.getElementById('chase-area');
    let level1Taps = 0; // Counter for taps
    const tapsNeeded = 3;

    function startLevel1() {
        showScreen('level1');
        level1Taps = 0;
        btnChase.innerText = "❤️"; // Reset text
        btnChase.style.top = '50%';
        btnChase.style.left = '50%';
    }

    // Touch/Hover logic to make it move
    function moveButton() {
        const areaRect = chaseArea.getBoundingClientRect();
        const btnRect = btnChase.getBoundingClientRect();

        // Calculate nice random position within bounds
        const maxX = areaRect.width - btnRect.width;
        const maxY = areaRect.height - btnRect.height;

        const randomX = Math.random() * maxX;
        const randomY = Math.random() * maxY;

        // Make it faster!
        btnChase.style.transition = 'top 0.1s, left 0.1s';
        btnChase.style.left = `${randomX}px`;
        btnChase.style.top = `${randomY}px`;
    }

    // Desktop: 50% chance to flee on hover (Balanced Difficulty) - User wanted easier
    btnChase.addEventListener('mouseenter', () => {
        if (Math.random() > 0.5) moveButton();
    });

    // Mobile: 40% chance to flee on touch (Balanced Difficulty)
    btnChase.addEventListener('touchstart', (e) => {
        if (Math.random() > 0.6) {
            moveButton();
        }
    });

    btnChase.addEventListener('click', () => {
        // Logic: Require 3 taps
        level1Taps++;

        if (level1Taps < tapsNeeded) {
            // Visual feedback
            btnChase.innerText = `${level1Taps}/${tapsNeeded}`;
            moveButton(); // Force move after hit
        } else {
            // Success!
            startLevel2();
        }
    });


    // --- Level 2: Maze Logic ---
    const mazeContainer = document.getElementById('maze-container');
    const mazePlayer = document.getElementById('maze-player');
    const mazeStart = document.getElementById('maze-start');
    const mazeEnd = document.getElementById('maze-end');
    const walls = document.querySelectorAll('.maze-wall');

    let isDragging = false;

    function startLevel2() {
        showScreen('level2');
    }

    function resetMaze() {
        isDragging = false;
        mazePlayer.style.display = 'none';

        // Vibrate if supported
        if (navigator.vibrate) navigator.vibrate(200);

        // Shake screen?
        if (screens.level2) {
            screens.level2.classList.add('shake-screen');
            setTimeout(() => screens.level2.classList.remove('shake-screen'), 300);
        }
    }

    function checkCollision(x, y) {
        // Check walls
        for (let wall of walls) {
            const rect = wall.getBoundingClientRect();
            if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
                return true;
            }
        }
        // Check bounds of container
        const containerRect = mazeContainer.getBoundingClientRect();
        if (x < containerRect.left || x > containerRect.right || y < containerRect.top || y > containerRect.bottom) {
            return true;
        }
        return false;
    }

    function checkWin(x, y) {
        const endRect = mazeEnd.getBoundingClientRect();
        if (x >= endRect.left && x <= endRect.right && y >= endRect.top && y <= endRect.bottom) {
            return true;
        }
        return false;
    }

    // Touch Events for Maze
    mazeStart.addEventListener('touchstart', (e) => {
        e.preventDefault();
        isDragging = true;
        mazePlayer.style.display = 'block';
        updatePlayerPos(e.touches[0].clientX, e.touches[0].clientY);
    });

    mazeContainer.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        e.preventDefault(); // Prevent scrolling

        const touch = e.touches[0];
        handleMazeMove(touch.clientX, touch.clientY);
    });

    mazeContainer.addEventListener('touchend', () => {
        if (isDragging) {
            // If they lift finger before finish
            resetMaze();
        }
    });

    // Mouse Events for PC
    mazeStart.addEventListener('mousedown', (e) => {
        e.preventDefault();
        isDragging = true;
        mazePlayer.style.display = 'block';
        updatePlayerPos(e.clientX, e.clientY);
    });

    mazeContainer.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        handleMazeMove(e.clientX, e.clientY);
    });

    document.addEventListener('mouseup', () => {
        if (isDragging && screens.level2.classList.contains('active')) {
            resetMaze();
        }
    });

    function handleMazeMove(clientX, clientY) {
        updatePlayerPos(clientX, clientY);

        if (checkCollision(clientX, clientY)) {
            resetMaze();
        } else if (checkWin(clientX, clientY)) {
            isDragging = false;
            startLevel3();
        }
    }

    function updatePlayerPos(clientX, clientY) {
        const rect = mazeContainer.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        mazePlayer.style.left = x + 'px';
        mazePlayer.style.top = y + 'px';
    }


    // --- Level 3: Typist Logic ---
    const inputLove = document.getElementById('input-love');
    const targetText = document.getElementById('target-text').innerText;
    const errorMsg = document.getElementById('error-msg');

    function startLevel3() {
        showScreen('level3');
        inputLove.value = '';
        inputLove.focus();
    }

    inputLove.addEventListener('input', (e) => {
        const currentVal = e.target.value;

        // Strict check: currentVal must match beginning of targetText perfectly
        if (!targetText.startsWith(currentVal)) {
            // ERROR!
            failTyping();
        } else {
            // Correct so far... check completion
            if (currentVal === targetText) {
                // Next level
                startLevel4();
            }
        }
    });

    function failTyping() {
        // Shake input
        inputLove.classList.add('shake');
        errorMsg.classList.add('visible');

        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

        setTimeout(() => {
            inputLove.value = '';
            inputLove.classList.remove('shake');
            errorMsg.classList.remove('visible');
        }, 500);
    }

    // --- Level 4: Kiss Storm Logic ---
    const kissProgress = document.getElementById('kiss-progress');
    const kissCounter = document.querySelector('.kiss-counter');
    const btnKiss = document.getElementById('btn-kiss');
    let progress = 0;
    let stormInterval;

    function startLevel4() {
        showScreen('level4');
        progress = 0;
        updateProgress();

        // Start decay loop
        if (stormInterval) clearInterval(stormInterval);
        stormInterval = setInterval(() => {
            if (progress > 0) {
                progress -= 1.5; // Decay rate
                if (progress < 0) progress = 0;
                updateProgress();
            }
        }, 100);
    }

    function updateProgress() {
        if (kissProgress) kissProgress.style.width = `${progress}%`;
        if (kissCounter) kissCounter.innerText = `${Math.floor(progress)}%`;

        if (progress >= 100) {
            winLevel4();
        }
    }

    function winLevel4() {
        clearInterval(stormInterval);
        showVictory();
    }

    if (btnKiss) {
        btnKiss.addEventListener('click', (e) => {
            // Add progress
            progress += 4; // Difficulty adjustment
            if (progress > 100) progress = 100;
            updateProgress();

            // Visual effect on click
            createSmallHeart(e.clientX, e.clientY);
        });
    }

    function createSmallHeart(x, y) {
        const heart = document.createElement('div');
        heart.innerHTML = '💋';
        heart.style.position = 'fixed';
        heart.style.left = x + 'px';
        heart.style.top = y + 'px';
        heart.style.pointerEvents = 'none';
        heart.style.fontSize = '2rem';
        heart.style.transition = 'transform 0.5s, opacity 0.5s';
        document.body.appendChild(heart);

        setTimeout(() => {
            heart.style.transform = `translate(0, -100px) scale(1.5)`;
            heart.style.opacity = '0';
        }, 10);

        setTimeout(() => heart.remove(), 500);
    }

    function showVictory() {
        showScreen('victory');
        startConfetti();
    }

    // Simple Canvas Confetti
    function startConfetti() {
        const canvas = document.createElement('canvas');
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '999';
        document.body.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles = [];
        const colors = ['#ff4757', '#2ed573', '#1e90ff', '#ffa502', '#ffffff'];

        for (let i = 0; i < 150; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height - canvas.height,
                size: Math.random() * 8 + 4,
                speedY: Math.random() * 3 + 2,
                speedX: Math.random() * 2 - 1,
                color: colors[Math.floor(Math.random() * colors.length)],
                angle: Math.random() * 360,
                spin: Math.random() * 10 - 5
            });
        }

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.y += p.speedY;
                p.x += Math.sin(p.angle * Math.PI / 180) * 1 + p.speedX;
                p.angle += p.spin;

                if (p.y > canvas.height) {
                    p.y = -20;
                    p.x = Math.random() * canvas.width;
                }

                ctx.fillStyle = p.color;
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.angle * Math.PI / 180);
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
                ctx.restore();
            });
            requestAnimationFrame(draw);
        }
        draw();
    }

});
