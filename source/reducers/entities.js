import mergeWith from 'lodash/mergeWith'
import isArray from 'lodash/isArray'
import set from 'lodash/set'
import unset from 'lodash/unset'
import omit from 'lodash/omit'


export const types = {
  ENTITIES_MERGE: `@remote/DATA_MERGE`,
  ENTITIES_MERGE_AND_DELETE: `@remote/DATA_MERGE_AND_DELETE`,
  ENTITIES_SET: `@remote/DATA_SET`,
  ENTITIES_REMOVE: `@remote/DATA_REMOVE`,
  ENTITIES_MERGE_REPLACE: `@remote/DATA_MERGE_REPLACE`
}

const dataInitialState = {
  chats: { 0:'def' },
  archive: {},
  users: { 0:'vasya' },
  messages: {},
  events: {},
  typingMessages: {},
}

const entitiesReducer = (state = dataInitialState, action) => {
  switch (action.type) {
    case types.ENTITIES_MERGE:  // переименовать в DATA_MERGE
      return mergeWith({}, state, action.entities, (objValue, srcValue, key, object, source, stack) =>
        // Сливает новые данные со старыми. Специальное правило для массивов - они перезаписываются.
        (isArray(objValue) || isArray(srcValue) && srcValue !== null && srcValue !== undefined) ? srcValue || [] : undefined)

    case types.ENTITIES_MERGE_AND_DELETE:  // переименовать в DATA_MERGE
      if ( action.deleteEntities != undefined ) {
        for (let e in action.deleteEntities) {
          let list = action.deleteEntities[e]
          for (let k in list) {
            console.log('UNSET entities = ', [e, k])
            unset(state, [e, k])
          }
        }
      }
      return mergeWith({}, state, action.entities, (objValue, srcValue, key, object, source, stack) =>
        // Сливает новые данные со старыми. Специальное правило для массивов - они перезаписываются.
        (isArray(objValue) || isArray(srcValue) && srcValue !== null && srcValue !== undefined) ? srcValue || [] : undefined)

    case types.ENTITIES_SET:
      return set({ ...state }, action.path, action.value)
    case types.ENTITIES_MERGE_REPLACE:
      let z = mergeWith({}, state, action.entities, (objValue, srcValue, key, object, source, stack) =>
        // Сливает новые данные со старыми. Специальное правило для массивов - они перезаписываются.
        (isArray(objValue) || isArray(srcValue) && srcValue !== null && srcValue !== undefined) ? srcValue || [] : undefined)
      z[action.replace] = action.entities[action.replace] == undefined ? {} : action.entities[action.replace]
      return z
    case types.ENTITIES_REMOVE:
      return set({ ...state }, action.entity, omit(state[action.entity], action.id))

    default:
      return state
  }
}
export default entitiesReducer