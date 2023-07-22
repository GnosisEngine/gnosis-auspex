import Rectangle from './rectangle'
import type Tiles from './tiles'

export default class Subway extends Rectangle implements Tiles {
	/**
	 * 
	 */
	getTiles(): number[][] {
		return []
	}
}
