/*global Phaser */
/*global TreasureHunter */
/*global game*/
/*global clickSound */
/*jshint -W020 */

TreasureHunter.Preloader = function () {};

TreasureHunter.Preloader.prototype = {

    preload: function () {
        var loadingLabel = this.add.bitmapText(this.world.centerX, this.world.centerY - 20, 'eightbitwonder', 'LOADING', 20);
        loadingLabel.anchor.set(0.5);

        this.loadingText = this.add.bitmapText(this.world.centerX, this.world.centerY + 20, 'eightbitwonder', '0', 20);
        this.loadingText.anchor.set(0.5);

        this.load.onFileComplete.add(this.fileComplete, this);

        this.load.path = 'assets/';

        // Atlas (Spritesheets & Animations)
        this.load.atlas('player');
        this.load.atlas('patrol');
        this.load.atlas('coin');
        this.load.atlas('firefly');
        this.load.spritesheet('spark', 'spark.png', 32, 32);
        this.load.spritesheet('levelButtons', 'levelButtons.png', 40, 40);
        this.load.spritesheet('levelArrows', 'levelArrows.png', 40, 40);

        // Tilemaps
        this.load.image('tilemap');
        this.load.tilemap('mainMenu', 'mainMenu.json', null, Phaser.Tilemap.TILED_JSON);

        // Levels
        for(var i = 1; i <= game.global.levels; i++) {
            this.load.tilemap('level'+i, 'levels/level'+i+'.json', null, Phaser.Tilemap.TILED_JSON);
        }

        // Other sprites
        this.load.images(['background', 'blackTile', 'floorTile', 'grassFlowers',
                          'grassPlain', 'rock', 'spike', 'treasureChest', 'light', 'bat',
                          'movPlatform', 'fallPlatform', 'buttonLongBrown', 'exitButton']);

        // Audio
        this.load.audio('music', 'audio/music.ogg');
        this.load.audio('coin', 'audio/coin.wav');
        this.load.audio('jump', 'audio/jump.wav');
        this.load.audio('lose', 'audio/lose.ogg');
        this.load.audio('click', 'audio/click.wav');
    },

    fileComplete: function(progress, cacheKey, success, totalLoaded, totalFiles) {
        this.loadingText.text = progress;
    },

    isSoundDecoded: function() {
        return (this.cache.isSoundDecoded('music') &&
               this.cache.isSoundDecoded('coin') &&
               this.cache.isSoundDecoded('jump') &&
               this.cache.isSoundDecoded('lose') &&
               this.cache.isSoundDecoded('click')) ? true : false;
    },

    playMusic: function() {
        this.music = this.add.audio('music', 0.7, true);
        this.music.play('', 0, 0.2, true, true);
    },

    update: function () {
        if (this.isSoundDecoded) {
            clickSound = this.add.audio('click');
            this.playMusic();
            this.state.start('MainMenu');
        }
    },

    shutdown: function () {
        this.loadingText = null;
    }
};
