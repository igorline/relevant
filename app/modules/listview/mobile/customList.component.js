import React, { Component } from 'react';
import { ListView, RefreshControl, View, StyleSheet, Platform } from 'react-native';
import PropTypes from 'prop-types';
import { globalStyles, fullWidth, fullHeight } from 'app/styles/global';
import CustomSpinner from 'modules/ui/mobile/CustomSpinner.component';
import EmptyList from 'modules/ui/mobile/emptyList.component';
import ErrorComponent from 'modules/ui/mobile/error.component';

let styles;

export default class CustomListView extends Component {
  static propTypes = {
    data: PropTypes.array,
    active: PropTypes.bool,
    view: PropTypes.number,
    load: PropTypes.func,
    onReload: PropTypes.func,
    loaded: PropTypes.bool,
    headerData: PropTypes.object,
    parent: PropTypes.string,
    error: PropTypes.bool,
    scrollableTab: PropTypes.bool,
    YOffset: PropTypes.number,
    stickyHeaderIndices: PropTypes.array,
    onScroll: PropTypes.func,
    renderHeader: PropTypes.func,
    renderRow: PropTypes.func,
    children: PropTypes.object,
    type: PropTypes.string
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      reloading: false,
      none: false,
      page: 0
    };
    this.height = fullHeight;
    this.reload = this.reload.bind(this);
    this.loadMore = this.loadMore.bind(this);
    this.dataSource = null;
    this.lastReload = 0;
    const ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2
    });
    this.tpmDataSource = ds.cloneWithRows([]);
  }

  componentWillMount() {
    if (this.props.data && this.props.data.length) {
      this.updateData(this.props.data);
      this.lastReload = new Date().getTime();
    } else if (this.props.active) {
      this.props.load(this.props.view, 0);
      this.setState({ loading: true });
      this.lastReload = new Date().getTime();
    }
  }

  componentDidMount() {}

  componentWillReceiveProps(next) {
    if (this.props.data !== next.data) {
      this.updateData(next.data);
      clearTimeout(this.stateTimeout);
      this.stateTimeout = setTimeout(
        () => this.setState({ reloading: false, loading: false }),
        100
      );
      if (!next.data.length) this.setState({ none: true });
    } else {
      // need to update data either way for list to re-render
      this.updateData(this.props.data);
    }
    if (next.error) {
      this.setState({ reloading: false, loading: false });
    }

    if (next.active && next.needsReload > this.lastReload) {
      this.setState({ loading: true });
      this.props.load(this.props.view, 0);
      this.lastReload = new Date().getTime();
    }
  }

  shouldComponentUpdate(next) {
    if (!this.props.active && !next.active) return false;
    return true;
  }

  componentWillUnmount() {
    clearTimeout(this.stateTimeout);
  }

  updateData(data) {
    const ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2
    });
    this.dataSource = ds.cloneWithRows(data);
  }

  reload() {
    if (this.state.loading || this.state.reloading) return;
    this.setState({ reloading: true });
    this.lastReload = new Date().getTime();
    this.props.load(this.props.view, 0);
    if (this.props.onReload) this.props.onReload();
  }

  loadMore() {
    if (this.props.loaded && !this.props.data.length) return;
    if (!this.props.active) return;
    if (this.state.loading || this.state.reloading) return;
    this.setState({ loading: true });
    let length = 0;
    if (this.props.data) length = this.props.data.length;
    this.props.load(this.props.view, length);
  }

  render() {
    const { data, active, headerData } = this.props;
    let listEl = null;
    let emptyEl = null;
    let spinnerEl = <CustomSpinner visible={!data.length && active && !headerData} />;

    let listStyle = [styles.commonList, styles.hiddenList];

    if (this.props.active || this.props.scrollableTab) {
      listStyle = [styles.commonList, styles.vis];
    }

    let type = 'data';
    if (this.props.type) type = this.props.type;

    if (this.props.loaded) spinnerEl = null;

    if (this.props.loaded && !this.props.data.length) {
      emptyEl = (
        <EmptyList visible emoji={'😶'} type={type} YOffset={this.props.YOffset}>
          {this.props.children}
        </EmptyList>
      );
      if (this.props.parent !== 'profile') listEl = null;
    }

    listEl = (
      <ListView
        ref={c => {
          this.listview = c;
        }}
        enableEmptySections
        removeClippedSubviews
        pageSize={1}
        initialListSize={10}
        scrollEventThrottle={10}
        automaticallyAdjustContentInsets={false}
        stickyHeaderIndices={this.props.stickyHeaderIndices}
        dataSource={this.dataSource || this.tpmDataSource}
        renderRow={(row, s, i) => this.props.renderRow(row, this.props.view, i)}
        contentInset={{ top: this.props.YOffset || 0 }}
        contentOffset={{ y: -this.props.YOffset || 0 }}
        renderHeader={this.props.renderHeader}
        contentContainerStyle={{
          paddingTop: Platform.OS === 'android' ? this.props.YOffset : 0,
          backgroundColor: 'white'
        }}
        style={{
          flex: 0.5,
          width: fullWidth,
          backgroundColor: 'white'
        }}
        keyboardShouldPersistTaps={'always'}
        keyboardDismissMode={'on-drag'}
        onScroll={e => {
          if (this.props.onScroll) {
            this.props.onScroll(e, this.props.view || 0);
          }
        }}
        onEndReached={this.loadMore}
        onEndReachedThreshold={100}
        renderFooter={() => emptyEl}
        refreshControl={
          <RefreshControl
            // key={this.props.needsReload}
            style={[
              { backgroundColor: 'hsl(238,20%,95%)' },
              this.props.data.length ? null : styles.hideReload
            ]}
            refreshing={this.state.reloading && !this.props.error}
            onRefresh={this.reload}
            tintColor="#000000"
            colors={['#000000', '#000000', '#000000']}
            progressBackgroundColor="#ffffff"
          />
        }
      />
    );

    if (this.props.error && !this.props.data.length && !this.props.headerData) {
      return (
        <ErrorComponent
          parent={this.props.parent}
          error={this.props.error}
          reloadFunction={() => this.props.load(this.props.view, 0)}
        />
      );
    }

    return (
      <View style={listStyle}>
        {listEl}
        {spinnerEl}
      </View>
    );
  }
}

const localStyles = StyleSheet.create({
  hideReload: {
    backgroundColor: 'white'
  },
  vis: {
    flex: 1,
    width: fullWidth,
    flexDirection: 'column',
    justifyContent: 'flex-start'
  },
  hiddenList: {
    flex: 0,
    height: 0,
    width: 0,
    position: 'absolute'
  }
});

styles = { ...localStyles, ...globalStyles };
