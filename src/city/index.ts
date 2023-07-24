import type { ChunkRange } from './chunkManager'
import ChunkManager from './chunkManager'
import Camera from '../camera'
import Road from './elements/road'
import Subway from './elements/subway'
import Building from './elements/road'
import SubwayOnRamp from './elements/subwayOnRamp'
import Elevator from './elements/road'
import Room from './elements/room'

interface CityOptions {
  city: {
    length: number
    height: number
  },
  buildings: {
    minHeight: number
    maxHeight: number
    minWidth: number
    maxWidth: number
    minDistance: number
    maxDistance: number
    averageRoomPopulation: number
  },
  subway: {
    height: number
    onrampDistance: number
  },
  fov: {
    width: number,
    height: number,
    x: number,
    y: number
  },
  rng: Object
}

// @TODO: seedable rng needs to be specified 
function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export default class City {
  chunks: ChunkManager
  options: CityOptions
  buildings: Element[] = []

  /**
   * Called by: ../game.ts (startEngine)
   */
	constructor (scene: Phaser.Scene, options = CityOptions) {
    this.scene = scene
    this.options = options

    // scene.game.config.width
    // scene.game.config.height

    this.chunks = new ChunkManager(this.scene, this.options.fov.x, this.options.fov.y, this.options.fov.width, this.options.fov.height)
	}

  /**
   * Generates a city
   */
  generate () {
    // Array to store the city layout
    const count = {
      buildings: 0,
      rooms: 0,
      estimatedPopulation: 0,
      miles: 0
    }

    // Put the road in the middle
    const roadPosition = this.options.city.height - this.options.subway.height - 1

    const buildingQueue = []

    // Prepare building width dimensions
    let position = 0
    for (; position < this.options.city.length; position += getRandomNumber(this.options.buildings.minDistance, this.options.buildings.maxDistance)) {
      // Generate a random building width
      // @TODO bring in RNG
      let width = getRandomNumber(this.options.buildings.minWidth, this.options.buildings.maxWidth)

      if (width % 2 === 1) {
        // Don't allow odd number building widths, this makes elevator generation easier
        width += 1
      }

      if (position + width > this.options.city.length) {
        // The next buidling size is out of bounds of the city
        if (this.options.city.length - position < this.options.buildings.minWidth ) {
          // stretch the last building to the end
          const building = buildingQueue[buildingQueue.length - 1]
          building[1] = this.options.city.length - building[0]
          position = this.options.city.length
        }
        break
      }

      // Add the building to the queue
      buildingQueue.push([position, width])
      count.buildings += 1
      position += width
    }

    if (position < this.options.city.length) {
      // If there is a gap, fill it with a building
      buildingQueue.push([position, this.options.city.length - position])
      count.buildings += 1
    }

    // Generate the road
    const road = new Road(
      0,
      roadPosition,
      this.options.city.length,
      1
    )

    this.buildings.push(road)

    // Generate the subway
    const subway = new Subway(
      0,
      roadPosition + 1,
      this.options.city.length,
      this.options.subway.height
    )

    this.buildings.push(subway)

    const actualBuildingMaxHeight = this.options.buildings.maxHeight > this.options.city.height
      ? this.options.city.height
      : this.options.buildings.maxHeight

    // Generate the buildings
    let firstBuilding = true
    let distanceCovered = 0
    for (const buildingData of buildingQueue) {
      const buildingHeight = getRandomNumber(this.options.buildings.minHeight, actualBuildingMaxHeight)
      const x = buildingData[0]
      const buildingWidth = buildingData[1]

      // Add building
      const building = new Building(
        x,
        roadPosition - buildingHeight,
        buildingWidth,
        buildingHeight,
      )
      this.buildings.push(building)

      // Generate the elevator to the subway
      const elevator = new Elevator(
        building.x + (buildingWidth / 2),
        roadPosition - buildingHeight,
        1,
        buildingHeight + this.options.subway.height
      )
      building.add(elevator)

      if (distanceCovered === 0) {
        // Generate subway entrance
        const subwayEntrance = new SubwayOnRamp(
          elevator.x - 1,
          roadPosition - 3,
          3, // @TODO: SUBWAY_ONRAMP_WIDTH
          3  // @TODO: SUBWAY_ONRAMP_HEIGHT
        )
        this.buildings.push(subwayEntrance)
      }

      distanceCovered += buildingWidth

      if (distanceCovered > this.options.subway.onrampDistance) {
        distanceCovered = 0
      }

      // Generate rooms
      for (let roomId = building.height - 3; roomId > 0; roomId -= 3) {
        const leftRoom = new Room(
          building.x + 1,
          roadPosition - buildingHeight + roomId,
          buildingWidth / 2 - elevator.width ,
          3 // @TODO: ROOM_HEIGHT
        )
        building.add(leftRoom)
        count.rooms += 1
        count.estimatedPopulation += this.options.buildings.averageRoomPopulation

        const rightRoom = new Room(
          elevator.x + elevator.width,
          roadPosition - buildingHeight + roomId,
          buildingWidth / 2 - elevator.width - 1,
          3
        )
        building.add(rightRoom)
        count.rooms += 1
        count.estimatedPopulation += this.options.buildings.averageRoomPopulation
      }
    }

    // @TODO: METERS_TO_MILES
    count.miles = (this.options.city.length / 1609.344).toFixed(2)

    return {
      buildings: this.buildings,
      count
    }
  }

  /**
   * Get all the tile layers and data for what the camera sees
   */
  getChunk (camera: Rectangle | Camera, buildings = this.buildings) {
    const result: ChunkRange[] = [];

    // Find intersecting rectangles and calculate their intersection area
    buildings.forEach(building => {
      const width = this.calculateOverlap(building.x, building.width, camera.x, camera.width)

      if (width <= 0) {
        return
      }

      const height = this.calculateOverlap(building.y, building.height, camera.y, camera.height)

      if (height <= 0) {
        return
      }

      result.push({
        target: building,
        x: camera.x,
        y: camera.y,
        height,
        width
      })

      if (building.hasChildren()) {
        this.getChunk(camera, building.children).forEach(child => result.push(child))
      }

      
    });

    return result
  }

  /**
   * 
   */
  private calculateOverlap(lineX, lineWidth, focusX, focusWidth) {
    const lineEnd = lineX + lineWidth;
    const focusEnd = focusX + focusWidth;

    // If the lines don't overlap at all
    if (lineX >= focusEnd || lineEnd <= focusX) {
      return 0;
    }

    // Calculate the overlapping region
    const overlapStart = Math.max(lineX, focusX);
    const overlapEnd = Math.min(lineEnd, focusEnd);
    return overlapEnd - overlapStart;
  }
}
