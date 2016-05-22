/*global document */
/*global window */
/*global PIXI */
/*global Phaser */
/*global Cocoon */

var TreasureHunter = {};

TreasureHunter.Boot = function () {};

TreasureHunter.Boot.prototype = {

    init: function () {
        document.body.style.backgroundColor = '#0a0b0f';
        this.stage.backgroundColor = '#0a0b0f';

        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.scale.minWidth = window.innerWidth;
        this.scale.minHeight = window.innerHeight;
        //this.scale.maxWidth = window.innerWidth;    // SWITCH WITH THESE TWO FOR WEB BROWSERS
        //this.scale.maxHeight = window.innerHeight;  // SWITCH WITH THESE TWO FOR WEB BROWSERS
        this.scale.pageAlignHorizontally = true;
        this.scale.pageAlignVertically = true;
        this.scale.updateLayout(true);
        this.scale.refresh();

        Phaser.Canvas.setImageRenderingCrisp(this.game.canvas);  // For Canvas, modern approach
        Phaser.Canvas.setSmoothingEnabled(this.game.context, false);  // Also for Canvas, legacy approach
        PIXI.scaleModes.DEFAULT = PIXI.scaleModes.NEAREST; // For WebGL
        Cocoon.Utils.setAntialias(false); // For CocoonJS
    },

    preload: function () {
        this.load.bitmapFont('eightbitwonder','assets/fonts/eightbitwonder.png', 'assets/fonts/eightbitwonder.fnt');
        this.load.image('tilde', 'assets/fonts/tilde.png');
    },

    create: function () {
        var gameDiv = document.getElementById("game_div");

        // Align Vertically
        var extraSpaceVer = window.innerHeight - gameDiv.clientHeight;
        if(extraSpaceVer !== 0) {
            gameDiv.style.marginTop = extraSpaceVer/2 + "px";
        }

        // Align Horizontally
        var extraSpaceHor = window.innerWidth - gameDiv.clientWidth;
        if(extraSpaceHor !== 0) {
            gameDiv.style.marginLeft = extraSpaceHor/2 + "px";
        }

        this.physics.startSystem(Phaser.Physics.ARCADE);

        this.state.start('Preloader');
    }
};
