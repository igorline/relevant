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
  }

  setSelected(id) {
    var self = this;
    if (id == self.props.auth.user._id) {
      self.props.navigator.replace('profile');
    } else {
      self.props.actions.getSelectedUser(id).then(function(results) {
        if (results) {
          self.props.navigator.resetTo('user');
        }
      })
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
    if (self.props.stats) {
      if (self.props.stats[user._id]) {
        var val = self.props.stats[user._id].value;
        var relevance = user.relevance || 0;
        if (relevance > 0) {
          //console.log(val, relevance, typeof val, typeof relevance)
          var change = val / relevance;
          percent = Math.round((1 - change)*100);
          // console.log(percent)
          if (percent == 0) {
            percentEl = (<Text style={[{textAlign: 'right'}, styles.active]}>no change</Text>);
          } else if (percent > 0) {
            percentEl = (<Text style={{color: '#009933', fontWeight: '600', textAlign: 'right'}}>⬆️{percent}%</Text>);
          } else if (percent < 0) {
            percentEl = (<Text style={{color: 'red', fontWeight: '600', textAlign: 'right'}}>⬇️{percent}%</Text>);
          }
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






