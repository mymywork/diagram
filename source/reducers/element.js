const element = (e = {}, action) => {
	switch (action.type) {
		case 'EMPTY_ELEMENT':
			return {
				state: 0
			}
		case 'LOADING_ELEMENT':
			return {
				state: 1
			}
		case 'LOADED_ELEMENT':
			return {
				state: 2
			}
		default:
			return e
	}
}

export default element
