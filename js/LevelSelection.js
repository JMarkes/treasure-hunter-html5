/*global Phaser */
/*global TreasureHunter */
/*global game */
/*global localStorage */
/*global clickSound */

TreasureHunter.LevelSelection = function () {};

TreasureHunter.LevelSelection.prototype = {

    create: function() {
        var thumbRows = 2;
        var thumbCols = 5;
        var thumbWidth = 40;
        var thumbHeight = 40;
        var thumbSpacing = 25;

        var storageArray = JSON.parse(localStorage.getItem('levelStatus'));
        if(storageArray) {
            var newLevels = false;
            var firstNewLevel;
            if(game.global.levelStatusArray.length > storageArray.length) {
                newLevels = true;
                firstNewLevel = storageArray.length;
            }
            for(var s = 0; s < storageArray.length; s++) {
                game.global.levelStatusArray[s] = storageArray[s];
            }
            if(newLevels) {
                game.global.levelStatusArray[firstNewLevel] = 1;
            }
        }

        this.pages = game.global.levelStatusArray.length/(thumbRows*thumbCols);

        this.currentPage = 0;

        // Create background world
        this.createWorld();

        // Add title
        var titleLabel = this.add.bitmapText(this.world.centerX, 50, 'eightbitwonder', 'LEVEL SELECTION', 25);
        titleLabel.anchor.set(0.5);

        // Create level selection area
        this.leftArrow = this.add.button(95, 265, 'levelArrows', this.arrowClicked, this);
        this.leftArrow.anchor.setTo(0.5);
        this.leftArrow.frame = 0;
        this.leftArrow.alpha = 0.3;
        this.rightArrow = this.add.button(450, 265, 'levelArrows', this.arrowClicked, this);
        this.rightArrow.anchor.setTo(0.5);
        this.rightArrow.frame = 1;

        this.levelThumbsGroup = this.add.group();

        var levelLength = thumbWidth*thumbCols+thumbSpacing*(thumbCols-1);
        var levelHeight = thumbWidth*thumbRows+thumbSpacing*(thumbRows-1)-5;

        for(var l = 0; l < this.pages; l++) {
            var offsetX = (this.world.width-levelLength)/2+this.world.width*l;
            var offsetY = (this.world.height-levelHeight)/2;

            for(var i = 0; i < thumbRows; i++) {
                for(var j = 0; j < thumbCols; j++) {
                    var levelNumber = i*thumbCols+j+l*(thumbRows*thumbCols);

                    var levelThumb = this.add.button(offsetX+j*(thumbWidth+thumbSpacing), offsetY+i*(thumbHeight+thumbSpacing),
                                                     'levelButtons', this.thumbClicked, this);

                    levelThumb.animating = false;
                    levelThumb.frame = game.global.levelStatusArray[levelNumber];
                    levelThumb.levelNumber = levelNumber+1;

                    this.levelThumbsGroup.add(levelThumb);

                    var levelText = this.add.bitmapText(levelThumb.x, levelThumb.y, 'eightbitwonder', ''+(levelNumber+1), 13);
                    levelText.anchor.set(0.5);
                    this.levelThumbsGroup.add(levelText);
                }
            }
        }

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

    mainMenu: function () {
        this.state.start('MainMenu');
    },

    thumbClicked: function(button) {
        if(button.frame !== 0) {
            this.state.start('PlayLevel', true, false, 'level' + button.levelNumber);
        } else{
            if(button.animating) return;
            var buttonTween = this.add.tween(button);
            buttonTween.to({x: button.x+button.width/15}, 20, Phaser.Easing.Cubic.None);
            buttonTween.to({x: button.x-button.width/15}, 20, Phaser.Easing.Cubic.None);
            buttonTween.to({x: button.x+button.width/15}, 20, Phaser.Easing.Cubic.None);
            buttonTween.to({x: button.x-button.width/15}, 20, Phaser.Easing.Cubic.None);
            buttonTween.to({x: button.x}, 20, Phaser.Easing.Cubic.None);
            buttonTween.start();
            buttonTween.onComplete.add(function() {button.animating = false;}, this);
            button.animating = true;
        }
    },

    arrowClicked: function(button) {
        var buttonsTween;

        // If touching right arrow and still not reached last page
        if(button.frame === 1 && this.currentPage < this.pages-1){
            this.leftArrow.alpha = 1;
            this.currentPage++;
            // Fade out the button if we reached last page
            if(this.currentPage === this.pages-1){
                button.alpha = 0.3;
            }
            // Scrolling level pages
            buttonsTween = this.add.tween(this.levelThumbsGroup);
            buttonsTween.to({
                x: this.currentPage * this.world.width * -1
            }, 500, Phaser.Easing.Cubic.None);
            buttonsTween.start();
        }
        // If touching left arrow and still not reached first page
        if(button.frame === 0 && this.currentPage > 0){
            this.rightArrow.alpha = 1;
            this.currentPage--;
            // Fade out the button if we reached first page
            if(this.currentPage === 0){
                button.alpha = 0.3;
            }
            // Scrolling level pages
            buttonsTween = this.add.tween(this.levelThumbsGroup);
            buttonsTween.to({
                x: this.currentPage * this.world.width * -1
            }, 400, Phaser.Easing.Cubic.None);
            buttonsTween.start();
        }
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
        for(i = 0; i < 2; i++) {
            this.add.sprite(32 + 16*i, this.world.height-21, 'grassPlain');
        }
        for(i = 0; i < 3; i++) {
            this.add.sprite(128 + 16*i, this.world.height-23, 'grassFlowers');
        }
        for(i = 0; i < 2; i++) {
            this.add.sprite(176 + 16*i, this.world.height-21, 'grassPlain');
        }
        for(i = 0; i < 6; i++) {
            this.add.sprite(400 + 16*i, this.world.height-23, 'grassFlowers');
        }
        this.add.sprite(185, this.world.height-21, 'rock');
    },

    shutdown: function () {
        this.pages = null;
        this.currentPage = null;
        this.leftArrow = null;
        this.rightArrow = null;

        if(this.levelThumbsGroup) {
            this.levelThumbsGroup.destroy();
            this.levelThumbsGroup = null;
        }
    }

};
