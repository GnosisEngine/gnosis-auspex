import Rectangle from './rectangle'
import type Tiles from './tiles'

export default class Elevator extends Rectangle implements Tiles {
	/**
	 * 
	 */
	getTiles(): number[][] {
		return []
	}
}
