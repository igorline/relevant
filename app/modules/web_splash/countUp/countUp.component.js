import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import CountUpThumb from './countUp.thumb.component';
import CountUpRelevant from './countUp.relevant.component';
import CountUpCoin from './countUp.coin.component';

export default class CountUp extends PureComponent {
  static propTypes = {
    type: PropTypes.string
  };

  render() {
    const { type, ...props } = this.props;
    switch (type) {
      case 'thumb':
        return <CountUpThumb {...props} />;
      case 'relevant':
        return <CountUpRelevant {...props} />;
      case 'coin':
        return <CountUpCoin {...props} />;
      default:
        return null;
    }
  }
}
