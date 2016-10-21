'use strict';

import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ListView,
  TouchableHighlight,
  LayoutAnimation,
} from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Spinner from 'react-native-loading-spinner-overlay';
import * as postActions from '../actions/post.actions';
import * as userActions from '../actions/user.actions';
import { globalStyles, fullWidth, fullHeight } from '../styles/global';
import * as viewActions from '../actions/view.actions';
import * as notifActions from '../actions/notif.actions';
import * as onlineActions from '../actions/online.actions';
import * as statsActions from '../actions/stats.actions';
import SingleActivity from '../components/activity.component';
import DiscoverUser from '../components/discoverUser.component';

const localStyles = StyleSheet.create({});
const styles = { ...localStyles, ...globalStyles };

class Activity extends Component {
  constructor(props, context) {
    super(props, context);
    this.onScroll = this.onScroll.bind(this);

    this.state = {
      view: 1,
      online: [],
      onlinePop: [],
      dataSource: null,
      enabled: true,
    };
  }

  componentDidMount() {
    const self = this;
    self.populateUsers(self.props.online);
    if (self.props.auth.user) self.props.actions.markRead(self.props.auth.token, self.props.auth.user._id);
    if (self.props.notif.personal && self.props.notif.general) {
      var ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
      self.setState({ dataSource: ds.cloneWithRows(self.props.notif.personal) });
    }
  }

  componentWillReceiveProps(next) {
    const self = this;
    if (next.online !== self.props.online) self.populateUsers(next.online);
  }

  componentWillUpdate(next, nextState) {
    const self = this;
    if ((next.notif.personal && next.notif.general && next.notif.general !== self.props.notif.general) || (next.notif.personal !== self.props.notif.personal) || (self.state.view !== nextState.view)) {
      if (nextState.view === 1) {
        const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        self.setState({dataSource: ds.cloneWithRows(next.notif.personal) });
      }
      if (nextState.view === 2) {
        const xs = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        self.setState({ dataSource: xs.cloneWithRows(next.notif.general) });
      }
    }
  }

  populateUsers(users) {
    var self = this;
    var i = 0;
    var populated = [];
    for (var index in users) {
      i += 1;
      self.props.actions.getOnlineUser(index, self.props.auth.token).then(function(response) {
        if (response.status) {
          populated.push(response.data);
          if (i == Object.keys(users).length) {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            self.setState({onlinePop: populated, online: users});
          }
        } else {
          console.log('error');
        }
      });
    }
  }

  renderRow(rowData) {
    return (
      <SingleActivity singleActivity={rowData} {...this.props} styles={styles} />
    );
  }

  changeView(num) {
    var self = this;
    self.setState({ view: num });
  }

  onScroll(e) {
    var self = this;
    if (self.refs.listview.scrollProperties.offset + self.refs.listview.scrollProperties.visibleLength >= self.refs.listview.scrollProperties.contentLength) {
      self.loadMore();
    }
  }

  loadMore() {
    const self = this;
    console.log('load more');
    if (self.state.enabled) {
      self.setState({enabled: false});
      switch (self.state.view) {
        case 1:
          self.props.actions.getActivity(self.props.auth.user._id, self.props.notif.personal.length);
          break;

        case 2:
          self.props.actions.getGeneralActivity(self.props.auth.user._id, self.props.notif.general.length);
          break;

        default:
          return;
      }
      setTimeout(() =>
        self.setState({ enabled: true })
      , 1000);
    }
  }

  render() {
    var self = this;
    var activityEl = null;
    var personalActivity = null;
    var generalActivity = null;
    var personalActivityEl = null;
    var generalActivityEl = null;
    var onlineEl = null;
    var typeEl = null;

    if (self.state.dataSource) {
      activityEl = (
        <ListView
          ref="listview"
          enableEmptySections
          renderScrollComponent={props => <ScrollView {...props} />}
          onScroll={self.onScroll}
          dataSource={self.state.dataSource}
          renderRow={self.renderRow.bind(self)}
        />)
    }

    if (self.state.onlinePop.length) {
      onlineEl = self.state.onlinePop.map((user, i) => {
        return (<DiscoverUser key={user._id} {...self.props} user={user} styles={styles} />);
      });
    }

    typeEl = (<View style={[styles.row, styles.typeBar]}>
      <TouchableHighlight underlayColor={'transparent'} style={[styles.typeParent, self.state.view === 1 ? styles.activeBorder : null]} onPress={self.changeView.bind(self, 1)}>
        <Text style={[styles.type, styles.darkGray, styles.font15, self.state.view === 1 ? styles.active : null]}>Personal</Text>
      </TouchableHighlight>
      <TouchableHighlight underlayColor={'transparent'} style={[styles.typeParent, self.state.view === 2 ? styles.activeBorder : null]} onPress={self.changeView.bind(self, 2)}>
        <Text style={[styles.type, styles.darkGray, styles.font15, self.state.view === 2 ? styles.active : null]}>General</Text>
      </TouchableHighlight>
      <TouchableHighlight underlayColor={'transparent'} style={[styles.typeParent, self.state.view === 3 ? styles.activeBorder : null]} onPress={self.changeView.bind(self, 3)}>
        <Text style={[styles.type, styles.darkGray, styles.font15, self.state.view === 3 ? styles.active : null]}>Online</Text>
      </TouchableHighlight>
    </View>);

    return (
      <View style={[styles.fullContainer, { backgroundColor: 'white' }]}>
        {typeEl}
        {self.state.view < 3 ? activityEl : onlineEl }
        <Spinner color={'rgba(0,0,0,1)'} overlayColor={'rgba(0,0,0,0)'} visible={!self.state.dataSource} />
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
      ...onlineActions,
      ...notifActions,
      ...statsActions,
      ...viewActions,
      ...userActions },
    dispatch),
  };
}


export default connect(mapStateToProps, mapDispatchToProps)(Activity)

