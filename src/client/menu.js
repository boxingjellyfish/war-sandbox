const ColorHSL = require("./util/color_hsl.js");

class Menu {

    constructor(canvas, engine, socket, actionsHandler) {
        this.canvas = canvas;
        this.engine = engine;
        this.socket = socket;
        this.actionsHandler = actionsHandler;
        this.scene = null;
        this.camera = null;
        this.advancedTexture = null;
        this.menuMusic = null;
        this.buttonHoverSound = null;
        this.buttonClickSound = null;
        this.txtGameTitle = null;
        this.btnCreateMatch = null;
        this.btnJoinMatch = null;
    }

    createMainMenuScene() {
        this.scene = new BABYLON.Scene(this.engine);
        this.scene.clearColor = new BABYLON.Color4(0, 0, 0, 1);
        this.scene.defaultCursor = "url('/img/cursors/green_select.cur'), auto ";
        this.scene.hoverCursor = "url('/img/cursors/yellow_select.cur'), auto ";

        this.camera = new BABYLON.ArcRotateCamera("ArcRotateCamera", -Math.PI * 0.5, Math.PI * 0.6, 150, new BABYLON.Vector3(110, 50, 0), this.scene);
        this.camera.attachControl(this.canvas, false);

        this.advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

        this.menuMusic = new BABYLON.Sound("buttonHoverSound", "audio/menu.mp3", this.scene, null, { autoplay: true, loop: true });
        this.buttonHoverSound = new BABYLON.Sound("buttonHoverSound", "audio/beep-29.wav", this.scene);
        this.buttonClickSound = new BABYLON.Sound("buttonClickSound", "audio/button-35.wav", this.scene);

        this.createTitle();
        this.createNewGameButton();
        this.createJoinGameButton();

        return this.scene;
    }

    createTitle() {
        this.txtGameTitle = new BABYLON.GUI.TextBlock();
        this.txtGameTitle.width = "400px";
        this.txtGameTitle.height = "40px";
        this.txtGameTitle.text = "WAR II ONLINE";
        this.txtGameTitle.fontFamily = "Share Tech Mono";
        this.txtGameTitle.color = new ColorHSL(0.3, 0.9, 0.5).toRGBString();
        this.txtGameTitle.alpha = 0.0;
        this.txtGameTitle.fontSize = 48;
        this.advancedTexture.addControl(this.txtGameTitle);

        let titleAnimationKeys = [];
        titleAnimationKeys.push({
            frame: 0,
            value: 0.0
        });
        titleAnimationKeys.push({
            frame: 30,
            value: 1.0
        });

        let titleAnimation = new BABYLON.Animation("titleAnimation", "alpha", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT);
        titleAnimation.setKeys(titleAnimationKeys);

        let titleEasingFunction = new BABYLON.QuadraticEase();
        titleEasingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
        titleAnimation.setEasingFunction(titleEasingFunction)

        this.txtGameTitle.animations = [];
        this.txtGameTitle.animations.push(titleAnimation);

        this.scene.beginAnimation(this.txtGameTitle, 0, 30, false, 1, () => {
            this.scene.beginAnimation(this.btnCreateMatch, 0, 30, false, 1, () => {
                this.scene.beginAnimation(this.btnJoinMatch, 0, 30, false, 1, () => {
                    this.enableButtonInteractions();
                });
            });
        });
    }

