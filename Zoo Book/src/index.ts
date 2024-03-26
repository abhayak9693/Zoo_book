import {MaskRevealView} from "~/ui/ThreeView";
declare class DocumentTouch {}
class Main {
    public WEBP_SUPPORTED = false;
    public PREMULTIPLIEDALPHA = true;
    private maskRevealView: MaskRevealView;
    private refCalcHeightDiv = document.getElementById('CALC_HEIGHT_DIV') as HTMLDivElement;
    public I_OS: boolean = (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    public IS_TOUCH_DEVICE: boolean = 'ontouchstart' in window || ((window as any).DocumentTouch && document instanceof DocumentTouch); // https://github.com/Modernizr/Modernizr/blob/master/feature-detects/touchevents.js
    public IS_ANDROID = navigator.userAgent.toLowerCase().indexOf("android") > -1; //&& ua.indexOf("mobile");
    constructor() {
        this.supportsWebp((supported: boolean) => {
            this.WEBP_SUPPORTED = supported;
            this.PREMULTIPLIEDALPHA = this.I_OS || this.IS_ANDROID || this.WEBP_SUPPORTED ? false : false;
            console.log('webp support', supported);
            console.log('ios: ', this.I_OS);
            console.log('IS_TOUCH_DEVICE: ', this.IS_TOUCH_DEVICE);
            this.maskRevealView = new MaskRevealView(document.querySelector('#canvasContainer'));
            this.resize();
            window.addEventListener('resize', this.resize);
        });
    }

    supportsWebp(cb: Function) {
        let supported = false;
        var image = new Image();

        function addResult(event) {
            // if the event is from 'onload', check the see if the image's width is
            // 1 pixel (which indicates support). otherwise, it fails

            var result = event && event.type === 'load' ? image.width === 1 : false;

            // if it is the base test, and the result is false, just set a literal false
            // rather than use the Boolean constructor
            //   addTest(name, (baseTest && result) ? new Boolean(result) : result);
            cb(result);
        }

        image.onerror = addResult;
        image.onload = addResult;
        image.src = 'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=';
        return supported;
    }

    resize = () => {
        document.documentElement.style.setProperty('--window-height', `${window.innerHeight}px`)
        document.documentElement.style.setProperty(`--window-ui-offset`, (this.refCalcHeightDiv.clientHeight - window.innerHeight) + 'px');
    }
}

window.onload = () => {
    // @ts-ignore

    window.Main = new Main();
};
