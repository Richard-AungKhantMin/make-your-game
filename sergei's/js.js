const gameBox = document.getElementById("gBox")
const startBox = document.getElementById("startSection")
const scoreBox = document.getElementById("score")
const timeHTML = document.getElementById("time")
const livesHTML = document.getElementById("lives")
const bat = document.getElementById("bat")
const pauseSection = document.getElementById("pauseSection");
const resume = document.getElementById("resume");
const gameOverBox = document.getElementById("over")
const bonkAudio = document.getElementById("bonk");
const gameOverAudio = document.getElementById("gameOver");
const tomScreamAudio = document.getElementById("tomScream");
const happiAudio = document.getElementById("happi")

let happiInterval;
let gameOverInterval;
let catInterval;
let timeInterval;
let batMoveInterval;
let isGameStarted = false;
let isPaused = false
let time = 0
let reqAnimation = null
let speed = 3
let score = 0
let lives = 5

let x, y;
let bonkSpeed = 50
 
// Function to create visual hit effect
function createHitEffect(x, y) {
    const effect = document.createElement('div');
    effect.className = 'hit-effect';
    effect.style.position = 'absolute';
    effect.style.left = `${x - 50}px`; // Center the effect
    effect.style.top = `${y - 50}px`;
    effect.style.width = '100px';
    effect.style.height = '100px';
    effect.style.background = 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 70%)';
    effect.style.borderRadius = '50%';
    effect.style.pointerEvents = 'none';
    effect.style.zIndex = '9';
    effect.style.animation = 'hitExpand 0.5s forwards';
    
    gameBox.appendChild(effect);
    
    // Remove the effect after animation completes
    setTimeout(() => {
        effect.remove();
    }, 500);
}

// Add the keyframe animation to the document
const hitEffectStyle = document.createElement('style');
hitEffectStyle.textContent = `
@keyframes hitExpand {
    0% {
        transform: scale(0.5);
        opacity: 1;
    }
    100% {
        transform: scale(2);
        opacity: 0;
    }
}`;
document.head.appendChild(hitEffectStyle);

function checkHit(){
    const cats = document.querySelectorAll(".cat");
    const batInfo = bat.getBoundingClientRect();

    cats.forEach((cat) => {
        const catInfo = cat.getBoundingClientRect();
        if (
            batInfo.left < catInfo.right &&
            batInfo.right > catInfo.left &&
            batInfo.top < catInfo.bottom &&
            batInfo.bottom > catInfo.top
        ) {
            // Calculate hit position (center of intersection)
            const hitX = (Math.max(batInfo.left, catInfo.left) + Math.min(batInfo.right, catInfo.right)) / 2;
            const hitY = (Math.max(batInfo.top, catInfo.top) + Math.min(batInfo.bottom, catInfo.bottom)) / 2;
            
            // Create visual hit effect
            createHitEffect(hitX, hitY);
            
            score += Math.ceil((gameBox.clientWidth-parseInt(cat.style.left))*0.1)
            animateScoreChange(Math.ceil((gameBox.clientWidth-parseInt(cat.style.left))*0.1))
            scoreBox.innerText = `Score: ${score}`
            tomScreamAudio.play()
            cat.dispatchEvent(new Event("hit"));
        }
    });

    const timeInfo = timeHTML.getBoundingClientRect()
    if (
        batInfo.left < timeInfo.right &&
        batInfo.right > timeInfo.left &&
        batInfo.top < timeInfo.bottom &&
        batInfo.bottom > timeInfo.top
    ) {
        isPaused = !isPaused
        if (isPaused){
            gameBox.style.backgroundImage =  `url(ice.png)`
            cancelAnimationFrame(moveCats)
        }else{
            reqAnimation = requestAnimationFrame(moveCats)
            gameBox.style.backgroundImage =  "none"
        }
    }
} 


function controlBat(){
    // Clear previous interval if it exists
    if (batMoveInterval) {
        clearInterval(batMoveInterval);
    }

    document.addEventListener("keydown", (e)=>{
        if (isGameStarted && !isPaused){
            // Use e.code instead of e.key to support different keyboard layouts
            if (e.code === "KeyD" && x < gameBox.clientWidth-bat.clientWidth) x += bonkSpeed;
            if (e.code === "KeyA" && x > 0) x -= bonkSpeed;
            if (e.code === "KeyS" && y < gameBox.clientHeight-(bat.clientHeight/2)) y += bonkSpeed;
            if (e.code === "KeyW" && y > 0) y -= bonkSpeed;

            if (e.code === "Enter") {
                bonkAudio.pause();
                bonkAudio.currentTime = 0; // Reset audio for better playback
                bonkAudio.play();
                checkHit();
                bat.style.transition = "transform 0.1s ease";
                bat.style.transform = "rotate(-45deg)";
                setTimeout(() => {
                    bat.style.transform = "rotate(0deg)";
                }, 100);
            }
        }
    });
    
    // Create interval only once here, not on each key press
    batMoveInterval = setInterval(() => {
        if (!isGameStarted || isPaused) return;
        
        let BatX = parseInt(bat.style.left) || 0;
        let BatY = parseInt(bat.style.top) || 0;

        const frameSpeed = 1;

        if (BatX > x){
            BatX -= frameSpeed;
        }

        if (BatX < x) {
            BatX += frameSpeed;
        }

        if (BatY > y){
            BatY -= frameSpeed;
        }
        
        if (BatY < y){
            BatY += frameSpeed;
        }

        bat.style.top = `${BatY}px`;
        bat.style.left = `${BatX}px`; 
    }, 1);
}

