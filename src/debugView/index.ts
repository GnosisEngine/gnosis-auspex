import {
  FOV_HEIGHT,
  FOV_WIDTH,
} from '../config';
import Player from '../player'

export default class DebugView {
  container: Phaser.GameObjects.Container
  text: Phaser.GameObjects.Text

  /**
   * 
   */
  constructor (scene: Phaser.Scene) {
    const rect = scene.add.rectangle(0, 0, FOV_WIDTH, FOV_HEIGHT);
    rect.setStrokeStyle(2, 0x1a65ac);

    this.text = scene.add.text(
      FOV_WIDTH / -2,
      FOV_HEIGHT / -2,
      `${FOV_WIDTH / -2}/${FOV_HEIGHT / -2}`,
      {
        fontFamily: 'serif',
      }
    );

    this.container = scene.add.container(0, 0);
    this.container.add([rect, this.text]);
  }

  /**
   * 
   */
  update (player: Player) {
    if (this.container) {
      this.text.text = `${
        FOV_WIDTH / -2 + player.sprite.x
      }/${FOV_HEIGHT / -2 + player.sprite.y}`;

      this.container.x = player.sprite.x;
      this.container.y = player.sprite.y;
    }
  }
}
