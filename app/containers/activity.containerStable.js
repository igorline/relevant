import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  ListView,
  RefreshControl,
} from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as postActions from '../actions/post.actions';
import * as userActions from '../actions/user.actions';
import { globalStyles, fullWidth } from '../styles/global';
import * as viewActions from '../actions/view.actions';
import * as notifActions from '../actions/notif.actions';
import * as statsActions from '../actions/stats.actions';
import SingleActivity from '../components/activity.component';
import DiscoverUser from '../components/discoverUser.component';
import CustomSpinner from '../components/CustomSpinner.component';
import Tabs from '../components/tabs.component';

const localStyles = StyleSheet.create({});
const styles = { ...localStyles, ...globalStyles };

class Activity extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      view: 1,
      reloading: false,
      loading: false,
    };
    this.online = [];
    this.onlinePop = [];
    this.renderRow = this.renderRow.bind(this);
    this.changeView = this.changeView.bind(this);
    this.loadMore = this.loadMore.bind(this);
    this.reload = this.reload.bind(this);
  }

  componentWillMount() {
    if (this.props.auth.user) {
      this.props.actions.markRead(this.props.auth.token, this.props.auth.user._id);
    }
    this.data = this.updateData(this.props, this.state);
    this.load();
    this.updateListView();
  }

  componentWillUpdate(next, nextState) {
    let data = this.updateData(next, nextState);
    if (this.data !== data) {
      this.data = data;
      this.updateListView();
      this.setState({ reloading: false });
      this.setState({ loading: false });
    }
  }

  updateData(props, state) {
    switch (state.view) {
      case 1:
        return props.notif.personal;
      case 2:
        return props.notif.general;
      case 3:
        return props.users.online;
      default:
        return null;
    }
  }

  updateListView() {
    let ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    this.dataSource = ds.cloneWithRows(this.data);
  }


  changeView(num) {
    this.setState({ view: num });
  }

  reload() {
    if (this.state.loading || this.state.reloading) return;
    this.setState({ reloading: false });
    this.load(0);
  }

  loadMore() {
    if (this.state.loading || this.state.reloading) return;
    this.setState({ loading: false });
    this.load();
  }

  load(l) {
    let length = typeof l !== 'undefined' ? l : this.data.length;
    this.loading = true;
    switch (this.state.view) {
      case 1:
        this.props.actions.getActivity(
          this.props.auth.user._id,
          length
        );
        break;

      case 2:
        this.props.actions.getGeneralActivity(
          this.props.auth.user._id,
          length
        );
        break;

      case 3:
        this.props.actions.getUsers(length, null, 'online');
        break;

      default:
        return;
    }
  }

  renderRow(rowData) {
    if (!rowData.role) {
      return (
        <SingleActivity singleActivity={rowData} {...this.props} styles={styles} />
      );
    }
    return (<DiscoverUser user={rowData} {...this.props} styles={styles} />);
  }

  render() {
    let activityEl = null;
    let tabsEl = null;

    if (this.dataSource) {
      activityEl = (
        <ListView
          ref={(c) => { this.listview = c; }}
          enableEmptySections
          pageSize={1}
          initialListSize={2}
          scrollEventThrottle={16}
          onScroll={this.onScroll}
          dataSource={this.dataSource}
          renderRow={this.renderRow}
          contentContainerStyle={{
            position: 'absolute',
            top: 0,
            flex: 1,
            width: fullWidth
          }}
          onEndReached={this.loadMore}
          onEndReachedThreshold={50}
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

    let tabs = [
      { id: 1, title: 'Personal' },
      { id: 2, title: 'General' },
      { id: 3, title: 'Online' },
    ];

    tabsEl = (
      <Tabs
        tabs={tabs}
        active={this.state.view}
        handleChange={this.changeView}
      />
    );

    return (
      <View style={[styles.fullContainer, { backgroundColor: 'white' }]}>
        {tabsEl}
        {activityEl}
        <CustomSpinner visible={!this.dataSource} />
      </View>
    );
  }
}

function mapStateToProps(state) {
  return {
    auth: state.auth,
    online: state.online,
    notif: state.notif,
    view: state.view,
    stats: state.stats,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      ...postActions,
      ...notifActions,
      ...statsActions,
      ...viewActions,
      ...userActions },
    dispatch),
  };
}


export default connect(mapStateToProps, mapDispatchToProps)(Activity);

