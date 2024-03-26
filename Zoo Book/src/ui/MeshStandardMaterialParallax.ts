import {IUniform, MeshStandardMaterial, Shader, Texture, Vector2, Vector3, Vector4, WebGLRenderer} from "three";
import {MeshStandardMaterialParameters} from "three/src/materials/MeshStandardMaterial";
import * as THREE from "three";
import * as dat from 'dat.gui';
import {checkWebP} from "~/utils/MathUtils";

export interface PageData {
    frames: FrameElement[];
    meta: Meta;
}

export interface FrameElement {
    filename: string;
    frame: SpriteSourceSizeClass;
    rotated: boolean;
    trimmed: boolean;
    parallax?: { x: number, y: number };
    spriteSourceSize: SpriteSourceSizeClass;
    sourceSize: Size;
}

export interface SpriteSourceSizeClass {
    x: number;
    y: number;
    w: number;
    h: number;
}

export interface Size {
    w: number;
    h: number;
}

export interface Meta {
    app: string;
    version: string;
    image: string;
    format: string;
    size: Size;
    scale: string;
    smartupdate: string;
}

const DUMMY_TEXTURE = new THREE.Texture();

export class MeshStandardMaterialParallax extends MeshStandardMaterial {
    public iResolution: IUniform;
    private _gui: dat.GUI;

    private textures: Texture[] = [];
    private moveFactors: Vector2[] = [];
    private moveFactorDefaults: Vector2[] = [new Vector2(0.25, 0.25), new Vector2(0.5, 0.5), new Vector2(2, 1), new Vector2(1, 1), new Vector2(1.5, 0.1), new Vector2(3, 0.1)];
    private textureDimensions: Vector4[] = [];
    private anisotropy: number;

    constructor(anisotropy: number, renderer:WebGLRenderer, parameters?: MeshStandardMaterialParameters, gui?: dat.GUI) {
        super(parameters);
        this.renderer = renderer;
        this.anisotropy = anisotropy;
        this._gui = gui;
        this.onBeforeCompile = this.beforeCompileModifier;
    }

    public addPage = (pageData: PageData, pageNumber = 0) => {
        pageData.frames.reverse().forEach((frame, index) => {
            let filename = checkWebP(`images/0${pageNumber}/${frame.filename}`);
            let texture = new THREE.TextureLoader().load(filename, () => {
                this.renderer.initTexture(texture);
            });

            // texture.minFilter = THREE.LinearFilter; //avoids texture resize on webgl1;

            texture.flipY = false;
            texture.premultiplyAlpha = (window as any).Main.PREMULTIPLIEDALPHA;
            if (frame.filename.toLowerCase().indexOf('text') >=0) {
                // texture.minFilter = THREE.LinearFilter;
                frame.parallax = {x: 0, y: 0};
            }
            texture.anisotropy = this.anisotropy;
            if (frame.parallax) {
                this.moveFactors.push(new Vector2(frame.parallax.x, frame.parallax.y));
            } else {
                this.moveFactors.push(this.moveFactorDefaults[index]);
            }
            this.textures.push(texture);
            this.textureDimensions.push(new Vector4(
                frame.spriteSourceSize.x / frame.spriteSourceSize.w,
                frame.spriteSourceSize.y / frame.spriteSourceSize.h,
                frame.spriteSourceSize.w,
                frame.spriteSourceSize.h
            ));
        })
    }
    private renderer: WebGLRenderer;

