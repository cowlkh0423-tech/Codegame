export class Arrow {

    constructor(x, y, vx, vy) {

        this.x = x;
        this.y = y;

        this.vx = vx;
        this.vy = vy;

        this.length = 42;

        this.width = 4;

        this.dead = false;

        // 화살이 너무 오래 존재하지 않도록
        this.life = 0;
        this.maxLife = 6;

    }


    /*
        화살 업데이트
    */

    update(delta) {

        this.x +=
            this.vx * delta;

        this.y +=
            this.vy * delta;

        this.life += delta;


        /*
            너무 오래 존재하면 제거
        */

        if (
            this.life >
            this.maxLife
        ) {

            this.dead = true;

        }

    }


    /*
        화살과 플레이어 충돌
    */

    collidesWith(player) {

        /*
            화살의 앞부분 위치 계산
        */

        const speed =
            Math.sqrt(
                this.vx * this.vx +
                this.vy * this.vy
            );


        if (speed === 0) {

            return false;

        }


        const dirX =
            this.vx / speed;

        const dirY =
            this.vy / speed;


        /*
            화살촉 위치
        */

        const tipX =
            this.x +
            dirX * 8;

        const tipY =
            this.y +
            dirY * 8;


        /*
            플레이어와 화살촉 사이 거리
        */

        const dx =
            tipX - player.x;

        const dy =
            tipY - player.y;


        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );


        /*
            충돌 판정
        */

        return (
            distance <
            player.radius + 5
        );

    }


    /*
        화살 그리기
    */

    draw(ctx) {

        const angle =
            Math.atan2(
                this.vy,
                this.vx
            );


        ctx.save();


        /*
            화살 위치로 이동
        */

        ctx.translate(
            this.x,
            this.y
        );


        /*
            화살 방향으로 회전
        */

        ctx.rotate(angle);


        /*
            화살대
        */

        ctx.strokeStyle =
            "#5a3b22";

        ctx.lineWidth =
            this.width;

        ctx.beginPath();

        ctx.moveTo(
            -this.length,
            0
        );

        ctx.lineTo(
            4,
            0
        );

        ctx.stroke();


        /*
            화살 깃털
        */

        ctx.fillStyle =
            "#b49b70";

        ctx.beginPath();

        ctx.moveTo(
            -this.length,
            0
        );

        ctx.lineTo(
            -this.length + 12,
            -7
        );

        ctx.lineTo(
            -this.length + 8,
            0
        );

        ctx.lineTo(
            -this.length + 12,
            7
        );

        ctx.closePath();

        ctx.fill();


        /*
            화살촉
        */

        ctx.fillStyle =
            "#24231d";

        ctx.beginPath();

        ctx.moveTo(
            12,
            0
        );

        ctx.lineTo(
            -2,
            -7
        );

        ctx.lineTo(
            1,
            0
        );

        ctx.lineTo(
            -2,
            7
        );

        ctx.closePath();

        ctx.fill();


        /*
            화살촉 빛
        */

        ctx.strokeStyle =
            "#9d9475";

        ctx.lineWidth = 1;

        ctx.beginPath();

        ctx.moveTo(
            12,
            0
        );

        ctx.lineTo(
            1,
            0
        );

        ctx.stroke();


        ctx.restore();

    }

}