function manageTime(){
    timeInterval = setInterval(()=>{
        if (!isPaused){
            time++
        }
        timeHTML.innerHTML = `Time: ${time}s`
    }, 1000)
}

function pause(){
    // Clear previous handlers to avoid duplication
    resume.removeEventListener("click", resumeClickHandler);
    document.removeEventListener("visibilitychange", visibilityChangeHandler);
    document.removeEventListener("keydown", pauseKeyHandler);
    
    // Add new handlers
    resume.addEventListener("click", resumeClickHandler);
    document.addEventListener("visibilitychange", visibilityChangeHandler);
    document.addEventListener("keydown", pauseKeyHandler);
}

// Function to resume the game
function resumeClickHandler() {
    isPaused = false;
    gameBox.style.backgroundImage = "none";
    pauseSection.style.display = "none";
    bat.style.display = "block";
    reqAnimation = requestAnimationFrame(moveCats);
}

// Function to handle page visibility changes
function visibilityChangeHandler() {
    if (document.hidden && isGameStarted) {
        isPaused = true;
        gameBox.style.backgroundImage = "none";
        bat.style.display = "none";
        pauseSection.style.display = "block";
        cancelAnimationFrame(reqAnimation);
    }
}

// Function to handle pause keys
function pauseKeyHandler(event) {
    if (isGameStarted) {
        if (event.key === "Escape" || event.key === " ") {
            if (pauseSection.style.display === "block") {
                reqAnimation = requestAnimationFrame(moveCats);
                gameBox.style.backgroundImage = "none";
                pauseSection.style.display = "none";
                bat.style.display = "block";
                isPaused = false;
            } else {
                cancelAnimationFrame(reqAnimation);
                pauseSection.style.display = "block";
                bat.style.display = "none";
                isPaused = true;
            }
        }
    }
}

function createCat() {
    const cat = document.createElement("div");
    cat.classList.add("cat");
    gameBox.appendChild(cat);

    // Position cat randomly by height
    let ranNum = Math.random();
    let topPos = ranNum * (gameBox.clientHeight - cat.clientHeight); 
    
    cat.style.top = `${topPos}px`;
    cat.style.left = "0px"; 

    // Event handler for hit
    cat.addEventListener("hit", () => {
        const pics = ["cry1.png", "cry2.png", "cry3.png"];
        const ranPic = pics[Math.floor(Math.random() * 3)];
        cat.style.transition = "transform 0.5s ease"; 
        
        if (!cat.dataset.hit) {
            cat.style.backgroundImage = `url(${ranPic})`; 
            cat.dataset.hit = "true";
        }

        setTimeout(() => {
            cat.remove();
        }, 500);
    });

    // Click handler for the cat (only if game is not paused)
    cat.addEventListener("click", () => {
        if (!isPaused) {
            cat.dispatchEvent(new Event("hit")); 
        }
    });
}

// Function to update lives display with heart icons
function updateLivesDisplay() {
    const livesContainer = document.getElementById('lives');
    livesContainer.innerHTML = '';
    
    for (let i = 0; i < lives; i++) {
        const heart = document.createElement('span');
        heart.innerHTML = '❤️';
        heart.style.fontSize = '24px';
        heart.style.margin = '0 3px';
        // We don't need to set --i as a style, it's handled by CSS nth-child
        livesContainer.appendChild(heart);
    }
    
    // Add empty hearts for lost lives (optional)
    for (let i = lives; i < 5; i++) {
        const emptyHeart = document.createElement('span');
        emptyHeart.innerHTML = '🖤';
        emptyHeart.style.fontSize = '24px';
        emptyHeart.style.margin = '0 3px';
        emptyHeart.style.opacity = '0.5';
        emptyHeart.style.animation = 'none'; // No animation for empty hearts
        livesContainer.appendChild(emptyHeart);
    }
}

