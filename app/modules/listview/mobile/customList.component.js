import React, { Component } from 'react';
import {
  FlatList,
  SectionList,
  RefreshControl,
  View,
  StyleSheet,
  Platform
} from 'react-native';
import PropTypes from 'prop-types';
import { globalStyles, fullWidth } from 'app/styles/global';
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
    type: PropTypes.string,
    sections: PropTypes.array,
    needsReload: PropTypes.number
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      reloading: false
    };
    this.reload = this.reload.bind(this);
    this.loadMore = this.loadMore.bind(this);
    this.lastReload = 0;
    this.List = props.sections ? SectionList : FlatList;
  }

  componentDidMount() {
    if (this.props.data && this.props.data.length) {
      this.lastReload = new Date().getTime();
    } else if (this.props.active) {
      this.props.load(this.props.view, 0);
      this.setState({ loading: true });
      this.lastReload = new Date().getTime();
    }
  }

  componentDidUpdate(prev) {
    const { data, error, active, needsReload, load, view } = this.props;
    const { reloading, loading } = this.state;
    if (JSON.stringify(data) !== JSON.stringify(prev.data) || error) {
      reloading && this.setState({ reloading: false });
      loading && this.setState({ loading: false });
    }
    if (reloading) {
      clearTimeout(this.stateTimeout);
      this.stateTimeout = setTimeout(
        () => this.setState({ reloading: false, loading: false }),
        100
      );
    }

    if (active && needsReload > this.lastReload && !loading) {
      load(view, 0);
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
    const {
      active,
      data,
      scrollableTab,
      headerData,
      sections,
      type = 'data',
      loaded,
      parent
    } = this.props;
    let listEl = null;
    let emptyEl = null;

    const spinnerEl = !loaded && (
      <CustomSpinner visible={!data.length && active && !headerData} />
    );

    const listStyle =
      active || scrollableTab
        ? [styles.commonList, styles.vis]
        : [styles.commonList, styles.hiddenList];

    if (loaded && !data.length) {
      emptyEl = (
        <EmptyList visible emoji={'😶'} type={type} YOffset={this.props.YOffset}>
          {this.props.children}
        </EmptyList>
      );
      if (parent !== 'profile') listEl = null;
    }

    const { List } = this;

    listEl = (
      <List
        ref={c => {
          this.listview = c;
        }}
        sections={sections}
        enableEmptySections
        scrollToOverflowEnabled={true}
        // removeClippedSubviews={false}
        stickySectionHeadersEnabled
        // pageSize={1}
        initialListSize={3}
        scrollEventThrottle={10}
        renderSectionHeader={({ section: { header } }) => header}
        automaticallyAdjustContentInsets={false}
        stickyHeaderIndices={this.props.stickyHeaderIndices}
        data={data}
        renderItem={({ item, index }) =>
          this.props.renderRow(item, this.props.view, index)
        }
        keyExtractor={(item, index) => index.toString()}
        contentInset={{ top: this.props.YOffset || 0 }}
        contentOffset={{ y: -this.props.YOffset || 0 }}
        ListHeaderComponent={this.props.renderHeader}
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
        onEndReachedThreshold={0.3}
        ListFooterComponent={() => emptyEl}
        refreshControl={
          <RefreshControl
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
