import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableHighlight,
} from 'react-native';
import { globalStyles } from '../styles/global';
import * as utils from '../utils';
import Percent from '../components/percent.component';

let styles;

class DiscoverUser extends Component {
  constructor(props, context) {
    super(props, context);
    this.setSelected = this.setSelected.bind(this);
    this.abbreviateNumber = this.abbreviateNumber.bind(this);
  }

  componentWillMount() {
    if (!this.props.stats[this.props.user._id]) {
      this.props.actions.getStats(this.props.user._id);
    }
  }

  abbreviateNumber(num) {
    let fixed = 0;
    if (num === null) { return null; };
    if (num === 0) { return '0'; };
    if (typeof num !== 'number') num = Number(num);
    fixed = (!fixed || fixed < 0) ? 0 : fixed;
    let b = (num).toPrecision(2).split('e');
    let k = b.length === 1 ? 0 : Math.floor(Math.min(b[1].slice(1), 14) / 3);
    let c = k < 1 ? num.toFixed(0 + fixed) : (num / Math.pow(10, k * 3) ).toFixed(1 + fixed);
    let d = c < 0 ? c : Math.abs(c);
    let e = d + ['', 'K', 'M', 'B', 'T'][k];
    return e;
  }

  setSelected() {
    this.props.navigator.goToProfile(this.props.user);
  }

  render() {
    const user = this.props.user;
    let image = null;
    let imageEl = null;
    let percent = 0;
    let percentEl = null;
    let relevanceEl = null;
    let oldRel = null;
    let spacer = null;
    const relevance = user.relevance || 0;

    if (user.image) {
      image = user.image;
      imageEl = (<Image style={styles.discoverAvatar} source={{ uri: image }} />);
    } else {
      image = require('../assets/images/default_user.jpg');
      imageEl = (<Image style={styles.discoverAvatar} source={image} />);
    }

    if (user.relevance) {
      relevanceEl = (
        <Text>📈
          <Text
            style={[styles.bebas, styles.quarterLetterSpacing]}
          >
            {this.abbreviateNumber(user.relevance)}
          </Text>
        </Text>);
    }

    if (user.relevance && user.balance) spacer = (<Text>&nbsp;•&nbsp;</Text>);

    return (
      <TouchableHighlight style={{ flex: 1 }} underlayColor={'transparent'} onPress={() => this.setSelected()}>
        <View style={[styles.discoverUser]}>
          <View style={[styles.leftDiscoverUser]}>
            {imageEl}
            <Text style={[styles.font17, styles.darkGray, styles.bebas]}>{user.name}</Text>
          </View>
          <View style={[styles.rightDiscoverUser]}>
            <Text style={[styles.font17]}>
              <Percent user={user} />
            </Text>
            {spacer}
            <Text style={[styles.font17]}>
              {relevanceEl}
            </Text>
          </View>
        </View>
      </TouchableHighlight>
    );
  }
}

export default DiscoverUser;

const localStyles = StyleSheet.create({
  discoverAvatar: {
    height: 25,
    width: 25,
    borderRadius: 12.5,
    marginRight: 5,
    marginLeft: 0
  },
  discoverUser: {
    flex: 1,
    flexDirection: 'row',
    paddingTop: 10,
    paddingRight: 10,
    paddingBottom: 10,
    paddingLeft: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#242425',
    height: 78,
    backgroundColor: 'white'
  },
  leftDiscoverUser: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'flex-start'
  },
  rightDiscoverUser: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexDirection: 'row',
  }
});

styles = { ...localStyles, ...globalStyles };

