import { Player } from "./player.js";
import { Arrow } from "./arrow.js";


export class Game {

    constructor(canvas) {

        // =========================================================
        // 기본 설정
        // =========================================================

        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        this.width = canvas.width;
        this.height = canvas.height;


        // =========================================================
        // 게임 상태
        // =========================================================

        this.running = false;
        this.gameOver = false;
        this.paused = false;


        // =========================================================
        // 플레이어
        // =========================================================

        this.player = new Player(
            this.width / 2,
            this.height / 2
        );


        // =========================================================
        // 화살 목록
        // =========================================================

        this.arrows = [];


        // =========================================================
        // 시간 관련
        // =========================================================

        this.startTime = 0;

        this.survivalTime = 0;

        this.lastTime = performance.now();


        // =========================================================
        // 화살 생성 타이머
        // =========================================================

        this.arrowTimer = 0;


        // =========================================================
        // 특수 패턴 타이머
        // =========================================================

        this.patternTimer = 0;


        // =========================================================
        // 특수 패턴 최소 간격
        // =========================================================

        this.patternCooldown = 2.5;


        // =========================================================
        // 최고 기록
        // =========================================================

        this.bestTime =
            Number(
                localStorage.getItem(
                    "juklim-gosu-best"
                )
            ) || 0;


        // =========================================================
        // 키 입력
        // =========================================================

        this.keys = {};

        window.addEventListener(
            "keydown",
            (event) => {

                this.keys[event.key] = true;


                // -------------------------------------------------
                // P = 일시정지
                // -------------------------------------------------

                if (
                    event.key.toLowerCase() === "p"
                ) {

                    this.togglePause();

                }


                // -------------------------------------------------
                // R = 다시 시작
                // -------------------------------------------------

                if (
                    event.key.toLowerCase() === "r"
                ) {

                    this.start();

                }

            }
        );


        window.addEventListener(
            "keyup",
            (event) => {

                this.keys[event.key] = false;

            }
        );

    }


    // =============================================================
    // 게임 시작
    // =============================================================

    start() {

        this.running = true;

        this.gameOver = false;

        this.paused = false;


        // ---------------------------------------------------------
        // 화살 초기화
        // ---------------------------------------------------------

        this.arrows = [];


        // ---------------------------------------------------------
        // 플레이어 초기화
        // ---------------------------------------------------------

        this.player.reset(
            this.width / 2,
            this.height / 2
        );


        // ---------------------------------------------------------
        // 시간 초기화
        // ---------------------------------------------------------

        this.startTime =
            performance.now();

        this.lastTime =
            performance.now();


        this.survivalTime = 0;


        // ---------------------------------------------------------
        // 타이머 초기화
        // ---------------------------------------------------------

        this.arrowTimer = 0;

        this.patternTimer = 0;

    }


    // =============================================================
    // 일시정지
    // =============================================================

    togglePause() {

        if (
            !this.running ||
            this.gameOver
        ) {

            return;

        }


        this.paused =
            !this.paused;


        // ---------------------------------------------------------
        // 다시 시작할 때 시간 보정
        // ---------------------------------------------------------

        if (!this.paused) {

            this.lastTime =
                performance.now();

            this.startTime =
                performance.now() -
                this.survivalTime * 1000;

        }

    }


    // =============================================================
    // 메인 업데이트
    // =============================================================

