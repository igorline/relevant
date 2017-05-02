import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  TouchableHighlight,
  Text
} from 'react-native';
import { globalStyles } from '../styles/global';
import Stats from '../components/post/stats.component';
import UserName from './userNameSmall.component';
import TextBody from './post/textBody.component';

let styles;

class DiscoverUser extends Component {
  constructor(props, context) {
    super(props, context);
    this.setSelected = this.setSelected.bind(this);
  }

  setSelected() {
    if (!this.props.user._id) return;
    this.props.actions.goToProfile(this.props.user);
  }

  render() {
    let user = this.props.user;
    let relevance = this.props.topic ? user[this.props.topic + '_relevance'] : user.relevance;
    let bioEl;

    let statsUser = { ...user, relevance };
    let stats = (<Stats
      type={'percent'}
      entity={statsUser}
      renderLeft={this.props.topic ? this.props.topic + '  ' : null}
    />);
    let right = this.props.renderRight ? this.props.renderRight() : stats;

    bioEl = (
      <View style={styles.bioContainer}>
        <TextBody
          style={styles.discoverBio}
          numberOfLines={2}
        >
          {this.props.user.bio}
        </TextBody>
      </View>
    );

    return (
      <TouchableHighlight
        underlayColor={'transparent'}
        onPress={() => this.setSelected()}
      >
        <View style={styles.discoverUserContainer}>
          <View style={[styles.discoverUser]}>
            <UserName
              bio
              big
              relevance={this.props.relevance}
              user={user}
              setSelected={this.setSelected}
            />
            {right}
          </View>
          {this.props.user.bio ? bioEl : null}
        </View>
      </TouchableHighlight>
    );
  }
}

export default DiscoverUser;

const localStyles = StyleSheet.create({
  bioContainer: {
    // borderTopWidth: StyleSheet.hairlineWidth,
    // borderTopColor: 'grey',
    marginLeft: 50,
  },
  discoverBio: {
    // marginTop: 5,
    fontFamily: 'Georgia',
    fontSize: 14,
    backgroundColor: 'white'
  },
  discoverUser: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'white'
  },
  discoverUserContainer: {
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#242425',
  }
});

styles = { ...localStyles, ...globalStyles };

