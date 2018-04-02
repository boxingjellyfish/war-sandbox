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
    this.txtGameTitle = null;
    this.btnCreateMatch = null;
    this.btnJoinMatch = null;
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

    this.createTitle();
    this.createNewGameButton();
    this.createJoinGameButton();

    return this.scene;
}

Menu.prototype.createTitle = function () {
    this.txtGameTitle = new BABYLON.GUI.TextBlock();
    this.txtGameTitle.width = "400px";
    this.txtGameTitle.height = "40px";
    this.txtGameTitle.text = "WAR II ONLINE";
    this.txtGameTitle.fontFamily = "Share Tech Mono";
    this.txtGameTitle.color = new ColorHSL(0.3, 0.9, 0.5).toRGBString();
    this.txtGameTitle.alpha = 0.0;
    this.txtGameTitle.fontSize = 48;
    this.advancedTexture.addControl(this.txtGameTitle);

    var titleAnimationKeys = [];
    titleAnimationKeys.push({
        frame: 0,
        value: 0.0
    });
    titleAnimationKeys.push({
        frame: 30,
        value: 1.0
    });

    var titleAnimation = new BABYLON.Animation("titleAnimation", "alpha", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT);
    titleAnimation.setKeys(titleAnimationKeys);

    var titleEasingFunction = new BABYLON.QuadraticEase();
    titleEasingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
    titleAnimation.setEasingFunction(titleEasingFunction)

    this.txtGameTitle.animations = [];
    this.txtGameTitle.animations.push(titleAnimation);

    var that = this;
    this.scene.beginAnimation(this.txtGameTitle, 0, 30, false, 1, function () {
        that.scene.beginAnimation(that.btnCreateMatch, 0, 30, false, 1, function () {
            that.scene.beginAnimation(that.btnJoinMatch, 0, 30, false, 1, function(){
                that.enableButtonInteractions();
            });
        });
    });
}

Menu.prototype.createNewGameButton = function () {
    this.btnCreateMatch = new BABYLON.GUI.TextBlock();
    this.btnCreateMatch.text = "CREATE NEW MATCH";
    this.btnCreateMatch.width = "200px";
    this.btnCreateMatch.height = "30px";
    this.btnCreateMatch.fontFamily = "Share Tech Mono";
    this.btnCreateMatch.color = new ColorHSL(0.3, 0.9, 0.5).toRGBString();
    this.btnCreateMatch.alpha = 0.0;
    this.btnCreateMatch.fontSize = 16;
    this.btnCreateMatch.top = "100px";

    var btnCreateMatchAnimationKeys = [];
    btnCreateMatchAnimationKeys.push({
        frame: 0,
        value: 0.0
    });
    btnCreateMatchAnimationKeys.push({
        frame: 30,
        value: 1.0
    });

    var btnCreateMatchAnimation = new BABYLON.Animation("newGameAnimation", "alpha", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT);
    btnCreateMatchAnimation.setKeys(btnCreateMatchAnimationKeys);

    var btnCreateMatchEasingFunction = new BABYLON.QuadraticEase();
    btnCreateMatchEasingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
    btnCreateMatchAnimation.setEasingFunction(btnCreateMatchEasingFunction)

    this.btnCreateMatch.animations = [];
    this.btnCreateMatch.animations.push(btnCreateMatchAnimation);

    this.advancedTexture.addControl(this.btnCreateMatch);
}

Menu.prototype.createJoinGameButton = function () {
    this.btnJoinMatch = new BABYLON.GUI.TextBlock();
    this.btnJoinMatch.text = "JOIN EXISTING MATCH";
    this.btnJoinMatch.width = "200px";
    this.btnJoinMatch.height = "30px";
    this.btnJoinMatch.fontFamily = "Share Tech Mono";
    this.btnJoinMatch.color = new ColorHSL(0.3, 0.9, 0.5).toRGBString();
    this.btnJoinMatch.alpha = 0.0;
    this.btnJoinMatch.fontSize = 16;
    this.btnJoinMatch.top = "140px";

    var btnJoinMatchAnimationKeys = [];
    btnJoinMatchAnimationKeys.push({
        frame: 0,
        value: 0.0
    });
    btnJoinMatchAnimationKeys.push({
        frame: 30,
        value: 1.0
    });

    var btnJoinMatchAnimation = new BABYLON.Animation("newGameAnimation", "alpha", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT);
    btnJoinMatchAnimation.setKeys(btnJoinMatchAnimationKeys);

    var btnJoinMatchEasingFunction = new BABYLON.QuadraticEase();
    btnJoinMatchEasingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
    btnJoinMatchAnimation.setEasingFunction(btnJoinMatchEasingFunction)

    this.btnJoinMatch.animations = [];
    this.btnJoinMatch.animations.push(btnJoinMatchAnimation);

    this.advancedTexture.addControl(this.btnJoinMatch);
}

Menu.prototype.enableButtonInteractions = function () {
    var that = this;
    this.btnCreateMatch.onPointerEnterObservable.add(function () {
        that.buttonHoverSound.play();
        that.btnCreateMatch.color = new ColorHSL(0.3, 0.9, 0.7).toRGBString();
        that.btnCreateMatch.text = "> CREATE NEW MATCH <";
    });
    this.btnCreateMatch.onPointerOutObservable.add(function () {
        that.btnCreateMatch.color = new ColorHSL(0.3, 0.9, 0.5).toRGBString();
        that.btnCreateMatch.text = "CREATE NEW MATCH";
    });
    this.btnCreateMatch.onPointerUpObservable.add(function () {
        that.menuMusic.pause();
        that.buttonClickSound.play();
        window.setTimeout(function () {
            that.actionsHandler.newGameAction();
        }, 200);
    });
    
    this.btnJoinMatch.onPointerEnterObservable.add(function () {
        that.buttonHoverSound.play();
        that.btnJoinMatch.color = new ColorHSL(0.3, 0.9, 0.7).toRGBString();
        that.btnJoinMatch.text = "> JOIN EXISTING MATCH <";
    });
    this.btnJoinMatch.onPointerOutObservable.add(function () {
        that.btnJoinMatch.color = new ColorHSL(0.3, 0.9, 0.5).toRGBString();
        that.btnJoinMatch.text = "JOIN EXISTING MATCH";
    });
    this.btnJoinMatch.onPointerUpObservable.add(function () {
        that.buttonClickSound.play();
    });
}

module.exports = Menu;