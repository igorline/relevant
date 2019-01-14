import React, { Component } from 'react';
import { StyleSheet, View, TouchableHighlight, Text } from 'react-native';
import PropTypes from 'prop-types';
import { globalStyles, mainPadding } from 'app/styles/global';
import Stats from 'modules/stats/mobile/stats.component';
import UserName from 'modules/user/mobile/avatar.component';
import TextBody from 'modules/text/mobile/textBody.component';

let styles;

class DiscoverUser extends Component {
  static propTypes = {
    type: PropTypes.string,
    user: PropTypes.object,
    actions: PropTypes.object,
    topic: PropTypes.string,
    renderRight: PropTypes.func,
    bio: PropTypes.bool,
    relevance: PropTypes.number
  };

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
    const { user } = this.props;
    if (!user) return null;
    const relevance = this.props.topic
      ? user[this.props.topic + '_relevance']
      : user.relevance;

    const stats = (
      <Stats
        type={'percent'}
        topic={this.props.topic}
        entity={user}
        renderLeft={this.props.topic ? <Text /> : null}
      />
    );
    const right = this.props.renderRight ? this.props.renderRight() : stats;

    const bioEl = (
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
              user={{ ...user, relevance }}
              setSelected={this.setSelected}
              // topic={{ topic: this.props.topic, relevance }}
            />
            <View
              style={{
                flex: 1,
                alignItems: 'flex-end',
                justifyContent: 'center'
              }}
            >
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
    marginLeft: 51
  },
  discoverBio: {
    fontFamily: 'Georgia',
    fontSize: 30 / 2,
    lineHeight: 40 / 2,
    paddingTop: 15,
    paddingBottom: 5
  },
  discoverUser: {
    flex: 1,
    flexDirection: 'row'
  },
  discoverUserContainer: {
    paddingVertical: 20,
    paddingHorizontal: mainPadding,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#242425'
  }
});

styles = { ...localStyles, ...globalStyles };
