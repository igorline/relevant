import React, { Component } from 'react';
import PropTypes from 'prop-types';
// import { numbers } from 'app/utils';
import Eth from 'modules/web_ethTools/eth.context';
import { View, Title, BodyText, SecondaryText } from 'modules/styled/uni';
import { initDrizzle } from 'app/utils/eth';

export class Contract extends Component {
  static propTypes = {
    wallet: PropTypes.object
  };

  static contextTypes = {
    store: PropTypes.object
  };

  state = {
    buyAmount: '',
    rewardsAmount: ''
  };

  componentDidMount() {
    initDrizzle(this.context.store);
  }

  render() {
    // const fixed = n => numbers.abbreviateNumber(n, 2);
    return (
      <View m={4}>
        <Title>Contract Params</Title>
        <View>
          <View>
            <SecondaryText>Some Data:</SecondaryText>
          </View>
          <BodyText>{JSON.stringify(this.props.wallet)}</BodyText>
        </View>
      </View>
    );
  }
}

export default props => (
  <Eth.Consumer>{wallet => <Contract wallet={wallet} {...props} />}</Eth.Consumer>
);
