import { all, fork } from 'redux-saga/effects';
import { sagas as statesauceSagas } from 'redux-saga-web3';
import { saga as RelevantToken } from './contracts';

export default function* rootSaga() {
  yield all([
    ...Object.values(statesauceSagas).map(saga => fork(saga)),
    fork(RelevantToken)
  ]);
}
