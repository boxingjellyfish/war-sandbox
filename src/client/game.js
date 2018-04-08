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

        this.scene = this.menu.createMainMenuScene();
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
