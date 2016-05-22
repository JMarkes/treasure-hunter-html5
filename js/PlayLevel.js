/*global PIXI */
/*global Phaser */
/*global TreasureHunter */
/*global game */
/*global localStorage */
/*global clickSound */
/*global console */

TreasureHunter.PlayLevel = function () {};

TreasureHunter.PlayLevel.prototype = {

    init: function(level) {
        this.level = parseInt(level.substring(5, level.length));
    },

    preload: function () {
        this.time.advancedTiming = true;
    },

    // Set up the game, display sprites, etc.
    create: function () {

        /////////////////////////////////
        // START VARIABLES DECLARATION //
        /////////////////////////////////

        this.gameStarted = false;
        this.timerEvents = [];

        this.shakeWorld = 0;
        this.shakeMagnitude = 0;

        this.playerDirection = 1;
        this.playerJumpSpeed = -550;
        this.playerVelocity = 175;
        this.isPlayerAlive = true;

        this.canJumpSpaceBar = false;

        this.coinsLeft = -1;
        this.treasureChest = null;

        this.coinSound = this.add.audio('coin');
        this.coinSound.volume = 0.4;
        this.jumpSound = this.add.audio('jump');
        this.jumpSound.volume = 0.7;
        this.loseSound = this.add.audio('lose');
        this.loseSound.volume = 1.3;

        /////////////////////////////////
        //  END VARIABLES DECLARATION  //
        /////////////////////////////////

        this.createLevel();

        // Fade In effect
        var blackTile =  this.add.sprite(0, 0, 'blackTile');
        blackTile.width = this.camera.width;
        blackTile.height = this.camera.height;

        var fadein = this.add.tween(blackTile).to({alpha: 0}, Phaser.Timer.SECOND * 0.4).start();
        fadein.onComplete.add(function() {
            this.input.onDown.add(this.startMoving, this);
        }, this);
    },

    // Prevents player from jump when first start running due to 'onUp jump' input
    initialDelay: function () {
        this.input.onUp.remove(this.initialDelay, this);
        this.input.onUp.add(this.jump, this);
    },

    startMoving: function() {
        this.input.onDown.remove(this.startMoving, this);
        this.input.onDown.add(this.jump, this);
        this.input.onUp.add(this.initialDelay, this);
        this.player.body.velocity.x = this.playerVelocity;
        this.gameStarted = true;
    },

    // Called 60 times per second, contains the game's logic
    update: function () {

        /////////////////////////////////
        //  COLLISIONS AND OVERLAPS    //
        /////////////////////////////////

        this.physics.arcade.collide(this.player, this.layerBackground);

        this.physics.arcade.overlap(this.player, this.treasureChest, this.nextLevel, null, this);

        this.physics.arcade.collide(this.player, this.movPlatforms);

        this.physics.arcade.collide(this.player, this.fallPlatforms, function(player, fallPlatform) {
            if(!fallPlatform.active) {
                var shakePlatform = this.add.tween(fallPlatform);
                for(var i = 0; i < 3; i++) {
                    shakePlatform.to({x: fallPlatform.x+fallPlatform.width/15}, 50, Phaser.Easing.Cubic.None);
                    shakePlatform.to({x: fallPlatform.x-fallPlatform.width/15}, 50, Phaser.Easing.Cubic.None);
                    shakePlatform.to({x: fallPlatform.x+fallPlatform.width/15}, 50, Phaser.Easing.Cubic.None);
                    shakePlatform.to({x: fallPlatform.x-fallPlatform.width/15}, 50, Phaser.Easing.Cubic.None);
                    shakePlatform.to({x: fallPlatform.x}, 50, Phaser.Easing.Cubic.None);
                }
                shakePlatform.start();
                shakePlatform.onComplete.add(function() {
                    fallPlatform.body.velocity.y = 275;
                    fallPlatform.collidable = false;
                }, this);
                fallPlatform.active = true;
            }
        }, function(player, fallPlatform) {return fallPlatform.collidable;}, this);

        this.physics.arcade.overlap(this.player, this.spikes, function() {
            this.gameOver();
        }, null, this);

        this.physics.arcade.overlap(this.player, this.coins, function(player, coin) {
            this.takeCoin(coin);
        }, null, this);

        this.physics.arcade.overlap(this.movPlatforms, this.platformLimits, function(movPlatform) {
            movPlatform.body.velocity.x *= -1;
            movPlatform.body.velocity.y *= -1;
        }, null, this);

        /////////////////////////////////
        //  SPRITES MOVEMENT           //
        /////////////////////////////////

        if (this.gameStarted && this.isPlayerAlive) {
            this.movePlayer();
        } else {
            if (this.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
                this.gameStarted = true;
                this.timerEvents.push(
                    this.time.events.add(150, function() {
                        this.canJumpSpaceBar = true;
                    }, this)
                );
            }
        }

        /////////////////////////////////
        //  SHAKE SCREEN               //
        /////////////////////////////////

        this.shakeEffect();
    },

    startShake: function (frames, magnitude) {
        if (this.shakeWorld < frames) {
            this.shakeWorld = frames;
            this.shakeMagnitude = magnitude;
        }
    },

    shakeEffect: function () {
        if (this.shakeWorld > 0) {
            var rand1 = game.rnd.integerInRange(-this.shakeMagnitude, this.shakeMagnitude);
            var rand2 = game.rnd.integerInRange(-this.shakeMagnitude, this.shakeMagnitude);
            game.world.setBounds(rand1, rand2, game.width + rand1, game.height + rand2);
            this.shakeWorld--;
            if (this.shakeWorld === 0) {
                game.world.setBounds(0, 0, game.width, game.height); // normalize after shake
            }
        }
    },

    nextLevel: function () {
        // Flag current level as cleared
        game.global.levelStatusArray[this.level-1] = 2;

        // Unlock next level
        if(game.global.levelStatusArray[this.level] !== null && game.global.levelStatusArray[this.level] === 0) {
            game.global.levelStatusArray[this.level] = 1;
        }

        localStorage.setItem('levelStatus', JSON.stringify(game.global.levelStatusArray));

        if(this.level+1 > game.global.levels) {
            this.state.start('Finale');
        } else {
            this.state.start('PlayLevel', true, false, 'level' + (this.level+1));
        }
    },

    restartLevel: function () {
        this.state.start('PlayLevel', true, false, 'level' + this.level);
    },

    exitLevel: function () {
        this.state.start('LevelSelection');
    },

    gameOver: function() {
        this.coinSound.stop();
        this.jumpSound.stop();
        this.loseSound.play();

        this.startShake(15, 5);

        this.timerEvents.push(
            this.time.events.add(1, function() {
                this.player.body.enable = false;
                this.isPlayerAlive = false;

                var hitAnimation = this.player.animations.play('hit');
                hitAnimation.onComplete.add(function(){
                    this.player.kill();
                    this.timerEvents.push(
                        this.time.events.add(Phaser.Timer.SECOND * 0.1, this.restartLevel, this)
                    );
                }, this);
            }, this)
        );
    },

    takeCoin: function (coin) {
        this.coinSound.play();

        coin.body.enable = false;
        coin.animations.stop();
        coin.frame = 8;
        coin.scale.x = 1;

        var hitTween = this.add.tween(coin.scale).to({x: 0, y: 5}, Phaser.Timer.SECOND * 0.1).start();
        hitTween.onComplete.add(function() {
            coin.destroy();
            this.coinsLeft--;
            if (this.coinsLeft === 0) {
                this.createTreasureChest();
            }
        }, this);
    },

    createPlayer: function () {

        var player = this.findObjectsByType('player', 'Player Treasure Layer', this.map);

        this.player = this.add.sprite(player[0].x, player[0].y, player[0].type, 'Idle01');
        this.physics.arcade.enable(this.player);

        this.player.anchor.setTo(0.5, 0.5);
        this.player.scale.set(2);
        this.player.body.setSize(9, 14, -1, 4);
        this.player.body.gravity.y = 2000;

        this.player.animations.add('idle', ['Idle01','Idle02','Idle03','Idle04'], 8, true, false);
        this.player.animations.add('hit', ['Hit01','Hit02','Hit03','Hit04','Hit05'], 16, false, false);
        this.player.animations.add('run', ['Run01','Run02','Run03','Run04','Run05',
                                           'Run06','Run07','Run08','Run09','Run10'], 16, true, false);

        this.player.animations.play('idle');
    },

    movePlayer: function () {

        this.player.body.velocity.x = this.playerDirection * this.playerVelocity;

        var standing = this.player.body.touching.down || this.player.body.onFloor();

        if(standing) {
            this.player.animations.play('run');
        } else if(this.player.body.velocity.y > 0) {
            this.player.frame = 0;
        } else {
            this.player.frame = 10;
        }

        if(this.player.body.blocked.left || this.player.body.blocked.right) {
            this.playerDirection *= -1;
            this.player.body.velocity.x = this.playerDirection * this.playerVelocity;
            this.player.scale.x *= -1;
        }

        if (this.canJumpSpaceBar) {
            if (this.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
                this.jump();
            }
        }
    },

    jump: function() {
        var standing = this.player.body.touching.down || this.player.body.onFloor();

        if(this.isPlayerAlive && standing) {
            this.player.body.velocity.y = this.playerJumpSpeed;
            this.jumpSound.play();
        }
    },

    createLevel: function () {

        // Create the tilemap
        this.map = this.add.tilemap('level' + this.level);

        var levelWidth = this.map.widthInPixels;
        var levelHeight = this.map.heightInPixels;

        this.world.setBounds(0, 0, levelWidth, levelHeight);

        // Add the background
        this.add.tileSprite(0, 0, levelWidth, levelHeight, 'background');

        // Create falling platforms
        this.createFallPlatforms();

        // Create fireflies
        this.createFireflies();

        // Add the tileset to the map
        this.map.addTilesetImage('tilemap');

        // Create the layer, by specifying the name of the Tiled layer
        this.layerBackground = this.map.createLayer('Background');

        // Enable collisions
        this.map.setCollisionBetween(1, 35, true, this.layerBackground);

        // Create invisible enemy blockers
        this.createBlockers();

        // Create invisible platform limits
        this.createPlatformLimits();

        // Create rocks
        this.createRocks();

        // Create bats
        this.createBats();

        // Create spikes
        this.createSpikes();

        // Create movable platforms
        this.createMovPlatforms();

        // Create coins
        this.createCoins();

        // Add level numbering
        var levelText = this.add.bitmapText(28, 28, 'eightbitwonder', 'LEVEL ' + this.level, 12);

        // Add appropriate tutorial text to each level
        if(this.level === 1) {
            var clickTap = this.game.device.desktop ? 'CLICK OR SPACEBAR' : 'TAP';

            this.add.bitmapText(this.world.centerX, 70, 'eightbitwonder', clickTap + ' TO RUN', 12).anchor.set(0.5);
            this.add.bitmapText(this.world.centerX, 100, 'eightbitwonder', ' AGAIN TO JUMP', 12).anchor.set(0.5);
            this.add.bitmapText(this.world.centerX, 130, 'eightbitwonder', 'COLLECT ALL COINS', 12).anchor.set(0.5);
            this.add.bitmapText(this.world.centerX, 160, 'eightbitwonder', 'GET THE TREASURE', 12).anchor.set(0.5);
        }
        if(this.level === 2) {
            this.add.bitmapText(this.world.centerX, 130, 'eightbitwonder', 'WATCH OUT FOR THE SPIKES', 12).anchor.set(0.5);
        }

        // Add exit button
        var exitButton = this.add.sprite(this.world.width-47, 23, 'exitButton');
        exitButton.inputEnabled = true;
        exitButton.input.useHandCursor = true;
        exitButton.events.onInputDown.add(this.exitLevel, this);

        // Create player
        this.createPlayer();
    },

    createBlockers: function () {
        this.blockers = this.add.group();
        this.blockers.enableBody = true;

        this.createObjects('blocker', 'Blockers Layer', this.map, this.blockers, null);

        if(this.blockers[0] === null) return;

        this.blockers.setAll('anchor.x', 0.5);
        this.blockers.setAll('anchor.y', 0.5);
        this.blockers.callAll('body.setSize', 'body', 16, 16, 0, 0);
    },

    createPlatformLimits: function () {
        this.platformLimits = this.add.group();
        this.platformLimits.enableBody = true;

        this.createObjects('platformLimit', 'Platform Limits Layer', this.map, this.platformLimits, null);

        if(this.platformLimits[0] === null) return;

        this.platformLimits.setAll('anchor.x', 0.5);
        this.platformLimits.setAll('anchor.y', 0.5);
        this.platformLimits.callAll('body.setSize', 'body', 16, 16, 0, 0);
    },

    createRocks: function () {
        var rocks = this.add.group();

        this.createObjects('rock', 'Rocks Layer', this.map, rocks);

        if(rocks[0] === null) return;

        rocks.setAll('anchor.y', 0.2);
        rocks.setAll('scale.x', 1);
        rocks.setAll('scale.y', 1);
    },

    createBats: function () {
        var bats = this.add.group();

        this.createObjects('bat', 'Bats Layer', this.map, bats);

        if(bats[0] === null) return;

        bats.setAll('anchor.x', 0.5);
        bats.setAll('anchor.y', 0.7);
        bats.setAll('scale.x', 1.6);
        bats.setAll('scale.y', 1.6);
    },

    createFireflies: function () {
        var fireflies = this.add.group();

        this.createObjects('firefly', 'Fireflies Layer', this.map, fireflies);

        if(fireflies === null) return;

        fireflies.setAll('scale.x', 2);
        fireflies.setAll('scale.y', 2);

        fireflies.callAll('animations.add', 'animations', 'fly', ['1', '2'], 10, true, false);
        fireflies.callAll('play', null, 'fly');

        this.timerEvents.push(
            fireflies.forEach(function(firefly) {
                this.time.events.loop(this.rnd.integerInRange(2000,2500), function() {
                    this.add.tween(firefly).to(
                        {x: firefly.x+(this.rnd.integerInRange(-15,15)),
                         y: firefly.y+(this.rnd.integerInRange(-15,15))},
                        1000, Phaser.Easing.Quadratic.InOut, true);
                }, this);
            }, this)
        );
    },

    createSpikes: function () {
        this.spikes = this.add.group();
        this.spikes.enableBody = true;

        this.createObjects('spike', 'Spikes Layer', this.map, this.spikes);

        if(this.spikes[0] === null) return;

        this.spikes.setAll('anchor.x', 0.5);
        this.spikes.setAll('anchor.y', 0.5);
        this.spikes.setAll('scale.x', 2);
        this.spikes.setAll('scale.y', 2);

        this.spikes.forEach(function(spike) {
            var rot = parseInt(spike.flipped);
            spike.angle = rot;
            if(rot === 90 || rot === 270) {
                spike.body.setSize(4, 8, 0, 0);
            }
        }, this);
    },

    createFallPlatforms: function () {
        this.fallPlatforms = this.add.group();
        this.fallPlatforms.enableBody = true;

        this.createObjects('fallPlatform', 'Falling Platforms Layer', this.map, this.fallPlatforms);

        if(this.fallPlatforms[0] === null) return;

        this.fallPlatforms.setAll('anchor.x', 0.5);
        this.fallPlatforms.setAll('anchor.y', 0.5);
        this.fallPlatforms.setAll('scale.x', 2);
        this.fallPlatforms.setAll('scale.y', 2);
        this.fallPlatforms.setAll('body.immovable', true);
        this.fallPlatforms.setAll('checkWorldBounds', true);
        this.fallPlatforms.setAll('outOfBoundsKill', true);
        this.fallPlatforms.setAll('active', false);
        this.fallPlatforms.setAll('collidable', true);
    },

    createMovPlatforms: function () {
        this.movPlatforms = this.add.group();
        this.movPlatforms.enableBody = true;

        this.createObjects('movPlatform', 'Movable Platforms Layer', this.map, this.movPlatforms);

        if(this.movPlatforms[0] === null) return;

        this.movPlatforms.setAll('anchor.x', 0.5);
        this.movPlatforms.setAll('anchor.y', 0.5);
        this.movPlatforms.setAll('scale.x', 2);
        this.movPlatforms.setAll('scale.y', 2);
        this.movPlatforms.setAll('body.immovable', true);

        this.movPlatforms.forEach(function(movPlatform) {
            movPlatform.body.velocity.x = parseInt(movPlatform.velocityX);
            movPlatform.body.velocity.y = parseInt(movPlatform.velocityY);
        }, this);
    },

    createCoins: function () {
        this.coins = this.add.group();
        this.coins.enableBody = true;

        this.createObjects('coin', 'Coins Layer', this.map, this.coins);

        this.coinsLeft = this.coins.length;

        this.coins.setAll('anchor.x', 0.5);
        this.coins.setAll('anchor.y', 0.5);
        this.coins.setAll('scale.x', 2);
        this.coins.setAll('scale.y', 2);

        this.coins.callAll('animations.add', 'animations', 'spin',
                           ['1', '2', '3', '4', '5', '6', '7', '8', '10', '11', '12'],
                           10, true, false);
        this.coins.callAll('play', null, 'spin');
    },

    createTreasureChest: function () {
        var treasureChest = this.findObjectsByType('treasureChest', 'Player Treasure Layer', this.map);

        this.treasureChest = this.add.sprite(treasureChest[0].x, treasureChest[0].y, treasureChest[0].type);
        this.physics.arcade.enable(this.treasureChest);

        this.treasureChest.anchor.set(0.5);

        var ty = this.treasureChest.y;
        this.add.tween(this.treasureChest.scale).to({x: 2.2, y: 2.2}, Phaser.Timer.SECOND * 0.3).start();
        this.add.tween(this.treasureChest).to({y: ty-10}, Phaser.Timer.SECOND * 1.5, Phaser.Easing.Default).
        to({y: ty}, Phaser.Timer.SECOND * 1.5, Phaser.Easing.Default).loop().start();

        var light = this.treasureChest.addChild(this.add.sprite(0, 0, 'light'));
        light.anchor.set(0.5);
        light.scale.set(0.4);
        light.alpha = 0.4;
        this.add.tween(light).to({alpha: 0.1}, Phaser.Timer.SECOND).
        to({alpha: 0.4}, Phaser.Timer.SECOND).loop().start();
    },

    // Create objects from a Tiled map and add them to the appropriate group
    createObjects: function(type, layer, map, group, sprite) {
        var objects = this.findObjectsByType(type, layer, map);
        objects.forEach(function(element){
            this.createFromTiledObject(element, group, sprite);
        }, this);
    },

    // Find objects in a Tiled layer that containt a property called "type" equal to a certain value
    findObjectsByType: function(type, layer, map) {
        var result = [];
        if(typeof map.objects[layer] !== 'undefined') {
            map.objects[layer].forEach(function(element){
                if(element.type === type) {
                    result.push(element);
                }
            });
        }
        return result;
    },

    // Create a sprite from an object
    createFromTiledObject: function(element, group, sprite) {
        var spriteImage = (typeof sprite === 'undefined') ? element.type : sprite;
        var spriteObj = group.create(element.x, element.y, spriteImage);
        // Copy all properties to the sprite
        Object.keys(element.properties).forEach(function(key) {
            spriteObj[key] = element.properties[key];
        });
    },

    shutdown: function() {
        // Clean up variables
        this.level = null;
        this.gameStarted = null;

        this.shakeWorld = null;
        this.shakeMagnitude = null;

        if(this.player) {
            this.player.destroy();
            this.player = null;
        }
        this.playerDirection = null;
        this.playerJumpSpeed = null;
        this.playerVelocity = null;
        this.isPlayerAlive = null;

        this.canJumpSpaceBar = null;

        this.coinsLeft = null;

        this.map.destroy();
        this.map = null;
        this.layerBackground.destroy();
        this.layerBackground = null;

        if(this.blockers) {
            this.blockers.destroy();
            this.blockers = null;
        }
        if(this.platformLimits) {
            this.platformLimits.destroy();
            this.platformLimits = null;
        }
        if(this.spikes) {
            this.spikes.destroy();
            this.spikes = null;
        }
        if(this.fallPlatforms) {
            this.fallPlatforms.destroy();
            this.fallPlatforms = null;
        }
        if(this.movPlatforms) {
            this.movPlatforms.destroy();
            this.movPlatforms = null;
        }
        if(this.coins) {
            this.coins.destroy();
            this.coins = null;
        }
        if(this.treasureChest) {
            this.treasureChest.destroy();
            this.treasureChest = null;
        }

        this.coinSound.stop();
        this.coinSound = null;
        this.jumpSound.stop();
        this.jumpSound = null;
        this.loseSound.stop();
        this.loseSound = null;

        // Remove all input events
        this.input.onDown.removeAll();
        this.input.onUp.removeAll();

        // Remove all timer events
        for(var i = 0; i < this.timerEvents.length; i++){
            this.time.events.remove(this.timerEvents[i]);
        }
        this.timerEvents = null;
    }
};
