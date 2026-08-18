import { Game } from "./game.js";

const canvas = document.getElementById("gameCanvas");

const startScreen = document.getElementById("start-screen");
const gameOverScreen = document.getElementById("game-over-screen");

const startButton = document.getElementById("start-button");
const restartButton = document.getElementById("restart-button");

const timeText = document.getElementById("time");
const finalTimeText = document.getElementById("final-time");
const bestTimeText = document.getElementById("best-time");
const healthText = document.getElementById("health");


/*
    게임 생성
*/

const game = new Game(canvas);


/*
    게임 시작
*/

startButton.addEventListener("click", () => {

    startScreen.classList.add("hidden");
    gameOverScreen.classList.add("hidden");

    game.start();

});


/*
    다시하기
*/

restartButton.addEventListener("click", () => {

    gameOverScreen.classList.add("hidden");

    game.start();

});


/*
    R키 = 다시하기
*/

window.addEventListener("keydown", (event) => {

    if (event.key.toLowerCase() === "r") {

        if (game.isGameOver()) {

            gameOverScreen.classList.add("hidden");

            game.start();

        }

    }

});


/*
    게임 상태 업데이트
*/

function updateUI() {

    const time = game.getSurvivalTime();

    const health = game.getHealth();

    timeText.textContent = time.toFixed(2);


    /*
        체력 표시

        ❤️❤️❤️
        ❤️❤️
        ❤️
    */

    let hearts = "";

    for (let i = 0; i < health; i++) {

        hearts += "❤️";

    }

    healthText.textContent = hearts;


    /*
        게임오버
    */

    if (game.isGameOver()) {

        finalTimeText.textContent =
            time.toFixed(2);

        bestTimeText.textContent =
            game.getBestTime().toFixed(2);

        gameOverScreen.classList.remove("hidden");

    }

}


/*
    메인 루프
*/

function gameLoop() {

    game.update();

    game.draw();

    updateUI();

    requestAnimationFrame(gameLoop);

}


/*
    게임 시작
*/

gameLoop();
