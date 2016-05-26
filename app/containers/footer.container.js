'use strict';
import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  View,
  Image,
  TextInput
} from 'react-native';
import { connect } from 'react-redux';
var Button = require('react-native-button');
import { bindActionCreators } from 'redux';
import * as authActions from '../actions/auth.actions';
import { globalStyles } from '../styles/global';

class Footer extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
      count: null
    }
  }

  componentDidMount() {
  }

  componentWillReceiveProps(next) {
    var self = this;
    // if (!self.props.notif.activity && next.notif.activity) {
    //   self.countNotifications(next.notif.activity);
    // }
    // if (self.props.notif.activity != next.notif.activity) {
    //   self.countNotifications(next.notif.activity);
    // }
  }



  render() {
    var self = this;
    var currentRoute = self.props.router.currentRoute;
    var authenticated = this.props.auth.isAuthenticated;
    var footerEl = null;

    if (authenticated) {
      footerEl = ( <View style={styles.footer}>
        <View style={styles.footerItem}>
          <Button style={currentRoute == 'Read' ? styles.active : styles.footerLink} onPress={self.props.routes.Read} >Read</Button>
        </View>
        <View style={styles.footerItem}>
          <Button style={currentRoute == 'Discover' ? styles.active : styles.footerLink} onPress={self.props.routes.Discover}>Discover</Button>
        </View>
        <View style={styles.footerItem}>
          <Button style={currentRoute == 'CreatePost' ? styles.active : styles.footerLink} onPress={self.props.routes.CreatePost}>Post</Button>
        </View>
        <View style={styles.footerItem}>
          <Button style={currentRoute == 'Profile' ? styles.active : styles.footerLink} onPress={self.props.routes.Profile}>Profile</Button>
        </View>
        <View style={[styles.footerItem, styles.activityRow]}>
          <Button style={currentRoute == 'Activity' ? styles.active : styles.footerLink} onPress={self.props.routes.Activity}>Activity</Button>
          {self.props.notif.count ? <Text style={styles.notifCount}>{self.props.notif.count}</Text> : null}
        </View>
      </View>);
    }
    return (
     <View>{footerEl}</View>
    );
  }
}

function mapStateToProps(state) {
  return {
    auth: state.auth,
    router: state.routerReducer,
    notif: state.notif
   }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(authActions, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Footer)

const localStyles = StyleSheet.create({
  notifCount: {
    color: 'red',
    marginLeft: 5
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  footer: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'black'
  },
  footerItem: {
    flex: 1
  },
  footerLink: {
    color: 'white'
  },
});

var styles = {...localStyles, ...globalStyles};
