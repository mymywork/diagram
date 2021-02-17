export const addContactAction = (id,name,phone) => ({
  type: 'ADD_CONTACT',
  id,
  name,
  phone
})
export const editContactAction = id => ({
  type: 'EDIT_CONTACT',
  id
})
export const cancelContactAction = id => ({
  type: 'CANCEL_CONTACT',
  id
})
export const saveContactAction = (id,ref) => ({
  type: 'SAVE_CONTACT',
  id,
  ref
})
export const deleteContactAction = id => ({
  type: 'DELETE_CONTACT',
  id
})

export const setRefAction = (id,type,val) => ({
	type: 'SET_REF',
	id: id,
	reftype: type,
	refval: val
})

export const getRefAction = (id) => ({
	type: 'GET_REF',
	id,
	retReftype: null,
})
export const RefType = {
	NAME: 'REFNAME',
	PHONE: 'REFPHONE'
}
export const getNextIdAction = () => ({
	type: 'GET_NEXT_ID',
	id: undefined,
})

export const loadElementAction = (id) => ({
	type: 'LOAD_ELEMENT',
})
