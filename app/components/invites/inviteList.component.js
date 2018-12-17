import React, { Component } from 'react';
import { StyleSheet, Text, TouchableHighlight, Alert } from 'react-native';
import PropTypes from 'prop-types';
import { globalStyles } from '../../styles/global';
import UserList from '../common/userList.component';
import DiscoverUser from '../discoverUser.component';

let styles;

export default class InviteList extends Component {
  static propTypes = {
    inviteList: PropTypes.array,
    invites: PropTypes.object,
    actions: PropTypes.object
  };

  constructor(props, context) {
    super(props, context);
    this.renderRow = this.renderRow.bind(this);
    this.renderRight = this.renderRight.bind(this);
    this.sendInvite = this.sendInvite.bind(this);
    this.getViewData = this.getViewData.bind(this);
  }

  getViewData() {
    const data = this.props.inviteList.map(id => this.props.invites[id]);
    const loaded = true;
    return {
      data,
      loaded
    };
  }

  sendInvite(invite) {
    if (invite.status) {
      Alert.alert(
        'Are you sure you want to send another invitation email?',
        null,
        [
          { text: 'Cancel', onPress: () => null, style: 'cancel' },
          { text: 'Send Email', onPress: () => this.props.actions.sendInvitationEmail(invite._id) }
        ],
        { cancelable: true }
      );
    } else {
      this.props.actions.sendInvitationEmail(invite._id);
    }
  }

  renderRow(rowData) {
    const user = rowData;
    if (!user || !user._id) return null;
    let userEl = {
      _id: user.email,
      name: user.name,
      bio: user.status
    };

    // if user has registered, use their profile
    let type = 'invite';
    if (user.registeredAs) {
      userEl = user.registeredAs;
      type = null;
    }

    return (
      <DiscoverUser
        relevance={false}
        user={userEl}
        type={type}
        {...this.props}
        renderRight={() => this.renderRight(rowData)}
      />
    );
  }

  renderRight(props) {
    if (props.status === 'registered' || props.redeemed) {
      return (
        <Text style={[styles.bebas, styles.votes, { alignSelf: 'flex-end' }]}>Registered</Text>
      );
    }
    const inner = (
      <TouchableHighlight
        underlayColor={'transparent'}
        style={[styles.button, { alignSelf: 'flex-end' }]}
        onPress={() => this.sendInvite(props)}
      >
        <Text style={[styles.bebas, styles.votes]}>Send Reminder Email</Text>
      </TouchableHighlight>
    );
    return inner;
  }

  render() {
    return (
      <UserList
        getViewData={this.getViewData}
        renderRow={this.renderRow}
        getDataAction={() => null}
        type={'invite'}
      />
    );
  }
}

const localStyles = StyleSheet.create({
  votes: {
    alignSelf: 'center',
    fontSize: 17
  },
  button: {
    alignSelf: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderColor: 'grey',
    borderWidth: StyleSheet.hairlineWidth
  }
});

styles = { ...localStyles, ...globalStyles };