    update() {

        // ---------------------------------------------------------
        // 게임이 실행 중이 아니면 종료
        // ---------------------------------------------------------

        if (
            !this.running ||
            this.gameOver
        ) {

            return;

        }


        // ---------------------------------------------------------
        // 일시정지 중이면 업데이트하지 않음
        // ---------------------------------------------------------

        if (this.paused) {

            return;

        }


        const now =
            performance.now();


        let delta =
            (now - this.lastTime) / 1000;


        this.lastTime = now;


        // ---------------------------------------------------------
        // 너무 큰 프레임 간격 방지
        // ---------------------------------------------------------

        delta =
            Math.min(
                delta,
                0.05
            );


        // =========================================================
        // 생존 시간 계산
        // =========================================================

        this.survivalTime =
            (now - this.startTime) / 1000;


        // =========================================================
        // 플레이어 업데이트
        // =========================================================

        this.player.update(
            delta,
            this.keys,
            this.width,
            this.height
        );


        // =========================================================
        // 화살 생성
        // =========================================================

        this.arrowTimer += delta;


        /*
            난이도

            0초  : 1.0
            5초  : 1.5
            10초 : 2.0
            15초 : 2.5
            이후 계속 증가
        */

        const difficulty =
            1 +
            this.survivalTime * 0.10;


        /*
            기본 생성 간격

            초반 약 0.42초
            이후 점점 짧아짐

            최소 0.13초
        */

        const spawnInterval =
            Math.max(
                0.13,
                0.42 -
                this.survivalTime * 0.018
            );


        if (
            this.arrowTimer >=
            spawnInterval
        ) {

            this.arrowTimer = 0;

            this.spawnAttack(
                difficulty
            );

        }


        // =========================================================
        // 특수 패턴
        // =========================================================

        this.patternTimer += delta;


        if (
            this.patternTimer >=
            this.patternCooldown
        ) {

            this.patternTimer = 0;

            this.trySpecialPattern();

        }


        // =========================================================
        // 화살 업데이트
        // =========================================================

        for (
            const arrow of this.arrows
        ) {

            arrow.update(delta);

        }


        // =========================================================
        // 충돌 검사
        // =========================================================

        this.checkCollisions();


        // =========================================================
        // 화면 밖 화살 제거
        // =========================================================

        this.removeDeadArrows();


        // =========================================================
        // 플레이어 사망
        // =========================================================

        if (
            this.player.health <= 0
        ) {

            this.endGame();

        }

    }


    // =============================================================
    // 기본 공격
    // =============================================================

    spawnAttack(difficulty) {

        /*
            기본 화살 수

            시간이 지날수록 증가
        */

        let count = 1;


        if (
            this.survivalTime >= 3
        ) {

            if (
                Math.random() < 0.35
            ) {

                count = 2;

            }

        }


        if (
            this.survivalTime >= 6
        ) {

            if (
                Math.random() < 0.45
            ) {

                count = 2;

            }

        }


        if (
            this.survivalTime >= 10
        ) {

            if (
                Math.random() < 0.55
            ) {

                count = 3;

            }

        }


        /*
            실제 화살 생성
        */

        for (
            let i = 0;
            i < count;
            i++
        ) {

            this.createAimedArrow(
                difficulty
            );

        }

    }


    // =============================================================
    // 플레이어를 겨냥하는 화살
    // =============================================================

