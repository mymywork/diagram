const identifier = (id = 0 , action) => {
	switch (action.type) {
		case 'GET_NEXT_ID':
			console.log("Called GET_NEXT_ID.")
			action.id = id++;
			return id;
		default:
			return id;
	}
}

export default identifier
