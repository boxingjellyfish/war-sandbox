var ColorHSL = require("./util/color_hsl.js");

module.exports = Game = function (canvasElement) {
    this.canvas = document.getElementById(canvasElement);
    this.engine = new BABYLON.Engine(this.canvas, true);
    this.map = null;
    this.socket = io();

    this.materials = [];

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

    this.socket.on("time", function (timeString) {
        console.log("Server time: " + timeString);
    });

    this.socket.on("load_map", function (map) {
        console.log("Map recieved: " + map);
        that.map = map;
        that.loadMap();
    });

    this.socket.emit("client_ready", new Date().toDateString());

};

Game.prototype.createScene3 = function () {
    var scene = new BABYLON.Scene(this.engine);
    scene.clearColor = new BABYLON.Color4(0, 0, 0, 1);
    scene.defaultCursor = "url('/img/cursors/green_select.cur'), auto ";
    scene.hoverCursor = "url('/img/cursors/yellow_select.cur'), auto ";
    var camera = new BABYLON.ArcRotateCamera("ArcRotateCamera", -Math.PI * 0.5, Math.PI * 0.6, 150, new BABYLON.Vector3(110, 50, 0), scene);
    camera.attachControl(this.canvas, false);
    this.createUI(scene);
    return scene;
}

Game.prototype.loadMap = function () {
    var that = this;
    for (var region of this.map.regions) {
        for (var territory of region.territories) {
            var points = [];
            var shape = [];
            for (var border of territory.borders) {
                points.push(new BABYLON.Vector3(border.x, border.y, 0));
                shape.push(new BABYLON.Vector3(border.x, 0, border.y));
            }
            points.push(new BABYLON.Vector3(territory.borders[0].x, territory.borders[0].y, 0));
            shape.push(new BABYLON.Vector3(territory.borders[0].x, 0, territory.borders[0].y));

            var gridMaterial = new BABYLON.GridMaterial(territory.id + "_grid_material", this.scene);
            gridMaterial.lineColor = new ColorHSL(region.color.h, region.color.s, region.color.l).toColor3();
            gridMaterial.majorUnitFrequency = 0;
            this.materials.push(gridMaterial);

            var polygonMaterial = new BABYLON.StandardMaterial(territory.id + "_material", this.scene);
            polygonMaterial.emissiveColor = new ColorHSL(region.color.h, region.color.s, region.color.l).toColor3();
            this.materials.push(polygonMaterial);

            var polygon = BABYLON.MeshBuilder.CreatePolygon(territory.id + "_polygon", { shape: shape, sideOrientation: BABYLON.Mesh.DOUBLESIDE }, this.scene);
            polygon.material = gridMaterial; //polygonMaterial;
            polygon.rotate(BABYLON.Axis.X, -Math.PI / 2, BABYLON.Space.WORLD);
            var lines = BABYLON.MeshBuilder.CreateLines(territory.id + "_lines", { points: points, updatable: false, instance: null }, this.scene);
            lines.color = new ColorHSL(region.color.h, region.color.s, 0.5).toColor3();

            polygon.actionManager = new BABYLON.ActionManager(this.scene);
            polygon.actionManager.registerAction(
                new BABYLON.ExecuteCodeAction(
                    BABYLON.ActionManager.OnPointerOverTrigger,
                    function (evt) {
                        evt.meshUnderPointer.material = that.getMaterialByName(evt.meshUnderPointer.name.replace("_polygon","_material"));
                    }
                )
            );
            polygon.actionManager.registerAction(
                new BABYLON.ExecuteCodeAction(
                    BABYLON.ActionManager.OnPointerOutTrigger,
                    function (evt) {
                        evt.meshUnderPointer.material = that.getMaterialByName(evt.meshUnderPointer.name.replace("_polygon","_grid_material"));
                    }
                )
            );
            polygon.actionManager.registerAction(
                new BABYLON.ExecuteCodeAction(
                    BABYLON.ActionManager.OnPickTrigger,
                    function (evt) {
                        if (evt.meshUnderPointer) {
                            var meshClicked = evt.meshUnderPointer;
                            that.onTerrytoryClicked(meshClicked);
                        }
                    }
                )
            );
        }
    }


    var discMaterial = new BABYLON.StandardMaterial("disc_material", this.scene)
    discMaterial.emissiveColor = new ColorHSL(0, 0, 0.7).toColor3();
    for (var connection of this.map.connections) {
        for (var point of connection.points) {
            var disc = BABYLON.MeshBuilder.CreateDisc("disc", { radius: 0.4, arc: 1, tessellation: 50, sideOrientation: BABYLON.Mesh.DOUBLESIDE }, this.scene);
            disc.position = new BABYLON.Vector3(point.x, point.y, -0.1);
            disc.material = discMaterial;
        }
    }

}

Game.prototype.onTerrytoryClicked = function (meshClicked) {
    var id = meshClicked.name.replace("_polygon", "");
    //meshClicked.material.emissiveColor = new ColorHSL(0.6, 0.9, 0.3).toColor3();
    meshClicked.material.lineColor = new ColorHSL(0.6, 0.9, 0.3).toColor3();
    for (var region of this.map.regions) {
        for (var territory of region.territories) {
            if (territory.id == id) {
                if (territory.neighbours) {
                    for (var neighbour of territory.neighbours) {
                        var mesh = this.scene.getMeshByName(neighbour.id + "_polygon");
                        //mesh.material.emissiveColor = new ColorHSL(0, 0.9, 0.3).toColor3();
                        mesh.material.lineColor = new ColorHSL(0, 0.9, 0.3).toColor3();
                    }
                }
            }
        }
    }
}

Game.prototype.getMaterialByName = function (name) {
    for (var material of this.materials) {
        if (material.name == name) {
            return material;
        }
    }
}

Game.prototype.createUI = function (scene) {
    var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

    var buttonHoverSound = new BABYLON.Sound("buttonHoverSound", "audio/beep-29.wav", scene);
    var buttonClickSound = new BABYLON.Sound("buttonClickSound", "audio/button-35.wav", scene);

    var that = this;

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

