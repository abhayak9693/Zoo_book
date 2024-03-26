import {gsap} from "gsap";

export class MouseMoveTracker {


    public pos = {
        prevX: 0,
        prevY: 0,
        x: 0,
        y: 0,
        xNormalizedFromCenter: 0, //-0.5 to + 0.5
        yNormalizedFromCenter: 0, //-0.5 to + 0.5
        distanceFromCenter: 0,
        xEased: 0,
        yEased: 0
    }
    private activeEaseString: string = 'none';
    private fromCenterMoveEase = gsap.parseEase(this.activeEaseString);

    private dim = {
        width: window.innerWidth,
        height: window.innerHeight,
        halfWidth: window.innerWidth * 0.5,
        halfHeight: window.innerHeight * 0.5
    };
    public speed = {
        x: 10,
        y: 10,
        ease: 0.01
    }
    public mouse = {
        x: 0,
        y: 0,
        eventX:0,
        eventY: 0,
        xNormalizedFromCenter: 0,
        yNormalizedFromCenter: 0,
        distanceFromCenter: 0,
        xNormalizedFromCenterMapFunction: gsap.utils.mapRange(-this.dim.halfWidth, this.dim.halfWidth, -1, 1),
        yNormalizedFromCenterMapFunction: gsap.utils.mapRange(-this.dim.halfHeight, this.dim.halfHeight, -1, 1),
        xEased: 0,
        yEased: 0
    };

    //Edge / bounds functions:
    private edgePixelSlowdown = 100;
    private edgeMoveOffset = 200;
    private mapEdge = gsap.utils.normalize(0, this.edgePixelSlowdown);
    private clampNormal = gsap.utils.clamp(0, 1);
    private clampMoveNormal = gsap.utils.clamp(-1, 1);
    private normalizeDiff = (value: number) => this.clampNormal(this.mapEdge(value));

    constructor() {
        this.enable();
    }

    private enable() {

        if (!(window as any).Main.IS_TOUCH_DEVICE) {
            window.addEventListener('mousemove', this.mouseMove);
        }
    }

    private mouseMove = (event: MouseEvent) => {
        // var dt = 1.0 - Math.pow(1.0 - 0.1, gsap.ticker.deltaRatio());
        this.mouse.eventX = event.clientX;
        this.mouse.eventY = event.clientY;
        this.mouse.x = event.x - this.dim.halfWidth;
        this.mouse.y = event.y - this.dim.halfHeight;
        this.mouse.xNormalizedFromCenter = this.clampMoveNormal(this.mouse.xNormalizedFromCenterMapFunction(this.mouse.x));
        this.mouse.yNormalizedFromCenter = this.clampMoveNormal(this.mouse.yNormalizedFromCenterMapFunction(this.mouse.y));
        this.mouse.xEased = this.fromCenterMoveEase(Math.abs(this.mouse.xNormalizedFromCenter)) * (this.mouse.xNormalizedFromCenter > 0 ? 1 : -1);
        this.mouse.yEased = this.fromCenterMoveEase(Math.abs(this.mouse.yNormalizedFromCenter)) * (this.mouse.yNormalizedFromCenter > 0 ? 1 : -1);
        this.mouse.distanceFromCenter = Math.max(Math.abs(this.mouse.xEased), Math.abs(this.mouse.yEased));
        // console.log(this.pos.x);

    }

    raf() {
        this.pos.xEased += (this.mouse.xEased - this.pos.xEased) * this.speed.ease;
        this.pos.yEased += (this.mouse.yEased - this.pos.yEased) * this.speed.ease;
        this.pos.distanceFromCenter += (this.mouse.distanceFromCenter - this.pos.distanceFromCenter) * this.speed.ease;
        this.pos.prevX = this.pos.x;
        this.pos.prevY = this.pos.y;
        this.pos.x -= this.pos.xEased * this.speed.x;
        this.pos.y -= this.pos.yEased * this.speed.y;
    }

    public resize = () => {
        this.dim.width = window.innerWidth;
        this.dim.height = window.innerHeight;
        this.dim.halfWidth = this.dim.width * 0.5;
        this.dim.halfHeight = this.dim.height * 0.5;
        this.edgeMoveOffset = Math.min(this.dim.width, this.dim.height) * 0.1;
        this.mouse.xNormalizedFromCenterMapFunction = gsap.utils.mapRange(-this.dim.halfWidth + this.edgeMoveOffset, this.dim.halfWidth - this.edgeMoveOffset, -1, 1);
        this.mouse.yNormalizedFromCenterMapFunction = gsap.utils.mapRange(-this.dim.halfHeight + this.edgeMoveOffset, this.dim.halfHeight - this.edgeMoveOffset, -1, 1);

    }
}