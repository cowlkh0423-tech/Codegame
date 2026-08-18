import { Player } from "./player.js";
import { Arrow } from "./arrow.js";


export class Game {

    constructor(canvas) {

        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        this.width = canvas.width;
        this.height = canvas.height;


        /*
            게임 상태
        */

        this.running = false;
        this.gameOver = false;


        /*
            플레이어
        */

        this.player = new Player(
            this.width / 2,
            this.height / 2
        );


        /*
            화살
        */

        this.arrows = [];


        /*
            게임 시간
        */

        this.startTime = 0;
        this.survivalTime = 0;


        /*
            화살 생성 시간
        */

        this.arrowTimer = 0;


        /*
            최고 기록
        */

        this.bestTime =
            Number(
                localStorage.getItem(
                    "juklim-gosu-best"
                )
            ) || 0;


        /*
            마지막 프레임 시간
        */

        this.lastTime =
            performance.now();


        /*
            키보드
        */

        this.keys = {};

        window.addEventListener(
            "keydown",
            (event) => {

                this.keys[event.key] = true;

            }
        );


        window.addEventListener(
            "keyup",
            (event) => {

                this.keys[event.key] = false;

            }
        );

    }


    /*
        게임 시작
    */

    start() {

        this.running = true;
        this.gameOver = false;

        this.arrows = [];


        /*
            플레이어 초기화
        */

        this.player.reset(
            this.width / 2,
            this.height / 2
        );


        /*
            시간 초기화
        */

        this.startTime =
            performance.now();

        this.survivalTime = 0;

        this.arrowTimer = 0;


        this.lastTime =
            performance.now();

    }


    /*
        게임 업데이트
    */

    update() {

        if (!this.running) {

            return;

        }


        const now =
            performance.now();


        let delta =
            (now - this.lastTime) / 1000;


        /*
            프레임이 너무 오래 멈췄을 때
            순간이동 방지
        */

        delta =
            Math.min(delta, 0.05);


        this.lastTime = now;


        /*
            생존 시간
        */

        this.survivalTime =
            (now - this.startTime) / 1000;


        /*
            플레이어 이동
        */

        this.player.update(
            delta,
            this.keys,
            this.width,
            this.height
        );


        /*
            화살 생성
        */

        this.arrowTimer += delta;


        /*
            시간이 지나면
            화살 생성 속도가 빨라진다.
        */

        const spawnInterval =
            Math.max(
                0.18,
                0.75 -
                this.survivalTime * 0.012
            );


        if (
            this.arrowTimer >=
            spawnInterval
        ) {

            this.arrowTimer = 0;

            this.spawnArrow();

        }


        /*
            화살 업데이트
        */

        for (
            const arrow of this.arrows
        ) {

            arrow.update(delta);

        }


        /*
            충돌 검사
        */

        for (
            const arrow of this.arrows
        ) {

            if (
                arrow.collidesWith(
                    this.player
                )
            ) {

                this.player.takeDamage();

                arrow.dead = true;

            }

        }


        /*
            죽은 화살 제거
        */

        this.arrows =
            this.arrows.filter(
                arrow => !arrow.dead
            );


        /*
            플레이어 사망
        */

        if (
            this.player.health <= 0
        ) {

            this.endGame();

        }

    }


    /*
        화살 생성
    */

    spawnArrow() {

        const side =
            Math.floor(
                Math.random() * 4
            );


        let x;
        let y;


        /*
            화면 밖에서 생성
        */

        if (side === 0) {

            // 위

            x =
                Math.random() *
                this.width;

            y = -40;

        }


        else if (side === 1) {

            // 오른쪽

            x =
                this.width + 40;

            y =
                Math.random() *
                this.height;

        }


        else if (side === 2) {

            // 아래

            x =
                Math.random() *
                this.width;

            y =
                this.height + 40;

        }


        else {

            // 왼쪽

            x = -40;

            y =
                Math.random() *
                this.height;

        }


        /*
            플레이어 방향으로 발사
        */

        const targetX =
            this.player.x;

        const targetY =
            this.player.y;


        const dx =
            targetX - x;

        const dy =
            targetY - y;


        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );


        /*
            시간이 지날수록
            화살이 빨라진다.
        */

        const speed =
            180 +
            this.survivalTime * 5;


        const vx =
            dx / distance * speed;

        const vy =
            dy / distance * speed;


        this.arrows.push(

            new Arrow(
                x,
                y,
                vx,
                vy
            )

        );

    }


    /*
        게임 종료
    */

    endGame() {

        this.running = false;

        this.gameOver = true;


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


    /*
        현재 생존 시간
    */

    getSurvivalTime() {

        return this.survivalTime;

    }


    /*
        현재 체력
    */

    getHealth() {

        return this.player.health;

    }


    /*
        게임오버 여부
    */

    isGameOver() {

        return this.gameOver;

    }


    /*
        최고 기록
    */

    getBestTime() {

        return this.bestTime;

    }


    /*
        게임 그리기
    */

    draw() {

        const ctx =
            this.ctx;


        /*
            대나무 숲 배경
        */

        ctx.fillStyle =
            "#6f9147";

        ctx.fillRect(
            0,
            0,
            this.width,
            this.height
        );


        /*
            대나무
        */

        this.drawBamboo();


        /*
            화살
        */

        for (
            const arrow of this.arrows
        ) {

            arrow.draw(ctx);

        }


        /*
            플레이어
        */

        this.player.draw(ctx);

    }


    /*
        대나무 배경
    */

    drawBamboo() {

        const ctx =
            this.ctx;


        for (
            let x = -20;
            x < this.width + 40;
            x += 45
        ) {

            /*
                대나무 줄기
            */

            ctx.strokeStyle =
                "#315d2b";

            ctx.lineWidth = 13;


            ctx.beginPath();

            ctx.moveTo(
                x,
                0
            );

            ctx.lineTo(
                x + Math.sin(x) * 3,
                this.height
            );

            ctx.stroke();


            /*
                밝은 부분
            */

            ctx.strokeStyle =
                "#6f994e";

            ctx.lineWidth = 3;


            ctx.beginPath();

            ctx.moveTo(
                x - 3,
                0
            );

            ctx.lineTo(
                x - 3,
                this.height
            );

            ctx.stroke();


            /*
                대나무 마디
            */

            for (
                let y = 30;
                y < this.height;
                y += 55
            ) {

                ctx.strokeStyle =
                    "#254722";

                ctx.lineWidth = 4;


                ctx.beginPath();

                ctx.moveTo(
                    x - 7,
                    y
                );

                ctx.lineTo(
                    x + 7,
                    y
                );

                ctx.stroke();

            }

        }

    }

}
