import React, { Component } from 'react';
import {
  ListView,
  RefreshControl,
  View
} from 'react-native';
import { globalStyles, fullWidth } from '../styles/global';
import CustomSpinner from '../components/CustomSpinner.component';

let styles = { ...globalStyles };

export default class ActivityView extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      reloading: false
    };
    this.reload = this.reload.bind(this);
    this.loadMore = this.loadMore.bind(this);
    this.dataSource = null;
    this.lastReload = 0;
  }

  componentWillMount() {
    this.updateData(this.props.data);
  }

  componentWillReceiveProps(next) {
    if (this.props.data !== next.data) {
      this.updateData(next.data);
      this.setState({ reloading: false });
      this.setState({ loading: false });
    }

    if (next.active && next.needsReload > this.lastReload) {
      let ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
      this.dataSource = ds.cloneWithRows([]);
      this.props.load(this.props.view, 0);
      this.lastReload = new Date().getTime();
    }
  }

  updateData(data) {
    let ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    this.dataSource = ds.cloneWithRows(data);
  }

  reload() {
    if (this.state.loading || this.state.reloading) return;
    this.lastReload = (new Date()).getTime();
    this.setState({ reloading: true });
    this.props.load(this.props.view, 0);
  }

  loadMore() {
    if (!this.props.active) return;
    if (this.state.loading || this.state.reloading) return;
    this.setState({ loading: true });
    this.props.load(this.props.view, this.props.data.length);
  }

  render() {
    let activityEl;

    if (this.dataSource) {
      activityEl = (
        <ListView
          ref={(c) => { this.listview = c; }}
          enableEmptySections
          removeClippedSubviews={false}
          pageSize={2}
          initialListSize={3}
          scrollEventThrottle={16}
          dataSource={this.dataSource}
          renderRow={this.props.renderRow}
          contentInset={{ top: this.props.YOffset || 0 }}
          contentOffset={{ y: -this.props.YOffset || 0 }}
          contentContainerStyle={{
            position: 'absolute',
            top: 0,
            flex: 1,
            width: fullWidth
          }}
          onScroll={this.props.onScroll}
          onEndReached={this.loadMore}
          onEndReachedThreshold={100}
          refreshControl={
            <RefreshControl
              refreshing={this.state.reloading}
              onRefresh={this.reload}
              tintColor="#000000"
              colors={['#000000', '#000000', '#000000']}
              progressBackgroundColor="#ffffff"
            />
          }
        />
      );
    }

    return (
      <View style={this.props.active ? { flex: 1 } : { flex: 0 }}>
        {activityEl}
        <CustomSpinner visible={!this.dataSource && this.props.active} />
      </View>
    );
  }
}
