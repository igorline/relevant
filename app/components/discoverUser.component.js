import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableHighlight,
} from 'react-native';
import { globalStyles, fullWidth, fullHeight } from '../styles/global';

class DiscoverUser extends Component {
  constructor (props, context) {
    super(props, context)
    this.setSelected = this.setSelected.bind(this);
    this.state = {
    }
  }

  componentDidMount() {
    const self = this;
    if (!this.props.stats[this.props.user._id]) self.props.actions.getStats(self.props.user._id);
  }

  componentWillReceiveProps(next) {
    // console.log(next)
  }

  setSelected() {
    let user = this.props.user;
    this.props.actions.setSelectedUser(user._id);
    this.props.navigator.push({
      key: 'profile',
      title: user.name,
      back: true,
      id: user._id,
    });
  }

  render() {
    const self = this;
    const parentStyles = this.props.styles;
    const user = self.props.user;
    const styles = { ...localStyles, ...parentStyles };
    let image = null;
    let imageEl = null;
    let percent = 0;
    let percentEl = null;
    let relevanceEl = null;
    let oldRel = null;
    const relevance = user.relevance || 0;
    if (self.props.stats) {
      if (self.props.stats[user._id]) {
        oldRel = self.props.stats[user._id].startAmount;
        let change = oldRel / relevance;
        if (relevance) percent = Math.round((1 - change) * 100);

        if (percent === 0) {
          percentEl = (<Text style={[{ textAlign: 'right' }, styles.active]}>no change</Text>);
        } else if (percent > 0) {
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
      relevanceEl = (<Text>📈<Text style={styles.active}>{user.relevance ? user.relevance.toFixed(2) : null}</Text></Text>);
    } else {
      relevanceEl = null;
    }

    return (
      <TouchableHighlight underlayColor={'transparent'} onPress={() => self.setSelected()}>
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
