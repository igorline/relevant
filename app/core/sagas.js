import { CONNECT_ACCOUNT } from 'core/actionTypes';
import { all, call, select, put, fork, spawn, takeEvery } from 'redux-saga/effects';
import { actions as web3Actions, sagas as statesauceSagas } from 'redux-saga-web3';
import { saga as RelevantToken } from 'core/contracts';
import cashOutSaga from 'modules/wallet/cashOut.saga';
import { addEthAddress, connectAccountFailure } from 'modules/auth/auth.actions';
import { generateSalt, getProvider } from 'app/utils/eth';

export default function* rootSaga() {
  yield all([
    ...Object.values(statesauceSagas).map(saga => fork(saga)),
    spawn(cashOutSaga),
    spawn(connectAccount),
    spawn(RelevantToken)
  ]);
}

export function* connectAccount() {
  yield takeEvery(CONNECT_ACCOUNT.REQUEST, function* _connectAccount() {
    const web3 = yield call(getProvider);
    const accounts = yield select(state => state.web3.accounts.items);
    if (!accounts || !accounts.length) {
      yield put(web3Actions.accounts.getFailure());
    } else {
      const salt = generateSalt();
      const msgParams = [
        {
          type: 'string',
          name: 'Message',
          value: 'Connect Ethereum address to the Relevant account ' + salt
        }
      ];
      const result = yield call(web3.currentProvider.connection.send, {
        method: 'eth_signTypedData',
        params: [msgParams, accounts[0]],
        from: accounts[0]
      });
      try {
        yield put(addEthAddress(msgParams, result, accounts[0]));
      } catch (err) {
        yield put(connectAccountFailure(err));
        // Alert('failed signing message ', err);
      }
    }
  });
}
