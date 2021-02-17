import { createSelector } from 'reselect'
//import { chat as chatSchema, chatWithUsers as chatWithUsersSchema, archive as archiveSchema, message as messageSchema, typingMessage as typingMessageSchema } from 'Core/schemes'
//import { denormalize } from 'normalizr'
import { get } from 'lodash'

const stateSelector = state => state
const entitiesSelector = state => state.entities

export const idSelector = name => (state, props) => {
  if (props[name]) {
    return props[name]
  } else {
    return undefined
  }
}
/*
export const statusChatSelector = createSelector([stateSelector,idSelector('chatid')],(state, chatid) => {
  return state.status.chats[chatid]
})
*/

export const usersSelector = createSelector([entitiesSelector],(entities) => {

  let r = entities.users
  console.log('usersSelector ',r)

  return Object.values(r)
})

export const chatsSelector = createSelector([entitiesSelector],(entities) => {

  let r = entities.chats
  console.log('chatsSelector ',r)

  return Object.values(r)
})

export const firstChatSelector = createSelector([chatsSelector],(chats) => {

  let first = chats[0]
  console.log('firstChatSelector ',first)

  return first
})

/*
export const chatsSelector = createSelector([entitiesSelector,idSelector('prefix'),idSelector('nrState')],(entities, prefix, nrState) => {

  console.log('nrState = ', nrState)
  let myuserid = nrState.user.userid

  let r = denormalize(Object.keys(prefix == 'archive' ? entities.archive : entities.chats), prefix == 'archive' ? [archiveSchema] : [chatSchema], entities)
  console.log('chatsSelector ',r)
  if (prefix == undefined) return r
  let list = {
    'inbox': (x) => (x.usersid.length == 1 && x.lastmessageid == null) || x.inboxid.indexOf(myuserid) != -1,
    'mybox': (x) => x.usersid.length >= 2 && x.lastmessageid == null && x.usersid.indexOf(myuserid) != -1,
    'archive': (x) => x.lastmessageid != null,
    'all': (x) => x
  }

  let filter = list[prefix]

  return r.filter(x => filter(x))
})
*/

export const chatsWithUserCreatorSelector = createSelector([entitiesSelector, chatsSelector],(entities, chats) => {
  return chats.map(c => { return { ...c, usercreator:entities.users[c.creatorid] } } )
})

export const chatSelector = createSelector([entitiesSelector, chatsWithUserCreatorSelector, idSelector('chatid')],(entities, chats, chatid) => {
  console.log('[SELECTOR] chatSelector chatid = ', chatid ,' chats = ', chats)

  let r = chats.filter(x => x.chatid == parseInt(chatid)).map(x => {
    x.events = Object.values(entities.events).filter(e => e.chatid == x.chatid)
    x.creatoruser = entities.users[x.creatorid]
    return x
  })
  return r[0]
})

/*
export const chatSelector = createSelector([entitiesSelector,idSelector('chatid')],(entities, chatid) => {
  console.log('[SELECTOR] chatSelector chatid = ', chatid )
  let chats = denormalize(Object.keys(entities.chats), [chatSchema], entities)
  return chats.filter(x => x.chatid == parseInt(chatid))[0]
})
*/

export const chatCountersSelector = createSelector([stateSelector,entitiesSelector,idSelector('nrState')],(state, entities, nrState) => {
  console.log('[SELECTOR] chatCountersSelector ')

  let myuserid = nrState.user.userid

  let r = denormalize(Object.keys(entities.chats), [chatSchema], entities)

  let inboxCount = r.filter((x) => (x.usersid.length == 1 && x.lastmessageid == null) || x.inboxid.indexOf(myuserid) != -1).length
  let myboxCount = r.filter((x) => x.usersid.length >= 2 && x.lastmessageid == null && x.usersid.indexOf(myuserid) != -1).length

  let inbox = nrState.loaded['inbox'] ? inboxCount : parseInt(state.status.serverCounters.inbox)+inboxCount
  let mybox = nrState.loaded['mybox'] ? myboxCount : parseInt(state.status.serverCounters.mybox)+myboxCount

  return { inbox, mybox }
})

export const messagesWithOffsetHistorySelector = createSelector([entitiesSelector, chatSelector],(entities, chat) => {

  if ( !chat ) return []

  let list = denormalize(Object.keys(entities.messages), [messageSchema], entities)
  console.log('[SELECTOR] messagesWithOffsetHistorySelector list = ', list, 'chat = ',chat)

  //return chat ? list.reverse().filter(x =>  x.toid == chat.exchangeid && ( chat.lastmessageid >= x.messageid || chat.lastmessageid == null ) ) : []
  let nlist=[];
  for (let i=list.length-1; i >= 0;i--) {
    let x=list[i]
    if (x.toid == chat.exchangeid && ( chat.lastmessageid >= x.messageid || chat.lastmessageid == null ) ) {
      nlist.push(list[i])
      if (x.lastloaded) break;
    }
  }
  // add fromuser
  nlist = nlist.map(x => { return { ...x, fromuser: entities.users[x.fromid] } })
  return chat ? nlist.reverse() : [] ;
})

export const typingMessagesSelector = createSelector([entitiesSelector, chatSelector],(entities, chat) => {
  if ( !chat ) return []

  let list = denormalize(Object.keys(entities.typingMessages), [typingMessageSchema], entities)
  let nlist = list.map(x => { return { ...x, fromuser: entities.users[x.fromid] } })
  return nlist
})

export const lastMessageSelector = createSelector([messagesWithOffsetHistorySelector],(messages) => {
  console.log('[SELECTOR] lastMessageSelector messages = ',messages)
  if (messages.length != 0) {
    return messages[messages.length-1]
  }
  return undefined
})

export const getUserOfChat = createSelector([chatSelector,entitiesSelector],(chat,entities) => {
  if (!chat) return undefined
  let newChat = denormalize(chat, chatWithUsersSchema, entities)
  return newChat.usersid.filter(x => x.level == 0)[0]
})

