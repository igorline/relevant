import { actions, tokenAddress } from 'core/contracts';
import { getProvider, generateSalt, formatBalanceRead } from 'app/utils/eth';
import { alert, api } from 'app/utils';
import { updateAuthUser } from 'modules/auth/auth.actions';

const Alert = alert.Alert();

export function cashOutCall(customAmount = 0, account) {
  return async dispatch => {
    try {
      const result = await dispatch(
        api.request({
          method: 'POST',
          endpoint: 'user',
          path: '/cashOut',
          body: { customAmount }
        })
      );
      dispatch(updateAuthUser(result));
      const { amount: amnt, sig } = result.cashOut;

      const tx = dispatch(
        actions.methods.claimTokens({ at: tokenAddress, from: account }).send(amnt, sig)
      );
      Alert.alert(`Claiming ${parseFloat(formatBalanceRead(amnt))} tokens 😄`, 'success');
      return tx;
    } catch (err) {
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
      await web3.currentProvider.connection.sendAsync(
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
