// Tela de Titulo
class TitleState extends GameState {
    preload() {
        let dir = Config.ASSETS
        this.game.load.image('title', `${dir}title.png`);
        console.log('TITLE SCREEN')
    }
    create() {
        super.create()
        this.imgTitle = this.game.add.image(0, 0, 'title')
        //this.imgTitle.scale.setTo(1.0,1.0)
        this.imgTitle.anchor.setTo(0.5, 0.5)
        this.imgTitle.x = this.game.width / 2
        this.imgTitle.y = this.game.height / 2 - 50
        this.pressStart = this.game.add.text(0, 0, 'Press ENTER to begin', {
            fontSize: '32px',
            fill: '#ffffff'
        })
        this.pressStart.anchor.setTo(0.5, 0.5)
        this.pressStart.x = this.game.width / 2
        this.pressStart.y = this.game.height / 2 + 60
        let startButton = this.game.input.keyboard.addKey(Phaser.Keyboard.ENTER)
        startButton.onDown.add(this.startFade, this)
        // qualquer tecla muda para a proxima cena
        //this.game.input.onDown.add(this.startFade, this)
        // fade no titulo
        this.imgTitle.alpha = 0.3
        this.game.add.tween(this.imgTitle).to({
            alpha: 1
        }, 2000).to({
            alpha: 0.3
        }, 2000).loop(-1).start()
        // fade no presstart
        this.game.add.tween(this.pressStart).to({
            alpha: 0
        }, 500).to({
            alpha: 1
        }, 500).loop(-1).start()
        this.pressed = false
    }
    startFade() {
        if (!this.pressed) {
            this.pressed = true
            this.game.camera.fade(0x000000, 1000)
            this.game.camera.onFadeComplete.add(this.startGame, this)
        }
    }
    startGame() {
        // preparar o jogo
        // reset de highscore e controle de carregamento de estado do servidor
        Config.SCORE = 0
        Config.LEVEL = 1
        // evitar bug de levar o callback para outra tela (state)
        this.game.camera.onFadeComplete.removeAll(this)
        this.game.state.start('Play')
    }
    update() {}
}
class EndState extends GameState {
    preload() {
        let dir = Config.ASSETS
        this.game.load.image('win', `${dir}win.png`);
        console.log('TITLE SCREEN')
    }
    create() {
        super.create()
        this.imgTitle = this.game.add.image(0, 0, 'win')
        //this.imgTitle.scale.setTo(1.0,1.0)
        this.imgTitle.anchor.setTo(0.5, 0.5)
        this.imgTitle.x = this.game.width / 2
        this.imgTitle.y = this.game.height / 2 - 50
        this.pressStart = this.game.add.text(0, 0, 'Press ENTER to RESTART', {
            fontSize: '32px',
            fill: '#ffffff'
        })
        this.pressStart.anchor.setTo(0.5, 0.5)
        this.pressStart.x = this.game.width / 2
        this.pressStart.y = this.game.height / 2 + 95
        let startButton = this.game.input.keyboard.addKey(Phaser.Keyboard.ENTER)
        startButton.onDown.add(this.startFade, this)
        // qualquer tecla muda para a proxima cena
        //this.game.input.onDown.add(this.startFade, this)
        // fade no titulo
        this.imgTitle.alpha = 0.3
        this.game.add.tween(this.imgTitle).to({
            alpha: 1
        }, 2000).to({
            alpha: 0.3
        }, 2000).loop(-1).start()
        // fade no presstart
        this.game.add.tween(this.pressStart).to({
            alpha: 0
        }, 500).to({
            alpha: 1
        }, 500).loop(-1).start()
        this.pressed = false
    }
    startFade() {
        if (!this.pressed) {
            this.pressed = true
            this.game.camera.fade(0x000000, 1000)
            this.game.camera.onFadeComplete.add(this.startGame, this)
        }
    }
    startGame() {
        // preparar o jogo
        // reset de highscore e controle de carregamento de estado do servidor
        Config.SCORE = 0
        Config.LEVEL = 1
        // evitar bug de levar o callback para outra tela (state)
        this.game.camera.onFadeComplete.removeAll(this)
        this.game.state.start('Play')
    }
    update() {}
}
class FailState extends GameState {
    preload() {
        let dir = Config.ASSETS
        this.game.load.image('death', `${dir}death.png`);
        console.log('TITLE SCREEN')
    }
    create() {
        super.create()
        this.imgTitle = this.game.add.image(0, 0, 'death')
        //this.imgTitle.scale.setTo(1.0,1.0)
        this.imgTitle.anchor.setTo(0.5, 0.5)
        this.imgTitle.x = this.game.width / 2
        this.imgTitle.y = this.game.height / 2 - 50
        this.pressStart = this.game.add.text(0, 0, 'Press ENTER to RESTART', {
            fontSize: '32px',
            fill: '#ffffff'
        })
        this.pressStart.anchor.setTo(0.5, 0.5)
        this.pressStart.x = this.game.width / 2
        this.pressStart.y = this.game.height / 2 + 80
        let startButton = this.game.input.keyboard.addKey(Phaser.Keyboard.ENTER)
        startButton.onDown.add(this.startFade, this)
        // qualquer tecla muda para a proxima cena
        //this.game.input.onDown.add(this.startFade, this)
        // fade no titulo
        this.imgTitle.alpha = 0.3
        this.game.add.tween(this.imgTitle).to({
            alpha: 1
        }, 2000).to({
            alpha: 0.3
        }, 2000).loop(-1).start()
        // fade no presstart
        this.game.add.tween(this.pressStart).to({
            alpha: 0
        }, 500).to({
            alpha: 1
        }, 500).loop(-1).start()
        this.pressed = false
    }
    startFade() {
        if (!this.pressed) {
            this.pressed = true
            this.game.camera.fade(0x000000, 1000)
            this.game.camera.onFadeComplete.add(this.startGame, this)
        }
    }
    startGame() {
        // preparar o jogo
        // reset de highscore e controle de carregamento de estado do servidor
        Config.SCORE = 0
        Config.LEVEL = 1
        // evitar bug de levar o callback para outra tela (state)
        this.game.camera.onFadeComplete.removeAll(this)
        this.game.state.start('Play')
    }
    update() {}
}