function moveCats() {
    const cats = document.querySelectorAll(".cat");
    let maxRight;
    
    if (cats.length > 0) {
        maxRight = gameBox.clientWidth - (cats[0].clientWidth);
    }

    cats.forEach((cat) => {
        let currentLeft = parseInt(cat.style.left) || 0;

        if (!isPaused) {
            if (currentLeft < maxRight) {
                cat.style.left = `${currentLeft + speed}px`;
            } else {
                if (!cat.dataset.removed) {
                    lives--;
                    updateLivesDisplay(); // Update lives indicator
                    cat.style.backgroundImage = `url(gameOver.png)`;
                    gameOverAudio.play();
                    cat.dataset.removed = "true";

                    setTimeout(() => {
                        cat.remove();
                    }, 3000); 
                }
            }
        }
    });
    
    // Recursive animation loop
    if (!isPaused) {
        cancelAnimationFrame(reqAnimation);
        reqAnimation = requestAnimationFrame(moveCats);
    } else {
        cancelAnimationFrame(reqAnimation);
    }
}

function restart(){
    // Reset game variables
    score = 0;
    lives = 5;
    time = 0;
    isPaused = false;
    isGameStarted = false;
    speed = 3;
    
    // Update interface
    scoreBox.innerText = `Score: ${score}`;
    timeHTML.innerHTML = `Time: ${time}s`;
    updateLivesDisplay();
    
    // Reset bat position
    x = (gameBox.clientWidth - bat.clientWidth) / 2;
    y = (gameBox.clientHeight - bat.clientHeight) / 2;
    bat.style.left = `${x}px`;
    bat.style.top = `${y}px`;
    
    // Clear all intervals and animations
    clearInterval(timeInterval);
    clearInterval(happiInterval);
    clearInterval(catInterval);
    clearInterval(gameOverInterval);
    clearInterval(batMoveInterval);
    cancelAnimationFrame(reqAnimation);
    
    // Stop all audio
    happiAudio.pause();
    bonkAudio.pause();
    gameOverAudio.pause();
    tomScreamAudio.pause();
    
    // Remove all cats
    document.querySelectorAll(".cat").forEach(cat => cat.remove());
    
    // Show needed elements
    pauseSection.style.display = "none";
    startBox.style.display = "block";
    bat.style.display = "none";
    gameOverBox.style.display = "none";
}

function startGame(){
    // Set up pause and keyboard event handlers
    pause();
    controlBat();
    
    // Set up restart handlers outside the click handler (to avoid duplication)
    document.getElementById("r1").addEventListener("click", restart);
    document.getElementById("r2").addEventListener("click", restart);

    startBox.addEventListener("click", function () {
        startBox.style.display = "none";
        isGameStarted = true;
        manageTime();

        bat.style.display = "block";
        x = (gameBox.clientWidth - bat.clientWidth) / 2;
        y = (gameBox.clientHeight - bat.clientHeight) / 2;

        bat.style.left = `${x}px`;
        bat.style.top = `${y}px`;
        
        // Initialize lives display at start
        lives = 5;
        updateLivesDisplay();
        
        happiInterval = setInterval(() => {
            isPaused ? happiAudio.pause() : happiAudio.play();
        }, 500);
        
        clearInterval(catInterval);
        catInterval = setInterval(() => {
            if (!isPaused) createCat();
        }, 3000);

        gameOverInterval = setInterval(() => {
            if (lives === 0){
                gameOverBox.style.display = "block";
                isGameStarted = false;
                isPaused = true;
                
                // Stop all game processes when game ends
                clearInterval(timeInterval);
                clearInterval(happiInterval);
                clearInterval(catInterval);
                clearInterval(gameOverInterval);
                happiAudio.pause();
            }
        }, 100);

        reqAnimation = requestAnimationFrame(moveCats);
    }); 
}

// Function for animating score changes
function animateScoreChange(points) {
    const scorePopup = document.createElement('div');
    scorePopup.textContent = `+${points}`;
    scorePopup.style.position = 'absolute';
    scorePopup.style.color = '#f8ca4d';
    scorePopup.style.fontWeight = 'bold';
    scorePopup.style.fontSize = '24px';
    scorePopup.style.zIndex = '100';
    scorePopup.style.left = `${scoreBox.offsetLeft + scoreBox.offsetWidth/2}px`;
    scorePopup.style.top = `${scoreBox.offsetTop}px`;
    scorePopup.style.opacity = '1';
    scorePopup.style.transition = 'all 1s ease-out';
    document.body.appendChild(scorePopup);
    
    // Animation for moving up and fading out
    setTimeout(() => {
        scorePopup.style.opacity = '0';
        scorePopup.style.transform = 'translateY(-30px)';
    }, 10);
    
    // Remove after animation completes
    setTimeout(() => {
        scorePopup.remove();
    }, 1000);
}

startGame()
