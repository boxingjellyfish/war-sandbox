const ColorHSL = require("./util/color_hsl.js");

class Splash {

    constructor(canvas, engine, socket, actionsHandler) {
        this.canvas = canvas;
        this.engine = engine;
        this.socket = socket;
        this.actionsHandler = actionsHandler;
        this.scene = null;
        this.camera = null;
        this.advancedTexture = null;
        this.splashSound = null;
        this.txtSplash = null;
        this.imgLogo = null;
    }

    createSplashScene() {
        this.scene = new BABYLON.Scene(this.engine);
        this.scene.clearColor = new BABYLON.Color4(0, 0, 0, 1);
        this.scene.defaultCursor = "url('/img/cursors/green_select.cur'), auto ";
        this.scene.hoverCursor = "url('/img/cursors/yellow_select.cur'), auto ";

        this.camera = new BABYLON.ArcRotateCamera("splashCamera", -Math.PI * 0.5, Math.PI * 0.6, 150, new BABYLON.Vector3(110, 50, 0), this.scene);
        this.camera.attachControl(this.canvas, false);
        this.scene.activeCamera = this.camera;

        this.advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

        this.splashSound = new BABYLON.Sound("splashSound", "audio/intro.mp3", this.scene, null, { autoplay: true });
        this.imgLogo = new BABYLON.GUI.Image("imgLogo", "img/logo_boxingjellyfish.png");
        this.imgLogo.alpha = 0;
        this.imgLogo.width = "256px";
        this.imgLogo.height = "256px";
        this.advancedTexture.addControl(this.imgLogo);

        let logoAnimationKeys = [];
        logoAnimationKeys.push({
            frame: 0,
            value: 0.0
        });
        logoAnimationKeys.push({
            frame: 30,
            value: 1.0
        });
        logoAnimationKeys.push({
            frame: 90,
            value: 1.0
        });
        logoAnimationKeys.push({
            frame: 120,
            value: 0.0
        });

        let logoAnimation = new BABYLON.Animation("logoAnimation", "alpha", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT);
        logoAnimation.setKeys(logoAnimationKeys);

        let logoEasingFunction = new BABYLON.QuadraticEase();
        logoEasingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
        logoAnimation.setEasingFunction(logoEasingFunction)

        this.imgLogo.animations = [];
        this.imgLogo.animations.push(logoAnimation);

        this.scene.beginAnimation(this.imgLogo, 0, 120, false, 1, () => {
            // Required delay to correctly dispose the scene
            window.setTimeout(() => {
                this.actionsHandler.menuAction();
            }, 50);
        });

        return this.scene;
    }
}

module.exports = Splash;