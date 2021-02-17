export const loadState = () => {
	try {
		const state = localStorage.getItem('state');
		if ( state == null ) {
			return {};
		}
		return JSON.parse(state);	
	} catch (e) {
		console.log(e);
	}
};
export const saveState = (state) => {
	try {
		const serializedState = JSON.stringify(state);
		localStorage.setItem('state',serializedState);
	} catch (e) {
		console.log(e);
	}
}
