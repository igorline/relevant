'use strict';
import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  Animated,
  Easing,
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
      moveHeart: new Animated.Value(0),
      opacity: new Animated.Value(0)
    }
  }

  componentDidMount() {
    var self = this;
  }

  goTo(view) {
    var self = this;
    self.props.view.nav.resetTo(view)
  }

  runAnimation() {
    var self = this;
    self.state.opacity.setValue(1);
    Animated.timing(self.state.moveHeart, {
      toValue: -50,
      delay: 0,
      duration: 500,
      easing: Easing.linear
    }).start();
    Animated.timing(self.state.opacity, {
      toValue: 0,
      delay: 0,
      duration: 500,
      easing: Easing.linear
    }).start();
    self.setState({});
    setTimeout(function() {
      self.state.moveHeart.setValue(0);
    }, 1000);
  }

  componentWillReceiveProps(nextProps, nextState) {
    var self = this;
    if (self.props.notif.count != nextProps.notif.count) {
      self.runAnimation();
    }
  }

  render() {
    var self = this;
    var route = self.props.view.route;
    var authenticated = this.props.auth.isAuthenticated;
    var footerEl = null;
    var imageEl = (<Text style={[styles.icon, styles.textCenter]}>👤</Text>);
    if (self.props.auth.user) {
      if (self.props.auth.user.image) imageEl = (<Image source={{uri: self.props.auth.user.image}}  style={[styles.footerImg]} />)
    }

    if (authenticated) {
      footerEl = ( <View style={styles.footer}>
        <TouchableHighlight onPress={self.goTo.bind(self, 9)} underlayColor={'transparent'} style={[styles.footerItem, {borderBottomColor: route == 9 ? '#007aff' : 'transparent' }]} >
          <View style={styles.footerItemView}>
            <Text style={[styles.icon, styles.textCenter]}> 📩 </Text>
             {self.props.messages.count ? <View style={styles.notifCount}><Text style={styles.notifText}>{self.props.messages.count}</Text></View> : null}
          </View>
        </TouchableHighlight>
        <TouchableHighlight onPress={self.goTo.bind(self, 8)} underlayColor={'transparent'} style={[styles.footerItem, {borderBottomColor: route == 8 ? '#007aff' : 'transparent' }]} >
          <View style={styles.footerItemView}>
            <Text style={[styles.icon, styles.textCenter]}>🔮</Text>
          </View>
        </TouchableHighlight>
        <TouchableHighlight onPress={self.goTo.bind(self, 6)} underlayColor={'transparent'} style={[styles.footerItem, {borderBottomColor: route == 6 ? '#007aff' : 'transparent' }]} >
          <View style={styles.footerItemView}>
            <Text style={[styles.icon, styles.textCenter]}>📝</Text>
          </View>
        </TouchableHighlight>
        <TouchableHighlight onPress={self.goTo.bind(self,5)} underlayColor={'transparent'} style={[styles.footerItem, {borderBottomColor: route == 5 ? '#007aff' : 'transparent' }]} >
          <View style={styles.footerItemView}>
            <Text style={[styles.icon, styles.textCenter]}>⚡</Text>
            {self.props.notif.count ? <View style={styles.notifCount}><Text style={styles.notifText}>{self.props.notif.count}</Text></View> : null}
            {true ? <Animated.View pointerEvents={'none'} style={[styles.notifAnimation, {transform: [{translateY: self.state.moveHeart}], opacity: self.state.opacity}]}><Text style={[{fontSize: 30, color: 'red'}]}>❤️</Text></Animated.View> :  null}
          </View>
        </TouchableHighlight>
        <TouchableHighlight onPress={self.goTo.bind(self, 4)} underlayColor={'transparent'} style={[styles.footerItem, {borderBottomColor: route == 4 ? '#007aff' : 'transparent' }]} >
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

export default Footer

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
    alignItems: 'center',
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
  notifAnimation: {
    position: 'absolute',
    top: -12,
    // right: 10,
    // backgroundColor: 'yellow',
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
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
    alignItems: 'stretch',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  footerItem: {
    flex: 1,
    borderBottomWidth: 2,
    alignItems: 'center',
    justifyContent: 'center'
    // borderBottomColor: 'transparent'
  },
  footerLink: {
    fontSize: 10
  },
});

var styles = {...localStyles, ...globalStyles};
