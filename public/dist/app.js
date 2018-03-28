(function(){function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}return e})()({1:[function(require,module,exports){
module.exports = ColorHSL = function (h, s, l) {
    this.h = h;
    this.s = s;
    this.l = l;
};

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
ColorHSL.prototype.toColor3 = function () {
    var r, g, b;

    if (this.s == 0) {
        r = g = b = this.l; // achromatic
    }
    else {
        var hue2rgb = function hue2rgb(p, q, t) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        }

        var q = this.l < 0.5 ? this.l * (1 + this.s) : this.l + this.s - this.l * this.s;
        var p = 2 * this.l - q;
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
ColorHSL.prototype.fromColor3 = function (r, g, b) {
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    this.h = (max + min) / 2;
    this.s = (max + min) / 2;
    this.l = (max + min) / 2;

    if (max == min) {
        this.h = this.s = 0; // achromatic
    }
    else {
        var d = max - min;
        this.s = this.l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: this.h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: this.h = (b - r) / d + 2; break;
            case b: this.h = (r - g) / d + 4; break;
        }
        this.h /= 6;
    }
}
},{}],2:[function(require,module,exports){
var Level = require("./level.js");
var ColorHSL = require("./color_hsl.js");

module.exports = Game = function (canvasElement) {
    // Create canvas and engine
    this.canvas = document.getElementById(canvasElement);
    this.engine = new BABYLON.Engine(this.canvas, true);

    var that = this;
    // Listen for browser/canvas resize events
    window.addEventListener("resize", function () {
        that.engine.resize();
    });

    // Disable right click
    this.canvas.oncontextmenu = function (e) {
        e.preventDefault();
    };

    this.scene = this.createScene3();
};

Game.prototype.createScene1 = function () {
    // create a basic BJS Scene object
    var scene = new BABYLON.Scene(this.engine);
    scene.clearColor = new BABYLON.Color4(0, 0, 0, 1);

    // create a FreeCamera, and set its position to (x:0, y:5, z:-10)
    //let camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);
    //let camera = new BABYLON.UniversalCamera("UniversalCamera", new BABYLON.Vector3(0, 5, -10), scene);
    var camera = new BABYLON.ArcRotateCamera("ArcRotateCamera", 0, Math.PI / 4, 10, new BABYLON.Vector3(0, 0, 0), scene);

    // target the camera to scene origin
    camera.setTarget(BABYLON.Vector3.Zero());

    // attach the camera to the canvas
    camera.attachControl(this.canvas, false);

    // create a basic light, aiming 0,1,0 - meaning, to the sky
    var light = new BABYLON.HemisphericLight("HemisphericLight", new BABYLON.Vector3(0, 1, 0), scene);
    //let light = new BABYLON.PointLight("PointLight", new BABYLON.Vector3(5, 10, 2), scene);

    // Sphere material creation
    var sphereMaterial = new BABYLON.StandardMaterial("Material", scene)
    sphereMaterial.diffuseColor = new BABYLON.Color3(0.5, 0, 0);
    sphereMaterial.specularColor = new BABYLON.Color3(0.5, 0, 0);
    //sphereMaterial.emissiveColor = new BABYLON.Color3(0.5, 0, 0);
    //sphereMaterial.ambientColor = new BABYLON.Color3(0.5, 0, 0);

    // create a built-in "sphere" shape; with 16 segments and diameter of 2
    var sphere = BABYLON.MeshBuilder.CreateSphere("Sphere", { segments: 16, diameter: 2 }, scene);
    sphere.material = sphereMaterial;

    // move the sphere upward 1/2 of its height
    sphere.position.y = 1;

    // Ground material creation
    var groundMaterial = new BABYLON.StandardMaterial("Material", scene)
    groundMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0.5);
    groundMaterial.specularColor = new BABYLON.Color3(0, 0, 0.5);
    //groundMaterial.emissiveColor = new BABYLON.Color3(0, 0, 0.5);
    groundMaterial.ambientColor = new BABYLON.Color3(0, 0, 0.5);

    // create a built-in "ground" shape
    var ground = BABYLON.MeshBuilder.CreateGround("Ground", { width: 6, height: 6, subdivisions: 2 }, scene);
    ground.material = groundMaterial;

    // add gui layer
    this.createUI(scene);

    // Sphere basic animation
    var sphereAnimatable = BABYLON.Animation.CreateAndStartAnimation("SphereScale", sphere, "scaling", 30, 90, new BABYLON.Vector3(1.0, 1.0, 1.0), new BABYLON.Vector3(2.0, 2.0, 2.0));
    sphereAnimatable.pause();

    //When click event is raised
    window.addEventListener("click", function () {
        // We try to pick an object
        var pickResult = scene.pick(scene.pointerX, scene.pointerY);
        if (pickResult.hit && pickResult.pickedMesh.name == "Sphere") {
            sphereAnimatable.restart();
        }
    });

    return scene;
};


Game.prototype.createScene2 = function () {
    // create a basic BJS Scene object
    var scene = new BABYLON.Scene(this.engine);
    scene.clearColor = new BABYLON.Color4(0.25, 0.25, 0.25, 1);

    // create a FreeCamera, and set its position to (x:0, y:5, z:-10)
    //let camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);
    //let camera = new BABYLON.UniversalCamera("UniversalCamera", new BABYLON.Vector3(0, 5, -10), scene);
    var camera = new BABYLON.ArcRotateCamera("ArcRotateCamera", 0, Math.PI / 4, 10, new BABYLON.Vector3(0, 0, 0), scene);

    // target the camera to scene origin
    camera.setTarget(BABYLON.Vector3.Zero());

    // attach the camera to the canvas
    camera.attachControl(this.canvas, false);

    // create a basic light, aiming 0,1,0 - meaning, to the sky
    //let light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(1, 1, 1), scene);
    var light = new BABYLON.PointLight("PointLight", new BABYLON.Vector3(5, 10, 2), scene);

    // Box material creation
    var boxMaterial = new BABYLON.StandardMaterial("Material", scene)
    boxMaterial.diffuseColor = new BABYLON.Color3(0, 0.5, 0);
    boxMaterial.specularColor = new BABYLON.Color3(0, 0.5, 0);
    //boxMaterial.emissiveColor = new BABYLON.Color3(0, 0.5, 0);
    //boxMaterial.ambientColor = new BABYLON.Color3(0, 0.5, 0);

    // create a built-in "box" shape
    var box = BABYLON.MeshBuilder.CreateBox("Box", { size: 2 }, scene);
    box.material = boxMaterial;

    // move the box upward 1/2 of its height
    box.position.y = 1;

    // Ground material creation
    var groundMaterial = new BABYLON.StandardMaterial("Material", scene)
    groundMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0.5);
    groundMaterial.specularColor = new BABYLON.Color3(0, 0, 0.5);
    //groundMaterial.emissiveColor = new BABYLON.Color3(0, 0, 0.5);
    groundMaterial.ambientColor = new BABYLON.Color3(0, 0, 0.5);

    // create a built-in "ground" shape
    var ground = BABYLON.MeshBuilder.CreateGround("Ground", { width: 6, height: 6, subdivisions: 2 }, scene);
    ground.material = groundMaterial;

    // add gui layer
    this.createUI(scene);

    // Box animation
    // An array with all animation keys
    var keys = [];
    keys.push({
        frame: 0,
        value: new BABYLON.Vector3(1.0, 1.0, 1.0)
    });
    keys.push({
        frame: 30,
        value: new BABYLON.Vector3(1.2, 1.2, 1.2)
    });
    keys.push({
        frame: 60,
        value: new BABYLON.Vector3(1.0, 1.0, 1.0)
    });

    var animationBox = new BABYLON.Animation("myAnimation", "scaling", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    animationBox.setKeys(keys);

    // Creating an easing function
    var easingFunction = new BABYLON.QuadraticEase();
    easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
    animationBox.setEasingFunction(easingFunction)

    box.animations = [];
    box.animations.push(animationBox);

    var boxAnimatable = scene.beginAnimation(box, 0, 60, true);

    //When click event is raised
    window.addEventListener("click", function () {
        // We try to pick an object
        var pickResult = scene.pick(scene.pointerX, scene.pointerY);
        if (pickResult.hit && pickResult.pickedMesh.name == "Box") {
            boxAnimatable.reset();
        }
    });

    return scene;
}

Game.prototype.createScene3 = function () {
    var scene = new BABYLON.Scene(this.engine);
    scene.clearColor = new BABYLON.Color4(0, 0, 0, 1);
    var camera = new BABYLON.ArcRotateCamera("ArcRotateCamera", 0, 0, 200, new BABYLON.Vector3(30, -8, 60), scene);
    camera.attachControl(this.canvas, false);

    var map = new Level().createDefaultMap();

    for (var region of map.regions) {
        for (var territory of region.territories) {
            var shape = [];
            for (var border of territory.borders) {
                shape.push(new BABYLON.Vector3(border.x, 0, border.y))
            }
            shape.push(new BABYLON.Vector3(territory.borders[0].x, 0, territory.borders[0].y))

            var polygonMaterial = new BABYLON.StandardMaterial(territory.id + "Material", scene)
            polygonMaterial.emissiveColor = new ColorHSL(region.fill_color.h, region.fill_color.s, region.fill_color.l).toColor3();
            var polygon = BABYLON.MeshBuilder.CreatePolygon(territory.id + "Polygon", { shape: shape, sideOrientation: BABYLON.Mesh.DOUBLESIDE }, scene);
            polygon.material = polygonMaterial;
            var lines = BABYLON.MeshBuilder.CreateLines(territory.id + "Lines", { points: shape, updatable: false, instance: null }, scene);
            lines.color = new ColorHSL(region.line_color.h, region.line_color.s, region.line_color.l).toColor3();

            polygon.actionManager = new BABYLON.ActionManager(scene);
            polygon.actionManager.registerAction(
                new BABYLON.InterpolateValueAction(
                    BABYLON.ActionManager.OnPointerOverTrigger,
                    polygon.material,
                    'emissiveColor',
                    new ColorHSL(region.line_color.h, region.line_color.s, region.line_color.l).toColor3(),
                    100
                )
            );
            polygon.actionManager.registerAction(
                new BABYLON.InterpolateValueAction(
                    BABYLON.ActionManager.OnPointerOutTrigger,
                    polygon.material,
                    'emissiveColor',
                    new ColorHSL(region.fill_color.h, region.fill_color.s, region.fill_color.l).toColor3(),
                    100
                )
            );
        }
    }

    //When click event is raised
    window.addEventListener("click", function () {
        // We try to pick an object
        var pickResult = scene.pick(scene.pointerX, scene.pointerY);
        if (pickResult.hit && pickResult.pickedMesh.name == "Box") {
            boxAnimatable.reset();
        }
    });

    this.createUI(scene);

    return scene;
}

Game.prototype.createUI = function (scene) {
    var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

    var buttonHoverSound = new BABYLON.Sound("buttonHoverSound", "audio/beep-29.wav", scene);
    var buttonClickSound = new BABYLON.Sound("buttonClickSound", "audio/button-35.wav", scene);

    var that = this;

    var btnScene1 = BABYLON.GUI.Button.CreateSimpleButton("btnScene1", "S1");
    btnScene1.width = "100px";
    btnScene1.height = "40px";
    btnScene1.color = "white";
    btnScene1.background = "grey";
    btnScene1.top = "20px";
    btnScene1.left = "20px";
    btnScene1.fontFamily = "Share Tech Mono";
    //btnScene1.fontFamily = "Nova Mono";
    btnScene1.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    btnScene1.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    btnScene1.onPointerUpObservable.add(function () {
        buttonClickSound.play();
        var handle = window.setTimeout(function () {
            that.scene.dispose();
            that.scene = that.createScene1();
        }, 200);
    });
    btnScene1.onPointerEnterObservable.add(function () {
        buttonHoverSound.play();
    });
    advancedTexture.addControl(btnScene1);

    var btnScene2 = BABYLON.GUI.Button.CreateSimpleButton("btnScene2", "S2");
    btnScene2.width = "100px";
    btnScene2.height = "40px";
    btnScene2.color = "white";
    btnScene2.background = "grey";
    btnScene2.top = "20px";
    btnScene2.left = "140px";
    btnScene2.fontFamily = "Share Tech Mono";
    //btnScene2.fontFamily = "Nova Mono";
    btnScene2.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    btnScene2.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    btnScene2.onPointerUpObservable.add(function () {
        buttonClickSound.play();
        var handle = window.setTimeout(function () {
            that.scene.dispose();
            that.scene = that.createScene2();
        }, 200);
    });
    btnScene2.onPointerEnterObservable.add(function () {
        buttonHoverSound.play();
    });
    advancedTexture.addControl(btnScene2);

    var btnScene3 = BABYLON.GUI.Button.CreateSimpleButton("btnScene3", "S3");
    btnScene3.width = "100px";
    btnScene3.height = "40px";
    btnScene3.color = "white";
    btnScene3.background = "grey";
    btnScene3.top = "20px";
    btnScene3.left = "260px";
    btnScene3.fontFamily = "Share Tech Mono";
    //btnScene3.fontFamily = "Nova Mono";
    btnScene3.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    btnScene3.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    btnScene3.onPointerUpObservable.add(function () {
        buttonClickSound.play();
        var handle = window.setTimeout(function () {
            that.scene.dispose();
            that.scene = that.createScene3();
        }, 200);
    });
    btnScene3.onPointerEnterObservable.add(function () {
        buttonHoverSound.play();
    });
    advancedTexture.addControl(btnScene3);

    var btnDebug = BABYLON.GUI.Button.CreateSimpleButton("btnDebug", "Debug");
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
    btnDebug.onPointerUpObservable.add(function () {
        buttonClickSound.play();
        if (that.scene.debugLayer.isVisible()) {
            that.scene.debugLayer.hide();
        } else {
            that.scene.debugLayer.show();
        }
    });
    btnDebug.onPointerEnterObservable.add(function () {
        buttonHoverSound.play();
    });
    advancedTexture.addControl(btnDebug);
}

Game.prototype.run = function () {
    // run the render loop
    var that = this;
    this.engine.runRenderLoop(function () {
        that.scene.render();
    });
}

// Create the game using the "renderCanvas"
var game = new Game("renderCanvas");
console.log("Game object created");

// start animation
game.run();
console.log("Run started");

// Socket io
var socket = io();
socket.on("time", function (timeString) {
    console.log("Server time: " + timeString);
});
},{"./color_hsl.js":1,"./level.js":3}],3:[function(require,module,exports){
module.exports = Level = function () {

};

Level.prototype.createDefaultMap = function () {
    var map = {
        id: "default",
        regions: [
            {
                id: "north_america",
                line_color: { h: 0.1, s: 0.9, l: 0.5 },
                fill_color: { h: 0.1, s: 0.9, l: 0.3  },
                territories: [
                    {
                        id: "alaska",
                        borders: [
                            { x: 11, y: 9 },
                            { x: 13, y: 8 },
                            { x: 13, y: 5 },
                            { x: 19, y: 2 },
                            { x: 19, y: 4 },
                            { x: 17, y: 5 },
                            { x: 17, y: 10 },
                            { x: 19, y: 11 },
                            { x: 19, y: 15 },
                            { x: 17, y: 14 },
                            { x: 15, y: 15 },
                            { x: 15, y: 18 },
                            { x: 11, y: 20 },
                            { x: 11, y: 9 }
                        ]
                    },
                    {
                        id: "mackenzie",
                        borders: [
                            { x: 11, y: 20 },
                            { x: 15, y: 18 },
                            { x: 15, y: 15 },
                            { x: 17, y: 14 },
                            { x: 19, y: 15 },
                            { x: 19, y: 22 },
                            { x: 21, y: 23 },
                            { x: 21, y: 35 },
                            { x: 19, y: 36 },
                            { x: 19, y: 40 },
                            { x: 17, y: 41 },
                            { x: 17, y: 45 },
                            { x: 15, y: 44 },
                            { x: 15, y: 42 },
                            { x: 13, y: 41 },
                            { x: 15, y: 40 },
                            { x: 15, y: 31 },
                            { x: 13, y: 30 },
                            { x: 13, y: 21 },
                            { x: 11, y: 20 }
                        ]
                    },
                    {
                        id: "vancouver",
                        borders: [
                            { x: 19, y: 11 },
                            { x: 23, y: 13 },
                            { x: 25, y: 12 },
                            { x: 27, y: 13 },
                            { x: 27, y: 21 },
                            { x: 29, y: 22 },
                            { x: 29, y: 25 },
                            { x: 25, y: 27 },
                            { x: 23, y: 26 },
                            { x: 21, y: 27 },
                            { x: 21, y: 23 },
                            { x: 19, y: 22 }
                        ]
                    },
                    {
                        id: "ottawa",
                        borders: [
                            { x: 21, y: 27 },
                            { x: 23, y: 26 },
                            { x: 25, y: 27 },
                            { x: 29, y: 25 },
                            { x: 29, y: 29 },
                            { x: 31, y: 30 },
                            { x: 29, y: 31 },
                            { x: 31, y: 32 },
                            { x: 33, y: 31 },
                            { x: 33, y: 36 },
                            { x: 31, y: 37 },
                            { x: 27, y: 35 },
                            { x: 25, y: 36 },
                            { x: 25, y: 35 },
                            { x: 21, y: 33 }
                        ]
                    },
                    {
                        id: "labrador",
                        borders: [
                            { x: 21, y: 40 },
                            { x: 29, y: 36 },
                            { x: 31, y: 37 },
                            { x: 33, y: 36 },
                            { x: 33, y: 42 },
                            { x: 35, y: 41 },
                            { x: 35, y: 43 },
                            { x: 33, y: 44 },
                            { x: 29, y: 42 },
                            { x: 29, y: 49 },
                            { x: 27, y: 50 },
                            { x: 27, y: 48 },
                            { x: 25, y: 49 },
                            { x: 23, y: 48 },
                            { x: 23, y: 45 },
                            { x: 21, y: 44 }
                        ]
                    },
                    {
                        id: "california",
                        borders: [
                            { x: 27, y: 10 },
                            { x: 37, y: 5 },
                            { x: 39, y: 6 },
                            { x: 39, y: 8 },
                            { x: 41, y: 9 },
                            { x: 41, y: 11 },
                            { x: 37, y: 13 },
                            { x: 37, y: 21 },
                            { x: 41, y: 23 },
                            { x: 37, y: 25 },
                            { x: 35, y: 24 },
                            { x: 29, y: 27 },
                            { x: 29, y: 22 },
                            { x: 27, y: 21 }
                        ]
                    },
                    {
                        id: "new_york",
                        borders: [
                            { x: 29, y: 27 },
                            { x: 35, y: 24 },
                            { x: 37, y: 25 },
                            { x: 41, y: 23 },
                            { x: 37, y: 21 },
                            { x: 37, y: 13 },
                            { x: 41, y: 11 },
                            { x: 45, y: 13 },
                            { x: 45, y: 15 },
                            { x: 47, y: 16 },
                            { x: 45, y: 17 },
                            { x: 45, y: 24 },
                            { x: 47, y: 25 },
                            { x: 49, y: 24 },
                            { x: 49, y: 26 },
                            { x: 47, y: 27 },
                            { x: 45, y: 26 },
                            { x: 43, y: 27 },
                            { x: 43, y: 30 },
                            { x: 39, y: 32 },
                            { x: 39, y: 34 },
                            { x: 37, y: 35 },
                            { x: 37, y: 38 },
                            { x: 33, y: 40 },
                            { x: 33, y: 31 },
                            { x: 35, y: 32 },
                            { x: 35, y: 30 },
                            { x: 33, y: 29 },
                            { x: 35, y: 28 },
                            { x: 33, y: 27 },
                            { x: 29, y: 29 }
                        ]
                    },
                    {
                        id: "cuba",
                        borders: [
                            { x: 51, y: 24 },
                            { x: 53, y: 25 },
                            { x: 53, y: 28 },
                            { x: 55, y: 29 },
                            { x: 55, y: 31 },
                            { x: 53, y: 32 },
                            { x: 53, y: 28 },
                            { x: 51, y: 27 }
                        ]
                    },
                    {
                        id: "mexico",
                        borders: [
                            { x: 39, y: 6 },
                            { x: 43, y: 4 },
                            { x: 47, y: 6 },
                            { x: 47, y: 8 },
                            { x: 43, y: 6 },
                            { x: 41, y: 7 },
                            { x: 49, y: 11 },
                            { x: 49, y: 9 },
                            { x: 53, y: 11 },
                            { x: 53, y: 16 },
                            { x: 61, y: 20 },
                            { x: 61, y: 23 },
                            { x: 63, y: 24 },
                            { x: 61, y: 25 },
                            { x: 59, y: 24 },
                            { x: 59, y: 22 },
                            { x: 57, y: 21 },
                            { x: 55, y: 22 },
                            { x: 53, y: 21 },
                            { x: 51, y: 22 },
                            { x: 49, y: 21 },
                            { x: 49, y: 18 },
                            { x: 51, y: 17 },
                            { x: 51, y: 16 },
                            { x: 49, y: 15 },
                            { x: 47, y: 16 },
                            { x: 45, y: 15 },
                            { x: 45, y: 13 },
                            { x: 41, y: 11 },
                            { x: 41, y: 9 },
                            { x: 39, y: 8 }
                        ]
                    },
                    {
                        id: "greenland",
                        borders: [
                            { x: 1, y: 61 },
                            { x: 5, y: 59 },
                            { x: 5, y: 57 },
                            { x: 11, y: 54 },
                            { x: 13, y: 55 },
                            { x: 21, y: 51 },
                            { x: 23, y: 52 },
                            { x: 23, y: 55 },
                            { x: 21, y: 56 },
                            { x: 21, y: 59 },
                            { x: 19, y: 60 },
                            { x: 19, y: 66 },
                            { x: 17, y: 67 },
                            { x: 17, y: 70 },
                            { x: 11, y: 73 },
                            { x: 11, y: 76 },
                            { x: 5, y: 79 },
                            { x: 5, y: 81 },
                            { x: 3, y: 82 },
                            { x: 3, y: 78 },
                            { x: 1, y: 77 }
                        ]
                    }
                ]
            },
            {
                id: "south_america",
                line_color: { h: 0.3, s: 0.9, l: 0.5 },
                fill_color: { h: 0.3, s: 0.9, l: 0.3  },
                territories: [
                    {
                        id: "colombia_venezuela",
                        borders: [
                            { x: 57, y: 27 },
                            { x: 67, y: 22 },
                            { x: 67, y: 27 },
                            { x: 69, y: 28 },
                            { x: 67, y: 29 },
                            { x: 65, y: 28 },
                            { x: 65, y: 36 },
                            { x: 67, y: 37 },
                            { x: 67, y: 40 },
                            { x: 65, y: 41 },
                            { x: 63, y: 40 },
                            { x: 63, y: 37 },
                            { x: 59, y: 35 },
                            { x: 59, y: 28 }
                        ]
                    }
                ]
            }
        ]
    };

    return map;
}
},{}]},{},[2]);
