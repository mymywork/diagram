const refs = (list = {}, action) => {
	switch (action.type) {
		case 'SET_REF':
			if ( list[action.id] == null ) list[action.id] = {}
			list[action.id][action.reftype] = action.refval;
			return list;
		case 'GET_REF':
			action.retRef = list[action.id];
			return list;
		default:
			return list
	}
}

export default refs
