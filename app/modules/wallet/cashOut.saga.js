import { takeEvery, call, put } from 'redux-saga/effects';
import { actions, tokenAddress } from 'core/contracts';
import { request as apiRequest } from 'app/utils/api';
import {
  cashOutFailure,
  connectAccount,
  updateAuthUser
} from 'modules/auth/auth.actions';
// import { updateUserTokenBalance } from 'modules/user/user.actions';
import { formatBalanceRead } from 'app/utils/eth';
import { CASH_OUT } from 'core/actionTypes';

const NO_ETH_ADDRESS = 'NO_ETH_ADDRESS';
// const decimals = 18;

// TODO -- Replace Claiming tokens msg with toast with short-lived, success-themed toast
export function* handleRequest({
  meta,
  payload: {
    args: [user, accounts, customAmount]
  }
}) {
  if (!user.ethAddress || !user.ethAddress[0].length) {
    // It should not be possible to get here
    yield put(
      cashOutFailure({ args: [user, accounts, customAmount], ...meta }, NO_ETH_ADDRESS)
    );
  } else {
    try {
      const result = yield call(apiRequest, {
        method: 'POST',
        endpoint: 'user',
        path: '/cashOut',
        params: { customAmount }
      });
      yield put(updateAuthUser(result));
      const { sig, amount } = result.cashOut || user.cashOut;
      yield meta.errorHandler.alert(
        `Claiming ${parseFloat(formatBalanceRead(amount))} tokens 😄`,
        'success'
      );
      const tx = yield put(
        actions.methods
          .claimTokens({ at: tokenAddress, from: accounts[0] })
          .send(amount, sig)
      );
      console.log('tx', tx); // eslint-disable-line
      // TODO how do we track progress of transaction and update balance after it executes
      // yield put(updateUserTokenBalance());
    } catch (error) {
      yield put(cashOutFailure({ args: [user, accounts], ...meta }, error));
    }
  }
}
export function* handleFailure({ payload: { error }, meta }) {
  if (error === NO_ETH_ADDRESS) {
    // It should not be possible to get here
    yield meta.errorHandler.alert(
      'Looks like your account was disconnected. Try again with metamask enabled 😄'
    );
    yield put(connectAccount(meta.args.accounts));
  } else {
    yield meta.errorHandler.alert(error.message);
  }
}

export default function* cashOutSaga() {
  yield takeEvery(CASH_OUT.REQUEST, handleRequest);
  yield takeEvery(CASH_OUT.FAILURE, handleFailure);
}
