'use strict';
import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  StatusBarIOS,
  TouchableHighlight
} from 'react-native';
import { connect } from 'react-redux';
var Button = require('react-native-button');
import { bindActionCreators } from 'redux';
import * as authActions from '../actions/authActions';
import * as postActions from '../actions/postActions';

class Nav extends Component {
  componentDidMount() {
  }

  render() {
    var self = this;
    var authenticated = this.props.auth.isAuthenticated;
    var navEl = null;
    var title = '';
    var route = self.props.route.name;
    // console.log(this, 'nav self')

    if (route == 'Profile') {
      if (self.props.auth.user) {
        title = self.props.auth.user.name;
      } else {
        title = self.props.title;
      }

    } else if (route == 'SinglePost') {
      title = self.props.posts.activePost.body;
    } else if (route == 'User') {
      if (self.props.users.selectedUser) {
       title = self.props.users.selectedUser.name;
      } else {
        title = self.props.title;
      }
    } else {
      title = self.props.title;
    }

    if (authenticated) {
      StatusBarIOS.setStyle('light-content');
      navEl = (<View style={styles.nav}>
        <View style={styles.navItem}>
          <Text style={styles.navLink}>{title}</Text>
        </View>
         {route == 'Profile' ? <View style={styles.gear}><TouchableHighlight onPress={self.props.routes.ProfileOptions} ><Image style={styles.gearImg} source={require('../assets/images/gear.png')} /></TouchableHighlight></View> : null}
      </View>);
    } else {
      StatusBarIOS.setStyle('default');
    }

    return (
      <View>
        {navEl}
      </View>
    );
  }
}

function mapStateToProps(state) {
  return {
    auth: state.auth,
    posts: state.posts,
    users: state.user,
    router: state.routerReducer
   }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({...authActions, ...postActions }, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Nav)

const styles = StyleSheet.create({
  gear: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: 60,
    flex: 1,
    justifyContent: 'flex-end',
    padding: 12
  },
  gearImg: {
    height: 25,
    width: 25
  },
  uploadAvatar: {
    width: 200,
    height: 200
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 20,
    borderStyle: 'solid',
    borderColor: 'transparent'
  },
  wrap: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  nav: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    backgroundColor: 'black'
  },
  navItem: {
    flex: 1
  },
  navLink: {
    color: 'white',
    fontSize: 20,
    textAlign: 'center'
  },
  active: {
    color: 'lightgreen'
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center'
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  input: {
    borderColor: '#cccccc',
    borderStyle: 'solid',
    borderWidth: 1,
    height: 30,
    width: 200,
    alignSelf: 'center',
    margin: 5
  }
});

