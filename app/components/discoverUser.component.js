import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableHighlight,
} from 'react-native';
import { globalStyles } from '../styles/global';

let styles;

class DiscoverUser extends Component {
  constructor(props, context) {
    super(props, context);
    this.setSelected = this.setSelected.bind(this);
  }

  componentWillMount() {
    if (!this.props.stats[this.props.user._id]) {
      this.props.actions.getStats(this.props.user._id);
    }
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
    const relevance = user.relevance || 0;
    percentEl = (<Text style={[{ textAlign: 'right' }, styles.active]}>0%</Text>);
    if (this.props.stats) {
      if (this.props.stats[user._id]) {
        oldRel = this.props.stats[user._id].startAmount;
        let change = (relevance - oldRel) / oldRel;
        if (relevance) percent = Math.round(change * 100);
        if (percent > 0) {
          percentEl = (<Text style={[{ textAlign: 'right' }, styles.active]}>⬆️{percent}%</Text>);
        } else if (percent < 0) {
          percentEl = (<Text style={{ color: 'red', textAlign: 'right' }}>⬇️{percent}%</Text>);
        }
      }
    }

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
            style={styles.active}
          >
            {user.relevance ? user.relevance.toFixed(2) : null}
          </Text>
        </Text>);
    } else {
      relevanceEl = null;
    }

    return (
      <TouchableHighlight style={{ flex: 1, paddingBottom: 5 }} underlayColor={'transparent'} onPress={() => this.setSelected()}>
        <View style={[styles.discoverUser]}>
          <View style={[styles.leftDiscoverUser]}>
            {imageEl}
            <Text style={styles.darkGray}>{user.name}</Text>
          </View>
          <View style={[styles.rightDiscoverUser]}>
            <View>
              {percentEl}
            </View>
            <View>
              {relevanceEl}
            </View>
          </View>
        </View>
      </TouchableHighlight>
    );
  }
}

export default DiscoverUser;

const localStyles = StyleSheet.create({
  discoverAvatar: {
    height: 50,
    width: 50,
    borderRadius: 25,
    marginRight: 10,
    marginLeft: 0
  },
  discoverUser: {
    flex: 1,
    flexDirection: 'row',
    paddingTop: 10,
    paddingRight: 20,
    paddingBottom: 10,
    paddingLeft: 20,
  },
  leftDiscoverUser: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'flex-start'
  },
  rightDiscoverUser: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'flex-end'
  }
});

styles = { ...localStyles, ...globalStyles };

