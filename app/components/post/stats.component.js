import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
} from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { globalStyles, fullWidth } from '../../styles/global';
import Percent from '../percent.component';
import { numbers } from '../../utils';
import * as navigationActions from '../../actions/navigation.actions';

let styles;

class Stats extends Component {
  constructor(props, context) {
    super(props, context);
    this.toggleTooltip = this.toggleTooltip.bind(this);
  }

  componentDidMount() {
    if (this.props.auth.user &&
      this.props.auth.user.onboarding === 0 &&
      this.props.type === 'nav') {
      this.tooltipTimeout = setTimeout(() => this.toggleTooltip(), 1000);
    }
  }

  toggleTooltip() {
    if (this.props.type !== 'nav') return;
    let tooltipContent = (<Text>
      This is your relevance:{' '}
      <Text style={[styles.bebas]}>
        <Image
          style={[styles.r, { marginBottom: -2 }]}
          source={require('../../assets/images/r.png')}
        />
        {numbers.abbreviateNumber(this.props.entity.relevance)}
      </Text>
      {'\n\n'}
      As your relevance grows, you will become more influential and your upvotes will have more value
      {'\n\n'}
      To get started, upvote a post
      {'\n\n\n'}
      <Image
        resizeMode={'contain'}
        style={{ width: 100, height: 60, marginTop: 0 }}
        source={require('../../assets/images/upvote.jpg')}
      />
    </Text>);

    this.tooltipData = {
      vertical: 'bottom',
      horizontal: 'right',
      horizontalOffset: -5,
      name: 'coin',
      verticalOffset: 10,
      text: tooltipContent,
    };

    clearTimeout(this.tooltipTimeout);
    if (this.tooltipParent) {
      this.tooltipParent.measureInWindow((x, y, w, h) => {
        let parent = { x, y, w, h };
        this.props.actions.showTooltip({
          ...this.tooltipData,
          parent
        });
      });
    } else {
      this.tooltipTimeout = setTimeout(() => this.toggleTooltip(), 1000);
    }
  }

  render() {
    let { type, entity } = this.props;
    let smallScreen = fullWidth <= 320 || false;

    let statsStyle = [{ fontSize: 17, lineHeight: 17 }, styles.bebas, styles.quarterLetterSpacing];
    let iconStyle = [];
    let coinStyle = [];

    if (this.props.size === 'small' || (smallScreen && type === 'nav')) {
      statsStyle = [{ fontSize: 15, lineHeight: 15 }, styles.bebas, styles.quarterLetterSpacing];
      iconStyle = [{ width: 15, height: 14.5, marginBottom: -4 }];
      coinStyle = [{ width: 18, height: 15, marginBottom: -6 }];
    }
    if (this.props.size === 'tiny') {
      statsStyle = [{ fontSize: 13, lineHeight: 13 }, styles.bebas, styles.quarterLetterSpacing];
      iconStyle = [{ width: 13, height: 13, marginBottom: -4 }];
      // coinStyle = [{ width: 18, height: 15, marginBottom: -6 }];
    }

    let value = (
      <Text onPress={() => this.toggleTooltip()}>
        <Image
          style={[styles.coin, ...coinStyle]}
          source={require('../../assets/images/relevantcoin.png')}
        />
        <Text>{numbers.abbreviateNumber(entity.value || entity.balance || 0)}</Text>
      </Text>);

    let percent = <Percent fontSize={17} user={entity} />;

    let relevance = (
      <Text onPress={() => this.toggleTooltip()}>
        <Image
          style={[styles.r, ...iconStyle]}
          source={require('../../assets/images/r.png')}
        />
        {numbers.abbreviateNumber(entity.relevance)}
      </Text>
    );

    let getLeft = () => {
      if (type === 'relevance') return null;
      if (type === 'value') return value;
      if (type === 'percent') return this.props.renderLeft || percent;
      if (type === 'nav') return value;
      return null;
    };

    let getRight = () => {
      if (type === 'value') return relevance;
      if (type === 'percent') return relevance;
      if (type === 'nav') return relevance;
      if (type === 'relevance') return relevance;
      return null;
    };


    return (
      <View
        style={[styles.stats, this.props.style]}
      >
        <View
          style={styles.statInner}
        >
          <Text style={statsStyle}>
            {getLeft()}
            {getLeft() && !this.props.renderLeft ? ' • ' : null}
          </Text>

        </View>
        <View
          ref={(c) => this.tooltipParent = c}
          style={styles.statInner}
        >
          <Text style={statsStyle}>
            {getRight()}
          </Text>
        </View>
      </View>
    );
  }
}

let localStyles = StyleSheet.create({
  stats: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexDirection: 'row',
  },
  statInner: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
  }
});

styles = { ...globalStyles, ...localStyles };

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      ...navigationActions,
    }, dispatch)
  };
}

export default connect(
  (state) => { return { auth: state.auth }; },
  mapDispatchToProps
)(Stats);
