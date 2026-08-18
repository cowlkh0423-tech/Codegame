export class Player {

    constructor(x, y) {

        this.x = x;
        this.y = y;

        // 캐릭터 크기
        this.radius = 15;

        // 기본 이동 속도
        this.speed = 230;

        // 대시 속도
        this.dashSpeed = 650;

        // 체력
        this.maxHealth = 3;
        this.health = this.maxHealth;

        // 대시 상태
        this.dashing = false;

        // 대시 지속 시간
        this.dashTime = 0;

        // 대시 쿨타임
        this.dashCooldown = 0;

        // 대시 방향
        this.dashX = 0;
        this.dashY = 0;

    }


    /*
        플레이어 초기화
    */

    reset(x, y) {

        this.x = x;
        this.y = y;

        this.health =
            this.maxHealth;

        this.dashing = false;

        this.dashTime = 0;

        this.dashCooldown = 0;

        this.dashX = 0;
        this.dashY = 0;

    }


    /*
        플레이어 업데이트
    */

    update(
        delta,
        keys,
        width,
        height
    ) {

        /*
            대시 쿨타임 감소
        */

        if (
            this.dashCooldown > 0
        ) {

            this.dashCooldown -= delta;

        }


        /*
            이동 방향
        */

        let moveX = 0;
        let moveY = 0;


        /*
            WASD
        */

        if (
            keys["w"] ||
            keys["W"] ||
            keys["ArrowUp"]
        ) {

            moveY -= 1;

        }


        if (
            keys["s"] ||
            keys["S"] ||
            keys["ArrowDown"]
        ) {

            moveY += 1;

        }


        if (
            keys["a"] ||
            keys["A"] ||
            keys["ArrowLeft"]
        ) {

            moveX -= 1;

        }


        if (
            keys["d"] ||
            keys["D"] ||
            keys["ArrowRight"]
        ) {

            moveX += 1;

        }


        /*
            대각선 이동 속도 보정
        */

        const length =
            Math.sqrt(
                moveX * moveX +
                moveY * moveY
            );


        if (length > 0) {

            moveX /= length;
            moveY /= length;

        }


        /*
            SHIFT 대시
        */

        if (
            keys["Shift"] &&
            !this.dashing &&
            this.dashCooldown <= 0 &&
            length > 0
        ) {

            this.dashing = true;

            this.dashTime = 0.16;

            this.dashCooldown = 1.2;

            this.dashX = moveX;

            this.dashY = moveY;

        }


        /*
            대시 중
        */

        if (this.dashing) {

            this.x +=
                this.dashX *
                this.dashSpeed *
                delta;

            this.y +=
                this.dashY *
                this.dashSpeed *
                delta;


            this.dashTime -= delta;


            if (
                this.dashTime <= 0
            ) {

                this.dashing = false;

            }

        }


        /*
            일반 이동
        */

        else {

            this.x +=
                moveX *
                this.speed *
                delta;

            this.y +=
                moveY *
                this.speed *
                delta;

        }


        /*
            화면 밖으로 나가지 못하게 함
        */

        this.x =
            Math.max(
                this.radius,
                Math.min(
                    width - this.radius,
                    this.x
                )
            );


        this.y =
            Math.max(
                this.radius,
                Math.min(
                    height - this.radius,
                    this.y
                )
            );

    }


    /*
        데미지
    */

    takeDamage() {

        /*
            대시 중에는 무적
        */

        if (
            this.dashing
        ) {

            return;

        }


        /*
            체력 감소
        */

        this.health--;

    }


    /*
        플레이어 그리기
    */

    draw(ctx) {

        /*
            그림자
        */

        ctx.fillStyle =
            "rgba(0, 0, 0, 0.25)";

        ctx.beginPath();

        ctx.ellipse(
            this.x,
            this.y + 14,
            17,
            7,
            0,
            0,
            Math.PI * 2
        );

        ctx.fill();


        /*
            대시 중이면
            주변에 효과
        */

        if (
            this.dashing
        ) {

            ctx.fillStyle =
                "rgba(255, 240, 150, 0.35)";

            ctx.beginPath();

            ctx.arc(
                this.x,
                this.y,
                28,
                0,
                Math.PI * 2
            );

            ctx.fill();

        }


        /*
            몸
        */

        ctx.fillStyle =
            "#456b3c";

        ctx.beginPath();

        ctx.ellipse(
            this.x,
            this.y + 8,
            14,
            15,
            0,
            0,
            Math.PI * 2
        );

        ctx.fill();


        /*
            얼굴
        */

        ctx.fillStyle =
            "#e5bd83";

        ctx.beginPath();

        ctx.arc(
            this.x,
            this.y - 3,
            9,
            0,
            Math.PI * 2
        );

        ctx.fill();


        /*
            삿갓
        */

        ctx.fillStyle =
            "#80643a";

        ctx.beginPath();

        ctx.moveTo(
            this.x,
            this.y - 23
        );

        ctx.lineTo(
            this.x - 19,
            this.y - 5
        );

        ctx.lineTo(
            this.x + 19,
            this.y - 5
        );

        ctx.closePath();

        ctx.fill();


        /*
            삿갓 테두리
        */

        ctx.strokeStyle =
            "#44341d";

        ctx.lineWidth = 2;

        ctx.stroke();


        /*
            눈
        */

        ctx.fillStyle =
            "#17140d";

        ctx.fillRect(
            this.x - 4,
            this.y - 4,
            2,
            2
        );

        ctx.fillRect(
            this.x + 2,
            this.y - 4,
            2,
            2
        );

    }

}
