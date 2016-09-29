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

  goTo(view) {
    var self = this;
    self.props.navigator.resetTo(view)
  }

  runAnimation(count) {
    if (count < 1) return;
    var self = this;
    var opacity = new Animated.Value(1);
    var yVal = new Animated.Value(0);
    var xVal = new Animated.Value(0);
    var scale = new Animated.Value(1);

    var newArr = self.state.hearts.push(<Animated.View pointerEvents={'none'} style={[styles.notifAnimation, {transform: [{translateY: yVal}, {translateX: xVal}, {scale: scale}], opacity: opacity}]}><Text style={[{fontSize: 30, color: 'red'}]}>❤️</Text></Animated.View>);

    Animated.parallel([
      Animated.timing(yVal, {
        toValue: -100,
        delay: 0,
        duration: 500,
        easing: Easing.linear
      }),
      Animated.timing(opacity, {
        toValue: 0,
        delay: 0,
        duration: 500,
        easing: Easing.linear
      }),
      Animated.timing(scale, {
        toValue: 1.5,
        delay: 0,
        duration: 500,
        easing: Easing.linear
      }),
    ]).start();

    Animated.sequence([
      Animated.timing(xVal, {
        toValue: 5,
        duration: 250,
        easing: Easing.linear
      }),
      Animated.timing(xVal, {
        toValue: -5,
        duration: 250,
        easing: Easing.linear
      })
    ]).start();

    self.setState({});

    setTimeout(function() {
      self.setState({hearts: []});
    }, 2000);
  }

  componentWillReceiveProps(nextProps, nextState) {
    var self = this;
    if (self.props.notif.count != nextProps.notif.count) {
      self.runAnimation(nextProps.notif.count);
    }
  }

  render() {
    var self = this;
    console.log(self, 'footer')
    var route = null;
    var authenticated = this.props.auth.isAuthenticated;
    var footerEl = null;
    var imageEl = (<Text style={[styles.icon, styles.textCenter]}>👤</Text>);
    if (self.props.auth.user) {
      if (self.props.auth.user.image) imageEl = (<Image source={{uri: self.props.auth.user.image}}  style={[styles.footerImg]} />)
    }

    if (authenticated) {
      footerEl = ( <View style={styles.footer}>
        <TouchableHighlight onPress={self.goTo.bind(self, 'read')} underlayColor={'transparent'} style={[styles.footerItem, {borderBottomColor: route == 'read' ? '#007aff' : 'transparent' }]} >
          <View style={styles.footerItemView}>
            <Text style={[styles.icon, styles.textCenter]}> 📩 </Text>
             {self.props.messages.count ? <View style={styles.notifCount}><Text style={styles.notifText}>{self.props.messages.count}</Text></View> : null}
          </View>
        </TouchableHighlight>
        <TouchableHighlight onPress={self.goTo.bind(self, 'discover')} underlayColor={'transparent'} style={[styles.footerItem, {borderBottomColor: route == 'discover' ? '#007aff' : 'transparent' }]} >
          <View style={styles.footerItemView}>
            <Text style={[styles.icon, styles.textCenter]}>🔮</Text>
          </View>
        </TouchableHighlight>
        <TouchableHighlight onPress={self.goTo.bind(self, 'createPost')} underlayColor={'transparent'} style={[styles.footerItem, {borderBottomColor: route == 'createPost' ? '#007aff' : 'transparent' }]} >
          <View style={styles.footerItemView}>
            <Text style={[styles.icon, styles.textCenter]}>📝</Text>
          </View>
        </TouchableHighlight>
        <TouchableHighlight onPress={self.goTo.bind(self,'activity')} underlayColor={'transparent'} style={[styles.footerItem, {borderBottomColor: route == 'activity' ? '#007aff' : 'transparent' }]} >
          <View style={styles.footerItemView}>
            <Text style={[styles.icon, styles.textCenter]}>⚡</Text>
            {self.props.notif.count ? <View style={styles.notifCount}><Text style={styles.notifText}>{self.props.notif.count}</Text></View> : null}
            {self.state.hearts}
          </View>
        </TouchableHighlight>
        <TouchableHighlight onPress={self.goTo.bind(self, 'profile')} underlayColor={'transparent'} style={[styles.footerItem, {borderBottomColor: route == 'profile' ? '#007aff' : 'transparent' }]} >
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
