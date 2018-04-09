(function(){function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}return e})()({1:[function(require,module,exports){
const ColorHSL = require("./util/color_hsl.js");
const Menu = require("./menu.js");
const Match = require("./match.js");

class Game {

    constructor(canvasElement) {
        this.canvas = document.getElementById(canvasElement);
        this.engine = new BABYLON.Engine(this.canvas, true);
        this.socket = io();
        this.menu = new Menu(this.canvas, this.engine, this.socket, this);
        this.match = new Match(this.canvas, this.engine, this.socket);

        // Listen for browser/canvas resize events
        window.addEventListener("resize", () => {
            this.engine.resize();
        });

        // Disable right click
        this.canvas.oncontextmenu = function (e) {
            e.preventDefault();
        };

        let url = new URL(window.location.href);
        var scene = url.searchParams.get("scene");
        if (scene) {
            console.log("Load scene: " + scene);
            if (scene == "match")
                this.scene = this.match.createMatchScene();
        }
        else {
            this.scene = this.menu.createMainMenuScene();
        }
    }

    // run the render loop
    run() {
        this.engine.runRenderLoop(() => {
            this.scene.render();
        });
    }

    newGameAction() {
        this.scene.dispose();
        this.scene = this.match.createMatchScene();
    }
}


module.exports = Game;

// Create the game using the "renderCanvas"
const game = new Game("renderCanvas");

// start animation
game.run();

},{"./match.js":2,"./menu.js":3,"./util/color_hsl.js":4}],2:[function(require,module,exports){
const ColorHSL = require("./util/color_hsl.js");

class Match {

    constructor(canvas, engine, socket) {
        this.canvas = canvas;
        this.engine = engine;
        this.socket = socket;
        this.scene = null;
        this.camera = null;

        this.hoverText = null;

        this.materials = [];
        this.map = null;

        this.socket.on("load_map", (map) => {
            console.log("Map recieved: " + map);
            this.map = map;
            this.loadMap();
        });

        this.socket.on("chat_broadcast_message", (msg) => {
            console.log("CHAT >> " + msg);
        });
    }

    createMatchScene() {
        this.scene = new BABYLON.Scene(this.engine);
        this.scene.clearColor = new ColorHSL(0.6, 0.6, 0.1).toColor4();
        this.scene.defaultCursor = "url('/img/cursors/green_select.cur'), auto ";
        this.scene.hoverCursor = "url('/img/cursors/yellow_select.cur'), auto ";

        this.camera = new BABYLON.ArcRotateCamera("ArcRotateCamera", -Math.PI * 0.5, Math.PI * 0.6, 150, new BABYLON.Vector3(110, 50, 0), this.scene);
        //this.camera.attachControl(this.canvas, false);

        this.createUI(this.scene);

        this.socket.emit("client_ready");
        return this.scene;
    }

    loadMap() {
        for (let region of this.map.regions) {
            for (let territory of region.territories) {
                let points = [];
                let shape = [];
                for (let border of territory.borders) {
                    points.push(new BABYLON.Vector3(border.x, border.y, 0));
                    shape.push(new BABYLON.Vector3(border.x, 0, border.y));
                }
                points.push(new BABYLON.Vector3(territory.borders[0].x, territory.borders[0].y, 0));
                shape.push(new BABYLON.Vector3(territory.borders[0].x, 0, territory.borders[0].y));

                //let regionColor = new ColorHSL(region.color.h, region.color.s, region.color.l).toColor3();
                //let regionColorHighlight = new ColorHSL(region.color.h, region.color.s, region.color.l + 0.2).toColor3();

                let regionColor = new ColorHSL(0, 0, 0.3).toColor3();
                let regionColorHighlight = new ColorHSL(0, 0, 0.5).toColor3();

                let gridMaterial = new BABYLON.GridMaterial(territory.id + "_grid_material", this.scene);
                gridMaterial.lineColor = regionColor;
                gridMaterial.majorUnitFrequency = 0;
                this.materials.push(gridMaterial);

                let polygonMaterial = new BABYLON.StandardMaterial(territory.id + "_material", this.scene);
                polygonMaterial.emissiveColor = regionColor;
                this.materials.push(polygonMaterial);

                let polygon = BABYLON.MeshBuilder.CreatePolygon(territory.id + "_polygon", { shape: shape, sideOrientation: BABYLON.Mesh.DOUBLESIDE }, this.scene);
                polygon.material = gridMaterial; //polygonMaterial;
                polygon.rotate(BABYLON.Axis.X, -Math.PI / 2, BABYLON.Space.WORLD);
                let lines = BABYLON.MeshBuilder.CreateLines(territory.id + "_lines", { points: points, updatable: false, instance: null }, this.scene);
                lines.color = regionColorHighlight;

                polygon.actionManager = new BABYLON.ActionManager(this.scene);
                polygon.actionManager.registerAction(
                    new BABYLON.ExecuteCodeAction(
                        BABYLON.ActionManager.OnPointerOverTrigger,
                        (evt) => {
                            evt.meshUnderPointer.material = this.getMaterialByName(evt.meshUnderPointer.name.replace("_polygon", "_material"));
                            this.hoverText.text = evt.meshUnderPointer.name.replace("_polygon", "");
                            this.hoverText.alpha = 1;
                        }
                    )
                );
                polygon.actionManager.registerAction(
                    new BABYLON.ExecuteCodeAction(
                        BABYLON.ActionManager.OnPointerOutTrigger,
                        (evt) => {
                            evt.meshUnderPointer.material = this.getMaterialByName(evt.meshUnderPointer.name.replace("_polygon", "_grid_material"));
                            this.hoverText.alpha = 0;
                            this.hoverText.text = "";
                        }
                    )
                );
                polygon.actionManager.registerAction(
                    new BABYLON.ExecuteCodeAction(
                        BABYLON.ActionManager.OnPickTrigger,
                        (evt) => {
                            if (evt.meshUnderPointer) {
                                let meshClicked = evt.meshUnderPointer;
                                this.onTerrytoryClicked(meshClicked);
                            }
                        }
                    )
                );
            }
        }

        this.drawConnections();

    }

    drawConnections() {
        let pointZ = 0.2;
        for (let connection of this.map.connections) {
            for (let i = 1; i < connection.points.length; i++) {
                let from = connection.points[i - 1];
                let to = connection.points[i];
                let pointFrom = new BABYLON.Vector3(from.x, from.y, pointZ);
                let pointTo = new BABYLON.Vector3(to.x, to.y, pointZ);
                let norm = pointTo.subtract(pointFrom).normalize();
                let next = pointFrom.add(norm);
                this.drawConnectionDot(pointFrom);
                this.drawConnectionDot(next);
                let diff = pointTo.subtract(next).length();
                while (diff > norm.length()) {
                    next = next.add(norm);
                    this.drawConnectionDot(next);
                    diff = pointTo.subtract(next).length();
                }
            }
        }
    }

    drawConnectionDot(position) {
        let discMaterial = new BABYLON.StandardMaterial("disc_material", this.scene)
        discMaterial.emissiveColor = new ColorHSL(0, 0, 0.5).toColor3();
        let disc = BABYLON.MeshBuilder.CreateDisc("disc", { radius: 0.25, arc: 1, tessellation: 50, sideOrientation: BABYLON.Mesh.DOUBLESIDE }, this.scene);
        disc.position = position.clone();
        disc.material = discMaterial;
    }

    onTerrytoryClicked(meshClicked) {
        let id = meshClicked.name.replace("_polygon", "");
        //meshClicked.material.emissiveColor = new ColorHSL(0.6, 0.9, 0.3).toColor3();
        meshClicked.material.lineColor = new ColorHSL(0, 0, 0.5).toColor3();
        for (let region of this.map.regions) {
            for (let territory of region.territories) {
                if (territory.id == id) {
                    if (territory.neighbours) {
                        for (let neighbour of territory.neighbours) {
                            let mesh = this.scene.getMeshByName(neighbour.id + "_polygon");
                            //mesh.material.emissiveColor = new ColorHSL(0, 0.9, 0.3).toColor3();
                            mesh.material.lineColor = new ColorHSL(0, 0, 0.7).toColor3();
                        }
                    }
                }
            }
        }
        this.socket.emit("chat_send_message", id);
        if (id.startsWith("a")) {
            this.socket.emit("chat_client_rename", "player_" + id);
        }
    }

    getMaterialByName(name) {
        for (let material of this.materials) {
            if (material.name == name) {
                return material;
            }
        }
    }

    createUI(scene) {
        let advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

        let buttonHoverSound = new BABYLON.Sound("buttonHoverSound", "audio/beep-29.wav", scene);
        let buttonClickSound = new BABYLON.Sound("buttonClickSound", "audio/button-35.wav", scene);

        let btnDebug = BABYLON.GUI.Button.CreateSimpleButton("btnDebug", "Debug");
        btnDebug.width = "100px";
        btnDebug.height = "40px";
        btnDebug.color = "white";
        btnDebug.background = "grey";
        btnDebug.top = "-20px";
        btnDebug.left = "20px";
        btnDebug.fontFamily = "Share Tech Mono";
        //btnDebug.fontFamily = "Nova Mono";
        btnDebug.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        btnDebug.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        btnDebug.onPointerUpObservable.add(() => {
            buttonClickSound.play();
            if (this.scene.debugLayer.isVisible()) {
                this.scene.debugLayer.hide();
            } else {
                this.scene.debugLayer.show();
            }
        });
        btnDebug.onPointerEnterObservable.add(() => {
            buttonHoverSound.play();
        });
        advancedTexture.addControl(btnDebug);

        this.hoverText = new BABYLON.GUI.TextBlock();
        this.hoverText.width = "400px";
        this.hoverText.height = "40px";
        this.hoverText.text = "";
        this.hoverText.fontFamily = "Share Tech Mono";
        this.hoverText.color = new ColorHSL(0, 0, 0.7).toRGBString();
        this.hoverText.alpha = 0.0;
        this.hoverText.fontSize = 14;
        this.hoverText.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.hoverText.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        this.hoverText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.hoverText.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        advancedTexture.addControl(this.hoverText);

        window.addEventListener("mousemove", () => {
            this.hoverText.left = this.scene.pointerX + 20;
            this.hoverText.top = this.scene.pointerY + 20;
        });
    }
}

module.exports = Match;
},{"./util/color_hsl.js":4}],3:[function(require,module,exports){
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
        this.txtGameTitle.color = new ColorHSL(0, 0, 0.5).toRGBString();
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
        this.btnCreateMatch.color = new ColorHSL(0, 0, 0.5).toRGBString();
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
        this.btnJoinMatch.color = new ColorHSL(0, 0, 0.5).toRGBString();
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
            this.btnCreateMatch.color = new ColorHSL(0, 0, 0.7).toRGBString();
            this.btnCreateMatch.text = "> CREATE NEW MATCH <";
        });
        this.btnCreateMatch.onPointerOutObservable.add(() => {
            this.btnCreateMatch.color = new ColorHSL(0, 0, 0.5).toRGBString();
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
            this.btnJoinMatch.color = new ColorHSL(0, 0, 0.7).toRGBString();
            this.btnJoinMatch.text = "> JOIN EXISTING MATCH <";
        });
        this.btnJoinMatch.onPointerOutObservable.add(() => {
            this.btnJoinMatch.color = new ColorHSL(0, 0, 0.5).toRGBString();
            this.btnJoinMatch.text = "JOIN EXISTING MATCH";
        });
        this.btnJoinMatch.onPointerUpObservable.add(() => {
            this.buttonClickSound.play();
        });
    }
}

