import React, { Component } from 'react';
import {
  StyleSheet,
  ListView,
  View
} from 'react-native';
import { globalStyles, fullWidth } from '../../styles/global';
import UserName from '../userNameSmall.component';

let styles;

export default class UserSearchComponent extends Component {

  renderRow(rowData) {
    return (
      <View style={{ padding: 5 }}>
        <UserName
          user={rowData}
          setSelected={this.props.setSelected}
        />
      </View>
    );
  }

  render() {
    const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    let dataSource = ds.cloneWithRows(this.props.users);

    return (
      <ListView
        automaticallyAdjustContentInsets={false}
        keyboardShouldPersistTaps
        contentContainerStyle={{ backgroundColor: 'white' }}
        style={{ height: 100 }}
        dataSource={dataSource}
        renderRow={rowData => this.renderRow(rowData)}
      />
    );
  }
}
