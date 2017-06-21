import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity
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
    this.initTooltips = this.initTooltips.bind(this);
    this.toggleTooltip = this.toggleTooltip.bind(this);
    this.tooltipParent = {};
  }

  componentDidMount() {
    if (this.props.type === 'nav' && this.props.discover) {
      this.tooltipParent.topics = this.props.parent.title;
      setTimeout(() => this.initTooltips(), 1000);
    }
  }

  initTooltips() {
    ['relevance', 'coin', 'topics', 'earnings'].forEach(name => {
      this.props.actions.setTooltipData({
        name,
        toggle: () => this.toggleTooltip(name)
      });
    });
  }

  toggleTooltip(name) {
    if (this.props.type !== 'nav') return;
    if (!this.tooltipParent[name]) return;
    this.tooltipParent[name].measureInWindow((x, y, w, h) => {
      let parent = { x, y, w, h };
      if (x + y + w + h === 0) return;
      this.props.actions.setTooltipData({
        name,
        parent
      });
      this.props.actions.showTooltip(name);
    });
  }

  render() {
    let { type, entity } = this.props;
    let smallScreen = fullWidth <= 320 || false;

    let statsStyle = [
      { fontSize: 17, lineHeight: 17 },
      styles.bebas,
      styles.quarterLetterSpacing,
    ];
    let iconStyle = [];
    let coinStyle = [];

    if (this.props.size === 'small' || (smallScreen && type === 'nav')) {
      statsStyle = [{ fontSize: 15, lineHeight: 15 }, styles.bebas, styles.quarterLetterSpacing];
      iconStyle = [{ width: 15, height: 15 }];
      coinStyle = [{ width: 15, height: 15 }];
    }
    if (this.props.size === 'tiny') {
      statsStyle = [{ fontSize: 13, lineHeight: 13 }, styles.bebas, styles.quarterLetterSpacing];
      iconStyle = [{ width: 14, height: 14 }];
      // coinStyle = [{ width: 18, height: 15, marginBottom: -6 }];
    }

    let value = (
      <TouchableOpacity
        ref={(c) => this.tooltipParent.coin = c}
        onPress={() => this.toggleTooltip('coin')}
        style={styles.statInner}
      >
        <Image
          resizeMode={'contain'}
          style={[styles.coin, ...coinStyle]}
          source={require('../../assets/images/relevantcoin.png')}
        />
        <Text style={[this.props.textStyle, statsStyle, styles.darkGrey]}>
          {numbers.abbreviateNumber(entity.value || entity.balance || 0)}
        </Text>
      </TouchableOpacity>
    );

    let percent = <View style={styles.statInner}><Percent fontSize={17} user={entity} /></View>;

    let relevance = (
      <TouchableOpacity
        ref={(c) => this.tooltipParent.relevance = c}
        onPress={() => this.toggleTooltip('relevance')}
        style={styles.statInner}
      >
        <Image
          resizeMode={'contain'}
          style={[styles.r, ...iconStyle]}
          source={require('../../assets/images/r.png')}
        />
        <Text style={[this.props.textStyle, statsStyle, styles.darkGrey]}>
          {numbers.abbreviateNumber(entity.relevance)}
        </Text>
      </TouchableOpacity>
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

    let br = <View style={styles.statInner}><Text style={statsStyle}> • </Text></View>;

    return (
      <View
        style={[styles.stats, this.props.style]}
      >
        {getLeft()}
        {getLeft() && !this.props.renderLeft ? br : null}
        {getRight()}
      </View>
    );
  }
}

let localStyles = StyleSheet.create({
  stats: {
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    flexDirection: 'row',
  },
  statInner: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
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
  (state) => ({
    auth: state.auth,
  }),
  mapDispatchToProps
)(Stats);
