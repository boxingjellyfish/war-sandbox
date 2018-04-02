var ColorHSL = require("./util/color_hsl.js");
var Menu = require("./menu.js");
var Match = require("./match.js");

function Game(canvasElement) {
    this.canvas = document.getElementById(canvasElement);
    this.engine = new BABYLON.Engine(this.canvas, true);
    this.socket = io();
    this.menu = new Menu(this.canvas, this.engine, this.socket, this);
    this.match = new Match(this.canvas, this.engine, this.socket);

    var that = this;

    // Listen for browser/canvas resize events
    window.addEventListener("resize", function () {
        that.engine.resize();
    });

    // Disable right click
    this.canvas.oncontextmenu = function (e) {
        e.preventDefault();
    };

    this.scene = this.menu.createMainMenuScene();
};

// run the render loop
Game.prototype.run = function () {
    var that = this;
    this.engine.runRenderLoop(function () {
        that.scene.render();
    });
}

Game.prototype.newGameAction = function () {    
    this.scene.dispose();
    this.scene = this.match.createMatchScene();
}

module.exports = Game;

// Create the game using the "renderCanvas"
var game = new Game("renderCanvas");

// start animation
game.run();
