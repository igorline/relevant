'use strict';
import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  ScrollView,
  Linking,
  TouchableHighlight,
  LayoutAnimation
} from 'react-native';
import { connect } from 'react-redux';
var Button = require('react-native-button');
import { bindActionCreators } from 'redux';
import * as authActions from '../actions/auth.actions';
import * as postActions from '../actions/post.actions';
import * as userActions from '../actions/user.actions';
require('../publicenv');
import { globalStyles, fullWidth, fullHeight } from '../styles/global';
import Post from '../components/post.component';
import * as investActions from '../actions/invest.actions';
import * as notifActions from '../actions/notif.actions';
import * as tagActions from '../actions/tag.actions';
import Notification from '../components/notification.component';
import DiscoverUser from '../components/discoverUser.component';
import Shimmer from 'react-native-shimmer';
var moment = require('moment');

class Activity extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
      view: 1,
      online: [],
      onlinePop: []
    }
  }

  componentDidMount() {
    var self = this;
    self.populateUsers(self.props.online);
    self.props.actions.markRead(self.props.auth.token, self.props.auth.user._id);
  }

  setSelected(id) {
    var self = this;
    if (id == self.props.auth.user._id) {
      self.props.routes.Profile();
    } else {
      self.props.actions.getSelectedUser(id);
    }
  }

  componentWillReceiveProps(next) {
    var self = this;
    if(next.online != self.props.online) self.populateUsers(next.online);
  }

  setTagAndRoute(tag) {
    var self = this;
    self.props.actions.setTag(tag);
    self.props.routes.Discover();
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
      })
    }
  }

  setSelected(id) {
    var self = this;
    if (id == self.props.auth.user._id) {
      self.props.routes.Profile();
    } else {
      self.props.actions.getSelectedUser(id);
    }
  }

  changeView(num) {
    var self = this;
    self.setState({view: num});
  }

  goToPost(activity) {
    var self = this;
    self.props.actions.getActivePost(activity.post._id).then(function() {
      self.props.routes.SinglePost();
    })
  }


  render() {
    var self = this;
    var personalActivity = null;
    var generalActivity = null;
    var personalActivityEl = null;
    var generalActivityEl = null;
    var onlineEl = null;

    if (self.state.onlinePop.length) {
      onlineEl = self.state.onlinePop.map(function(user, i) {
          return <DiscoverUser key={user._id} {...self.props} user={user} styles={styles} />;
      });
    }

    if (self.props.notif.activity) {
      personalActivity = self.props.notif.activity;
      personalActivityEl = [];

      personalActivity.forEach(function(singleActivity) {
        if (!singleActivity.byUser || !singleActivity.personal) return;
        var activityTime = moment(singleActivity.createdAt);
        var fromNow = activityTime.fromNow();
        if (singleActivity.type == 'investment') {
           personalActivityEl.push(
            <View style={styles.singleActivity}>
              <View style={styles.activityLeft}>
                <Text>
                  <Text style={styles.active} onPress={self.setSelected.bind(self, singleActivity.byUser._id)}>
                    {singleActivity.byUser.name}
                  </Text>
                  &nbsp;invested {'$'+singleActivity.amount} in your post
                </Text>
                <Text numberOfLines={1} onPress={self.goToPost.bind(self, singleActivity)} style={styles.active}>
                  {singleActivity.post.title}
                </Text>
              </View>
              <View style={styles.activityRight}>
                <Text style={[styles.gray, styles.textRight]}>{fromNow}</Text>
              </View>
            </View>
          );
         } else if (singleActivity.type == 'profile') {
          personalActivityEl.push(
            <View style={styles.singleActivity}>
              <Text>
                <Text style={styles.active} onPress={self.setSelected.bind(self, singleActivity.byUser._id)}>
                  {singleActivity.byUser.name}
                </Text>
                &nbsp;visited your profile
              </Text>
              <Text style={styles.gray}>{fromNow}</Text>
            </View>
          );
         } else if (singleActivity.type == 'comment') {
          personalActivityEl.push(
            <View style={styles.singleActivity}>
              <View style={styles.activityLeft}>
                <Text>
                  <Text style={styles.active} onPress={self.setSelected.bind(self, singleActivity.byUser._id)}>
                    {singleActivity.byUser.name}
                  </Text>
                  &nbsp;commented on your post
                </Text>
                <Text onPress={self.goToPost.bind(self, singleActivity)} numberOfLines={1} style={[styles.active]}>{singleActivity.post.title}</Text>
              </View>
              <View style={styles.activityRight}>
                <Text style={[styles.gray, styles.textRight]}>{fromNow}</Text>
              </View>
            </View>
          );
        } else if (singleActivity.type == 'thirst') {
          personalActivityEl.push(
            <View style={styles.singleActivity}>
              <View style={styles.activityLeft}>
                <Text><Text style={styles.active} onPress={self.setSelected.bind(self, singleActivity.byUser._id)}>{singleActivity.byUser.name}</Text>&nbsp;is thirsty 4 u 👅💦</Text>
              </View>
              <View style={styles.activityRight}>
              <Text style={[styles.gray, styles.textRight]}>{fromNow}</Text>
              </View>
            </View>
          );
         } else {
            personalActivityEl.push(
              <View style={styles.singleActivity}>
                <Text>
                Notification from {singleActivity.byUser.name}
                </Text>
                <Text style={styles.gray}>{fromNow}</Text>
              </View>
            );
         }
      })

      generalActivity = self.props.notif.activity;
      generalActivityEl = [];
      generalActivity.forEach(function(singleActivity) {
        if (singleActivity.personal) return;
        var activityTime = moment(singleActivity.createdAt);
        var fromNow = activityTime.fromNow();
        if (singleActivity.type == 'online') {
          if (singleActivity.byUser._id == self.props.auth.user._id) return;
           generalActivityEl.push(
            <View style={styles.singleActivity}>
              <View style={styles.activityLeft}>
                <Text>
                  <Text style={styles.active} onPress={self.setSelected.bind(self, singleActivity.byUser._id)}>
                    {singleActivity.byUser.name}
                  </Text>
                  &nbsp;went online
                </Text>
              </View>
              <View style={styles.activityRight}>
                <Text style={[styles.gray, styles.textRight]}>{fromNow}</Text>
              </View>
            </View>
          );
         }
      })
    }

    console.log(self)

    return (
      <View style={styles.fullContainer}>
      <ScrollView>
      <View style={styles.activityHeader}>
        <Text onPress={self.changeView.bind(self, 1)} style={[self.state.view == 1 ? styles.active : null, styles.font20]}>Personal</Text>
        <Text onPress={self.changeView.bind(self, 2)} style={[self.state.view == 2 ? styles.active : null, styles.font20]}>General</Text>
        <Text onPress={self.changeView.bind(self, 3)} style={[self.state.view == 3 ? styles.active : null, styles.font20]}>Online</Text>
      </View>
      {self.state.view == 1 ? personalActivityEl : null }
      {self.state.view == 2 ? generalActivityEl : null }
      {self.state.view == 3 ? onlineEl : null }
      </ScrollView>
        <View pointerEvents={'none'} style={styles.notificationContainer}>
          <Notification />
        </View>
      </View>
    );
  }
}

function mapStateToProps(state) {
  return {
    auth: state.auth,
    posts: state.posts,
    user: state.user,
    router: state.routerReducer,
    online: state.online,
    notif: state.notif
   }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({...investActions, ...authActions, ...postActions, ...userActions, ...tagActions, ...notifActions}, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Activity)

const localStyles = StyleSheet.create({
activityRight: {
  flex: 0.40,
},
activityLeft: {
  flex: 0.60,
},
singleActivity: {
  padding: 10,
  borderBottomWidth: 1,
  borderBottomColor: 'black',
  width: fullWidth,
  justifyContent: 'space-between',
  flexDirection: 'row',
  alignItems: 'center',
  flex: 1,
},
activityHeader: {
  flexDirection: 'row',
  padding: 10,
  justifyContent: 'space-around',
  alignItems: 'center'
},
onlineUser: {
  justifyContent: 'space-between',
  flexDirection: 'row',
  padding: 10
},
});

var styles = {...localStyles, ...globalStyles};


















