import Element from './index'

export default class Rectangle extends Element {
	readonly x: number
	readonly y: number
	readonly width: number
	readonly height: number

	/**
	 * All values are based on one meter (1m)
	 */
	constructor (x: number, y: number, width: number, height: number, id?: number) {
		super(id)
		this.x = x
		this.y = y
		this.width = width
		this.height = height
	}
}
