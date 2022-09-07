import { CityLayers } from ".";
import { GROUND_Y, LIVING_UNIT_HEIGHT, LIVING_UNIT_LENGTH, SERVICE_CHANNEL_FACE_LENGTH } from "../config";
import { GameScene } from "../scenes";

interface BuildingBlock {
  x: number
  y: number
  layer: CityLayers
  image: string
  state?: {
    [key: string]: any
  }
  onInteract?: () => void
  onOverlap?: () => void
  onProximity?: () => void
}

let id = 0

export class Building {
  blocks: BuildingBlock[] = []
  width: number
  height:  number
  id: number
  name: string
  scene: GameScene

  /**
   * 
   */
  constructor (name: string, width: number, height: number) {
    this.id = id
    this.name = name
    this.width = width
    this.height = height
    id += 1

    const maxStories = Math.floor(LIVING_UNIT_HEIGHT / this.height)
    this.makeGround()
    this.makeTunnel()
    this.makeBuilding(maxStories)
  }

  /**
   * Creates ground tiles
   */
  private makeGround() {
    for (let x = 0; x < this.width; x++) {
      this.blocks.push({
        x,
        y: GROUND_Y,
        layer: CityLayers.street,
        image: 'city1'
      })

      for (let y = 1; x < 10; x++) {
        this.blocks.push({
          x,
          y: GROUND_Y + y,
          layer: CityLayers.ground,
          image: 'city2'
        })
      }
    }
   }

  /**
   *
   */
  private makeTunnel() {
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; x < 7; x++) {
        this.blocks.push({
          x,
          y: GROUND_Y + 3 + y,
          layer: CityLayers.tunnel,
          image: 'city3'
        })
      }
    }
  }

  /**
   *
   */
  private makeBuilding(maxStories: number) {
    for (let storyNumber = 0; storyNumber < maxStories; storyNumber++) {
      const story = this.makeStory(storyNumber);
    }
  }

  /**
   
   */
  private makeStory(storyNumber: number) {
    // @TODO math this
    const width = (LIVING_UNIT_LENGTH * 2) + SERVICE_CHANNEL_FACE_LENGTH

    for (let x = 0; x < width; x++) {
      for (let y = 0; x < 7; x++) {
        if (x > 0 && x < width) {

        } else {

        }
      }
    }
  }

  /**
   *
   */
  private makeRoom() {}
 
  /**
   *
   */
  private makeStreetRoom() {}
}
