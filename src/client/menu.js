var ColorHSL = require("./util/color_hsl.js");

function Menu(canvas, engine, socket, actionsHandler) {
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
    this.gameTitle = null;
    this.newGame = null;
}

Menu.prototype.createMainMenuScene = function () {
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

    this.createNewGameButton();
    this.createTitle();

    return this.scene;
}

Menu.prototype.createTitle = function () {
    this.gameTitle = new BABYLON.GUI.TextBlock();
    this.gameTitle.width = "200px";
    this.gameTitle.height = "40px";
    this.gameTitle.text = "WAR II";
    this.gameTitle.fontFamily = "Share Tech Mono";
    this.gameTitle.color = new ColorHSL(0.3, 0.9, 0.7).toRGBString();
    this.gameTitle.alpha = 0.0;
    this.gameTitle.fontSize = 48;
    this.advancedTexture.addControl(this.gameTitle);

    var titleAnimationKeys = [];
    titleAnimationKeys.push({
        frame: 0,
        value: 0.0
    });
    titleAnimationKeys.push({
        frame: 60,
        value: 1.0
    });

    var titleAnimation = new BABYLON.Animation("titleAnimation", "alpha", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT);
    titleAnimation.setKeys(titleAnimationKeys);

    var titleEasingFunction = new BABYLON.QuadraticEase();
    titleEasingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
    titleAnimation.setEasingFunction(titleEasingFunction)

    this.gameTitle.animations = [];
    this.gameTitle.animations.push(titleAnimation);

    var that = this;
    this.scene.beginAnimation(this.gameTitle, 0, 60, false, 1, function () {
        that.scene.beginAnimation(that.newGame, 0, 60, false);
    });
}

Menu.prototype.createNewGameButton = function () {
    this.newGame = new BABYLON.GUI.TextBlock();
    this.newGame.text =  "Start";
    this.newGame.width = "100px";
    this.newGame.height = "40px";
    this.newGame.fontFamily = "Share Tech Mono";
    this.newGame.color = new ColorHSL(0.3, 0.9, 0.7).toRGBString();
    this.newGame.alpha = 0.0;
    this.newGame.fontSize = 18;
    this.newGame.top = "75px";

    var newGameAnimationKeys = [];
    newGameAnimationKeys.push({
        frame: 0,
        value: 0.0
    });
    newGameAnimationKeys.push({
        frame: 60,
        value: 1.0
    });

    var newGameAnimation = new BABYLON.Animation("newGameAnimation", "alpha", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT);
    newGameAnimation.setKeys(newGameAnimationKeys);

    var newGameEasingFunction = new BABYLON.QuadraticEase();
    newGameEasingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
    newGameAnimation.setEasingFunction(newGameEasingFunction)

    this.newGame.animations = [];
    this.newGame.animations.push(newGameAnimation);
    
    var that = this;
    this.newGame.onPointerEnterObservable.add(function () {
        that.buttonHoverSound.play();
    });
    this.newGame.onPointerUpObservable.add(function () {
        that.menuMusic.pause();
        that.buttonClickSound.play();
        window.setTimeout(function () {
            that.actionsHandler.newGameAction();
        }, 200);
    });

    this.advancedTexture.addControl(this.newGame);
}

module.exports = Menu;