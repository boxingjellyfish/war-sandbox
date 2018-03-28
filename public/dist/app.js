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
    var camera = new BABYLON.ArcRotateCamera("ArcRotateCamera", 0, Math.PI / 8, 150, new BABYLON.Vector3(60, -8, 100), scene);
    camera.attachControl(this.canvas, false);

    var map = new Level().createDefaultMap();

    for (var region of map.regions) {
        for (var territory of region.territories) {
            var shape = [];
            for (var border of territory.borders) {
                shape.push(new BABYLON.Vector3(border.x, 0, border.y))
            }
            shape.push(new BABYLON.Vector3(territory.borders[0].x, 0, territory.borders[0].y))

            var polygonMaterial = new BABYLON.StandardMaterial(territory.id + "_material", scene)
            //polygonMaterial.emissiveColor = new BABYLON.Color4(0, 0, 0);
            polygonMaterial.emissiveColor = new ColorHSL(region.fill_color.h, region.fill_color.s, region.fill_color.l).toColor3();
            var polygon = BABYLON.MeshBuilder.CreatePolygon(territory.id + "_polygon", { shape: shape, sideOrientation: BABYLON.Mesh.DOUBLESIDE }, scene);
            polygon.material = polygonMaterial;
            var lines = BABYLON.MeshBuilder.CreateLines(territory.id + "_lines", { points: shape, updatable: false, instance: null }, scene);
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
                    400
                )
            );
            polygon.actionManager.registerAction(
                new BABYLON.ExecuteCodeAction(
                    BABYLON.ActionManager.OnPickTrigger,
                    function (evt) {
                        if (evt.meshUnderPointer) {
                            var meshClicked = evt.meshUnderPointer;
                            var id = meshClicked.name.replace("_polygon", "");
                            meshClicked.material.emissiveColor = new ColorHSL(0.6, 0.9, 0.3).toColor3();
                            for (var region of map.regions) {
                                for (var territory of region.territories) {
                                    if (territory.id == id) {
                                        if (territory.neighbours) {
                                            for (var neighbour of territory.neighbours) {
                                                var mesh = scene.getMeshByName(neighbour.id + "_polygon");
                                                mesh.material.emissiveColor = new ColorHSL(0, 0.9, 0.3).toColor3();
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                )
            );
        }
    }

    for (var connection of map.connections) {
        var points = [];
        for (var point of connection.points) {
            points.push(new BABYLON.Vector3(point.x, 0, point.y));
        }
        var dashedLines = BABYLON.MeshBuilder.CreateDashedLines(connection.id + "_connection", { points: points, dashSize: 1, dashNb: 10 }, scene);
        dashedLines.color = new ColorHSL(1, 1, 1).toColor3();
    }

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
                fill_color: { h: 0.1, s: 0.9, l: 0.3 },
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
                        ],
                        neighbours: [
                            { id: "vladivostok" },
                            { id: "vancouver" },
                            { id: "mackenzie" }
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
                        ],
                        neighbours: [
                            { id: "alaska" },
                            { id: "vancouver" },
                            { id: "ottawa" },
                            { id: "greenland" }
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
                        ],
                        neighbours: [
                            { id: "alaska" },
                            { id: "mackenzie" },
                            { id: "ottawa" },
                            { id: "california" }
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
                        ],
                        neighbours: [
                            { id: "vancouver" },
                            { id: "mackenzie" },
                            { id: "labrador" },
                            { id: "new_york" },
                            { id: "california" }
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
                        ],
                        neighbours: [
                            { id: "greenland" },
                            { id: "new_york" },
                            { id: "ottawa" }
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
                        ],
                        neighbours: [
                            { id: "vancouver" },
                            { id: "ottawa" },
                            { id: "new_york" },
                            { id: "mexico" }
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
                        ],
                        neighbours: [
                            { id: "california" },
                            { id: "ottawa" },
                            { id: "labrador" },
                            { id: "mexico" },
                            { id: "cuba" }
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
                        ],
                        neighbours: [
                            { id: "mexico" },
                            { id: "new_york" }
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
                        ],
                        neighbours: [
                            { id: "california" },
                            { id: "new_york" },
                            { id: "cuba" },
                            { id: "colombia_venezuela" }
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
                        ],
                        neighbours: [
                            { id: "mackenzie" },
                            { id: "labrador" },
                            { id: "iceland" }
                        ]
                    }
                ]
            },
            {
                id: "south_america",
                line_color: { h: 0.3, s: 0.9, l: 0.5 },
                fill_color: { h: 0.3, s: 0.9, l: 0.3 },
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
                        ],
                        neighbours: []
                    },
                    {
                        id: "peru_bolivia_chile",
                        borders: [
                            { x: 67, y: 22 },
                            { x: 71, y: 20 },
                            { x: 79, y: 24 },
                            { x: 79, y: 28 },
                            { x: 81, y: 29 },
                            { x: 83, y: 28 },
                            { x: 85, y: 29 },
                            { x: 87, y: 28 },
                            { x: 89, y: 29 },
                            { x: 91, y: 28 },
                            { x: 95, y: 30 },
                            { x: 97, y: 29 },
                            { x: 99, y: 30 },
                            { x: 101, y: 29 },
                            { x: 105, y: 31 },
                            { x: 107, y: 30 },
                            { x: 111, y: 32 },
                            { x: 111, y: 34 },
                            { x: 107, y: 32 },
                            { x: 105, y: 33 },
                            { x: 101, y: 31 },
                            { x: 99, y: 32 },
                            { x: 97, y: 31 },
                            { x: 95, y: 32 },
                            { x: 91, y: 30 },
                            { x: 89, y: 31 },
                            { x: 87, y: 30 },
                            { x: 85, y: 31 },
                            { x: 85, y: 37 },
                            { x: 77, y: 33 },
                            { x: 77, y: 31 },
                            { x: 75, y: 30 },
                            { x: 75, y: 27 },
                            { x: 71, y: 25 },
                            { x: 69, y: 26 },
                            { x: 69, y: 28 },
                            { x: 67, y: 27 }
                        ],
                        neighbours: []
                    },
                    {
                        id: "brazil",
                        borders: [
                            { x: 65, y: 28 },
                            { x: 67, y: 29 },
                            { x: 69, y: 28 },
                            { x: 69, y: 26 },
                            { x: 71, y: 25 },
                            { x: 75, y: 27 },
                            { x: 75, y: 30 },
                            { x: 77, y: 31 },
                            { x: 77, y: 33 },
                            { x: 89, y: 39 },
                            { x: 93, y: 37 },
                            { x: 93, y: 42 },
                            { x: 87, y: 45 },
                            { x: 87, y: 48 },
                            { x: 83, y: 50 },
                            { x: 81, y: 49 },
                            { x: 77, y: 51 },
                            { x: 77, y: 53 },
                            { x: 75, y: 54 },
                            { x: 71, y: 52 },
                            { x: 71, y: 49 },
                            { x: 69, y: 48 },
                            { x: 69, y: 43 },
                            { x: 65, y: 41 },
                            { x: 67, y: 40 },
                            { x: 67, y: 37 },
                            { x: 65, y: 36 }
                        ],
                        neighbours: []
                    },
                    {
                        id: "argentina_uruguay",
                        borders: [
                            { x: 85, y: 31 },
                            { x: 87, y: 30 },
                            { x: 89, y: 31 },
                            { x: 91, y: 30 },
                            { x: 95, y: 32 },
                            { x: 97, y: 31 },
                            { x: 99, y: 32 },
                            { x: 101, y: 31 },
                            { x: 105, y: 33 },
                            { x: 107, y: 32 },
                            { x: 111, y: 34 },
                            { x: 111, y: 36 },
                            { x: 109, y: 35 },
                            { x: 107, y: 36 },
                            { x: 105, y: 35 },
                            { x: 103, y: 36 },
                            { x: 101, y: 35 },
                            { x: 97, y: 37 },
                            { x: 97, y: 40 },
                            { x: 93, y: 42 },
                            { x: 93, y: 37 },
                            { x: 89, y: 39 },
                            { x: 85, y: 37 }
                        ],
                        neighbours: []
                    }
                ]
            },
            {
                id: "africa",
                line_color: { h: 0.9, s: 0.9, l: 0.5 },
                fill_color: { h: 0.9, s: 0.9, l: 0.3 },
                territories: [
                    {
                        id: "argelia_nigeria",
                        borders: [
                            { x: 45, y: 75 },
                            { x: 49, y: 73 },
                            { x: 49, y: 70 },
                            { x: 53, y: 68 },
                            { x: 55, y: 69 },
                            { x: 59, y: 67 },
                            { x: 69, y: 72 },
                            { x: 69, y: 82 },
                            { x: 71, y: 83 },
                            { x: 71, y: 89 },
                            { x: 69, y: 88 },
                            { x: 67, y: 89 },
                            { x: 63, y: 87 },
                            { x: 59, y: 89 },
                            { x: 57, y: 88 },
                            { x: 55, y: 89 },
                            { x: 53, y: 88 },
                            { x: 53, y: 86 },
                            { x: 51, y: 85 },
                            { x: 47, y: 87 },
                            { x: 45, y: 86 }
                        ],
                        neighbours: []
                    },
                    {
                        id: "egypt",
                        borders: [
                            { x: 47, y: 87 },
                            { x: 51, y: 85 },
                            { x: 53, y: 86 },
                            { x: 53, y: 88 },
                            { x: 55, y: 89 },
                            { x: 55, y: 91 },
                            { x: 57, y: 92 },
                            { x: 57, y: 94 },
                            { x: 55, y: 95 },
                            { x: 55, y: 102 },
                            { x: 53, y: 101 },
                            { x: 53, y: 103 },
                            { x: 51, y: 102 },
                            { x: 51, y: 100 },
                            { x: 49, y: 99 },
                            { x: 49, y: 90 },
                            { x: 47, y: 89 }
                        ],
                        neighbours: []
                    },
                    {
                        id: "sudan",
                        borders: [
                            { x: 55, y: 89 },
                            { x: 57, y: 88 },
                            { x: 59, y: 89 },
                            { x: 63, y: 87 },
                            { x: 67, y: 89 },
                            { x: 69, y: 88 },
                            { x: 71, y: 89 },
                            { x: 69, y: 90 },
                            { x: 69, y: 96 },
                            { x: 71, y: 97 },
                            { x: 77, y: 94 },
                            { x: 81, y: 96 },
                            { x: 81, y: 102 },
                            { x: 73, y: 106 },
                            { x: 73, y: 108 },
                            { x: 67, y: 111 },
                            { x: 67, y: 108 },
                            { x: 55, y: 102 },
                            { x: 55, y: 95 },
                            { x: 57, y: 94 },
                            { x: 57, y: 92 },
                            { x: 55, y: 91 }
                        ],
                        neighbours: []
                    },
                    {
                        id: "congo",
                        borders: [
                            { x: 71, y: 83 },
                            { x: 73, y: 82 },
                            { x: 79, y: 85 },
                            { x: 83, y: 83 },
                            { x: 85, y: 84 },
                            { x: 85, y: 89 },
                            { x: 87, y: 90 },
                            { x: 87, y: 93 },
                            { x: 81, y: 96 },
                            { x: 77, y: 94 },
                            { x: 71, y: 97 },
                            { x: 69, y: 96 },
                            { x: 69, y: 90 },
                            { x: 71, y: 89 }
                        ],
                        neighbours: []
                    },
                    {
                        id: "south_africa",
                        borders: [
                            { x: 85, y: 84 },
                            { x: 87, y: 83 },
                            { x: 91, y: 85 },
                            { x: 93, y: 84 },
                            { x: 99, y: 87 },
                            { x: 99, y: 94 },
                            { x: 91, y: 98 },
                            { x: 89, y: 97 },
                            { x: 87, y: 98 },
                            { x: 87, y: 103 },
                            { x: 85, y: 104 },
                            { x: 81, y: 102 },
                            { x: 81, y: 96 },
                            { x: 87, y: 93 },
                            { x: 87, y: 90 },
                            { x: 85, y: 89 }
                        ],
                        neighbours: []
                    },
                    {
                        id: "madagascar",
                        borders: [
                            { x: 85, y: 106 },
                            { x: 91, y: 103 },
                            { x: 93, y: 104 },
                            { x: 93, y: 106 },
                            { x: 89, y: 108 },
                            { x: 87, y: 107 },
                            { x: 87, y: 109 },
                            { x: 85, y: 110 },
                            { x: 83, y: 109 },
                            { x: 85, y: 108 }
                        ],
                        neighbours: []
                    }
                ]
            },
            {
                id: "asia",
                line_color: { h: 0.2, s: 0.9, l: 0.5 },
                fill_color: { h: 0.2, s: 0.9, l: 0.3 },
                territories: [
                    {
                        id: "omsk",
                        borders: [
                            { x: 13, y: 109 },
                            { x: 23, y: 114 },
                            { x: 23, y: 113 },
                            { x: 27, y: 111 },
                            { x: 33, y: 114 },
                            { x: 33, y: 120 },
                            { x: 39, y: 123 },
                            { x: 41, y: 122 },
                            { x: 43, y: 123 },
                            { x: 43, y: 125 },
                            { x: 37, y: 128 },
                            { x: 35, y: 127 },
                            { x: 35, y: 124 },
                            { x: 23, y: 118 },
                            { x: 21, y: 119 },
                            { x: 19, y: 118 },
                            { x: 19, y: 114 },
                            { x: 13, y: 111 }
                        ],
                        neighbours: []
                    },
                    {
                        id: "aral",
                        borders: [
                            { x: 33, y: 114 },
                            { x: 35, y: 113 },
                            { x: 35, y: 111 },
                            { x: 37, y: 110 },
                            { x: 39, y: 111 },
                            { x: 39, y: 114 },
                            { x: 41, y: 113 },
                            { x: 47, y: 116 },
                            { x: 45, y: 117 },
                            { x: 45, y: 121 },
                            { x: 47, y: 122 },
                            { x: 45, y: 123 },
                            { x: 43, y: 122 },
                            { x: 43, y: 123 },
                            { x: 41, y: 122 },
                            { x: 39, y: 123 },
                            { x: 33, y: 120 }
                        ],
                        neighbours: []
                    },
                    {
                        id: "middle_east",
                        borders: [
                            { x: 41, y: 97 },
                            { x: 43, y: 96 },
                            { x: 47, y: 98 },
                            { x: 47, y: 104 },
                            { x: 51, y: 102 },
                            { x: 65, y: 109 },
                            { x: 61, y: 111 },
                            { x: 61, y: 113 },
                            { x: 57, y: 115 },
                            { x: 55, y: 114 },
                            { x: 55, y: 112 },
                            { x: 53, y: 111 },
                            { x: 53, y: 109 },
                            { x: 51, y: 108 },
                            { x: 51, y: 112 },
                            { x: 53, y: 113 },
                            { x: 53, y: 117 },
                            { x: 49, y: 115 },
                            { x: 47, y: 116 },
                            { x: 45, y: 115 },
                            { x: 47, y: 114 },
                            { x: 47, y: 111 },
                            { x: 45, y: 110 },
                            { x: 45, y: 108 },
                            { x: 43, y: 107 },
                            { x: 43, y: 98 }
                        ],
                        neighbours: []
                    },
                    {
                        id: "dudinka",
                        borders: [
                            { x: 13, y: 115 },
                            { x: 15, y: 116 },
                            { x: 15, y: 114 },
                            { x: 19, y: 116 },
                            { x: 19, y: 118 },
                            { x: 21, y: 119 },
                            { x: 23, y: 118 },
                            { x: 35, y: 124 },
                            { x: 35, y: 127 },
                            { x: 39, y: 129 },
                            { x: 39, y: 133 },
                            { x: 37, y: 134 },
                            { x: 37, y: 130 },
                            { x: 35, y: 129 },
                            { x: 33, y: 130 },
                            { x: 31, y: 129 },
                            { x: 31, y: 127 },
                            { x: 23, y: 123 },
                            { x: 21, y: 124 },
                            { x: 21, y: 125 },
                            { x: 23, y: 126 },
                            { x: 23, y: 128 },
                            { x: 21, y: 127 },
                            { x: 21, y: 129 },
                            { x: 17, y: 127 },
                            { x: 15, y: 128 },
                            { x: 13, y: 127 },
                            { x: 15, y: 126 },
                            { x: 15, y: 118 },
                            { x: 13, y: 117 }
                        ],
                        neighbours: []
                    },
                    {
                        id: "india",
                        borders: [
                            { x: 49, y: 115 },
                            { x: 59, y: 120 },
                            { x: 59, y: 122 },
                            { x: 63, y: 124 },
                            { x: 65, y: 123 },
                            { x: 71, y: 126 },
                            { x: 71, y: 128 },
                            { x: 69, y: 129 },
                            { x: 67, y: 128 },
                            { x: 65, y: 129 },
                            { x: 63, y: 128 },
                            { x: 59, y: 130 },
                            { x: 59, y: 134 },
                            { x: 55, y: 136 },
                            { x: 55, y: 130 },
                            { x: 53, y: 129 },
                            { x: 53, y: 127 },
                            { x: 51, y: 126 },
                            { x: 49, y: 127 },
                            { x: 47, y: 126 },
                            { x: 47, y: 122 },
                            { x: 45, y: 121 },
                            { x: 45, y: 117 }
                        ],
                        neighbours: []
                    },
                    {
                        id: "siberia",
                        borders: [
                            { x: 15, y: 128 },
                            { x: 17, y: 127 },
                            { x: 21, y: 129 },
                            { x: 21, y: 127 },
                            { x: 23, y: 128 },
                            { x: 23, y: 126 },
                            { x: 21, y: 125 },
                            { x: 21, y: 124 },
                            { x: 23, y: 123 },
                            { x: 27, y: 125 },
                            { x: 27, y: 132 },
                            { x: 31, y: 134 },
                            { x: 31, y: 137 },
                            { x: 29, y: 138 },
                            { x: 29, y: 142 },
                            { x: 27, y: 143 },
                            { x: 27, y: 138 },
                            { x: 25, y: 137 },
                            { x: 23, y: 138 },
                            { x: 17, y: 135 },
                            { x: 17, y: 133 },
                            { x: 15, y: 132 }
                        ],
                        neighbours: []
                    },
                    {
                        id: "chita",
                        borders: [
                            { x: 27, y: 125 },
                            { x: 31, y: 127 },
                            { x: 31, y: 129 },
                            { x: 33, y: 130 },
                            { x: 35, y: 129 },
                            { x: 37, y: 130 },
                            { x: 37, y: 136 },
                            { x: 39, y: 137 },
                            { x: 39, y: 143 },
                            { x: 37, y: 144 },
                            { x: 33, y: 142 },
                            { x: 33, y: 144 },
                            { x: 31, y: 143 },
                            { x: 31, y: 145 },
                            { x: 29, y: 146 },
                            { x: 27, y: 145 },
                            { x: 27, y: 143 },
                            { x: 29, y: 142 },
                            { x: 29, y: 138 },
                            { x: 31, y: 137 },
                            { x: 31, y: 134 },
                            { x: 27, y: 132 }
                        ],
                        neighbours: []
                    },
                    {
                        id: "mongolia",
                        borders: [
                            { x: 41, y: 126 },
                            { x: 41, y: 130 },
                            { x: 43, y: 131 },
                            { x: 43, y: 133 },
                            { x: 45, y: 134 },
                            { x: 45, y: 140 },
                            { x: 43, y: 141 },
                            { x: 43, y: 143 },
                            { x: 41, y: 144 },
                            { x: 39, y: 143 },
                            { x: 39, y: 137 },
                            { x: 37, y: 136 },
                            { x: 37, y: 134 },
                            { x: 39, y: 133 },
                            { x: 39, y: 129 },
                            { x: 37, y: 128 }
                        ],
                        neighbours: []
                    },
                    {
                        id: "china",
                        borders: [
                            { x: 47, y: 122 },
                            { x: 47, y: 126 },
                            { x: 49, y: 127 },
                            { x: 51, y: 126 },
                            { x: 53, y: 127 },
                            { x: 53, y: 129 },
                            { x: 55, y: 130 },
                            { x: 55, y: 136 },
                            { x: 61, y: 139 },
                            { x: 59, y: 140 },
                            { x: 59, y: 142 },
                            { x: 61, y: 143 },
                            { x: 61, y: 147 },
                            { x: 55, y: 150 },
                            { x: 47, y: 146 },
                            { x: 45, y: 147 },
                            { x: 45, y: 150 },
                            { x: 41, y: 152 },
                            { x: 39, y: 151 },
                            { x: 39, y: 147 },
                            { x: 37, y: 146 },
                            { x: 37, y: 144 },
                            { x: 39, y: 143 },
                            { x: 41, y: 144 },
                            { x: 43, y: 143 },
                            { x: 43, y: 141 },
                            { x: 45, y: 140 },
                            { x: 45, y: 134 },
                            { x: 43, y: 133 },
                            { x: 43, y: 131 },
                            { x: 41, y: 130 },
                            { x: 41, y: 126 },
                            { x: 43, y: 125 },
                            { x: 43, y: 122 },
                            { x: 45, y: 123 }
                        ],
                        neighbours: []
                    },
                    {
                        id: "vietnam",
                        borders: [
                            { x: 59, y: 134 },
                            { x: 69, y: 139 },
                            { x: 71, y: 138 },
                            { x: 75, y: 140 },
                            { x: 75, y: 142 },
                            { x: 71, y: 140 },
                            { x: 69, y: 141 },
                            { x: 71, y: 142 },
                            { x: 71, y: 144 },
                            { x: 67, y: 146 },
                            { x: 59, y: 142 },
                            { x: 59, y: 140 },
                            { x: 61, y: 139 },
                            { x: 55, y: 136 }
                        ],
                        neighbours: []
                    },
                    {
                        id: "vladivostok",
                        borders: [
                            { x: 17, y: 135 },
                            { x: 23, y: 138 },
                            { x: 25, y: 137 },
                            { x: 27, y: 138 },
                            { x: 27, y: 145 },
                            { x: 29, y: 146 },
                            { x: 31, y: 145 },
                            { x: 31, y: 143 },
                            { x: 33, y: 144 },
                            { x: 33, y: 142 },
                            { x: 37, y: 144 },
                            { x: 37, y: 146 },
                            { x: 39, y: 147 },
                            { x: 39, y: 151 },
                            { x: 41, y: 152 },
                            { x: 45, y: 150 },
                            { x: 49, y: 152 },
                            { x: 47, y: 153 },
                            { x: 45, y: 152 },
                            { x: 41, y: 154 },
                            { x: 35, y: 151 },
                            { x: 35, y: 149 },
                            { x: 31, y: 151 },
                            { x: 31, y: 155 },
                            { x: 29, y: 154 },
                            { x: 29, y: 156 },
                            { x: 37, y: 160 },
                            { x: 35, y: 161 },
                            { x: 29, y: 158 },
                            { x: 29, y: 160 },
                            { x: 27, y: 161 },
                            { x: 25, y: 160 },
                            { x: 25, y: 162 },
                            { x: 23, y: 161 },
                            { x: 23, y: 150 },
                            { x: 21, y: 149 },
                            { x: 21, y: 141 },
                            { x: 19, y: 140 },
                            { x: 19, y: 138 },
                            { x: 17, y: 137 }
                        ],
                        neighbours: []
                    },
                    {
                        id: "japan",
                        borders: [
                            { x: 43, y: 162 },
                            { x: 45, y: 163 },
                            { x: 47, y: 162 },
                            { x: 49, y: 163 },
                            { x: 49, y: 161 },
                            { x: 53, y: 159 },
                            { x: 55, y: 160 },
                            { x: 53, y: 161 },
                            { x: 51, y: 160 },
                            { x: 51, y: 164 },
                            { x: 49, y: 165 },
                            { x: 47, y: 164 },
                            { x: 45, y: 165 },
                            { x: 43, y: 164 }
                        ],
                        neighbours: []
                    }
                ]
            },
            {
                id: "europe",
                line_color: { h: 0.8, s: 0.9, l: 0.5 },
                fill_color: { h: 0.8, s: 0.9, l: 0.3 },
                territories: [
                    {
                        id: "sweden",
                        borders: [
                            { x: 15, y: 84 },
                            { x: 19, y: 82 },
                            { x: 21, y: 83 },
                            { x: 23, y: 82 },
                            { x: 23, y: 84 },
                            { x: 21, y: 85 },
                            { x: 21, y: 87 },
                            { x: 23, y: 88 },
                            { x: 23, y: 90 },
                            { x: 19, y: 92 },
                            { x: 19, y: 96 },
                            { x: 21, y: 97 },
                            { x: 21, y: 94 },
                            { x: 23, y: 93 },
                            { x: 23, y: 98 },
                            { x: 21, y: 99 },
                            { x: 17, y: 97 },
                            { x: 11, y: 100 },
                            { x: 11, y: 93 },
                            { x: 13, y: 92 },
                            { x: 13, y: 90 },
                            { x: 15, y: 89 }
                        ],
                        neighbours: []
                    },
                    {
                        id: "iceland",
                        borders: [
                            { x: 19, y: 75 },
                            { x: 21, y: 74 },
                            { x: 23, y: 75 },
                            { x: 23, y: 78 },
                            { x: 21, y: 79 },
                            { x: 19, y: 78 }
                        ],
                        neighbours: []
                    },
                    {
                        id: "england",
                        borders: [
                            { x: 25, y: 71 },
                            { x: 27, y: 72 },
                            { x: 29, y: 71 },
                            { x: 27, y: 70 },
                            { x: 27, y: 68 },
                            { x: 29, y: 69 },
                            { x: 29, y: 71 },
                            { x: 31, y: 70 },
                            { x: 31, y: 76 },
                            { x: 29, y: 75 },
                            { x: 29, y: 73 },
                            { x: 27, y: 74 },
                            { x: 25, y: 73 }
                        ],
                        neighbours: []
                    },
                    {
                        id: "germany",
                        borders: [
                            { x: 25, y: 84 },
                            { x: 27, y: 85 },
                            { x: 31, y: 83 },
                            { x: 37, y: 86 },
                            { x: 37, y: 91 },
                            { x: 35, y: 92 },
                            { x: 31, y: 90 },
                            { x: 29, y: 91 },
                            { x: 25, y: 89 }
                        ],
                        neighbours: []
                    },
                    {
                        id: "france_spain_portugal_italy",
                        borders: [
                            { x: 37, y: 75 },
                            { x: 39, y: 76 },
                            { x: 41, y: 75 },
                            { x: 43, y: 76 },
                            { x: 43, y: 81 },
                            { x: 41, y: 80 },
                            { x: 41, y: 82 },
                            { x: 39, y: 83 },
                            { x: 39, y: 88 },
                            { x: 43, y: 90 },
                            { x: 45, y: 89 },
                            { x: 45, y: 91 },
                            { x: 43, y: 92 },
                            { x: 37, y: 89 },
                            { x: 37, y: 86 },
                            { x: 31, y: 83 },
                            { x: 31, y: 81 },
                            { x: 33, y: 80 },
                            { x: 33, y: 78 },
                            { x: 37, y: 80 }
                        ],
                        neighbours: []
                    },
                    {
                        id: "poland_yugoslavia",
                        borders: [
                            { x: 27, y: 90 },
                            { x: 29, y: 91 },
                            { x: 31, y: 90 },
                            { x: 35, y: 92 },
                            { x: 37, y: 91 },
                            { x: 37, y: 89 },
                            { x: 39, y: 90 },
                            { x: 39, y: 92 },
                            { x: 43, y: 94 },
                            { x: 45, y: 93 },
                            { x: 47, y: 94 },
                            { x: 47, y: 96 },
                            { x: 45, y: 95 },
                            { x: 39, y: 98 },
                            { x: 37, y: 97 },
                            { x: 37, y: 95 },
                            { x: 35, y: 94 },
                            { x: 33, y: 95 },
                            { x: 27, y: 92 }
                        ],
                        neighbours: []
                    },
                    {
                        id: "moscow",
                        borders: [
                            { x: 11, y: 100 },
                            { x: 17, y: 97 },
                            { x: 21, y: 99 },
                            { x: 23, y: 98 },
                            { x: 23, y: 96 },
                            { x: 25, y: 97 },
                            { x: 27, y: 96 },
                            { x: 25, y: 95 },
                            { x: 25, y: 93 },
                            { x: 27, y: 92 },
                            { x: 33, y: 95 },
                            { x: 35, y: 94 },
                            { x: 37, y: 95 },
                            { x: 37, y: 97 },
                            { x: 39, y: 98 },
                            { x: 37, y: 99 },
                            { x: 39, y: 100 },
                            { x: 39, y: 103 },
                            { x: 37, y: 104 },
                            { x: 39, y: 105 },
                            { x: 41, y: 104 },
                            { x: 41, y: 106 },
                            { x: 43, y: 105 },
                            { x: 43, y: 107 },
                            { x: 45, y: 108 },
                            { x: 45, y: 110 },
                            { x: 41, y: 108 },
                            { x: 39, y: 109 },
                            { x: 39, y: 111 },
                            { x: 37, y: 110 },
                            { x: 35, y: 111 },
                            { x: 35, y: 113 },
                            { x: 33, y: 114 },
                            { x: 27, y: 111 },
                            { x: 23, y: 113 },
                            { x: 23, y: 114 },
                            { x: 15, y: 110 },
                            { x: 15, y: 108 },
                            { x: 17, y: 109 },
                            { x: 17, y: 107 },
                            { x: 15, y: 106 },
                            { x: 15, y: 102 },
                            { x: 17, y: 101 },
                            { x: 17, y: 99 },
                            { x: 13, y: 101 },
                            { x: 13, y: 103 },
                            { x: 11, y: 102 }
                        ],
                        neighbours: []
                    }
                ]
            },
            {
                id: "oceania",
                line_color: { h: 0.5, s: 0.9, l: 0.5 },
                fill_color: { h: 0.5, s: 0.9, l: 0.3 },
                territories: [
                    {
                        id: "australia",
                        borders: [
                            { x: 93, y: 133 },
                            { x: 99, y: 130 },
                            { x: 101, y: 131 },
                            { x: 101, y: 129 },
                            { x: 105, y: 131 },
                            { x: 105, y: 139 },
                            { x: 107, y: 140 },
                            { x: 109, y: 139 },
                            { x: 113, y: 141 },
                            { x: 113, y: 145 },
                            { x: 111, y: 146 },
                            { x: 111, y: 148 },
                            { x: 109, y: 149 },
                            { x: 109, y: 151 },
                            { x: 103, y: 154 },
                            { x: 99, y: 152 },
                            { x: 95, y: 154 },
                            { x: 93, y: 153 },
                            { x: 91, y: 154 },
                            { x: 89, y: 153 },
                            { x: 95, y: 150 },
                            { x: 93, y: 149 },
                            { x: 91, y: 150 },
                            { x: 89, y: 149 },
                            { x: 89, y: 147 },
                            { x: 91, y: 146 },
                            { x: 91, y: 144 },
                            { x: 89, y: 145 },
                            { x: 89, y: 143 },
                            { x: 91, y: 142 },
                            { x: 91, y: 140 },
                            { x: 93, y: 139 }
                        ],
                        neighbours: []
                    },
                    {
                        id: "sumatra",
                        borders: [
                            { x: 75, y: 133 },
                            { x: 87, y: 139 },
                            { x: 87, y: 143 },
                            { x: 85, y: 142 },
                            { x: 85, y: 138 },
                            { x: 83, y: 139 },
                            { x: 75, y: 135 }
                        ],
                        neighbours: []
                    },
                    {
                        id: "borneo",
                        borders: [
                            { x: 77, y: 141 },
                            { x: 81, y: 143 },
                            { x: 81, y: 146 },
                            { x: 79, y: 147 },
                            { x: 83, y: 149 },
                            { x: 83, y: 151 },
                            { x: 81, y: 150 },
                            { x: 81, y: 152 },
                            { x: 79, y: 153 },
                            { x: 79, y: 155 },
                            { x: 77, y: 154 },
                            { x: 79, y: 153 },
                            { x: 79, y: 147 },
                            { x: 73, y: 150 },
                            { x: 73, y: 148 },
                            { x: 75, y: 147 },
                            { x: 75, y: 144 },
                            { x: 77, y: 143 }
                        ],
                        neighbours: []
                    },
                    {
                        id: "new_guinea",
                        borders: [
                            { x: 83, y: 155 },
                            { x: 87, y: 153 },
                            { x: 87, y: 155 },
                            { x: 91, y: 157 },
                            { x: 91, y: 159 },
                            { x: 93, y: 160 },
                            { x: 91, y: 161 },
                            { x: 85, y: 158 },
                            { x: 85, y: 156 }
                        ],
                        neighbours: []
                    }
                ]
            }
        ],
        connections: [
            {
                id: "south_america_africa",
                points: [
                    { x: 71, y: 52 },
                    { x: 59, y: 58 },
                    { x: 59, y: 67 }
                ]
            },
            {
                id: "mexico_cuba",
                points: [
                    { x: 53, y: 21 },
                    { x: 53, y: 25 }
                ]
            },
            {
                id: "new_york_cuba",
                points: [
                    { x: 49, y: 26 },
                    { x: 51, y: 27 }
                ]
            },
            {
                id: "mackenzie_greenland",
                points: [
                    { x: 17, y: 45 },
                    { x: 17, y: 53 }
                ]
            },
            {
                id: "labrador_greenland",
                points: [
                    { x: 27, y: 50 },
                    { x: 23, y: 52 }
                ]
            },
            {
                id: "vladivostok_alaska",
                points: [
                    { x: 25, y: 162 },
                    { x: 25, y: 168 }
                ]
            },
            {
                id: "alaska_vladivostok",
                points: [
                    { x: 19, y: 2 },
                    { x: 25, y: -1 },
                    { x: 25, y: -7 }
                ]
            },
            {
                id: "greenland_iceland",
                points: [
                    { x: 13, y: 72 },
                    { x: 19, y: 75 }
                ]
            },
            {
                id: "iceland_sweden",
                points: [
                    { x: 19, y: 78 },
                    { x: 19, y: 82 }
                ]
            },
            {
                id: "iceland_england",
                points: [
                    { x: 21, y: 74 },
                    { x: 25, y: 72 }
                ]
            },
            {
                id: "sweden_england",
                points: [
                    { x: 19, y: 82 },
                    { x: 31, y: 76 }
                ]
            }
        ]
    };

    return map;
}
},{}]},{},[2]);