    createNewGameButton() {
        this.btnCreateMatch = new BABYLON.GUI.TextBlock();
        this.btnCreateMatch.text = "CREATE NEW MATCH";
        this.btnCreateMatch.width = "200px";
        this.btnCreateMatch.height = "30px";
        this.btnCreateMatch.fontFamily = "Share Tech Mono";
        this.btnCreateMatch.color = new ColorHSL(0.3, 0.9, 0.5).toRGBString();
        this.btnCreateMatch.alpha = 0.0;
        this.btnCreateMatch.fontSize = 16;
        this.btnCreateMatch.top = "100px";

        let btnCreateMatchAnimationKeys = [];
        btnCreateMatchAnimationKeys.push({
            frame: 0,
            value: 0.0
        });
        btnCreateMatchAnimationKeys.push({
            frame: 30,
            value: 1.0
        });

        let btnCreateMatchAnimation = new BABYLON.Animation("newGameAnimation", "alpha", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT);
        btnCreateMatchAnimation.setKeys(btnCreateMatchAnimationKeys);

        let btnCreateMatchEasingFunction = new BABYLON.QuadraticEase();
        btnCreateMatchEasingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
        btnCreateMatchAnimation.setEasingFunction(btnCreateMatchEasingFunction)

        this.btnCreateMatch.animations = [];
        this.btnCreateMatch.animations.push(btnCreateMatchAnimation);

        this.advancedTexture.addControl(this.btnCreateMatch);
    }

    createJoinGameButton() {
        this.btnJoinMatch = new BABYLON.GUI.TextBlock();
        this.btnJoinMatch.text = "JOIN EXISTING MATCH";
        this.btnJoinMatch.width = "200px";
        this.btnJoinMatch.height = "30px";
        this.btnJoinMatch.fontFamily = "Share Tech Mono";
        this.btnJoinMatch.color = new ColorHSL(0.3, 0.9, 0.5).toRGBString();
        this.btnJoinMatch.alpha = 0.0;
        this.btnJoinMatch.fontSize = 16;
        this.btnJoinMatch.top = "140px";

        let btnJoinMatchAnimationKeys = [];
        btnJoinMatchAnimationKeys.push({
            frame: 0,
            value: 0.0
        });
        btnJoinMatchAnimationKeys.push({
            frame: 30,
            value: 1.0
        });

        let btnJoinMatchAnimation = new BABYLON.Animation("newGameAnimation", "alpha", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT);
        btnJoinMatchAnimation.setKeys(btnJoinMatchAnimationKeys);

        let btnJoinMatchEasingFunction = new BABYLON.QuadraticEase();
        btnJoinMatchEasingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
        btnJoinMatchAnimation.setEasingFunction(btnJoinMatchEasingFunction)

        this.btnJoinMatch.animations = [];
        this.btnJoinMatch.animations.push(btnJoinMatchAnimation);

        this.advancedTexture.addControl(this.btnJoinMatch);
    }

    enableButtonInteractions() {
        this.btnCreateMatch.onPointerEnterObservable.add(() => {
            this.buttonHoverSound.play();
            this.btnCreateMatch.color = new ColorHSL(0.3, 0.9, 0.7).toRGBString();
            this.btnCreateMatch.text = "> CREATE NEW MATCH <";
        });
        this.btnCreateMatch.onPointerOutObservable.add(() => {
            this.btnCreateMatch.color = new ColorHSL(0.3, 0.9, 0.5).toRGBString();
            this.btnCreateMatch.text = "CREATE NEW MATCH";
        });
        this.btnCreateMatch.onPointerUpObservable.add(() => {
            this.menuMusic.pause();
            this.buttonClickSound.play();
            window.setTimeout(() => {
                this.actionsHandler.newGameAction();
            }, 200);
        });

        this.btnJoinMatch.onPointerEnterObservable.add(() => {
            this.buttonHoverSound.play();
            this.btnJoinMatch.color = new ColorHSL(0.3, 0.9, 0.7).toRGBString();
            this.btnJoinMatch.text = "> JOIN EXISTING MATCH <";
        });
        this.btnJoinMatch.onPointerOutObservable.add(() => {
            this.btnJoinMatch.color = new ColorHSL(0.3, 0.9, 0.5).toRGBString();
            this.btnJoinMatch.text = "JOIN EXISTING MATCH";
        });
        this.btnJoinMatch.onPointerUpObservable.add(() => {
            this.buttonClickSound.play();
        });
    }
}

module.exports = Menu;