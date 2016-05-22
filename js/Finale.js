/*global Phaser */
/*global TreasureHunter */
/*global game */
/*global localStorage */

TreasureHunter.Finale = function () {};

TreasureHunter.Finale.prototype = {

    create: function () {

        this.timerEvents = [];

        this.createWorld();
        this.createFireflies();

        var titleLabel = this.add.bitmapText(this.world.centerX, this.world.centerY-10, 'eightbitwonder', 'THANK YOU FOR PLAYING', 25);
        titleLabel.anchor.set(0.5);

        this.createTreasureChest();
        this.createPlayer();

        // Fade In effect
        var blackTile = this.add.sprite(0, 0, 'blackTile');
        blackTile.width = this.camera.width;
        blackTile.height = this.camera.height;

        var fadein = this.add.tween(blackTile).to({alpha: 0}, 400).start();
        this.timerEvents.push(
            this.time.events.add(5000, function() {
                this.input.onDown.add(this.endGame, this);
            }, this)
        );
    },

    update: function () {
        this.background.tilePosition.y -= 2;

        if(this.player.y > 375) {
            this.player.x = this.rnd.integerInRange(44, 500);
            this.player.y = this.rnd.integerInRange(-100, -50);
            if(this.rnd.integerInRange(0, 1) === 0) {
                this.player.scale.x *= -1;
                this.player.body.velocity.x *= -1;
            }
        }

        if(this.treasureChest.y > 375) {
            this.treasureChest.x = this.rnd.integerInRange(44, 500);
            this.treasureChest.y = this.rnd.integerInRange(-100, -50);
            this.treasureChest.y = -50;
            if(this.rnd.integerInRange(0, 1) === 0) {
                this.treasureChest.scale.x *= -1;
                this.treasureChest.body.velocity.x *= -1;
            }
        }
    },

    endGame: function () {
        this.state.start('MainMenu');
    },

    createPlayer: function () {
        this.player = this.add.sprite(this.world.centerX-10, -50, 'player', 'Fall');
        this.physics.arcade.enable(this.player);

        this.player.anchor.set(0.5);
        this.player.scale.set(2);
        this.player.body.velocity.x = 100;
        this.player.body.velocity.y = 250;
    },

    createWorld: function () {
        // Add the background
        this.background = this.add.tileSprite(0, 0, 544, 320, 'background');
    },

    createTreasureChest: function () {
        this.treasureChest = this.add.sprite(this.world.centerX-10, -50, 'treasureChest');
        this.physics.arcade.enable(this.treasureChest);

        this.treasureChest.anchor.set(0.5);
        this.treasureChest.scale.set(2.2);
        this.treasureChest.body.velocity.x = -100;
        this.treasureChest.body.velocity.y = 250;

        var light = this.treasureChest.addChild(this.add.sprite(0, 0, 'light'));
        light.anchor.set(0.5);
        light.scale.set(0.4);
        light.alpha = 0.4;
        this.add.tween(light).to({alpha: 0.1}, Phaser.Timer.SECOND).
        to({alpha: 0.4}, Phaser.Timer.SECOND).loop().start();
    },

    createFireflies: function () {
        var fireflies = this.add.group();

        for(var i = 0; i < 75; i++) {
            fireflies.create(this.rnd.integerInRange(0,544), this.rnd.integerInRange(0,320), 'firefly');
        }

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

    mainMenu: function () {
        this.state.start('MainMenu');
    },

    shutdown: function() {
        this.background = null;

        if(this.player) {
            this.player.destroy();
            this.player = null;
        }

        if(this.treasureChest) {
            this.treasureChest.destroy();
            this.treasureChest = null;
        }

        // Remove all input events
        this.input.onDown.removeAll();

        // Remove all timer events
        for(var i = 0; i < this.timerEvents.length; i++){
            this.time.events.remove(this.timerEvents[i]);
        }
        this.timerEvents = null;
    }
};