    createAimedArrow(difficulty) {

        const side =
            Math.floor(
                Math.random() * 4
            );


        let x;
        let y;


        // ---------------------------------------------------------
        // 위
        // ---------------------------------------------------------

        if (side === 0) {

            x =
                Math.random() *
                this.width;

            y = -60;

        }


        // ---------------------------------------------------------
        // 오른쪽
        // ---------------------------------------------------------

        else if (side === 1) {

            x =
                this.width + 60;

            y =
                Math.random() *
                this.height;

        }


        // ---------------------------------------------------------
        // 아래
        // ---------------------------------------------------------

        else if (side === 2) {

            x =
                Math.random() *
                this.width;

            y =
                this.height + 60;

        }


        // ---------------------------------------------------------
        // 왼쪽
        // ---------------------------------------------------------

        else {

            x = -60;

            y =
                Math.random() *
                this.height;

        }


        // =========================================================
        // 플레이어 예측
        // =========================================================

        /*
            현재 위치만 보는 게 아니라
            플레이어가 움직이고 있는 방향을
            약간 예측한다.
        */

        let prediction = 0;


        if (
            this.survivalTime >= 5
        ) {

            prediction = 0.18;

        }


        if (
            this.survivalTime >= 10
        ) {

            prediction = 0.28;

        }


        let targetX =
            this.player.x;

        let targetY =
            this.player.y;


        /*
            플레이어 이동 방향 추정
        */

        if (
            this.keys["ArrowLeft"] ||
            this.keys["a"] ||
            this.keys["A"]
        ) {

            targetX -=
                this.player.speed *
                prediction;

        }


        if (
            this.keys["ArrowRight"] ||
            this.keys["d"] ||
            this.keys["D"]
        ) {

            targetX +=
                this.player.speed *
                prediction;

        }


        if (
            this.keys["ArrowUp"] ||
            this.keys["w"] ||
            this.keys["W"]
        ) {

            targetY -=
                this.player.speed *
                prediction;

        }


        if (
            this.keys["ArrowDown"] ||
            this.keys["s"] ||
            this.keys["S"]
        ) {

            targetY +=
                this.player.speed *
                prediction;

        }


        // ---------------------------------------------------------
        // 조준 오차
        // ---------------------------------------------------------

        /*
            완벽하게 조준하면
            너무 불공평하기 때문에
            약간의 랜덤 오차를 넣는다.
        */

        const accuracy =
            Math.max(
                18,
                65 -
                this.survivalTime * 3
            );


        targetX +=
            (Math.random() - 0.5) *
            accuracy;

        targetY +=
            (Math.random() - 0.5) *
            accuracy;


        // =========================================================
        // 방향 계산
        // =========================================================

        const dx =
            targetX - x;

        const dy =
            targetY - y;


        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );


        if (
            distance === 0
        ) {

            return;

        }


        // =========================================================
        // 화살 속도
        // =========================================================

        const speed =
            235 +
            Math.min(
                190,
                this.survivalTime * 13
            );


        const vx =
            dx / distance *
            speed;

        const vy =
            dy / distance *
            speed;


        // =========================================================
        // 화살 생성
        // =========================================================

