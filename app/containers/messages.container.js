'use strict';

import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ListView,
} from 'react-native';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as authActions from '../actions/auth.actions';
import * as postActions from '../actions/post.actions';
import * as tagActions from '../actions/tag.actions';
import * as userActions from '../actions/user.actions';
import * as messageActions from '../actions/message.actions';
import { globalStyles, fullWidth, fullHeight } from '../styles/global';

const localStyles = StyleSheet.create({
  postsHeader: {
    padding: 10
  },
  uploadAvatar: {
    height: 100,
    width: 100,
    resizeMode: 'cover'
  },
  profileContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    backgroundColor: 'white',
  },
  insideRow: {
    flex: 1,
  },
  insidePadding: {
    paddingLeft: 10,
    paddingRight: 10
  },
  pictureWidth: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  message: {
    padding: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F0F0F0'
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'nowrap'
  },
});

let styles = { ...localStyles, ...globalStyles };

class Messages extends Component {
  constructor(props, context) {
    super(props, context);
    // this.renderMessageRow = this.renderMessageRow.bind(self)
    this.goToUser = this.goToUser.bind(this);
    let md = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    this.state = {
      messagesData: md
    };
  }

  componentDidMount() {
    const self = this;
    if (self.props.auth.user) self.props.actions.getMessages(self.props.auth.user._id);
    if (self.props.messages) {
      if (self.props.messages.index) {
        if (self.props.messages.index.length) {
          self.setState({ messagesData: self.state.messagesData.cloneWithRows(self.props.messages.index) });
        }
      }
    }
  }

  componentWillReceiveProps(next) {
    const self = this;
    if (next.messages.index != self.props.messages.index) {
      self.setState({ messagesData: self.state.messagesData.cloneWithRows(next.messages.index) });
    }
  }

  goToUser(user) {
    this.props.actions.setSelectedUser(user._id);
    this.props.navigator.push({
      key: 'profile',
      name: user.name,
      back: true,
      id: user._id,
    });
  }

  renderMessageRow(rowData) {
    var self = this;
    if (rowData.type === 'thirst') {
      return (<View style={styles.message}>
        <Text>
          <Text
            style={styles.active}
            onPress={() => self.goToUser(rowData.from)}
          >
            👅💦 {rowData.from.name}
          </Text>
          &nbsp;is thirsty 4 u:
        </Text>
        <Text>{rowData.text}</Text>
      </View>);
    } else {
      return (
        <Text>Message</Text>
      );
    }
  }

  render() {
    const self = this;
    let messagesEl = null;
    if (self.props.messages.index.length > 0) {
      messagesEl = (<ListView
        ref="messageslist"
        renderScrollComponent={props => <ScrollView {...props} />}
        dataSource={self.state.messagesData}
        renderRow={self.renderMessageRow.bind(self)}
      />);
    } else {
      messagesEl = (<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={[{ fontWeight: '500' }, styles.darkGray]}>No messages bruh</Text>
      </View>);
    }

    return (
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        {messagesEl}
      </View>
    );
  }
}

function mapStateToProps(state) {
  return {
    auth: state.auth,
    posts: state.posts,
    stats: state.stats,
    messages: state.messages,
    users: state.user,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      ...messageActions,
      ...authActions,
      ...postActions,
      ...userActions,
      ...tagActions,

    }, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Messages);
