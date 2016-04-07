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
import { globalStyles } from '../styles/global';

class Footer extends Component {
  componentDidMount() {
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
          <Button style={currentRoute == 'Post' ? styles.active : styles.footerLink} onPress={self.props.routes.Post}>Post</Button>
        </View>
        <View style={styles.footerItem}>
          <Button style={currentRoute == 'Profile' ? styles.active : styles.footerLink} onPress={self.props.routes.Profile}>Profile</Button>
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

const localStyles = StyleSheet.create({
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