        this.arrows.push(

            new Arrow(
                x,
                y,
                vx,
                vy
            )

        );

    }


    // =============================================================
    // 특수 패턴 선택
    // =============================================================

    trySpecialPattern() {

        /*
            4초 전에는 특수 패턴 없음
        */

        if (
            this.survivalTime < 4
        ) {

            return;

        }


        /*
            특수 패턴 등장 확률
        */

        let chance =
            0.18;


        if (
            this.survivalTime >= 7
        ) {

            chance = 0.30;

        }


        if (
            this.survivalTime >= 10
        ) {

            chance = 0.42;

        }


        if (
            this.survivalTime >= 15
        ) {

            chance = 0.55;

        }


        if (
            Math.random() >
            chance
        ) {

            return;

        }


        /*
            패턴 랜덤 선택
        */

        const pattern =
            Math.floor(
                Math.random() * 5
            );


        switch (pattern) {

            case 0:

                this.fanPattern();

                break;


            case 1:

                this.doubleSidePattern();

                break;


            case 2:

                this.crossPattern();

                break;


            case 3:

                this.circlePattern();

                break;


            case 4:

                this.randomBurst();

                break;

        }

    }


    // =============================================================
    // 부채꼴 공격
    // =============================================================

    fanPattern() {

        const side =
            Math.floor(
                Math.random() * 4
            );


        let x;
        let y;


        if (side === 0) {

            x =
                this.width / 2;

            y = -50;

        }

        else if (side === 1) {

            x =
                this.width + 50;

            y =
                this.height / 2;

        }

        else if (side === 2) {

            x =
                this.width / 2;

            y =
                this.height + 50;

        }

        else {

            x = -50;

            y =
                this.height / 2;

        }


        /*
            플레이어 방향
        */

        const baseAngle =
            Math.atan2(
                this.player.y - y,
                this.player.x - x
            );


        /*
            화살 개수

            시간이 지날수록 증가
        */

        let count = 5;


        if (
            this.survivalTime >= 10
        ) {

            count = 7;

        }


        if (
            this.survivalTime >= 15
        ) {

            count = 9;

        }


        const spread =
            Math.PI / 3;


        for (
            let i = 0;
            i < count;
            i++
        ) {

            const angle =
                baseAngle -
                spread / 2 +
                spread *
                (
                    i /
                    (count - 1)
                );


            this.createDirectionalArrow(
                x,
                y,
                angle
            );

        }

    }


    // =============================================================
    // 양쪽에서 공격
    // =============================================================

    doubleSidePattern() {

        /*
            왼쪽 + 오른쪽
        */

        const targetY =
            this.player.y;


        const speed =
            260 +
            Math.min(
                140,
                this.survivalTime * 10
            );


        /*
            왼쪽
        */

        const leftX = -60;

        const leftY =
            targetY +
            (Math.random() - 0.5) *
            100;


        const leftAngle =
            Math.atan2(
                targetY - leftY,
                this.player.x - leftX
            );


        this.createDirectionalArrow(
            leftX,
            leftY,
            leftAngle,
            speed
        );


        /*
            오른쪽
        */

        const rightX =
            this.width + 60;


        const rightY =
            targetY +
            (Math.random() - 0.5) *
            100;


        const rightAngle =
            Math.atan2(
                targetY - rightY,
                this.player.x - rightX
            );


        this.createDirectionalArrow(
            rightX,
            rightY,
            rightAngle,
            speed
        );


        /*
            10초 이후에는
            위아래까지 추가
        */

        if (
            this.survivalTime >= 10
        ) {

            const topAngle =
                Math.atan2(
                    this.player.y + 10,
                    this.player.x -
                    this.width / 2
                );


            this.createDirectionalArrow(
                this.width / 2,
                -60,
                topAngle,
                speed
            );


            const bottomAngle =
                Math.atan2(
                    this.player.y -
                    this.height - 10,
                    this.player.x -
                    this.width / 2
                );


            this.createDirectionalArrow(
                this.width / 2,
                this.height + 60,
                bottomAngle,
                speed
            );

        }

    }


    // =============================================================
    // 십자 공격
    // =============================================================

    crossPattern() {

        const centerX =
            this.width / 2;

        const centerY =
            this.height / 2;


        /*
            화면 네 방향
        */

        const positions = [

            {
                x: centerX,
                y: -60
            },

            {
                x: this.width + 60,
                y: centerY
            },

            {
                x: centerX,
                y: this.height + 60
            },

            {
                x: -60,
                y: centerY
            }

        ];


        const speed =
            275 +
            Math.min(
                150,
                this.survivalTime * 10
            );


        for (
            const position
            of positions
        ) {

            const angle =
                Math.atan2(
                    this.player.y -
                    position.y,

                    this.player.x -
                    position.x
                );


            this.createDirectionalArrow(
                position.x,
                position.y,
                angle,
                speed
            );

        }

    }


    // =============================================================
    // 원형 공격
    // =============================================================

    circlePattern() {

        const centerX =
            this.width / 2;

        const centerY =
            this.height / 2;


        let count = 8;


        if (
            this.survivalTime >= 10
        ) {

            count = 10;

        }


        if (
            this.survivalTime >= 15
        ) {

            count = 12;

        }


        const speed =
            210 +
            Math.min(
                130,
                this.survivalTime * 8
            );


        for (
            let i = 0;
            i < count;
            i++
        ) {

            const angle =
                (
                    Math.PI * 2
                ) *
                (
                    i / count
                );


            this.createDirectionalArrow(
                centerX,
                centerY,
                angle,
                speed
            );

        }

    }


    // =============================================================
    // 랜덤 폭발 패턴
    // =============================================================

    randomBurst() {

        /*
            플레이어 주변을 직접 겨냥하지 않고
            다양한 방향에서 무작위로 발사
        */

        let count = 6;


        if (
            this.survivalTime >= 10
        ) {

            count = 9;

        }


        if (
            this.survivalTime >= 15
        ) {

            count = 12;

        }


        for (
            let i = 0;
            i < count;
            i++
        ) {

            const side =
                Math.floor(
                    Math.random() * 4
                );


            let x;
            let y;


            if (side === 0) {

                x =
                    Math.random() *
                    this.width;

                y = -60;

            }

            else if (side === 1) {

                x =
                    this.width + 60;

                y =
                    Math.random() *
                    this.height;

            }

            else if (side === 2) {

                x =
                    Math.random() *
                    this.width;

                y =
                    this.height + 60;

            }

            else {

                x = -60;

                y =
                    Math.random() *
                    this.height;

            }


            const angle =
                Math.atan2(
                    this.player.y - y,
                    this.player.x - x
                );


            /*
                랜덤 오차
            */

            const randomAngle =
                angle +
                (
                    Math.random() - 0.5
                ) *
                0.35;


            this.createDirectionalArrow(
                x,
                y,
                randomAngle
            );

        }

    }


    // =============================================================
    // 특정 방향으로 화살 생성
    // =============================================================

    createDirectionalArrow(
        x,
        y,
        angle,
        customSpeed = null
    ) {

        const speed =
            customSpeed ??
            (
                240 +
                Math.min(
                    170,
                    this.survivalTime * 12
                )
            );


        const vx =
            Math.cos(angle) *
            speed;

        const vy =
            Math.sin(angle) *
            speed;


        this.arrows.push(

            new Arrow(
                x,
                y,
                vx,
                vy
            )

        );

    }


    // =============================================================
    // 충돌 검사
    // =============================================================

    checkCollisions() {

        for (
            const arrow
            of this.arrows
        ) {

            if (
                arrow.dead
            ) {

                continue;

            }


            if (
                arrow.collidesWith(
                    this.player
                )
            ) {

                /*
                    대시 중에는
                    Player에서 무시한다.
                */

                const oldHealth =
                    this.player.health;


                this.player.takeDamage();


                /*
                    실제로 데미지를 입었을 때만
                    화살 제거
                */

                if (
                    this.player.health <
                    oldHealth
                ) {

                    arrow.dead = true;

                }

            }

        }

    }


    // =============================================================
    // 화살 제거
    // =============================================================

    removeDeadArrows() {

        this.arrows =
            this.arrows.filter(
                (arrow) => {

                    /*
                        이미 죽은 화살
                    */

                    if (
                        arrow.dead
                    ) {

                        return false;

                    }


                    /*
                        너무 오래된 화살
                    */

                    if (
                        arrow.life >
                        arrow.maxLife
                    ) {

                        return false;

                    }


                    /*
                        화면에서 아주 멀리
                        벗어난 화살
                    */

                    if (
                        arrow.x <
                        -150 ||
                        arrow.x >
                        this.width + 150 ||
                        arrow.y <
                        -150 ||
                        arrow.y >
                        this.height + 150
                    ) {

                        return false;

                    }


                    return true;

                }
            );

    }


    // =============================================================
    // 게임 종료
    // =============================================================

    endGame() {

        if (
            this.gameOver
        ) {

            return;

        }


        this.running = false;

        this.gameOver = true;

        this.paused = false;


        /*
            최고 기록 갱신
        */

        if (
            this.survivalTime >
            this.bestTime
        ) {

            this.bestTime =
                this.survivalTime;


            localStorage.setItem(
                "juklim-gosu-best",
                this.bestTime
            );

        }

    }


    // =============================================================
    // 생존 시간 반환
    // =============================================================

    getSurvivalTime() {

        return this.survivalTime;

    }


    // =============================================================
    // 체력 반환
    // =============================================================

    getHealth() {

        return this.player.health;

    }


    // =============================================================
    // 게임오버 확인
    // =============================================================

    isGameOver() {

        return this.gameOver;

    }


    // =============================================================
    // 최고 기록 반환
    // =============================================================

    getBestTime() {

        return this.bestTime;

    }


    // =============================================================
    // 일시정지 여부
    // =============================================================

    isPaused() {

        return this.paused;

    }


    // =============================================================
    // 화면 그리기
    // =============================================================

    draw() {

        const ctx =
            this.ctx;


        // =========================================================
        // 배경
        // =========================================================

        this.drawBackground();


        // =========================================================
        // 화살
        // =========================================================

        for (
            const arrow
            of this.arrows
        ) {

            arrow.draw(ctx);

        }


        // =========================================================
        // 플레이어
        // =========================================================

        this.player.draw(ctx);


        // =========================================================
        // 일시정지 화면
        // =========================================================

        if (
            this.paused
        ) {

            this.drawPauseScreen();

        }

    }


    // =============================================================
    // 배경
    // =============================================================

    drawBackground() {

        const ctx =
            this.ctx;


        // ---------------------------------------------------------
        // 기본 색
        // ---------------------------------------------------------

        ctx.fillStyle =
            "#6f9147";

        ctx.fillRect(
            0,
            0,
            this.width,
            this.height
        );


        // ---------------------------------------------------------
        // 대나무
        // ---------------------------------------------------------

        for (
            let x = -30;
            x < this.width + 50;
            x += 43
        ) {

            const sway =
                Math.sin(
                    x * 0.05 +
                    this.survivalTime * 0.4
                ) * 3;


            // 대나무 줄기

            ctx.strokeStyle =
                "#315b2b";

            ctx.lineWidth = 13;


            ctx.beginPath();

            ctx.moveTo(
                x + sway,
                0
            );

            ctx.lineTo(
                x - sway,
                this.height
            );

            ctx.stroke();


            // 밝은 부분

            ctx.strokeStyle =
                "rgba(130,160,80,0.4)";

            ctx.lineWidth = 3;


            ctx.beginPath();

            ctx.moveTo(
                x - 3 + sway,
                0
            );

            ctx.lineTo(
                x - 6 - sway,
                this.height
            );

            ctx.stroke();


            // 대나무 마디

            for (
                let y = 25;
                y < this.height;
                y += 55
            ) {

                ctx.strokeStyle =
                    "#254722";

                ctx.lineWidth = 4;


                ctx.beginPath();

                ctx.moveTo(
                    x - 8,
                    y
                );

                ctx.lineTo(
                    x + 8,
                    y
                );

                ctx.stroke();

            }

        }


        // =========================================================
        // 잎사귀
        // =========================================================

        for (
            let i = 0;
            i < 30;
            i++
        ) {

            const x =
                (
                    i * 97 +
                    40
                ) %
                this.width;


            const y =
                (
                    i * 137 +
                    20
                ) %
                this.height;


            const rotation =
                Math.sin(i) * 0.8;


            ctx.save();


            ctx.translate(
                x,
                y
            );


            ctx.rotate(
                rotation
            );


            ctx.fillStyle =
                "rgba(25,65,25,0.3)";


            ctx.beginPath();

            ctx.ellipse(
                0,
                0,
                23,
                7,
                0,
                0,
                Math.PI * 2
            );

            ctx.fill();


            ctx.restore();

        }


        // =========================================================
        // 중앙 밝기
        // =========================================================

        const gradient =
            ctx.createRadialGradient(
                this.width / 2,
                this.height / 2,
                70,
                this.width / 2,
                this.height / 2,
                430
            );


        gradient.addColorStop(
            0,
            "rgba(230,230,160,0.12)"
        );


        gradient.addColorStop(
            1,
            "rgba(0,0,0,0.30)"
        );


        ctx.fillStyle =
            gradient;


        ctx.fillRect(
            0,
            0,
            this.width,
            this.height
        );

    }


    // =============================================================
    // 일시정지 화면
    // =============================================================

    drawPauseScreen() {

        const ctx =
            this.ctx;


        ctx.fillStyle =
            "rgba(0,0,0,0.55)";


        ctx.fillRect(
            0,
            0,
            this.width,
            this.height
        );


        ctx.textAlign =
            "center";


        ctx.fillStyle =
            "#fff4c7";


        ctx.font =
            "bold 42px sans-serif";


        ctx.fillText(
            "PAUSE",
            this.width / 2,
            this.height / 2
        );


        ctx.font =
            "18px sans-serif";


        ctx.fillStyle =
            "#ded7b5";


        ctx.fillText(
            "P를 눌러 계속하기",
            this.width / 2,
            this.height / 2 + 40
        );

    }

}
