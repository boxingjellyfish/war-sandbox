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
    var camera = new BABYLON.ArcRotateCamera("ArcRotateCamera", 0, Math.PI / 8, 200, new BABYLON.Vector3(60, -8, 100), scene);
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
            polygonMaterial.emissiveColor = new BABYLON.Color4(0, 0, 0);
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
                    new BABYLON.Color3(0, 0, 0),
                    100
                )
            );
            polygon.actionManager.registerAction(
                new BABYLON.ExecuteCodeAction(
                    BABYLON.ActionManager.OnPickTrigger,
                    function (evt) {
                        if (evt.meshUnderPointer) {
                            var meshClicked = evt.meshUnderPointer;
                            console.log(meshClicked.name);
                        }
                    }
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