import {
  CAMERA_DEADZONE_HEIGHT,
  CAMERA_DEADZONE_WIDTH
} from '../config';
import Player from '../player'

export default class Camera {
  /**
   * 
   */
  constructor (camera: Phaser.Camera, deadZoneWidth = CAMERA_DEADZONE_WIDTH, deadZoneHeight = CAMERA_DEADZONE_HEIGHT) {
    this.camera = camera
    this.camera.off('followupdate');

    this.camera.setDeadzone(
      deadZoneWidth,
      deadZoneHeight
    );
  }

  /**
   * 
   */
  async initialize (player: Player): Promise<boolean> {
    return new Promise(resolve => {
      this.camera.startFollow(player.sprite, true); // @TODO more flexible
      this.camera.on('followupdate', () => {
        resolve(true);
      });
    });
  }
}
