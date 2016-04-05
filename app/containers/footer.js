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
import * as authActions from '../actions/authActions';

class Footer extends Component {
  componentDidMount() {
  }

  render() {
    var self = this;
    var currentRoute = self.props.router.currentRoute;
    var authenticated = this.props.auth.isAuthenticated;
    var footerEl = null;
    if (authenticated) {
      footerEl = ( <View style={styles.nav}>
        <View style={styles.navItem}>
          <Button style={currentRoute == 'Read' ? styles.active : styles.navLink} onPress={self.props.routes.Read} >Read</Button>
        </View>
        <View style={styles.navItem}>
          <Button style={currentRoute == 'Discover' ? styles.active : styles.navLink} onPress={self.props.routes.Discover}>Discover</Button>
        </View>
        <View style={styles.navItem}>
          <Button style={currentRoute == 'Post' ? styles.active : styles.navLink} onPress={self.props.routes.Post}>Post</Button>
        </View>
        <View style={styles.navItem}>
          <Button style={currentRoute == 'Profile' ? styles.active : styles.navLink} onPress={self.props.routes.Profile}>Profile</Button>
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
    router: state.routerReducer
   }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(authActions, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Footer)
//export default Nav

const styles = StyleSheet.create({
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
    alignItems: 'center',
    backgroundColor: 'black'
  },
  navItem: {
    flex: 1
  },
  navLink: {
    color: 'white'
  },
  active: {
    color: '#007aff'
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
  },
  marginTop: {
    marginTop: 10
  }
});

