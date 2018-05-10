import { Component } from 'react';
import PropTypes from 'prop-types';
import crypto from 'crypto';

import Modal from '../common/modal';
import { BondedTokenUtils } from 'bonded-token';


export default class AddEthAddress extends Component {
  // static propTypes = {
  //   account: PropTypes.string,
  //   user: PropTypes.object
  // }

  constructor(props, context) {
    super(props, context);
    this.state = {
      modal: true,
    };

    this.renderModal = this.renderModal.bind(this);
    this.addKey = this.addKey.bind(this);
  }

  async addKey() {
    try {
      let salt = crypto.randomBytes(16).toString('hex');
      const msgParams = [{
        type: 'string',
        name: 'Message',
        value: 'Connect Ethereum address to the Relevant account ' + salt
      }];
      web3.currentProvider.sendAsync({
        method: 'eth_signTypedData',
        params: [msgParams, this.props.account],
        from: this.props.account,
      }, (err, msg) => {
        if (err || msg.error) return;
        this.props.actions.addEthAddress(msgParams, msg.result, this.props.account);
      });
    } catch (err) {
      console.log('failed signing message ', err);
    }
  }

  renderModal() {
    let footer = (
      <button className="shadowButton"
        onClick={this.addKey}
      >
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
          <p>Connect your Ethereum address to your Relevant account in order to start earning rewards</p>
          <div className="smallInfo">
            <p>-This is not a transaction and is totally free-</p>
          </div>
          {footer}
        </div>
      </Modal>
    );
  }


  render() {
    let { user, connectedAccount, account } = this.props;
    if (user && !connectedAccount && account && !user.ethAddress[0] || this.props.connectAccount) {
      return this.renderModal();
    }
    return null;
  }
}
