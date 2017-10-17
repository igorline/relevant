import React, { Component } from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as postActions from '../../actions/post.actions';
import * as userActions from '../../actions/user.actions';
import * as statsActions from '../../actions/stats.actions';
import { globalStyles } from '../../styles/global';
import * as notifActions from '../../actions/notif.actions';
import SingleActivity from './activity.component';
import DiscoverUser from '../../components/discoverUser.component';
import Tabs from '../../components/tabs.component';
import CustomListView from '../../components/customList.component';

const localStyles = StyleSheet.create({});
const styles = { ...localStyles, ...globalStyles };

class Activity extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      view: 0,
    };
    this.renderRow = this.renderRow.bind(this);
    this.changeView = this.changeView.bind(this);
    this.getViewData = this.getViewData.bind(this);
    this.load = this.load.bind(this);
    this.needsReload = new Date().getTime();
    this.scrollToTop = this.scrollToTop.bind(this);

    this.tabs = [
      { id: 0, title: 'Personal' },
      // { id: 1, title: 'Online' }
    ];
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
    let tab = next.tabs.routes[next.tabs.index];
    if (tab.key !== 'activity') return false;

    // console.log('updating activity');
    // for (let p in next) {
    //   if (next[p] !== this.props[p]) {
    //     console.log(p);
    //     for (let pp in next[p]) {
    //       if (next[p][pp] !== this.props[p][pp]) console.log('--> ',pp);
    //     }
    //   }
    // }

    return true;
  }

  scrollToTop() {
    if (this.tabs[this.state.view].component) {
      let view = this.tabs[this.state.view].component.listview;
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
        return;
    }
  }

  renderRow(rowData) {
    if (this.state.view === 0) {
      return (
        <SingleActivity singleActivity={rowData} {...this.props} styles={styles} />
      );
    }
    return (<DiscoverUser user={rowData} {...this.props} styles={styles} />);
  }

  getViewData(props, view) {
    switch (view) {
      case 0:
        return { data: props.notif.personal, loaded: props.notif.loaded };
      case 1:
        return { data: props.online, loaded: props.loaded };
      default:
        return null;
    }
  }

  render() {
    let tabsEl = null;
    let activityEl = [];
    this.tabs.forEach((tab) => {
      let tabData = this.getViewData(this.props, tab.id) || [];
      let active = this.state.view === tab.id;

      activityEl.push(
        <CustomListView
          ref={(c) => { this.tabs[tab.id].component = c; }}
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

    tabsEl = (
      <Tabs
        tabs={this.tabs}
        active={this.state.view}
        handleChange={this.changeView}
      />
    );

    return (
      <View style={[styles.fullContainer]}>
        {activityEl}
      </View>
    );
  }
}

function mapStateToProps(state) {
  return {
    auth: state.auth,
    notif: state.notif,
    // users: state.user,
    loaded: state.user.loaded,
    online: state.user.online,
    stats: state.stats,
    error: state.error.activity,
    refresh: state.navigation.activity.refresh,
    reload: state.navigation.activity.reload,
    tabs: state.navigation.tabs
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      ...postActions,
      ...notifActions,
      ...statsActions,
      ...userActions
    },
    dispatch),
  };
}


export default connect(mapStateToProps, mapDispatchToProps)(Activity);
