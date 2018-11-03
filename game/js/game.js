//Luan
class Config {}
Config.RATIO = 1.77
Config.HEIGHT = 750
Config.CONTAINER_HEIGHT = 630
Config.WIDTH = Config.HEIGHT * Config.RATIO
Config.CONTAINER_WIDTH = Config.CONTAINER_HEIGHT * Config.RATIO
Config.DEBUG = false
Config.ANTIALIAS = false
Config.ASSETS = 'assets/'
Config.LEVEL = 1
Config.SCORE = 0
Config.HEALTH = 6
Config.EMAIL = ''
Config.PASSWORD = ''
Config.ID = ''
// APP DO JOGO ///////////////////////////////////////////////////////////////////
class Game extends Phaser.Game {
    constructor() {
        super(Config.WIDTH, Config.HEIGHT, Phaser.CANVAS, 'game-container', null, false, Config.ANTIALIAS)
        this.state.add('Play', PlayState, false)
        this.state.add('Title', TitleState, false)
        this.state.add('End', EndState, false)
        this.state.add('Fail', FailState, false)
        this.state.start('Title')
    }
}
// CLASSE GENERICA DE TELAS //////////////////////////////////////////////////////
class GameState extends Phaser.State {
    create() {
        let fullScreenButton = this.input.keyboard.addKey(Phaser.Keyboard.ONE);
        fullScreenButton.onDown.add(this.toggleFullScreen, this)
        this.scaleGame()
    }
    toggleFullScreen() {
        this.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;
        if (this.scale.isFullScreen) {
            this.scale.stopFullScreen();
        } else {
            this.scale.startFullScreen(false);
        }
    }
    scaleGame() {
        this.game.scale.scaleMode = Phaser.ScaleManager.USER_SCALE //RESIZE
        // escala da tela        
        this.game.scale.setResizeCallback(function(scale, parentBounds) {
            //this.game.scale.setMaximum()
            let scaleX = Config.CONTAINER_WIDTH / Config.WIDTH
            let scaleY = Config.CONTAINER_HEIGHT / Config.HEIGHT
            this.game.scale.setUserScale(scaleX, scaleY, 0, 0)
        }, this)
    }
}
// TELA DO JOGO //////////////////////////////////////////////////////////////////
class PlayState extends GameState {
    preload() {

        let dir = Config.ASSETS
        // mapa
        this.game.load.tilemap('level1', `${dir}level${Config.LEVEL}.json`, null, Phaser.Tilemap.TILED_JSON);
        //sprites
        this.game.load.image('tiles-1', `${dir}tiles.png`)
        this.game.load.image('tiles-2', `${dir}hazards.png`)
        this.game.load.image('background', `${dir}snow.png`)
        this.game.load.image('death', `${dir}death.png`)
        this.game.load.image('full-health', `${dir}full.png`)
        this.game.load.image('half-health', `${dir}half.png`)
        this.game.load.image('empty-health', `${dir}empty.png`)
        this.game.load.image('hud-x', `${dir}x.png`)
        this.game.load.image('trophy', `${dir}trophy-200x64.png`);
        this.game.load.spritesheet('hero', `${dir}hero.png`, 71, 92)
        this.game.load.spritesheet('checkpoint', `${dir}flags.png`, 70, 70);
        this.game.load.spritesheet('ghost', `${dir}ghost.png`, 51, 73)
        this.game.load.spritesheet('fly', `${dir}fly.png`, 70, 55)
        this.game.load.spritesheet('bug', `${dir}bug.png`, 58, 34)
        //colecionaveis
        this.game.load.spritesheet('gem', `${dir}gem.png`, 70, 70);
        this.game.load.spritesheet('blueHeart', `${dir}blueHeart.png`, 53, 45);
        //telas
        this.game.load.image('win', `${dir}win.png`)
        this.game.load.spritesheet('end', `${dir}end.png`, 70, 70)
        this.checkExecOnce = false
        this.coordData = new Coord(Config.ID, this.game)
        this.lives = Config.HEALTH
    }
    loadNextLevel() {
        this.game.camera.fade(0x000000, 1000)
        this.game.camera.onFadeComplete.add(this.changeLevel, this)
    }
    changeLevel() {
        Config.LEVEL += 1
        Config.HEALTH = this.lives
        this.game.camera.onFadeComplete.removeAll(this) // bug
        if (Config.LEVEL <= 3)
            this.game.state.restart()
        else this.game.state.start('End')
    }
    createEnd() {
        this.endLevel = this.game.add.group()
        this.map.createFromObjects('Exit', 201, 'end', 0, true, false, this.endLevel, End)
    }
    createBug() {
        this.bug = this.game.add.group()
        this.map.createFromObjects('Bug', 207, 'bug', 1, true, false, this.bug, Bug)
    }
    createFly() {
        this.fly = this.game.add.group()
        this.map.createFromObjects('Fly', 205, 'fly', 1, true, false, this.fly, Fly)
    }
    createGhost() {
        this.ghost = this.game.add.group()
        this.map.createFromObjects('Enemies', 202, 'ghost', 1, true, false, this.ghost, Ghost)
    }
    createGems() {
        this.gems = this.game.add.group()
        this.map.createFromObjects('Gems', 200, 'gem', 0, true, false, this.gems, Gem)
    }
    createBlueHearts() {
        this.blueHeart = this.game.add.group()
        this.map.createFromObjects('CollectableHealth', 204, 'blueHeart', 0, true, false, this.blueHeart, BlueHeart)
    }
    createCheckpoint() {
        this.checkpoints = this.game.add.group()
        this.map.createFromObjects('Checkpoint', 197, 'checkpoint', 0, true, false, this.checkpoints, Checkpoint)
    }
    createHealthBar() {
        this.heartOne = this.game.add.sprite(16, 16, 'full-health')
        this.heartOne.fixedToCamera = true
        this.hearTwo = this.game.add.sprite(72, 16, 'full-health')
        this.hearTwo.fixedToCamera = true
        this.hearThree = this.game.add.sprite(128, 16, 'full-health')
        this.hearThree.fixedToCamera = true
    }
    createHud() {
        this.createHealthBar();
        this.scoreGem = this.game.add.sprite(200, -4, 'gem')
        this.scoreGem.fixedToCamera = true
        this.hudX = this.game.add.sprite(260, 18, 'hud-x')
        this.hudX.fixedToCamera = true
        this.scoreText = this.game.add.text(296, 13, '', {
            font: "32px ComicSans",
            fill: '#000000'
        });
        this.scoreText.text = Config.SCORE;
        this.scoreText.fixedToCamera = true;
    }
    createPlayer() {
        this.player = new Player(this.game, this.keys, this.coordData.data.x, this.coordData.data.y, 'hero')
        this.game.add.existing(this.player)
        this.game.camera.follow(this.player, Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1);
    }
    createMap() {
        this.map = this.game.add.tilemap('level1')
        this.map.addTilesetImage('tiles', 'tiles-1')
        this.map.addTilesetImage('hazards', 'tiles-2')
        this.mapLayer = this.map.createLayer('Map')
        this.map.setCollisionBetween(2, 10, true, 'Map')
        this.map.setCollisionBetween(16, 24, true, 'Map')
        this.decorationsLayer = this.map.createLayer('Decoration')
        this.decorations2Layer = this.map.createLayer('Decoration2')
        this.hazardLayer = this.map.createLayer('Hazards')
        this.trapsLayer = this.map.createLayer('Traps')
        this.map.setCollision([37], true, 'Traps')
        this.map.setCollisionBetween(43, 48, true, 'Traps')
        this.mapLayer.resizeWorld()
    }
    takeScreenShot() {
        // jQuery
        let imgData = this.game.canvas.toDataURL()
        $('#div-screenshot').append(`<img src=${imgData} alt='game screenshot' class='screenshot' style='width: 48%; height: 48%'>`)
    }
    create() {
        super.create()
        this.game.physics.startSystem(Phaser.Physics.ARCADE)
        this.game.stage.backgroundColor = '#000000'
        let bg = this.game.add.tileSprite(0, 0, Config.WIDTH, Config.HEIGHT, 'background')
        bg.fixedToCamera = true
        let screenshotButton = this.game.input.keyboard.addKey(Phaser.Keyboard.P)
        screenshotButton.onDown.add(this.takeScreenShot, this)
        this.keys = this.game.input.keyboard.createCursorKeys()
        this.game.physics.arcade.gravity.y = 550
        let fullScreenButton = this.game.input.keyboard.addKey(Phaser.Keyboard.ONE)
        fullScreenButton.onDown.add(this.toogleFullScreen, this)
        this.createMap()
        this.createPlayer()
        this.createHud()
        this.createBlueHearts()
        this.createCheckpoint()
        this.createGems()
        this.createEnd()
        this.createFly()
        this.createBug()
        this.createGhost()
        this.reshapeHud()
        this.trophy = new Trophy(Config.ID,this.game)
        this.game.add.existing(this.trophy)

                if(Config.LEVEL > 1){
            this.body.x = 170
            this.body.y= 240
        }
    }
    toogleFullScreen() {
        this.game.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;
        if (this.game.scale.isFullScreen) this.game.scale.stopFullScreen()
        else this.game.scale.startFullScreen(false)
    }
    update() {
        // colisao do player com o mapa
        this.game.physics.arcade.collide(this.player, this.mapLayer)
        this.game.physics.arcade.collide(this.player, this.trapsLayer, this.playerDied, null, this)
        this.game.physics.arcade.overlap(this.player, this.checkpoints, this.setCheckpoint, null, this)
        this.game.physics.arcade.overlap(this.player, this.gems, this.collectGem, null, this)
        this.game.physics.arcade.overlap(this.player, this.blueHeart, this.addHealth, null, this)
        this.game.physics.arcade.overlap(this.player, this.endLevel, this.loadNextLevel, null, this)
        this.game.physics.arcade.overlap(this.player, this.ghost, this.deadByGhost, null, this)
        this.game.physics.arcade.overlap(this.player, this.fly, this.playerDied, null, this)
        this.game.physics.arcade.overlap(this.player, this.bug, this.playerDied, null, this)
    }
    addHealth(player, blueHeart) {
        blueHeart.destroy()
        if (this.lives <= 5) {
            this.lives++
                this.reshapeHud()
        } else {
            Config.SCORE += 10
            this.scoreText.text = Config.SCORE
        }
    }
    addScore(amount) {
        Config.SCORE += amount
        this.scoreText.text = Config.SCORE
        if (Config.SCORE == 20) this.trophy.show(Config.ID, 'gem apprentice')
        if (Config.SCORE == 73) this.trophy.show(Config.ID, 'gem master')
    }
    collectGem(player, gem) {
        gem.destroy()
        this.addScore(gem.points)
    }
    setCheckpoint(player, checkpoint) {
        if (this.player.y - 100 > this.coordData.data.y || this.player.x - 100 > this.coordData.data.x) {
            this.coordData.updateCoord(Config.ID, this.player.x - 40, this.player.y)
        }
        if (this.checkExecOnce == false) {
            this.checkExecOnce = true
        }
        checkpoint.play()
    }
    deadByGhost() {
        this.trophy.show(Config.ID, 'ghost death')
        this.playerDied()
    }
    playerDied() {
        this.trophy.show(Config.ID, 'first death')
        this.player.x = this.coordData.data.x
        this.player.y = this.coordData.data.y
        this.lives--;
        if (this.lives == 0) this.state.start('Fail')
        else {
            this.reshapeHud()
            this.camera.shake(0.02, 200)
        }
    }
    reshapeHud() {
        this.hearThree.destroy()
        this.hearTwo.destroy()
        this.heartOne.destroy()
        switch (this.lives) {
            case 6:
                this.hearThree = this.game.add.sprite(128, 16, 'full-health')
                this.hearTwo = this.game.add.sprite(72, 16, 'full-health')
                this.heartOne = this.game.add.sprite(16, 16, 'full-health')
                break;
            case 5:
                this.hearThree = this.game.add.sprite(128, 16, 'half-health')
                this.hearTwo = this.game.add.sprite(72, 16, 'full-health')
                this.heartOne = this.game.add.sprite(16, 16, 'full-health')
                break;
            case 4:
                this.hearThree = this.game.add.sprite(128, 16, 'empty-health')
                this.hearTwo = this.game.add.sprite(72, 16, 'full-health')
                this.heartOne = this.game.add.sprite(16, 16, 'full-health')
                break;
            case 3:
                this.hearThree = this.game.add.sprite(128, 16, 'empty-health')
                this.hearTwo = this.game.add.sprite(72, 16, 'half-health')
                this.heartOne = this.game.add.sprite(16, 16, 'full-health')
                break;
            case 2:
                this.hearThree = this.game.add.sprite(128, 16, 'empty-health')
                this.hearTwo = this.game.add.sprite(72, 16, 'empty-health')
                this.heartOne = this.game.add.sprite(16, 16, 'full-health')
                break;
            case 1:
                this.hearThree = this.game.add.sprite(128, 16, 'empty-health')
                this.hearTwo = this.game.add.sprite(72, 16, 'empty-health')
                this.heartOne = this.game.add.sprite(16, 16, 'half-health')
                break;
            case 0:
                this.hearThree = this.game.add.sprite(128, 16, 'empty-health')
                this.hearTwo = this.game.add.sprite(72, 16, 'empty-health')
                this.heartOne = this.game.add.sprite(16, 16, 'empty-health')
                break;
        }
        this.heartOne.fixedToCamera = true
        this.hearTwo.fixedToCamera = true
        this.hearThree.fixedToCamera = true
    }
    render() {
        if (Config.DEBUG) {
            this.game.debug.body(this.player)
        }
    }
}
class Controller {
    constructor() {
        //var loginButton = $(document).getElementById('form-login-button')
        //loginButton.addEventListener('click', this.loginListener)
        $('#form-login-button').on('click', this.loginListener)
    }
    loginListener() {
        console.log('Called Listener')
        Config.EMAIL = $('#usrnm').val()
        Config.PASSWORD = $('#pswrd').val()
        Config.ID = Config.EMAIL + Config.PASSWORD
        console.log('Name ' + Config.EMAIL + ' Password ' + Config.PASSWORD)
        var data = {
            password: Config.PASSWORD,
            email: Config.EMAIL
        }
        ServerComm.addProfile((Config.EMAIL + Config.PASSWORD), data, function(response) {
            if (response['response'] != 'ok') {
                console.log("ERRO de comunicao com o servidor")
                window.alert("Erro no Login")
                return
            }
            //$('#label-logged-in').css('style', "")
            $('#form-login').hide()
            $('#label-logged-in p').html('Logged in as <strong>' + Config.EMAIL + '<strong>')
            $('#status-con h4 span').html('ONLINE')
            $('#status-con h4 span').removeClass('label label-danger').addClass('label label-success');
            $('#label-logged-in').show()
        })
    }
    rsLogin(val) {
        console.log('Called response')
    }
}
window.onload = function() {
    // funciona como singleton
    const GAME = new Game()
    const CONTROLLER = new Controller()
}