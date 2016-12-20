import React, { Component } from 'react';
import {
  ListView,
  RefreshControl,
  View,
  Text,
  StyleSheet
} from 'react-native';
import { globalStyles, fullWidth, fullHeight } from '../styles/global';
import CustomSpinner from '../components/CustomSpinner.component';
import EmptyList from '../components/emptyList.component';

let styles;

export default class ActivityView extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      reloading: false,
      none: false,
    };
    this.height = fullHeight;
    this.reload = this.reload.bind(this);
    this.loadMore = this.loadMore.bind(this);
    this.dataSource = null;
    this.lastReload = 0;
    let ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    this.tpmDataSource = ds.cloneWithRows([]);
  }

  componentWillMount() {
    if (this.props.data && this.props.data.length) {
      this.updateData(this.props.data);
      this.lastReload = new Date().getTime();
    } else if (this.props.active) {
      this.props.load(this.props.view, 0);
      this.lastReload = new Date().getTime();
    }
  }

  componentWillReceiveProps(next) {
    if (this.props.data !== next.data) {
      this.updateData(next.data);
      this.setState({ reloading: false, loading: false });
      if (!next.data.length) this.setState({ none: true });
    }

    if (next.active && next.needsReload > this.lastReload) {
      this.dataSource = null;
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
    let length = 0;
    if (this.props.data) length = this.props.data.length;
    this.props.load(this.props.view, length);
  }

  render() {
    let listEl = null;
    let emptyEl = null;
    let spinnerEl = null;

    listEl = (
      <ListView
        ref={(c) => { this.listview = c; }}
        enableEmptySections
        removeClippedSubviews={false}
        pageSize={1}
        initialListSize={10}
        scrollEventThrottle={16}
        automaticallyAdjustContentInsets={false}
        stickyHeaderIndices={this.props.stickyHeaderIndices}
        dataSource={this.dataSource || this.tpmDataSource}
        renderRow={row => this.props.renderRow(row, this.props.view)}
        contentInset={{ top: this.props.YOffset || 0 }}
        contentOffset={{ y: -this.props.YOffset || 0 }}
        renderHeader={this.props.renderHeader}
        contentContainerStyle={{
          flex: 1,
          position: 'absolute',
          top: 0,
          width: fullWidth,
          backgroundColor: 'white'
        }}
        onScroll={this.props.onScroll}
        onEndReached={this.loadMore}
        onEndReachedThreshold={100}
        renderSeparator={this.props.renderSeparator}
        renderFooter={() => <View />}
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

    let listStyle = [];

    if (this.props.active) {
      listStyle = [styles.commonList, styles.vis];
    } else {
      listStyle = [styles.commonList, styles.hiddenList];
    }

    spinnerEl = (<CustomSpinner visible={!this.props.data.length && this.props.active} />);

    let type = 'data';
    if (this.props.type) type = this.props.type;

    if ((this.props.loaded && !this.props.data.length) || this.props.loaded === 0) {
      emptyEl = this.props.children || (
      <EmptyList
        visible
        emoji={'😔'}
        type={type}
      />);
      listEl = null;
      spinnerEl = null;
    }

    return (
      <View style={listStyle}>
        {listEl}
        {emptyEl}
        {spinnerEl}
      </View>
    );
  }
}

const localStyles = StyleSheet.create({
  vis: {
    flex: 1,
    width: fullWidth,
  },
  hiddenList: {
    flex: 0,
    height: 0,
    width: 0,
  },
  commonList: {
  }
});

styles = { ...localStyles, ...globalStyles };
