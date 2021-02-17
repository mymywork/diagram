import { RefType } from '../actions'
const contacts = (list = [], action) => {
	switch (action.type) {
		case 'ADD_CONTACT':
			return [
				...list,
				{
					id: action.id,
					name: action.name,
					phone: action.phone,
					editing: true,
					//newest: true
				}
			]
		case 'EDIT_CONTACT':
			return list.map(c =>
				(c.id === action.id)
				? {...c, editing: c.editing ^ true }
				: c
			)
		case 'SAVE_CONTACT':
			return list.map(c => {
				if (c.id === action.id) {
					var o = {...c};
					console.log("action.ref",action.ref);
					o.name = action.ref[RefType.NAME].value;
					o.phone = action.ref[RefType.PHONE].value;
					o.editing = false;
					//o.newest = false;
				} else {
					return c;
				}
				return o;
			}
			)
		case 'CANCEL_CONTACT':
			return list.map(c => { 
				if (c.id === action.id) {
					var o = { ...c, editing: false };
					return o;
				} else {
					return c;	
				}
			})
		case 'DELETE_CONTACT':
			return list.filter(c => c.id !== action.id )
		default:
			return list
	}
}

export default contacts
