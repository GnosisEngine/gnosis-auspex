export default class Chunk {
  scene: Phaser.Scene
  x: number
  y: number
  id: number
  physicsLayer: Phaser.Physics // @TODO fix this
  layers: Phaser.Layer[]
  loaded: boolean = false
  tiles: number[][]
  til

  constructor(scene, x, y, id) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.id = id
    this.layers = [];
    this.physicsLayer = this.scene.physics.add.group();
  }

  /**
   * 
   */
  async load (width, height, tiles = [], physics = []) {
    for (const layer of tiles) {
      const pixels = await getPixels(layer)
      this.addImageLayer(width, height, pixels)
    }

    for (const object of physics) {
      this.physicsLayer.add(object)  
    }
    
    // @TODO load
    this.loaded = true
  }

  /**
   * 
   */
  async addImageLayer (width, height, bufferData) {
    const texture = this.scene.textures.createCanvas(`chunk-${this.id}`, width, height);
	  texture.context.drawImage(bufferData, 0, 0, width, height);
	  texture.refresh();

    const frame = texture.getFrame();

    const layer = this.scene.add.container(this.x, this.y);
    const blitter = layer.add.blitter(0, 0);
    blitter.create(0, 0, frame)
    this.layers.push(blitter);

    texture.destroy();

    return layer;
  }

  /**
   * @TODO
   */
  addPhysics (thing) {
    this.physicsLayer.add(thing)
  }

  /**
   * 
   */
  destroy() {
    // Destroy all graphical layers and their blitters
    for (let i = 0; i < this.layers.length; i++) {
      this.layers[i].destroy();
    }

    this.layers = []

    // Destroy the physics layer
    if (this.physicsLayer) {
      this.physicsLayer.destroy();
    }
  }
}
