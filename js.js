const gameBox = document.getElementById("gBox")
const startBox = document.getElementById("startSection")
const scoreBox = document.getElementById("score")
const timeHTML = document.getElementById("time")
const livesHTML = document.getElementById("lives")
const bat = document.getElementById("bat")
const pauseSection = document.getElementById("pauseSection");
const resume = document.getElementById("resume");
const gameOverBox = document.getElementById("over")
const bananaAudio = document.getElementById("banana");
const bonkAudio = document.getElementById("bonk");
const gameOverAudio = document.getElementById("gameOver");
const tomScreamAudio = document.getElementById("tomScream");
const happiAudio = document.getElementById("happi")

let happiInterval;
let gameOverInterval;
let catInterval;
let timeInterval;
let batMoveInterval;
let missed = false;
let isGameStarted = false;
let isPaused = false
let time = 0
let reqAnimation = null
let speed = 3
let score = 0
let lives = 5
let isRestart = false

let x, y;
let bonkSpeed = 50
 
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
            score += Math.ceil(Math.random()*50)
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
            cancelAnimationFrame(moveCats)
        }else{
            reqAnimation = requestAnimationFrame(moveCats)
        }
    }

} 


function controlBat(){

    document.addEventListener("keydown", (e)=>{

if (isGameStarted){
    if (e.key.toLowerCase() === "d" && x < gameBox.clientWidth-bat.clientWidth) x += bonkSpeed;
    if (e.key.toLowerCase() === "a" && x > 0) x -= bonkSpeed;
    if (e.key.toLowerCase() === "s" && y < gameBox.clientHeight-(bat.clientHeight/2)) y += bonkSpeed;
    if (e.key.toLowerCase() === "w" && y > 0) y -= bonkSpeed;

}
    
  batMoveInterval = setInterval(() =>{
    let BatX = parseInt(bat.style.left);
    let BatY = parseInt(bat.style.top)
    const dx = x - BatX;
    const dy = y - BatY;

    const frameSpeed = 1

    if (BatX > x){
        BatX -= frameSpeed
    }

    if (BatX < x) {
        BatX += frameSpeed
    }

    if (BatY > y){
        BatY -= frameSpeed
       
    }
    
    if (BatY < y){
        BatY += frameSpeed
    }

    bat.style.top = `${BatY}px`;
    bat.style.left = `${BatX}px`; 

  }, 1)
        
    if (e.key === "Enter") {
        if (!isPaused){
            bonkAudio.pause()
            bonkAudio.play()
            checkHit();
            bat.style.transition = "transform 0.1s ease";
            bat.style.transform = "rotate(-45deg)";
                setTimeout(() => {
           bat.style.transform = "rotate(0deg)";
            }, 100);
        }
        
    }
    })
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
  
    resume.addEventListener("click", () => {
        isPaused = false
        pauseSection.style.display = "none"
        bat.style.display = "block";
        reqAnimation = requestAnimationFrame(moveCats)
    });

    document.addEventListener("visibilitychange", () =>{
        if (document.hidden && isGameStarted){
            isPaused = true
            bat.style.display = "none";
            pauseSection.style.display = "block";
            cancelAnimationFrame(reqAnimation)
        }

    })

    document.addEventListener("keydown", (event) => {
        if (isGameStarted){
            if (event.key === "Escape" || event.key === " ") {

                if (pauseSection.style.display === "block") {
                    reqAnimation = requestAnimationFrame(moveCats);
                    pauseSection.style.display = "none";
                    bat.style.display = "block";
                    isPaused = false; 
                } else {
                    cancelAnimationFrame(reqAnimation)
                    pauseSection.style.display = "block";
                    bat.style.display = "none";
                    isPaused = true; 
                }
            }
        }
    });
}


function createCat() {
    const cat = document.createElement("div");
    cat.classList.add("cat");
    gameBox.appendChild(cat);

    let ranNum = Math.random();
    let topPos = ranNum * (gameBox.clientHeight - cat.clientHeight); 
    
    cat.style.top = `${topPos}px`;
    cat.style.left = "0px"; 

   
   cat.addEventListener("hit", () => {
    const pics = ["cry1.png", "cry2.png", "cry3.png"]
    const ranPic = pics[Math.floor(Math.random()*3)]
    cat.style.transition = "transform 0.5s"; 
    cat.style.backgroundImage = `url(${ranPic})`; 

    setTimeout(() => {
        cat.remove();
    }, 500);
});

cat.addEventListener("click", () => {
    if (!isPaused) {
        cat.dispatchEvent(new Event("hit")); 
    }
});
   
}

function moveCats() {
    const cats = document.querySelectorAll(".cat");
    let maxRight;
    if (cats.length > 0){
        maxRight = gameBox.clientWidth - (cats[0].clientWidth);
    }

    cats.forEach((cat) => {
    let currentLeft = parseInt(cat.style.left);

    if (!isPaused){
        if (currentLeft < maxRight) {
            cat.style.left = `${currentLeft + speed}px`;
        } else {

            if (!cat.dataset.removed) {
                lives--;
                livesHTML.innerText = `Lives: ${lives}`;
                cat.style.backgroundImage = `url(gameOver.png)`;
                gameOverAudio.play();

                cat.dataset.removed = "true";

                setTimeout(() => {
                    cat.remove();
                }, 3000); 
            }
        }
    }
}
)
    
    if (!isPaused) {
        cancelAnimationFrame(reqAnimation)
       reqAnimation = requestAnimationFrame(moveCats);
    }else{
        cancelAnimationFrame(reqAnimation)
    }
}

function restart(){
    
score = 0
lives = 5
time = 0
isPaused = false
isGameStarted = false
speed = 3
scoreBox.innerText = `Score: ${score}`
timeHTML.innerHTML = `Time: ${time}s`
livesHTML.innerText = `Lives: ${lives}`

x = (gameBox.clientWidth - bat.clientWidth) / 2
y = (gameBox.clientHeight - bat.clientHeight) / 2
bat.style.left = `${x}px`
bat.style.top = `${y}px`

clearInterval(timeInterval)
clearInterval(happiInterval)
clearInterval(catInterval)
clearInterval(gameOverInterval)
cancelAnimationFrame(reqAnimation)
document.querySelectorAll(".cat").forEach(cat => cat.remove())

pauseSection.style.display = "none"
startBox.style.display = "block"
bat.style.display = "none"
  gameOverBox.style.display = "none"

}

function startGame(){

    //User control event listener and frames doesn't need to be reset because they're controlled by the user
    pause()
    controlBat()


    startBox.addEventListener("click", function () {
        startBox.style.display = "none";
        isGameStarted = true;
        manageTime()

        bat.style.display = "block";
        x = (gameBox.clientWidth - bat.clientWidth) / 2
        y = (gameBox.clientHeight - bat.clientHeight) / 2

        bat.style.left = `${x}px`
        bat.style.top = `${y}px`
        
        
        happiInterval = setInterval(() =>{
            isPaused ? happiAudio.pause():happiAudio.play()
        }, 10)
        

        clearInterval(catInterval);
        catInterval = setInterval(() => {
            if (!isPaused) createCat();
    
        }, 3000);

        gameOverInterval = setInterval(()=>{
            if (lives === 0){
                gameOverBox.style.display = "block"
                isGameStarted = false
                isPaused = true
            }
        }, 1)

        reqAnimation = requestAnimationFrame(moveCats)

        document.getElementById("r1").addEventListener("click", restart)
        document.getElementById("r2").addEventListener("click", restart)

        }); 
}

startGame()