import { takeEvery, call, put } from 'redux-saga/effects';
import { actions, tokenAddress } from 'core/contracts';
import { request as apiRequest } from 'app/utils/api';
import {
  cashOutFailure,
  connectAccount,
  updateAuthUser
} from 'modules/auth/auth.actions';
import { formatBalanceWrite } from 'app/utils/eth';
import { CASH_OUT } from 'core/actionTypes';

const NO_ETH_ADDRESS = 'NO_ETH_ADDRESS';
const decimals = 18;

export function* handleRequest({
  meta,
  payload: {
    args: [user, accounts]
  }
}) {
  if (!user.ethAddress || !user.ethAddress[0].length) {
    // It should not be possible to get here
    yield put(cashOutFailure({ args: [user, accounts], ...meta }, NO_ETH_ADDRESS));
  } else {
    const result = yield call(apiRequest, {
      method: 'POST',
      endpoint: 'user',
      path: '/cashOut'
    });
    try {
      yield put(updateAuthUser(result));
      const { sig, amount } = result.cashOut || user.cashOut;
      yield put(
        actions.methods
          .claimTokens({ at: tokenAddress, from: accounts[0] })
          .send(formatBalanceWrite(amount, decimals), sig)
      );
    } catch (error) {
      yield put(cashOutFailure({ args: [user, accounts], ...meta }, error));
    }
  }
}
export function* handleFailure({ payload: { error }, meta }) {
  if (error === NO_ETH_ADDRESS) {
    // It should not be possible to get here
    yield put(connectAccount(meta.args.accounts));
  } else {
    yield put(cashOutFailure(meta, error));
  }
}

export default function* cashOutSaga() {
  yield takeEvery(CASH_OUT.REQUEST, handleRequest);
  yield takeEvery(CASH_OUT.FAILURE, handleFailure);
}
