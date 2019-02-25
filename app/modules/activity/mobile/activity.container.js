import React, { Component } from 'react';
import { StyleSheet, View } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as postActions from 'modules/post/post.actions';
import * as userActions from 'modules/user/user.actions';
import * as statsActions from 'modules/stats/stats.actions';
import * as tooltipActions from 'modules/tooltip/tooltip.actions';
import * as navigationActions from 'modules/navigation/navigation.actions';
import { globalStyles } from 'app/styles/global';
import DiscoverUser from 'modules/discover/mobile/discoverUser.component';
import CustomListView from 'modules/listview/mobile/customList.component';
import { withNavigation } from 'react-navigation';
import SingleActivity from 'modules/activity/activity.component';
import PostComponent from 'modules/post/mobile/post.component';
import * as notifActions from './../activity.actions';

const localStyles = StyleSheet.create({});
const styles = { ...localStyles, ...globalStyles };

class Activity extends Component {
  static propTypes = {
    auth: PropTypes.object,
    notif: PropTypes.object,
    actions: PropTypes.object,
    refresh: PropTypes.number,
    reload: PropTypes.number,
    error: PropTypes.bool,
    online: PropTypes.array,
    loaded: PropTypes.bool
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      view: 0
    };
    this.renderRow = this.renderRow.bind(this);
    this.changeView = this.changeView.bind(this);
    this.getViewData = this.getViewData.bind(this);
    this.load = this.load.bind(this);
    this.needsReload = new Date().getTime();
    this.scrollToTop = this.scrollToTop.bind(this);

    this.tabs = [{ id: 0, title: 'Personal' }];
  }

  componentWillMount() {
    if (this.props.auth.user && this.props.notif.count) {
      this.props.actions.markRead();
    }
  }

  componentWillReceiveProps(next) {
    if (this.props.refresh !== next.refresh) {
      this.scrollToTop();
    }
    if (this.props.reload !== next.reload) {
      this.props.actions.markRead();
      this.needsReload = new Date().getTime();
    }
  }

  shouldComponentUpdate(next) {
    return next.navigation.isFocused();
  }

  scrollToTop() {
    if (this.tabs[this.state.view].component) {
      const view = this.tabs[this.state.view].component.listview;
      if (view) view.scrollTo({ y: 0, animated: true });
    }
  }

  changeView(view) {
    if (view === this.state.view) this.scrollToTop();
    this.setState({ view });
  }

  load(view, length) {
    if (!view) view = this.state.view;
    if (!length) length = 0;

    switch (view) {
      case 0:
        this.props.actions.getActivity(length);
        break;
      case 1:
        this.props.actions.getUsers(length, null, 'online');
        break;
      default:
    }
  }

  renderRow(rowData) {
    if (this.state.view === 0) {
      return (
        <SingleActivity
          mobile
          PostComponent={PostComponent}
          singleActivity={rowData}
          {...this.props}
        />
      );
    }
    return <DiscoverUser user={rowData} {...this.props} styles={styles} />;
  }

  getViewData(view) {
    const { loaded, notif, online } = this.props;
    switch (view) {
      case 0:
        return { data: notif.personal, loaded: notif.loaded };
      case 1:
        return { data: online, loaded };
      default:
        return null;
    }
  }

  render() {
    const activityEl = [];
    this.tabs.forEach(tab => {
      const tabData = this.getViewData(tab.id) || { data: [] };
      const active = this.state.view === tab.id;

      activityEl.push(
        <CustomListView
          style={{ flex: 1 }}
          ref={c => {
            this.tabs[tab.id].component = c;
          }}
          key={tab.id}
          data={tabData.data}
          loaded={tabData.loaded}
          renderRow={this.renderRow}
          type={'activity'}
          parent={'activity'}
          load={this.load}
          view={tab.id}
          active={active}
          needsReload={this.needsReload}
          error={this.props.error}
        />
      );
    });

    return <View style={[styles.fullContainer]}>{activityEl}</View>;
  }
}

const mapStateToProps = state => ({
  auth: state.auth,
  notif: state.notif,
  loaded: state.user.loaded,
  online: state.user.online,
  stats: state.stats,
  error: state.error.activity,
  refresh: state.navigation.activity.refresh,
  reload: state.navigation.activity.reload,
  posts: state.posts
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(
    {
      ...postActions,
      ...notifActions,
      ...statsActions,
      ...userActions,
      ...tooltipActions,
      ...navigationActions
    },
    dispatch
  )
});

export default withNavigation(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(Activity)
);
