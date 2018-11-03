class Checkpoint extends Phaser.Sprite {
    constructor(game, x, y, asset) {
        super(game, x, y, asset)
        this.game.physics.arcade.enable(this)
        this.body.allowGravity = false
        this.autoCull = true
        this.points = 1
        this.animations.add('rise', [1, 2], 10, true)
    }
    play() {
        this.animations.play('rise')
    }
    update() {}
}