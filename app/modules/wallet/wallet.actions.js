import { generateSalt, formatBalanceRead } from 'utils/eth';
import { getProvider } from 'utils/web3.provider';
import { alert, api } from 'utils';
import { updateAuthUser } from 'modules/auth/auth.actions';
import { addEarning } from 'modules/wallet/earnings.actions';

const Alert = alert.Alert();

export function cashOutCall(customAmount = 0, sendCashoutAction) {
  return async dispatch => {
    try {
      const { user, earning } = await dispatch(
        api.request({
          method: 'POST',
          endpoint: 'user',
          path: '/cashOut',
          body: JSON.stringify({ customAmount })
        })
      );
      dispatch(updateAuthUser(user));
      earning && dispatch(addEarning(earning));
      const { amount: amnt, sig } = user.cashOut;
      const tx = sendCashoutAction(amnt, sig);
      Alert.alert(`Claiming ${parseFloat(formatBalanceRead(amnt))} tokens 😄`, 'success');
      return tx;
    } catch (err) {
      console.log(err); // eslint-disable-line
      return Alert.alert(err.message, 'error');
    }
  };
}

export function connectAddress(account) {
  return async dispatch => {
    try {
      const salt = generateSalt();
      const msgParams = [
        {
          type: 'string',
          name: 'Message',
          value: 'Connect Ethereum address to the Relevant account ' + salt
        }
      ];
      const web3 = getProvider();
      await web3.currentProvider.sendAsync(
        {
          method: 'eth_signTypedData',
          params: [msgParams, account],
          from: account
        },
        (err, msg) => {
          if (err || msg.error) {
            const error = err || msg.error;
            Alert.alert(error, 'error');
            return;
          }
          dispatch(addEthAddress(msgParams, msg.result, account));
        }
      );
    } catch (err) {
      Alert.alert('Failed signing message: ' + err.messate, 'error');
    }
  };
}

export function addEthAddress(msg, sig, acc) {
  return async dispatch => {
    try {
      const result = await dispatch(
        api.request({
          method: 'PUT',
          endpoint: 'user',
          path: '/ethAddress',
          body: JSON.stringify({ msg, sig, acc })
        })
      );
      dispatch(updateAuthUser(result));
      return true;
    } catch (err) {
      Alert.alert(err.message, 'error');
      return false;
    }
  };
}
