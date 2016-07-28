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
    }
  }

  componentDidMount() {
  }

  componentWillReceiveProps(next) {
  }

  render() {
    var self = this;
    var currentRoute = self.props.router.currentRoute;
    var authenticated = this.props.auth.isAuthenticated;
    var footerEl = null;
    var imageEl = (<Text style={[styles.icon, styles.textCenter, currentRoute == 'Profile' ? styles.activeIcon : null]}>👤</Text>);
    if (self.props.auth.user) {
      if (self.props.auth.user.image) {
        imageEl = (<Image source={{uri: self.props.auth.user.image}}  style={[styles.footerImg, currentRoute == 'Profile' ? styles.activeIcon : null]} />)
      }
    }

    if (authenticated) {
      footerEl = ( <View style={styles.footer}>
        <TouchableHighlight underlayColor={'transparent'} style={[styles.footerItem]} onPress={currentRoute != 'Read' ? self.props.routes.Read : null}>
          <View style={styles.footerItemView}>
            <Text style={[styles.icon, styles.textCenter, currentRoute == 'Read' ? styles.activeIcon : null]}> 📩 </Text>
          </View>
        </TouchableHighlight>
        <TouchableHighlight underlayColor={'transparent'} style={[styles.footerItem]} onPress={currentRoute != 'Discover' ? self.props.routes.Discover : null}>
          <View style={styles.footerItemView}>
            <Text style={[styles.icon, styles.textCenter, currentRoute == 'Discover' ? styles.activeIcon : null]}>🔮</Text>
          </View>
        </TouchableHighlight>
        <TouchableHighlight underlayColor={'transparent'} style={[styles.footerItem]} onPress={currentRoute != 'CreatePost' ? self.props.routes.CreatePost : null}>
          <View style={styles.footerItemView}>
            <Text style={[styles.icon, styles.textCenter, currentRoute == 'CreatePost' ? styles.activeIcon : null]}>📝</Text>
          </View>
        </TouchableHighlight>
        <TouchableHighlight underlayColor={'transparent'} style={[styles.footerItem]} onPress={currentRoute != 'Activity' ? self.props.routes.Activity : null}>
          <View style={styles.footerItemView}>
            <Text style={[styles.icon, styles.textCenter, currentRoute == 'Activity' ? styles.activeIcon : null]}>⚡</Text>
            {self.props.notif.count ? <View style={styles.notifCount}><Text style={styles.notifText}>{self.props.notif.count}</Text></View> : null}
          </View>
        </TouchableHighlight>
        <TouchableHighlight underlayColor={'transparent'} style={[styles.footerItem]} onPress={currentRoute != 'Profile' ? self.props.routes.Profile : null}>
          <View style={styles.footerItemView}>
            {imageEl}
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
  footerImg: {
    height: 25,
    width: 25,
    borderRadius: 12.5
  },
  icon: {
    fontSize: 25
  },
  activeIcon: {
    transform: [{scale: 1.2}]
  },
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
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.25)',
    borderTopStyle: 'solid'
  },
  footerItem: {
    flex: 1
  },
  footerLink: {
    fontSize: 10
  },
});

var styles = {...localStyles, ...globalStyles};
