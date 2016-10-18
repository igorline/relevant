'use strict';
import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableHighlight,
  LinkingIOS
} from 'react-native';
import Button from 'react-native-button';
import { globalStyles, fullWidth, fullHeight } from '../styles/global';

class DiscoverUser extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
    }
  }

  componentDidMount() {
    var self = this;
    self.props.actions.getStats(self.props.user._id);
  }

  componentWillUpdate(next) {
  }

  setSelected(id) {
    var self = this;
    // if (id == self.props.auth.user._id) {
    //   // self.props.actions.clearSelectedUser();
    //   self.props.navigator.push({name: 'profile'});
    // } else {
    //   // self.props.actions.clearSelectedUser();
      self.props.actions.setSelectedUser(id);
      self.props.navigator.push({name: 'profile'});
    // }
  }

  renderHeader() {
    var self = this;
    var tags = null;
    var view = self.props.view.discover;
    var tagsEl = null;
    var id = null;
    if (self.props.posts.tag) id = self.props.posts.tag._id;
    if (self.props.posts.discoverTags) {
      tags = self.props.posts.discoverTags;
      if (tags.length > 0) {
        tagsEl = tags.map(function(data, i) {
          return (
            <Text style={[styles.tagBox, {backgroundColor: data._id == id ? '#007aff' : '#F0F0F0', color: data._id == id ? 'white' : '#808080'}]} onPress={data._id == id ? self.clearTag.bind(self) : self.setTag.bind(self, data)} key={i}>{data.name}</Text>
            )
        })
      }
    }
  }

  render() {
    var self = this;
    var parentStyles = this.props.styles;
    var user = self.props.user;
    var styles = {...localStyles, ...parentStyles};
    var image = null;
    var imageEl = null;
    var percent = 0;
    var percentEl = null;
    var oldRel = null;
    var relevance = user.relevance || 0;
    if (self.props.stats) {
      if (self.props.stats[user._id]) {
        var oldRel = self.props.stats[user._id].startAmount;
        var change = oldRel / relevance;
        percent = Math.round((1 - change) * 100);

        if (percent == 0) {
          percentEl = (<Text style={[{textAlign: 'right'}, styles.active]}>no change</Text>);
        } else if (percent > 0) {
          percentEl = (<Text style={[{textAlign: 'right'}, styles.active]}>⬆️{percent}%</Text>);
        } else if (percent < 0) {
          percentEl = (<Text style={{color: 'red', textAlign: 'right'}}>⬇️{percent}%</Text>);
        }
      }
    }
    if (user.image) {
      image = user.image;
      imageEl = (<Image style={styles.discoverAvatar} source={{uri: image}} />)
    }

    return (
      <TouchableHighlight underlayColor={'transparent'} onPress={self.setSelected.bind(self, user._id)}>
        <View style={[styles.discoverUser]}>
          <View style={[styles.leftDiscoverUser]}>
            {imageEl}
            <Text style={styles.darkGray}>{user.name}</Text>
          </View>
          <View style={styles.rightDiscoverUser}>
            <View>
              {percentEl}
            </View>
            <View>
              <Text>📈<Text style={styles.active}>{user.relevance ? user.relevance.toFixed(2) : null}</Text></Text>
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
    flexDirection: 'row',
    paddingTop: 10,
    paddingRight: 20,
    paddingBottom: 10,
    paddingLeft: 20,
    alignItems: 'center',
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






