/*global Phaser */
/*global TreasureHunter */
/*global game */
/*global localStorage */
/*global clickSound */

TreasureHunter.MainMenu = function () {};

TreasureHunter.MainMenu.prototype = {

    create: function () {

        this.createWorld();

        var titleLabel = this.add.bitmapText(this.world.centerX, 65, 'eightbitwonder', 'TREASURE HUNTER', 32);
        titleLabel.anchor.set(0.5);

        var sparkle1 = this.add.sprite(31, 43, 'spark');
        sparkle1.scale.set(0.6);
        sparkle1.animations.add('spark');
        sparkle1.animations.play('spark', 9, true);

        var sparkle2 = this.add.sprite(490, 70, 'spark');
        sparkle2.scale.set(0.6);
        sparkle2.animations.add('spark');
        sparkle2.animations.play('spark', 9, true);

        var playButton = this.add.sprite(this.world.centerX-100, 155, 'buttonLongBrown');
        playButton.anchor.set(0.5);
        var playText = this.add.bitmapText(this.world.centerX-100, 155, 'eightbitwonder', 'PLAY', 12);
        playText.anchor.set(0.5);
        playButton.useHandCursor = true;

        var creditsButton = this.add.sprite(this.world.centerX+100, 155, 'buttonLongBrown');
        creditsButton.anchor.set(0.5);
        var creditsText = this.add.bitmapText(this.world.centerX+100, 155, 'eightbitwonder', 'CREDITS', 12);
        creditsText.anchor.set(0.5);

        this.createEnemies();
        this.createPlayer();
        this.createTreasureChest();

        // Fade In effect
        var blackTile =  this.add.sprite(0, 0, 'blackTile');
        blackTile.width = this.camera.width;
        blackTile.height = this.camera.height;

        var fadein = this.add.tween(blackTile).to({alpha: 0}, 400).start();
        fadein.onComplete.add(function() {
            playButton.inputEnabled = true;
            playButton.input.useHandCursor = true;
            //playButton.events.onInputDown.add(function() {clickSound.play(); this.levelSelection();}, this);
            playButton.events.onInputDown.add(this.levelSelection, this);

            creditsButton.inputEnabled = true;
            creditsButton.input.useHandCursor = true;
            //creditsButton.events.onInputDown.add(function() {clickSound.play(); this.credits();}, this);
            creditsButton.events.onInputDown.add(this.credits, this);
        },this);
    },

    update: function () {
        this.background.tilePosition.x -= 2;

        this.loopSprites.forEach(function (loopSprite) {
            if(loopSprite.x < -loopSprite.width) loopSprite.x = 544;
        }, this);
    },

    createWorld: function () {

        // Add the background
        this.background = this.add.tileSprite(0, 0, 544, 320, 'background');

        // Add the floor
        this.loopSprites = this.add.group();
        this.loopSprites.enableBody = true;

        var i;
        for(i = 0; i < 38; i++) {
            this.loopSprites.create(i*15, 304, 'floorTile');
        }

        for(i = 0; i < 6; i++) {
            this.loopSprites.create(15*i, this.world.height-21, 'grassPlain');
        }

        for(i = 0; i < 4; i++) {
            this.loopSprites.create(240 + 15*i, this.world.height-23, 'grassFlowers');
        }

        this.loopSprites.create(480, this.world.height-21, 'grassPlain');
        this.loopSprites.create(495, this.world.height-23, 'grassFlowers');
        this.loopSprites.create(510, this.world.height-21, 'grassPlain');

        this.loopSprites.create( 70, this.world.height-21, 'rock');
        this.loopSprites.create(368, this.world.height-21, 'rock');

        this.loopSprites.create(475, 120, 'movPlatform');
        this.loopSprites.create( 50, 150, 'movPlatform');
        this.loopSprites.create(350, 190, 'movPlatform');
        this.loopSprites.create(150, 220, 'movPlatform');

        this.loopSprites.setAll('body.velocity.x', -150);
    },

    createEnemies: function () {
        var enemies = this.add.group();

        enemies.create(100, 292, 'patrol');
        enemies.create(200, 292, 'patrol');

        enemies.setAll('anchor.x', 0.5);
        enemies.setAll('anchor.y', 0.5);
        enemies.setAll('scale.x', -1.5);
        enemies.setAll('scale.y', 1.5);

        enemies.callAll('animations.add', 'animations', 'move',
                             ['Move01','Move02','Move03', 'Move04','Move05','Move06'],
                             8, true, false);
        enemies.callAll('play', null, 'move');
    },

    createPlayer: function () {
        var player = this.add.sprite(400, 286, 'player', 'Idle01');

        player.anchor.setTo(0.5, 0.5);
        player.scale.set(2);

        player.animations.add('run', ['Run01','Run02','Run03','Run04','Run05',
                                      'Run06','Run07','Run08','Run09','Run10'], 16, true, false);
        player.animations.play('run');
    },

    createTreasureChest: function () {
        var treasureChest = this.add.sprite(this.world.centerX, 225, 'treasureChest');

        treasureChest.anchor.set(0.5);
        treasureChest.scale.set(2.2);

        var ty = treasureChest.y;
        this.add.tween(treasureChest).to({y: ty-10}, Phaser.Timer.SECOND * 1.5, Phaser.Easing.Default).
        to({y: ty}, Phaser.Timer.SECOND * 1.5, Phaser.Easing.Default).loop().start();

        var light = treasureChest.addChild(this.add.sprite(0, 0, 'light'));
        light.anchor.set(0.5);
        light.scale.set(0.4);
        light.alpha = 0.4;
        this.add.tween(light).to({alpha: 0.1}, Phaser.Timer.SECOND).
        to({alpha: 0.4}, Phaser.Timer.SECOND).loop().start();
    },

    levelSelection: function () {
        this.state.start('LevelSelection');
    },

    credits: function () {
        this.state.start('Credits');
    },

    shutdown: function() {
        this.background = null;

        if(this.loopSprites) {
            this.loopSprites.destroy();
            this.loopSprites = null;
        }
    }
};
