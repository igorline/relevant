'use strict';

import React, { Component } from 'react';
import {
  AppRegistry,
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
import Button from 'react-native-button';
import { bindActionCreators } from 'redux';
import * as authActions from '../actions/auth.actions';
import { globalStyles } from '../styles/global';

class Footer extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
      moveHeart: new Animated.Value(0),
      opacity: new Animated.Value(0),
      hearts: []
    }
  }

  componentDidMount() {
    var self = this;
  }

  componentWillUpdate(newProps) {
    var nav = null;
    if (newProps.navigator) {
      nav = newProps.navigator;
      var routes = nav.state.routeStack;
      var length = nav.state.routeStack.length;
      if (length > 0) length --;
      this.route = routes[length].name;
    }
  }

  goTo(view) {
    var self = this;
    self.props.navigator.push({name: view});
    this.route = view;
    this.setState({});
  }

  runAnimation(i) {
    var self = this;
    var opacity = new Animated.Value(1);
    var yVal = new Animated.Value(0);
    var xVal = new Animated.Value(0);
    var scale = new Animated.Value(1);
    var index = 0;

    var newArr = self.state.hearts.push(
      <Animated.View
        pointerEvents={'none'}
        key = {i}
        style={[styles.notifAnimation,
          {transform: [{translateY: yVal},
          {translateX: xVal},
          {scale: scale}], opacity: opacity}]}>
          <Text style = {[{fontSize: 30, color: 'red'}]}>❤️</Text>
        </Animated.View>);

    Animated.parallel([
      Animated.timing(yVal, {
        toValue: -300,
        delay: 100 * i,
        duration: 600,
        easing: Easing.quad
      }),
      Animated.timing(opacity, {
        toValue: 0,
        delay: 100 * i,
        duration: 500,
        easing: Easing.linear
      }),
      Animated.timing(scale, {
        toValue: 1.5,
        delay: 100 * i,
        duration: 500,
        easing: Easing.linear
      }),
    ]).start();

    Animated.sequence([
      Animated.timing(xVal, {
        toValue: 5 * Math.random(),
        duration: 250,
        delay: 100 * i,
        easing: Easing.linear
      }),
      Animated.timing(xVal, {
        toValue: -5 * Math.random(),
        duration: 250,
        delay: 100 * i,
        easing: Easing.linear
      })
    ]).start();

    self.setState({});

    setTimeout(function() {
      self.setState({hearts: []});
    }, 5000);
  }

  componentWillReceiveProps(nextProps, nextState) {
    var self = this;
    if (nextProps.notif.count && self.props.notif.count < nextProps.notif.count) {
      var newNotifications = nextProps.notif.count - self.props.notif.count;
      for (var i = 0; i < newNotifications * 2; i++) {
        self.runAnimation(i);
      }
    }
  }

  render() {
    var self = this;
    var route = null;
    var nav = null;
    if (self.props.navigator) {
      nav = self.props.navigator;
      // var routes = nav.state.routeStack;
      // var length = nav.state.routeStack.length;
      // if (length > 0) length --;
      // route = routes[length].name;
    }
    var authenticated = self.props.auth.user;
    var footerEl = null;
    var imageEl = (<Text style={[styles.icon, styles.textCenter]}>👤</Text>);
    if (self.props.auth.user) {
      if (self.props.auth.user.image) imageEl = (<Image source={{uri: self.props.auth.user.image}}  style={[styles.footerImg]} />)
    }

    if (authenticated) {
      footerEl = ( <View style={styles.footer}>
        <TouchableHighlight onPress={self.goTo.bind(self, 'read')} underlayColor={'transparent'} style={[styles.footerItem, {borderBottomColor: this.route == 'read' ? '#007aff' : 'transparent' }]} >
          <View style={styles.footerItemView}>
            <Text style={[styles.icon, styles.textCenter]}> 📩 </Text>
             {self.props.messages.count ? <View style={styles.notifCount}><Text style={styles.notifText}>{self.props.messages.count}</Text></View> : null}
          </View>
        </TouchableHighlight>
        <TouchableHighlight onPress={self.goTo.bind(self, 'discover')} underlayColor={'transparent'} style={[styles.footerItem, {borderBottomColor: this.route == 'discover' ? '#007aff' : 'transparent' }]} >
          <View style={styles.footerItemView}>
            <Text style={[styles.icon, styles.textCenter]}>🔮</Text>
          </View>
        </TouchableHighlight>
        <TouchableHighlight onPress={self.goTo.bind(self, 'createPost')} underlayColor={'transparent'} style={[styles.footerItem, {borderBottomColor: this.route == 'createPost' ? '#007aff' : 'transparent' }]} >
          <View style={styles.footerItemView}>
            <Text style={[styles.icon, styles.textCenter]}>📝</Text>
          </View>
        </TouchableHighlight>
        <TouchableHighlight onPress={self.goTo.bind(self,'activity')} underlayColor={'transparent'} style={[styles.footerItem, {borderBottomColor: this.route == 'activity' ? '#007aff' : 'transparent' }]} >
          <View style={styles.footerItemView}>
            <Text style={[styles.icon, styles.textCenter]}>⚡</Text>
            {self.props.notif.count ? <View style={styles.notifCount}><Text style={styles.notifText}>{self.props.notif.count}</Text></View> : null}
            {self.state.hearts}
          </View>
        </TouchableHighlight>

        <TouchableHighlight
          onPress={self.goTo.bind(self, 'profile')}
          underlayColor={'transparent'}
          style={[styles.footerItem, {borderBottomColor: this.route == 'profile' ? '#007aff' : 'transparent' }]} >

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
