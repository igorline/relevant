import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  Animated,
  Easing,
  TouchableHighlight,
} from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as authActions from '../actions/auth.actions';
import { globalStyles } from '../styles/global';

let styles;

class Footer extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      moveHeart: new Animated.Value(0),
      opacity: new Animated.Value(0),
      hearts: []
    };
  }

  componentDidMount() {
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.notif.count && this.props.notif.count < nextProps.notif.count) {
      let newNotifications = nextProps.notif.count - this.props.notif.count;
      for (let i = 0; i < newNotifications * 2; i++) {
        this.runAnimation(i);
      }
    }
  }

  goTo(view) {
    if (view === 'profile') {
      this.props.actions.setSelectedUser(this.props.auth.user._id);
      this.props.actions.setSelectedUserData(this.props.auth.user);
    }

    const currentRoutes = this.props.navigator.getCurrentRoutes();

    let i = Object.keys(currentRoutes).find((key) => {
      let v = currentRoutes[key];
      return v.name === view;
    });

    if (i !== undefined) this.props.navigator.jumpTo(currentRoutes[i]);
    else this.props.navigator.push({ name: view });

    this.route = view;
    this.setState({});
  }

  runAnimation(i) {
    let opacity = new Animated.Value(1);
    let yVal = new Animated.Value(0);
    let xVal = new Animated.Value(0);
    let scale = new Animated.Value(1);

    this.state.hearts.push(
      <Animated.View
        pointerEvents={'none'}
        key={i}
        style={[styles.notifAnimation,
          { transform: [
            { translateY: yVal },
            { translateX: xVal },
            { scale }
          ],
          opacity
        }]}
      >
        <Text style={[{ fontSize: 30, color: 'red' }]}>❤️</Text>
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

    this.setState({});

    setTimeout(() => {
      this.setState({ hearts: [] });
    }, 5000);
  }


  render() {
    let authenticated = this.props.auth.user;
    let footerEl = null;
    let imageEl = (
      <Text style={[styles.icon, styles.textCenter]}>
        👤
      </Text>
    );

    if (this.props.auth.user) {
      if (this.props.auth.user.image) {
        imageEl = (
          <Image
            source={{ uri: this.props.auth.user.image }}
            style={[styles.footerImg]}
          />);
      }
    }

    if (authenticated) {
      footerEl = (
        <View style={styles.footer}>
          <TouchableHighlight
            onPress={() => this.goTo('read')}
            underlayColor={'transparent'}
            style={[
              styles.footerItem,
              { borderBottomColor: this.route === 'read' ? '#007aff' : 'transparent' }]}
          >
            <View style={styles.footerItemView}>
              <Text style={[styles.icon, styles.textCenter]}> 📩 </Text>
              { this.props.messages.count ?
                <View style={styles.notifCount}>
                  <Text style={styles.notifText}>
                    {this.props.messages.count}
                  </Text>
                </View> :
                null
              }
            </View>
          </TouchableHighlight>
          <TouchableHighlight
            onPress={() => this.goTo('discover')}
            underlayColor={'transparent'}
            style={[
              styles.footerItem,
              { borderBottomColor: this.route === 'discover' ? '#007aff' : 'transparent' }]}
          >
            <View style={styles.footerItemView}>
              <Text style={[styles.icon, styles.textCenter]}>🔮</Text>
            </View>
          </TouchableHighlight>
          <TouchableHighlight
            onPress={() => this.goTo('createPost')}
            underlayColor={'transparent'}
            style={[
              styles.footerItem,
              { borderBottomColor: this.route === 'createPost' ? '#007aff' : 'transparent' }]}
          >
            <View style={styles.footerItemView}>
              <Text style={[styles.icon, styles.textCenter]}>📝</Text>
            </View>
          </TouchableHighlight>
          <TouchableHighlight
            onPress={() => this.goTo('activity')}
            underlayColor={'transparent'}
            style={[
              styles.footerItem,
              { borderBottomColor: this.route === 'activity' ? '#007aff' : 'transparent' }]}
          >
            <View style={styles.footerItemView}>
              <Text style={[styles.icon, styles.textCenter]}>⚡</Text>
              {this.props.notif.count ?
                <View style={styles.notifCount}>
                  <Text style={styles.notifText}>
                    {this.props.notif.count}
                  </Text>
                </View> : null}
              {this.state.hearts}
            </View>
          </TouchableHighlight>

          <TouchableHighlight
            onPress={() => this.goTo('profile')}
            underlayColor={'transparent'}
            style={[
              styles.footerItem,
              { borderBottomColor: this.route === 'profile' &&
                this.props.users.selectedUserId === this.props.auth.user._id ?
                '#007aff' : 'transparent' }]}
          >

            <View style={styles.footerItemView}>
              {imageEl}
            </View>

          </TouchableHighlight>
        </View>
      );
    }
    return (
      <View>{footerEl}</View>
    );
  }
}

Footer.propTypes = {
  auth: React.PropTypes.object,
  actions: React.PropTypes.object,
  navigator: React.PropTypes.object,
  notif: React.PropTypes.object,
  messages: React.PropTypes.object,
  users: React.PropTypes.object
};

export default Footer;

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
    transform: [{ scale: 1.2 }]
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

styles = { ...localStyles, ...globalStyles };
