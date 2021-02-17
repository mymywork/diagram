import React from 'react'
import { render } from 'react-dom'
import { createStore, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'

import App from './components/App'

import rootReducer from './reducers'
import { loadState, saveState  } from './localStorage'

import createSagaMiddleware from 'redux-saga'
import rootSaga from './sagas'

const sagaMiddleware = createSagaMiddleware();
const store = createStore(rootReducer,loadState(),applyMiddleware(sagaMiddleware));
sagaMiddleware.run(rootSaga)

store.subscribe(() => {
	console.log("Save state");
	console.log(store.getState());
	var state = store.getState();
	var newstate = { contacts:state.contacts, identifier: state.identifier }
	saveState(newstate);
});

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)
