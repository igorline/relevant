import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  TouchableHighlight,
  Text
} from 'react-native';
import { globalStyles, mainPadding } from '../styles/global';
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
    if (this.props.type === 'invite') return;
    if (!this.props.user._id) return;
    this.props.actions.goToProfile(this.props.user);
  }

  render() {
    let user = this.props.user;
    if (!user) return null;
    let relevance = this.props.topic ? user[this.props.topic + '_relevance'] : user.relevance;
    let bioEl;

    let statsUser = { ...user, relevance };
    let stats = (<Stats
      type={'percent'}
      topic={this.props.topic}
      entity={user}
      renderLeft={this.props.topic ? <Text/> : null}
      // renderLeft={this.props.topic ? <Text style={[styles.bebas, styles.font17]}>{this.props.topic} </Text> : null}
    />);
    let right = this.props.renderRight ? this.props.renderRight() : stats;

    bioEl = (
      <View style={styles.bioContainer}>
        <TextBody
          actions={this.props.actions}
          style={[styles.discoverBio, styles.darkGrey]}
          numberOfLines={3}
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
              type={this.props.type}
              relevance={this.props.topic ? false : this.props.relevance}
              user={{...user, relevance}}
              setSelected={this.setSelected}
              // topic={{ topic: this.props.topic, relevance }}
            />
            <View style={{ flex: 1, alignItems: 'flex-end', justifyContent: 'center' }}>
              {right}
            </View>
          </View>
          {this.props.user.bio && this.props.bio ? bioEl : null}
        </View>
      </TouchableHighlight>
    );
  }
}

export default DiscoverUser;

const localStyles = StyleSheet.create({
  bioContainer: {
    marginLeft: 51,
  },
  discoverBio: {
    fontFamily: 'Georgia',
    fontSize: 30 / 2,
    lineHeight: 40 / 2,
    paddingTop: 15,
    paddingBottom: 5,
    // textAlign: 'right'
  },
  discoverUser: {
    flex: 1,
    flexDirection: 'row',
  },
  discoverUserContainer: {
    paddingVertical: 20,
    paddingHorizontal: mainPadding,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#242425',
    // backgroundColor: 'white'
  }
});

styles = { ...localStyles, ...globalStyles };

