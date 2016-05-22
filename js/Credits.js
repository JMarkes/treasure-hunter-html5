/*global Phaser */
/*global TreasureHunter */
/*global game */
/*global localStorage */
/*global clickSound */

TreasureHunter.Credits = function () {};

TreasureHunter.Credits.prototype = {

    create: function () {

        this.timerEvents = [];

        this.createWorld();
        this.createFireflies();

        var titleLabel = this.add.bitmapText(this.world.centerX, 50, 'eightbitwonder', 'CREDITS', 25);
        titleLabel.anchor.set(0.5);

        var creditsText1 = this.add.bitmapText(this.world.centerX, 100, 'eightbitwonder', 'CREATED BY', 12);
        creditsText1.anchor.set(0.5);
        var creditsText2 = this.add.bitmapText(this.world.centerX, 130, 'eightbitwonder', 'JOAO MARQUES', 17);
        creditsText2.anchor.set(0.5);
        var tilde = this.add.sprite(211, 117, 'tilde');
        tilde.anchor.set(0.5);

        var creditsText3 = this.add.bitmapText(this.world.centerX-this.world.centerX/2, 160, 'eightbitwonder', 'GRAPHICS', 12);
        var creditsText4 = this.add.bitmapText(this.world.centerX-this.world.centerX/2, 185, 'eightbitwonder', 'FOXFIN', 11);
        var creditsText5 = this.add.bitmapText(this.world.centerX-this.world.centerX/2, 205, 'eightbitwonder', 'KENNEY', 11);

        var creditsText6 = this.add.bitmapText(this.world.centerX+this.world.centerX/2, 160, 'eightbitwonder', 'SOUND', 12);
        var creditsText7 = this.add.bitmapText(this.world.centerX+this.world.centerX/2, 185, 'eightbitwonder', 'Cynicmusic', 11);
        var creditsText8 = this.add.bitmapText(this.world.centerX+this.world.centerX/2, 205, 'eightbitwonder', 'ZStriefel', 11);
        creditsText6.anchor.set(1,0);
        creditsText7.anchor.set(1,0);
        creditsText8.anchor.set(1,0);

        var backButton = this.add.sprite(this.world.centerX, 265, 'buttonLongBrown');
        backButton.anchor.set(0.5);
        var backText = this.add.bitmapText(this.world.centerX, 265, 'eightbitwonder', 'BACK', 12);
        backText.anchor.set(0.5);

        // Fade In effect
        var blackTile = this.add.sprite(0, 0, 'blackTile');
        blackTile.width = this.camera.width;
        blackTile.height = this.camera.height;

        var fadein = this.add.tween(blackTile).to({alpha: 0}, 400).start();
        fadein.onComplete.add(function() {
            backButton.inputEnabled = true;
            backButton.input.useHandCursor = true;
            backButton.events.onInputDown.add(this.mainMenu, this);
        },this);
    },

    createWorld: function () {

        // Add the background
        this.add.tileSprite(0, 0, 544, 320, 'background');

        // Add floor tiles
        var i;
        for(i = 0; i < 38; i++) {
            this.add.sprite(i*15, 304, 'floorTile');
        }
        // Add grass and rocks
        for(i = 0; i < 5; i++) {
            this.add.sprite(128 + 16*i, this.world.height-23, 'grassFlowers');
        }
        for(i = 0; i < 13; i++) {
            this.add.sprite(304 + 16*i, this.world.height-21, 'grassPlain');
        }
        this.add.sprite(368, this.world.height-21, 'rock');
    },

    createFireflies: function () {
        var fireflies = this.add.group();

        fireflies.create(100, 100, 'firefly');
        fireflies.create(450, 150, 'firefly');

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
        // Remove all timer events
        for(var i = 0; i < this.timerEvents.length; i++){
            this.time.events.remove(this.timerEvents[i]);
        }
        this.timerEvents = null;
    }
};
