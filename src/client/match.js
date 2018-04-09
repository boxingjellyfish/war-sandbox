const ColorHSL = require("./util/color_hsl.js");

class Match {

    constructor(canvas, engine, socket) {
        this.canvas = canvas;
        this.engine = engine;
        this.socket = socket;
        this.scene = null;
        this.camera = null;

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
        this.camera.attachControl(this.canvas, false);

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
                        }
                    )
                );
                polygon.actionManager.registerAction(
                    new BABYLON.ExecuteCodeAction(
                        BABYLON.ActionManager.OnPointerOutTrigger,
                        (evt) => {
                            evt.meshUnderPointer.material = this.getMaterialByName(evt.meshUnderPointer.name.replace("_polygon", "_grid_material"));
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
    }
}

module.exports = Match;