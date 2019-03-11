import React, { Component } from 'react';
import { ListView, View } from 'react-native';
import PropTypes from 'prop-types';
import UserName from 'modules/user/avatarbox.component';

export default class UserSearchComponent extends Component {
  static propTypes = {
    setSelected: PropTypes.func,
    users: PropTypes.array
  };

  renderRow(rowData) {
    return (
      <View style={{ padding: 5, flex: 1 }}>
        <UserName user={rowData} setSelected={this.props.setSelected} />
      </View>
    );
  }

  render() {
    const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    const dataSource = ds.cloneWithRows(this.props.users);

    return (
      <ListView
        automaticallyAdjustContentInsets={false}
        keyboardShouldPersistTaps={'always'}
        contentContainerStyle={{ backgroundColor: 'white' }}
        style={[{ flex: 1 }]}
        dataSource={dataSource}
        renderRow={rowData => this.renderRow(rowData)}
      />
    );
  }
}
