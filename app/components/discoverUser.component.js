import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  TouchableHighlight,
} from 'react-native';
import { globalStyles } from '../styles/global';
import Stats from '../components/post/stats.component';
import UserName from './userNameSmall.component';

let styles;

class DiscoverUser extends Component {
  constructor(props, context) {
    super(props, context);
    this.setSelected = this.setSelected.bind(this);
  }

  setSelected() {
    this.props.navigator.goToProfile(this.props.user);
  }

  render() {
    let user = this.props.user;
    let relevance = this.props.topic ? user[this.props.topic + '_relevance'] : user.relevance;
    user = { ...user, relevance };

    return (
      <TouchableHighlight
        underlayColor={'transparent'}
        onPress={() => this.setSelected()}
      >
        <View style={[styles.discoverUser]}>
          <UserName
            big
            relevance={false}
            user={user}
            setSelected={this.setSelected}
          />
          <Stats
            type={'percent'}
            entity={user}
          />
        </View>
      </TouchableHighlight>
    );
  }
}

export default DiscoverUser;

const localStyles = StyleSheet.create({
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
  }
});

styles = { ...localStyles, ...globalStyles };

