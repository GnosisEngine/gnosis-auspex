import type Tiles from './tiles'
import Rectangle from './rectangle'


export default class Room extends Rectangle implements Tiles {
	/**
	 * 
	 */
	getTiles(): number[][] {
		return []
	}
}
