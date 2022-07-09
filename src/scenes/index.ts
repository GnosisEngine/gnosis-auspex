import * as Phaser from 'phaser';

interface Layers {
  [key: string]: Phaser.GameObjects.Layer;
}

interface Containers {
  [key: string]: Phaser.GameObjects.Container;
}

interface Config extends Phaser.Types.Scenes.SettingsConfig {}

export class GameScene extends Phaser.Scene {
  layers: Layers;
  containers: Containers;
  loadedSprites = [];

  constructor(config: string | Config = '') {
    super(config);
    this.layers = {};
    this.containers = {};
  }

  preload() {
    this.loadAtlas(
      'atlas',
      [
        'https://raw.githubusercontent.com/GnosisEngine/gnosis-auspex/main/assets/veg.png',
      ],
      'https://raw.githubusercontent.com/GnosisEngine/gnosis-auspex/main/assets/veg.json'
    );
  }

  create() {
    const a = 8;

    const blitter = this.add.blitter(0, 0, 'atlas');

    for (var idx = 0; idx < 5; ++idx) {
      if (idx === 38) {
        idx = 1;
      }

      const frame = idx < 10 ? 'veg0' + idx.toString() : 'veg' + idx.toString();

      var bob = blitter.create(0, 0, frame);
      // bob.data.vx = Math.random() * 10;
      // bob.data.vy = Math.random() * 10;
      // bob.data.bounce = 0.8 + (Math.random() * 0.3);
      console.log(bob);
    }

    var len = Phaser.Utils.String.Pad(
      blitter.children.list.length.toString(),
      7,
      '0',
      1
    );
  }

  /**
   *
   */
  update() {}

  /**
   *
   */
  loadAtlas(
    name: string,
    texturePathsOrUrls: string[],
    atlasJsonPathsOrUrls: string
  ) {
    const result = this.load.atlas(
      name,
      texturePathsOrUrls,
      atlasJsonPathsOrUrls
    );
    return result;
  }

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
  addLayer(name: string) {
    const layer = this.add.layer();
    layer.setName(name);
    this.layers[name] = layer;
    return layer;
  }

  /**
   *
   */
  addContainer(
    containerName: string,
    layerName: string,
    x: number = 0,
    y: number = 0,
    children: Phaser.GameObjects.GameObject[] = []
  ) {
    const container = this.add.container(x, y, children);
    this.containers[containerName] = container;
    const layer = this.getLayer(layerName);
    layer.add(container);
    return container;
  }

  /**
   *
   */
  getLayer(name: string) {
    const layer = this.layers[name];

    if (layer === undefined) {
      throw new RangeError(`${name} is not a defined layer`);
    }

    return layer;
  }

  /**
   *
   */
  getContainer(name: string) {
    const container = this.containers[name];

    if (container === undefined) {
      throw new RangeError(`${name} is not a defined container`);
    }

    return container;
  }

  /**
   *
   */
  addSpriteToLayer(
    layerName: string,
    spriteConfigs:
      | Phaser.Types.GameObjects.Sprite.SpriteConfig[]
      | Phaser.GameObjects.Sprite[]
  ) {
    const layer = this.getLayer(layerName);
    const result: Phaser.GameObjects.Sprite[] = [];

    for (const config of spriteConfigs) {
      const sprite =
        config instanceof Phaser.GameObjects.Sprite
          ? config
          : this.make.sprite(config, false);

      layer.add(sprite);
      result.push(sprite);
    }

    return result;
  }

  /**
   *
   */
  addSpritesToContainer(
    name: string,
    spriteConfigs:
      | Phaser.Types.GameObjects.Sprite.SpriteConfig[]
      | Phaser.GameObjects.Sprite[]
  ) {
    const container = this.getContainer(name);
    const result: Phaser.GameObjects.Sprite[] = [];

    for (const config of spriteConfigs) {
      const sprite =
        config instanceof Phaser.GameObjects.Sprite
          ? config
          : this.make.sprite(config, false);

      container.add(sprite);
      result.push(sprite);
    }

    return result;
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
