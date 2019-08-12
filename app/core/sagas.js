import { all, fork, spawn } from 'redux-saga/effects';
import { sagas as statesauceSagas } from 'redux-saga-web3';
import { saga as RelevantToken } from 'core/contracts';
import cashOutSaga from 'modules/wallet/cashOut.saga';

export default function* rootSaga() {
  yield all([
    ...Object.values(statesauceSagas).map(saga => fork(saga)),
    spawn(cashOutSaga),
    spawn(RelevantToken)
  ]);
}
