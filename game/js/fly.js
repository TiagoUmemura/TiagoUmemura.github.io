class Fly extends Phaser.Sprite {
    constructor(game, x, y, asset) {
        super(game, x, y, asset)
        this.game.physics.arcade.enable(this)
        this.body.allowGravity = false
        this.autoCull = true
        this.anchor.setTo(0.5, 0.5)
        this.counter = 0
        this.originalY = this.body.y
        this.first = true
        this.animations.add('move', [0, 1], 2, true)
        this.animations.play('move')
    }
    update() {
        this.body.velocity.x = 0
        this.counter++;
        if (this.counter == 140) {
            this.counter = 0
            this.body.y = this.originalY - this.body.height
        }
        if (this.counter <= 70) {
            this.body.velocity.y = -200
        } else if (this.counter > 70 && this.counter < 140) {
            this.body.velocity.y = 200
        }
    }
}