import type { SceneConfig } from '../index.d';

export default class Player {
  constructor (physics: Phaser.Types.Physics.Arcade.ImageWithDynamicBody, config: SceneConfig) {
    this.physics = physics
    this.sprite = physics.add.image(0, 0, 'null')
    this.sprite.setCollideWorldBounds(true); // @TODO more flexible

    this.physics.world.setBounds(
      config.bounds.x,
      config.bounds.y,
      config.bounds.width,
      config.bounds.height
    );
  }

  /**
   * 
   */
  update (cursors: Phaser.Types.Input.Keyboard.CursorKeys) {
    this.sprite.setVelocity(0);

    if (cursors.left.isDown) {
      this.sprite.setVelocityX(-300);
    } else if (cursors.right.isDown) {
      this.sprite.setVelocityX(300);
    }

    if (cursors.up.isDown) {
      this.sprite.setVelocityY(-300);
    } else if (cursors.down.isDown) {
      this.sprite.setVelocityY(300);
    }
  }
}
