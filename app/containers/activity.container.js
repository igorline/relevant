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
import Notification from '../components/notification.component';
import DiscoverUser from '../components/discoverUser.component';
import Shimmer from 'react-native-shimmer';

class Activity extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
      personalActivity: null,
      view: 1,
      online: [],
      onlinePop: []
    }
  }

  componentDidMount() {
    var self = this;
    notifActions.getActivity(this.props.auth.user._id).then(function(data) {
      self.setState({personalActivity: data.data});
    });
    self.populateUsers(self.props.online);
  }

  setSelected(id) {
    var self = this;
    if (id == self.props.auth.user._id) {
      self.props.routes.Profile();
    } else {
      self.props.actions.getSelectedUser(id, self.props.auth.token);
    }
  }

  componentWillReceiveProps(next) {
    var self = this;
    if(next.online != self.props.online) self.populateUsers(next.online);
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
      self.props.actions.getSelectedUser(id, self.props.auth.token);
    }
  }

  changeView(num) {
    var self = this;
    self.setState({view: num});
  }


  render() {
    var self = this;
    var personalActivity = null;
    var personalActivityEl = null;
    var generalActivityEl = null;
    var onlineEl = null;

    if (self.state.onlinePop.length) {
      onlineEl = self.state.onlinePop.map(function(user, i) {
          return <DiscoverUser key={user._id} {...self.props} user={user} styles={styles} />;
      });
    }

    if (self.state.personalActivity) {
      personalActivity = self.state.personalActivity;
      personalActivityEl = [];
      personalActivity.forEach(function(singleActivity) {
        if (singleActivity.type == 'investment') {
           personalActivityEl.push(
            <View style={styles.singleActivity}>
              <Text>
                <Text style={styles.active} onPress={self.setSelected.bind(self, singleActivity.byUser._id)}>
                  {singleActivity.byUser.name}
                </Text>
                &nbsp;invested {'$'+singleActivity.amount} in your post
                <Text onPress={self.props.actions.getActivePost.bind(self, singleActivity.post._id)} style={styles.active}>
                  &nbsp;{singleActivity.post.title}
                </Text>
              </Text>
            </View>
          );
         } else {
            personalActivityEl.push(
              <View style={styles.singleActivity}>
                <Text style={styles.singleActivity}>
                Generic notification from {singleActivity.byUser.name}
                </Text>
              </View>
            );
         }
      })
    }

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
    online: state.online
   }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({...investActions, ...authActions, ...postActions, ...userActions}, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Activity)

const localStyles = StyleSheet.create({
singleActivity: {
  padding: 10,
  borderBottomWidth: 1,
  borderBottomColor: 'black',
  width: fullWidth
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


















