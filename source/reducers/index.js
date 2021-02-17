import { combineReducers } from 'redux'
import contacts from './contacts'
import refs from './refs'
import identifier from './identifier'
import element from './element'
import entities from './entities'

export default combineReducers({
  contacts,
  refs,
  identifier,
  element,
  entities,
})
