import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
} from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { globalStyles } from '../../styles/global';
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
      this.props.auth.user.onboarding === 'coin' &&
      this.props.type === 'nav') {
      this.tooltipTimeout = setTimeout(() => this.toggleTooltip(), 1000);
    }
  }

  toggleTooltip() {
    this.tooltipData = {
      vertical: 'bottom',
      horizontal: 'right',
      horizontalOffset: -5,
      name: 'coin',
      verticalOffset: 10,
      text: 'We started you out with 10\nrelevance points. Use them\nto upvote something relevant.'
    };
    if (this.props.auth.user && this.props.auth.user.onboarding !== 'coin') {
      this.tooltipData.text = 'This is your relevance,\nevery time you upvote\nsomethingyou loose 1 point';
      if (this.props.auth.user.relevance < 10) {
        this.tooltipData.text = 'Don\'t worry, you\nwill get more relevance\npoints tomorrow';
      }
    }

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

    let statsStyle = [{ fontSize: 17, lineHeight: 17 }, styles.bebas, styles.quarterLetterSpacing];
    let iconStyle = [];

    if (this.props.size === 'small') {
      statsStyle = [{ fontSize: 17, lineHeight: 17 }, styles.bebas, styles.quarterLetterSpacing];
      iconStyle = [{ width: 16, height: 15 }];
    }

    let value = (
      <Text onPress={() => this.toggleTooltip()}>
        <Image
          style={[styles.coin, ...iconStyle]}
          source={require('../../assets/images/r.png')}
        />
        <Text>{numbers.abbreviateNumber(entity.value || entity.balance || 0)}</Text>
      </Text>);

    let percent = <Percent user={entity} />;

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
      if (type === 'value') return null;
      if (type === 'percent') return percent;
      if (type === 'nav') return null;
      return null;
    };

    let getRight = () => {
      if (type === 'value') return relevance;
      if (type === 'percent') return relevance;
      if (type === 'nav') return relevance;
      return null;
    };


    return (
      <View
        style={styles.stats}
      >
        <View
          style={styles.statInner}
        >
          <Text style={statsStyle}>
            {getLeft()}
            {getLeft() ? ' • ' : null}
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
