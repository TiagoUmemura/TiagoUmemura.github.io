class Ghost extends Phaser.Sprite {
    constructor(game, x, y, asset) {
        super(game, x, y, asset)
        this.game.physics.arcade.enable(this)
        this.body.allowGravity = false
        this.autoCull = true
        this.anchor.setTo(0.5, 0.5)
        this.originalX = this.body.x
        this.counter = 0
        this.first = true
    }
    update() {
        this.body.velocity.x = 0
        this.counter++;
        if (this.first) {
            this.body.y += this.height / 2
            this.body.x = this.originalX
            this.first = false
        }
        if (this.counter == 240) this.counter = 0
        if (this.counter <= 120) {
            this.body.velocity.x = -200
            this.scale.x = 1
        } else if (this.counter > 120 && this.counter <= 240) {
            this.body.velocity.x = 200
            this.scale.x = -1
        }
    }
}