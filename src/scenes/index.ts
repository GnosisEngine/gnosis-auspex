import * as Phaser from 'phaser';

interface Layers {
  [key: string]: Phaser.GameObjects.Layer;
}

export class GameScene extends Phaser.Scene {
  layers: Layers;
  loadedSprites = [];

  constructor(config: string | Phaser.Types.Scenes.SettingsConfig = '') {
    super(config);
    this.layers = {};
  }

  preload() {
    console.log(1);
  }

  create() {
    console.log(2);
  }

  update() {}

  /**
   *
   */
  loadSprite(
    config: Phaser.Types.GameObjects.Sprite.SpriteConfig,
    path: string
  ) {
    this.load.image(config.key, path);
  }

  /**
   *
   */
  addSprite(
    layerName: string,
    config: Phaser.Types.GameObjects.Sprite.SpriteConfig
  ) {
    const layer = this.layers[layerName];

    if (layer === undefined) {
      throw new RangeError(`${layerName} is not a valid layer`);
    }

    const sprite = this.make.sprite(config, false);
    layer.add(sprite);

    return sprite;
  }

  /**
   *
   */
  addLayer(name: string) {
    const layer = this.add.layer();
    this.layers[name] = layer;
    return layer;
  }
}

const json = {
  cameras: [{}],
  animations: [{}],
  events: [{}],
  data: [{}],
  lights: [{}],
  physics: [{}],
  textures: [{}],
};

/*
Class: Scene
Phaser. Scene
new Scene(config)
Members
add :Phaser.GameObjects.GameObjectFactory
anims :Phaser.Animations.AnimationManager
cache :Phaser.Cache.CacheManager
cameras :Phaser.Cameras.Scene2D.CameraManager
children :Phaser.GameObjects.DisplayList
data :Phaser.Data.DataManager
events :Phaser.Events.EventEmitter
facebook :Phaser.FacebookInstantGamesPlugin
game :Phaser.Game
input :Phaser.Input.InputPlugin
lights :Phaser.GameObjects.LightsManager
load :Phaser.Loader.LoaderPlugin
make :Phaser.GameObjects.GameObjectCreator
matter :Phaser.Physics.Matter.MatterPhysics
physics :Phaser.Physics.Arcade.ArcadePhysics
plugins :Phaser.Plugins.PluginManager
registry :Phaser.Data.DataManager
renderer :Phaser.Renderer.Canvas.CanvasRenderer|Phaser.Renderer.WebGL.WebGLRenderer
scale :Phaser.Scale.ScaleManager
scene :Phaser.Scenes.ScenePlugin
sound :Phaser.Sound.BaseSoundManager
sys :Phaser.Scenes.Systems
textures :Phaser.Textures.TextureManager
time :Phaser.Time.Clock
tweens :Phaser.Tweens.TweenManager
*/
