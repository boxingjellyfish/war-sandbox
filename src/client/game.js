const Splash = require("./splash.js");
const Menu = require("./menu.js");
const Match = require("./match.js");

class Game {

    constructor(canvasElement) {
        this.canvas = document.getElementById(canvasElement);
        this.engine = new BABYLON.Engine(this.canvas, true);
        this.socket = io();
        this.splash = new Splash(this.canvas, this.engine, this.socket, this);
        this.menu = new Menu(this.canvas, this.engine, this.socket, this);
        this.match = new Match(this.canvas, this.engine, this.socket);

        // Listen for browser/canvas resize events
        window.addEventListener("resize", () => {
            this.engine.resize();
        });

        // Disable right click
        this.canvas.oncontextmenu = (e) => {
            e.preventDefault();
        };

        // Fullscreen F key
        document.addEventListener("keydown", (e) => {
            if (e.code == "KeyF") {
                this.toggleFullScreen();
            }
        }, false);

        // Debug console D key
        document.addEventListener("keydown", (e) => {
            if (e.code == "KeyD") {
                this.toggleDebugLayer();
            }
        }, false);

        // Load scene from parameter
        let url = new URL(window.location.href);
        var scene = url.searchParams.get("scene");
        if (scene && scene == "match") {
            this.scene = this.match.createMatchScene();
        }
        else if (scene && scene == "menu") {
            this.scene = this.menu.createMainMenuScene();
        }
        else {
            this.scene = this.splash.createSplashScene();
        }
    }

    // run the render loop
    run() {
        this.engine.runRenderLoop(() => {
            this.scene.render();
        });
    }

    menuAction() {
        this.scene.dispose();
        this.scene = this.menu.createMainMenuScene();
    }

    newGameAction() {
        this.scene.dispose();
        this.scene = this.match.createMatchScene();
    }

    // Fullscreen cross browser support
    toggleFullScreen() {
        if (!document.fullscreenElement &&    // alternative standard method
            !document.mozFullScreenElement && !document.webkitFullscreenElement) {  // current working methods
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            } else if (document.documentElement.mozRequestFullScreen) {
                document.documentElement.mozRequestFullScreen();
            } else if (document.documentElement.webkitRequestFullscreen) {
                document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
            }
        } else {
            if (document.cancelFullScreen) {
                document.cancelFullScreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitCancelFullScreen) {
                document.webkitCancelFullScreen();
            }
        }
    }

    // Debug layer
    toggleDebugLayer() {
        if (this.scene.debugLayer.isVisible()) {
            this.scene.debugLayer.hide();
        } else {
            this.scene.debugLayer.show();
        }
    }
}

module.exports = Game;

// Create the game using the "renderCanvas"
const game = new Game("renderCanvas");

// start animation
game.run();
