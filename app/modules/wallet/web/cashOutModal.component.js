import { Component } from 'react';
import PropTypes from 'prop-types';
import crypto from 'crypto';
import Modal from 'modules/ui/web/modal';
import { alert } from 'app/utils';
import { Button, View, BodyText, SecondaryText } from 'modules/styled/uni';

const Alert = alert.Alert();

export default class AddEthAddress extends Component {
  static propTypes = {
    account: PropTypes.string,
    actions: PropTypes.object,
    balance: PropTypes.number,
    modal: PropTypes.string,
    contract: PropTypes.object,
    user: PropTypes.object
    // connectedAccount: PropTypes.string
  };

  cashOut = async () => {
    const { actions, user, contract } = this.props;
    try {
      // TODO call await this.connectAddress() here if no ethAddress is present

      const decimals = contract.methods.decimals.cacheCall();

      let cashOut = await actions.cashOut();
      cashOut = cashOut || user.cashOut;

      const { sig } = cashOut;
      let amount = new web3.utils.BN(cashOut.amount.toString());
      let mult = new web3.utils.BN(10 ** (decimals / 2));
      mult = mult.mul(mult);
      amount = amount.mul(mult);

      // let result = await this.props.RelevantCoin.methods.cashOut(amount, sig).call();
      // console.log(result);
      contract.methods.cashOut.cacheSend(amount, sig, {
        from: user.ethAddress[0]
      });
      // console.log(result);
    } catch (err) {
      throw err;
    }
  };

  connectAddress = async () => {
    const { actions, account } = this.props;
    try {
      const salt = crypto.randomBytes(16).toString('hex');
      const msgParams = [
        {
          type: 'string',
          name: 'Message',
          value: 'Connect Ethereum address to the Relevant account ' + salt
        }
      ];
      web3.currentProvider.sendAsync(
        {
          method: 'eth_signTypedData',
          params: [msgParams, account],
          from: account
        },
        (err, msg) => {
          if (err || msg.error) return;
          actions.addEthAddress(msgParams, msg.result, account);
        }
      );
    } catch (err) {
      Alert('failed signing message ', err);
    }
  };

  componentDidUpdate(prevProps) {
    if (!prevProps.balance && this.props.balance > 0 && this.state.modal === false) {
      this.setState({ modal: true });
    }
  }

  render() {
    const { actions, modal } = this.props;
    return (
      <Modal
        visible={modal === 'cashOut'}
        close={actions.hideModal}
        title={'Claim Your Relevant Coins'}
      >
        <View>
          <BodyText>
            This will transfer the coins you have to your Ethereum wallet.
          </BodyText>
          <BodyText mt={2}>TODO: show prompt to install Metamask if no Metamask</BodyText>
          <SecondaryText>
            Like this: *We'll need to connect your account, it is not a transaction and is
            totally free
          </SecondaryText>
          <BodyText>
            TODO: explain if no account is connected to db (prompt to sign tx)
          </BodyText>
          <BodyText>TODO: warning if network mismatch</BodyText>
          <BodyText>TODO: warning if current account mismatch</BodyText>
          <BodyText>TODO: warning if current account mismatch</BodyText>
          <BodyText>TODO: add custom amount?</BodyText>
          <BodyText>TODO: add custom address?</BodyText>

          <Button mr={'auto'} mt={4} onClick={this.cashOut}>
            Claim Relevant Coins
          </Button>
        </View>
      </Modal>
    );
  }
}
