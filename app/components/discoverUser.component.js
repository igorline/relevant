'use strict';
import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableHighlight,
  LinkingIOS
} from 'react-native';
import { connect } from 'react-redux';
var Button = require('react-native-button');
import { bindActionCreators } from 'redux';
import * as authActions from '../actions/auth.actions';
import * as postActions from '../actions/post.actions';
import * as userActions from '../actions/user.actions';
require('../publicenv');
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
      self.props.routes.Profile();
    } else {
      self.props.actions.getSelectedUser(id, self.props.auth.token);
    }
  }

  render() {
    var self = this;
    var parentStyles = this.props.styles;
    var user = self.props.user;
    var styles = {...localStyles, ...parentStyles};
    var image = null;
    var imageEl = null;
    if (user.image) {
      image = user.image;
      imageEl = (<Image style={styles.discoverAvatar} source={{uri: image}} />)
    }


    return (
      <TouchableHighlight onPress={self.setSelected.bind(self, user._id)}>
        <View style={[styles.row, styles.discoverUser]}>
          <View style={[styles.row, styles.leftDiscoverUser]}>
            {imageEl}
            <Text>{user.name}</Text>
          </View>
          <View stlye={styles.rightDiscoverUser}>
            <Text style={styles.active}>{user.relevance}</Text>
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
    marginRight: 10
  },
  discoverUser: {
    paddingBottom: 20,
    paddingLeft: 20,
    paddingRight: 20,
    alignItems: 'center',
  },
  leftDiscoverUser: {
    alignItems: 'center',
    flex: 1
  },
  rightDiscoverUser: {
    flex: 1
  }
});