module.exports = Menu;
},{"./util/color_hsl.js":4}],4:[function(require,module,exports){
class ColorHSL {

    constructor(h, s, l) {
        this.h = h;
        this.s = s;
        this.l = l;
    }

    /**
     * Converts an HSL color value to RGB. Conversion formula
     * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
     * Assumes h, s, and l are contained in the set [0, 1] and
     * returns r, g, and b in the set [0, 1].
     *
     * @param   {number}  h       The hue
     * @param   {number}  s       The saturation
     * @param   {number}  l       The lightness
     * @return  {Color3}          The RGB representation
     */
    toColor3() {
        let r, g, b;

        if (this.s == 0) {
            r = g = b = this.l; // achromatic
        }
        else {
            let hue2rgb = function hue2rgb(p, q, t) {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            }

            let q = this.l < 0.5 ? this.l * (1 + this.s) : this.l + this.s - this.l * this.s;
            let p = 2 * this.l - q;
            r = hue2rgb(p, q, this.h + 1 / 3);
            g = hue2rgb(p, q, this.h);
            b = hue2rgb(p, q, this.h - 1 / 3);
        }
        return new BABYLON.Color3(r, g, b);
    }

    /**
     * Converts an RGB color value to HSL. Conversion formula
     * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
     * Assumes r, g, and b are contained in the set [0, 1] and
     * returns h, s, and l in the set [0, 1].
     *
     * @param   {number}  r       The red color value
     * @param   {number}  g       The green color value
     * @param   {number}  b       The blue color value
     */
    fromColor3(r, g, b) {
        let max = Math.max(r, g, b), min = Math.min(r, g, b);
        this.h = (max + min) / 2;
        this.s = (max + min) / 2;
        this.l = (max + min) / 2;

        if (max == min) {
            this.h = this.s = 0; // achromatic
        }
        else {
            let d = max - min;
            this.s = this.l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: this.h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: this.h = (b - r) / d + 2; break;
                case b: this.h = (r - g) / d + 4; break;
            }
            this.h /= 6;
        }
    }

    toRGBString() {
        let color3 = this.toColor3();
        let r = Math.floor(color3.r * 255);
        let g = Math.floor(color3.g * 255);
        let b = Math.floor(color3.b * 255);
        return "rgb(" + r + "," + g + "," + b + ")";
    }

    toColor4(a = 1) {
        let color3 = this.toColor3();
        return new BABYLON.Color4(color3.r, color3.g, color3.b, a);
    }
}

module.exports = ColorHSL;
},{}]},{},[1]);
