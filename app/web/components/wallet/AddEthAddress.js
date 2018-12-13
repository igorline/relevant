import { Component } from 'react';
import PropTypes from 'prop-types';
import crypto from 'crypto';
import Modal from '../common/modal';
import { api } from '../../../utils';

const Alert = api.Alert();

export default class AddEthAddress extends Component {
  static propTypes = {
    account: PropTypes.string,
    actions: PropTypes.object,
    balance: PropTypes.number,
    connectAccount: PropTypes.bool,
    closeModal: PropTypes.func,
    user: PropTypes.object,
    connectedAccount: PropTypes.string
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      modal: true
    };

    this.renderModal = this.renderModal.bind(this);
    this.addKey = this.addKey.bind(this);
  }

  async addKey() {
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
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.balance && this.props.balance > 0 && this.state.modal === false) {
      this.setState({ modal: true });
    }
  }

  renderModal() {
    const footer = (
      <button className="shadowButton" onClick={this.addKey}>
        Connect Ethereum Address
      </button>
    );
    return (
      <Modal
        visible={this.state.modal || this.props.connectAccount}
        close={() => {
          if (this.props.closeModal) this.props.closeModal();
          this.setState({ modal: false });
        }}
        title={'ethAddress'}
        header={<div>Connect Eth Address</div>}
      >
        <div className="ethAddress">
          <p>Looks like you got some Relevant Tokens!</p>
          <p>
            Connect your Ethereum address to your Relevant account in order to start earning rewards
          </p>
          <div className="smallInfo">
            <p>-This is not a transaction and is totally free-</p>
          </div>
          {footer}
        </div>
      </Modal>
    );
  }

  render() {
    const { user, connectedAccount, account, balance } = this.props;
    if (
      (user && !connectedAccount && balance && account && !user.ethAddress[0]) ||
      this.props.connectAccount
    ) {
      return this.renderModal();
    }
    return null;
  }
}
