// We use a common zero-length array to significantly save memory when dealing with many branchless leaves
const zeroArray = []

export default class Element {
	static nextId: number = 0
	private readonly id: number
	private children: Element[] = zeroArray

	constructor(id?: number) {
		this.id = id || Element.nextId
		Element.nextId += 1
	}

	/**
	 * Adds an Element to children
	 */
	add (element: Element | Element[]) {
		if (this.children === zeroArray) {
			this.children = []
		}

		if (element instanceof Array) {
			for (const e of element) {
				this.add(e)
			}
		} else {
			this.children.push(element)
		}

	}

	/**
	 * Adds an Element to children
	 */
	remove (element: Element | Element[] | number) {
		if (element instanceof Array) {
			for (const e of element) {
				this.remove(e)
			}
		} else if (typeof element === 'number') {
			this.children.splice(element, 1)
		} else {
			const index = this.children.indexOf(element)
			this.children.splice(index, 1)
		}

		if (this.children.length === 0) {
			this.children = zeroArray
		}
	}

	/**
	 * Sets children
	 */
	setChildren (children: Element[]) {
		if (children.length === 0) {
			this.children = zeroArray
		} else {
			this.children = children	
		}
		
	}

	/**
	 * Returns if children exist
	 */
	hasChildren () {
		return this.children !== zeroArray
	}

	/**
	 * Transforms every child
	 */
	map (transform: (e: Element) => Element | undefined) {
		return this.children.map(transform)
	}

	/**
	 * Iterates over every child
	 **/
	forEach (iterate: (e: Element) => void) {
		this.children.forEach(iterate)
	}

	/**
	 * Returns a list of children that match criteria
	 **/
	filter (criteria: (e: Element) => boolean) {
		return this.children.filter(criteria)
	}

	/**
	 * Transforms every child (This is NOT immutable!)
	 */
	mapAll (transform: (e: Element) => Element | undefined) {
		return this.children.map((e: Element) => {
			const result = transform(e)

			if (e.hasChildren()) {
				result.setChildren(e.mapAll(transform))
			}

			return result
		})
	}

	/**
	 * Copies every child then transforms them
	 */
	immutableMapAll () {
		// @TODO: coming soon!
		return []
	}

	/**
	 * Iterates over every child
	 **/
	forEachAll (iterate: (e: Element) => void) {
		this.children.forEach((e: Element) => {
			const result = iterate(e)

			if (e.hasChildren()) {
				e.forEachAll(iterate)
			}
		})
	}

	/**
	 * Returns a list of children that match criteria
	 **/
	filterAll (criteria: (e: Element) => boolean) {
		let results: Element[] = []

		this.children.forEach((e: Element) => {
			if (criteria(e) === true) {
				results.push(e)
			}

			if (e.hasChildren()) {
				results = results.concat(e.filterAll(criteria))
			}
		})

		return results
	}

	/**
	 * Returns an element by ID as long as it is in the tree.  Returns false if it isn't there
	 */
	getById (id: number) {
		if (this.id === id) {
			return this
		} else {
			const result = this.filterAll((e: Element) => {
			  return e.id === id
			})

			if (result.length > 0) {
				return result[0]
			}
		}

		return false
	}

	/**
	 * Returns the index position of a child
	 */
	getIndex (element: Element) {
		return this.children.indexOf(element)
	}
}
