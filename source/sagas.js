import { put, takeEvery, all, call } from 'redux-saga/effects'

const delay = (ms) => new Promise(res => setTimeout(res, ms))

export function* loadElementAsync() {
  yield put({ type: 'LOADING_ELEMENT' })
  var data = yield call(delay,4000);
  yield put({ type: 'LOADED_ELEMENT' })
}

export function* watchIncrementAsync() {
  yield takeEvery('LOAD_ELEMENT', loadElementAsync)
}

// notice how we now only export the rootSaga
// single entry point to start all Sagas at once
export default function* rootSaga() {
  yield all([
    watchIncrementAsync()
  ])
}
