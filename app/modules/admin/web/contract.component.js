import React, { Component } from 'react';
import PropTypes from 'prop-types';
// import { numbers } from 'app/utils';
// import Eth from 'modules/web_ethTools/eth.context';
import { View, Title, BodyText, SecondaryText } from 'modules/styled/uni';
// import { initDrizzle } from 'app/utils/eth';

import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { actions as _web3Actions } from 'redux-saga-web3';
import { actions as tokenActions, types, tokenAddress, selectors } from 'core/contracts';
import { initProvider, getBN } from 'modules/web_ethTools/utils';

const ContractParams = styled.table`
  margin-top: 10px;
  margin-left: 20px;
`;

const web3 = initProvider();

// TODO -- Delete demo and call only desired methods
const readableMethods = Object.keys(types.methods).filter(
  method => !types.methods[method].send
);

const parseBN = value =>
  value && value.get ? getBN(web3, value.get('_hex')).toString() : value;

export class Contract extends Component {
  static propTypes = {
    contextStatus: PropTypes.string,
    web3Actions: PropTypes.object,
    contractActions: PropTypes.object,
    cachedMethods: PropTypes.object
  };

  static contextTypes = {
    store: PropTypes.object
  };

  state = {
    buyAmount: '',
    rewardsAmount: ''
  };

  componentWillMount() {
    const { contextStatus, web3Actions } = this.props;
    if (contextStatus !== 'WEB3_SET') {
      web3Actions.setContext(web3);
    }
  }

  componentDidMount() {
    const { contextStatus, web3Actions } = this.props;
    if (contextStatus === 'WEB3_SET') {
      web3Actions.init();
    }
    // initDrizzle(this.context.store);
    this.props.contractActions.demoContractActions();
  }

  render() {
    // const fixed = n => numbers.abbreviateNumber(n, 2);
    const { cachedMethods } = this.props;
    return (
      <View m={4}>
        <Title>Contract Params</Title>
        <View>
          <View>
            <SecondaryText>Some Data:</SecondaryText>
            <BodyText>
              <ContractParams>
                <tbody>
                  <tr>
                    <td>Metdod</td>
                    <td>value</td>
                  </tr>
                  <hr />
                  {cachedMethods.decimals &&
                    cachedMethods.decimals.value &&
                    readableMethods.map(method => (
                      <tr key={method}>
                        <td>{method}: </td>
                        <td>
                          {cachedMethods[method] && parseBN(cachedMethods[method].value)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </ContractParams>
            </BodyText>
          </View>
        </View>
      </View>
    );
  }
}

const mapStateToProps = state => ({
  cachedMethods: {
    decimals: selectors.methods.decimals({ at: tokenAddress })(state),
    name: selectors.methods.name({ at: tokenAddress })(state),
    targetRound: selectors.methods.targetRound({ at: tokenAddress })(state),
    totalSupply: selectors.methods.totalSupply({ at: tokenAddress })(state),
    initRoundReward: selectors.methods.initRoundReward({ at: tokenAddress })(state),
    timeConstant: selectors.methods.timeConstant({ at: tokenAddress })(state)
  },
  contextStatus: state.web3 && state.web3.context ? state.web3.context.status : null,
  isInitialized: state.web3.init.isInitialized,
  accounts: state.web3.accounts,
  network: state.web3.network
});

const mapDispatchToProps = dispatch => ({
  web3Actions: {
    setContext(provider) {
      dispatch(_web3Actions.context.setRequest(provider));
    },
    init() {
      dispatch(_web3Actions.init.init());
      // dispatch(_web3Actions.blocks.subscribeNewHeaders({ fromBlock: 4417457 }));
    }
  },
  contractActions: {
    // TODO -- Delete demo and call only desired methods
    demoContractActions() {
      if (readableMethods.length > 6) {
        readableMethods
        .slice(0, 6)
        .forEach(method =>
          dispatch(tokenActions.methods[method]({ at: tokenAddress }).call())
        );
      }
    }
  }
});

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(
    Contract
    // (props => (
    //   <Eth.Consumer>{wallet => <Contract wallet={wallet} {...props} />}</Eth.Consumer>
    // )
  )
);