    private beforeCompileModifier = (shader: Shader, renderer: WebGLRenderer) => {
        shader.uniforms.moveFactor = {value: this.moveFactors[1]};
        shader.uniforms.moveFactor2 = {value: this.moveFactors[2]};
        shader.uniforms.moveFactor3 = {value: this.moveFactors[3]};
        shader.uniforms.moveFactor4 = {value: this.moveFactors[4] ? this.moveFactors[4] : new Vector2()};
        shader.uniforms.moveFactor5 = {value: this.moveFactors[5] ? this.moveFactors[5] : new Vector2()};

        this.map = this.textures[0];
        shader.uniforms.map2 = {value: this.textures[1]};
        shader.uniforms.map3 = {value: this.textures[2]};
        shader.uniforms.map4 = {value: this.textures[3]};
        shader.uniforms.map5 = {value: this.textures[4] ? this.textures[4] : DUMMY_TEXTURE};
        shader.uniforms.map6 = {value: this.textures[5] ? this.textures[5] : DUMMY_TEXTURE};

        shader.uniforms.map2Dimensions = {value: this.textureDimensions[1]};
        shader.uniforms.map3Dimensions = {value: this.textureDimensions[2]};
        shader.uniforms.map4Dimensions = {value: this.textureDimensions[3]};
        shader.uniforms.map5Dimensions = {value: this.textureDimensions[4] ? this.textureDimensions[4] : new Vector4()};
        shader.uniforms.map6Dimensions = {value: this.textureDimensions[5] ? this.textureDimensions[5] : new Vector4()};

        shader.uniforms.iResolution = {value: new Vector3(2100, 1200, 1)};
        shader.uniforms.map2Offset = {value: new Vector2(0, 0)};

        this.iResolution = shader.uniforms.iResolution;


        shader.fragmentShader = shader.fragmentShader.replace(
            '#include <map_pars_fragment>',
            // language=GLSL
                `
                    #ifdef USE_MAP

                    uniform sampler2D map;
                    uniform sampler2D map2;
                    uniform sampler2D map3;
                    uniform sampler2D map4;
                    uniform sampler2D map5;
                    uniform sampler2D map6;
                    uniform vec2 moveFactor;
                    uniform vec2 moveFactor2;
                    uniform vec2 moveFactor3;
                    uniform vec2 moveFactor4;
                    uniform vec2 moveFactor5;
                    uniform vec2 map2Offset;
                    uniform vec4 map2Dimensions;
                    uniform vec4 map3Dimensions;
                    uniform vec4 map4Dimensions;
                    uniform vec4 map5Dimensions;
                    uniform vec4 map6Dimensions;
                    uniform vec3 iResolution;

                    #endif
            `);
        /* glsl */
        shader.fragmentShader = shader.fragmentShader.replace(
            '#include <map_fragment>',
            // language=GLSL
                `
                    #ifdef USE_MAP

                    vec4 texelColor = texture2D(map, vUv);
                    vec4 texelColor2 = texture2D(map2, ((vUv.xy +map2Offset * moveFactor)  * (iResolution.xy / map2Dimensions.zw) - map2Dimensions.xy));// text
                    vec4 texelColor3 = texture2D(map3, ((vUv.xy +map2Offset * moveFactor2)  * (iResolution.xy / map3Dimensions.zw) - map3Dimensions.xy));
                    vec4 texelColor4 = texture2D(map4, ((vUv.xy +map2Offset * moveFactor3)  * (iResolution.xy / map4Dimensions.zw) - map4Dimensions.xy));
                    vec4 texelColor5 = texture2D(map5, ((vUv.xy +map2Offset * moveFactor4)  * (iResolution.xy / map5Dimensions.zw) - map5Dimensions.xy));
                    vec4 texelColor6 = texture2D(map6, ((vUv.xy +map2Offset * moveFactor5)  * (iResolution.xy / map6Dimensions.zw) - map6Dimensions.xy));

                    texelColor = mapTexelToLinear(texelColor);
                    texelColor2 = mapTexelToLinear(texelColor2);
                    texelColor3 = mapTexelToLinear(texelColor3);
                    texelColor4 = mapTexelToLinear(texelColor4);
                    texelColor5 = mapTexelToLinear(texelColor5);
                    texelColor6 = mapTexelToLinear(texelColor6);

                    ${!(window as any).Main.PREMULTIPLIEDALPHA ? `diffuseColor = mix(texelColor, texelColor2, texelColor2.a);
                    diffuseColor = mix(diffuseColor, texelColor3, texelColor3.a);
                    diffuseColor = mix(diffuseColor, texelColor4, texelColor4.a);
                    diffuseColor = mix(diffuseColor, texelColor5, texelColor5.a);
                    diffuseColor = mix(diffuseColor, texelColor6, texelColor6.a);` : 
            `diffuseColor = mix(texelColor / texelColor.a, texelColor2 / texelColor2.a, texelColor2.a);
diffuseColor = mix(diffuseColor, texelColor3 / texelColor3.a, texelColor3.a);
diffuseColor = mix(diffuseColor, texelColor4 / texelColor4.a, texelColor4.a);
diffuseColor = mix(diffuseColor, texelColor5 / texelColor5.a, texelColor5.a);
diffuseColor = mix(diffuseColor, texelColor6 / texelColor6.a, texelColor6.a);`}
                    
                    #endif
            `);
        this.userData.shader = shader;
        if (this._gui) {
            this._gui.add(shader.uniforms.moveFactor.value, 'x').name('layer0 .x');
            this._gui.add(shader.uniforms.moveFactor.value, 'y').name('layer0 .y');
            this._gui.add(shader.uniforms.moveFactor2.value, 'x').name('layer1 .x');
            this._gui.add(shader.uniforms.moveFactor2.value, 'y').name('layer1 .y');
            this._gui.add(shader.uniforms.moveFactor3.value, 'x').name('layer2 .x');
            this._gui.add(shader.uniforms.moveFactor3.value, 'y').name('layer2 .y');
            this._gui.add(shader.uniforms.moveFactor4.value, 'x').name('text .x');
            this._gui.add(shader.uniforms.moveFactor4.value, 'y').name('text .y');
        }
    }
}