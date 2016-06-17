'use strict';
import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableHighlight
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
  }

  render() {
    var self = this;
    var currentRoute = self.props.router.currentRoute;
    var authenticated = this.props.auth.isAuthenticated;
    var footerEl = null;


    if (authenticated) {
      footerEl = ( <View style={styles.footer}>
        <TouchableHighlight style={[styles.footerItem]} onPress={self.props.routes.Read}>
          <View style={styles.footerItemView}>
            <Text style={styles.textCenter}> 📩 👀</Text>
            <Text style={[currentRoute == 'Read' ? styles.active : styles.white, styles.footerLink]}>Read</Text>
          </View>
        </TouchableHighlight>
        <TouchableHighlight style={[styles.footerItem]} onPress={self.props.routes.Discover}>
          <View style={styles.footerItemView}>
            <Text style={styles.textCenter}>🔮</Text>
            <Text style={[currentRoute == 'Discover' ? styles.active : styles.white, styles.footerLink]} >Discover</Text>
          </View>
        </TouchableHighlight>
        <TouchableHighlight style={[styles.footerItem]} onPress={self.props.routes.CreatePost}>
          <View style={styles.footerItemView}>
            <Text style={styles.textCenter}>📝</Text>
            <Text style={[currentRoute == 'CreatePost' ? styles.active : styles.white, styles.footerLink]} >Post</Text>
          </View>
        </TouchableHighlight>
        <TouchableHighlight style={[styles.footerItem]} onPress={self.props.routes.Profile}>
          <View style={styles.footerItemView}>
            <Text style={styles.textCenter}>👤</Text>
            <Text style={[currentRoute == 'Profile' ? styles.active : styles.white, styles.footerLink]}>Profile</Text>
          </View>
        </TouchableHighlight>
          <TouchableHighlight style={[styles.footerItem]} onPress={self.props.routes.Activity}>
            <View style={styles.footerItemView}>
              <Text style={styles.textCenter}>⚡</Text>
              <View>
                <Text style={[currentRoute == 'Activity' ? styles.active : styles.white,  styles.footerLink]}>Activity</Text>
              </View>
              {self.props.notif.count ? <View style={styles.notifCount}><Text style={styles.notifText}>{self.props.notif.count}</Text></View> : null}
            </View>
          </TouchableHighlight>
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
  footerItemView: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  notifCount: {
    position: 'absolute',
    top: -20,
    backgroundColor: 'red',
    right: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 2.5,
    height: 20,
    width: 20
  },
  notifText: {
    color: 'white'
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
    fontSize: 10
  },
});

var styles = {...localStyles, ...globalStyles};
