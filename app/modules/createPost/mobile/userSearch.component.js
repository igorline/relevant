import React, { Component } from 'react';
import { View, FlatList } from 'react-native';
import PropTypes from 'prop-types';
import UserName from 'modules/user/avatarbox.component';

export default class UserSearchComponent extends Component {
  static propTypes = {
    setSelected: PropTypes.func,
    users: PropTypes.array
  };

  renderRow({ item }) {
    return (
      <View style={{ padding: 5, flex: 1 }}>
        <UserName user={item} setSelected={this.props.setSelected} />
      </View>
    );
  }

  render() {
    return (
      <FlatList
        automaticallyAdjustContentInsets={false}
        keyboardShouldPersistTaps={'always'}
        contentContainerStyle={{ backgroundColor: 'white' }}
        style={[{ flex: 1 }]}
        keyExtractor={item => item._id}
        data={this.props.users}
        renderItem={rowData => this.renderRow(rowData)}
      />
    );
  }
}
