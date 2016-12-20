import React, { Component } from 'react';
import {
  StyleSheet,
  NavigationExperimental,
  TouchableHighlight,
  Text,
  View,
  Image
} from 'react-native';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import BackButton from 'NavigationHeaderBackButton';
import Read from './read.container';
import Discover from './discover.container';
import SinglePost from './singlePost.container';
import Activity from './activity.container';
import Comments from './comments.container';
import Messages from './messages.container';
import Thirst from './thirst.container';
import Profile from './profile.container';

import { globalStyles } from '../styles/global';
import * as navigationActions from '../actions/navigation.actions';

const {
  Header: NavigationHeader,
  CardStack: NavigationCardStack,
} = NavigationExperimental;

let styles;

class CardContainer extends Component {

  constructor(props, context) {
    super(props, context);
    this.abbreviateNumber = this.abbreviateNumber.bind(this);
    this.default = this.props.defaultContainer;
    this.renderScene = this.renderScene.bind(this);
    this.renderHeader = this.renderHeader.bind(this);
    this.renderTitle = this.renderTitle.bind(this);
    this.renderLeft = this.renderLeft.bind(this);
    this.renderRight = this.renderRight.bind(this);
    this.back = this.back.bind(this);
    this.thirsty = this.thirsty.bind(this);
  }

  getDefaultComponent(props) {
    let key = this.default;

    switch (key) {
      case 'discover':
        return <Discover {...this.props} navigator={this.props.actions} />;
      case 'myProfile':
        return <Profile {...this.props} navigator={this.props.actions} />;
      case 'activity':
        return <Activity {...this.props} navigator={this.props.actions} />;
      case 'read':
        return <Read {...this.props} navigator={this.props.actions} />;
      default:
        return null;
    }
  }

  back() {
    this.props.actions.pop();
  }

  renderLeft(props) {
    let back = null;
    if (props.scene.route.back) {
      back = (
        <BackButton onPress={this.back} />
      );
    }
    return back;
  }

  renderTitle(props) {
    let title = props.scene.route ? props.scene.route.title : '';

    if (title === 'Profile' && this.props.auth.user) {
      title = this.props.auth.user.name;
    }

    let clipped = title;

    if (title && title.length > 20) {
      clipped = title.substring(0, 18);
      clipped += '...';
    }

    if (title === 'Read') {
      return (
        <NavigationHeader.Title style={{ bottom: -4, backgroundColor: 'transparent' }}>
          <Image
            source={require('../assets/images/logo.png')}
            resizeMode={'contain'}
            style={{ width: 200, height: 25 }}
          />
        </NavigationHeader.Title>
      );
    }

    return (
      <NavigationHeader.Title>
        <Text style={styles.navTitle}>{clipped}</Text>
      </NavigationHeader.Title>
    );
  }

  renderScene(props) {
    let component = props.scene.route.component;

    switch (component) {
      case 'comment':
        return <Comments navigator={this.props.actions} scene={props.scene.route} />;

      case 'thirst':
        return <Thirst navigator={this.props.actions} scene={props.scene.route} />;

      case 'singlePost':
        return <SinglePost navigator={this.props.actions} scene={props.scene.route} />;

      case 'messages':
        return <Messages navigator={this.props.actions} />;

      // case 'categories':
      //   return <Categories navigator={this.props.actions} />;

      case 'profile':
        return <Profile navigator={this.props.actions} scene={props.scene.route} />;

      // case 'auth':
      //   return <Auth authType={key} />;

      // case 'login':
      //   return <Auth authType={key} />;

      // case 'signup':
      //   return <Auth authType={key} />;

      default:
        return this.getDefaultComponent(props);
    }
  }

  abbreviateNumber(num) {
    let fixed = 0;
    if (num === null) { return null; } // terminate early
    if (num === 0) { return '0'; } // terminate early
    if (typeof num !== 'number') num = Number(num);
    fixed = (!fixed || fixed < 0) ? 0 : fixed; // number of decimal places to show
    let b = (num).toPrecision(2).split('e'); // get power
    let k = b.length === 1 ? 0 : Math.floor(Math.min(b[1].slice(1), 14) / 3); // floor at decimals, ceiling at trillions
    let c = k < 1 ? num.toFixed(0 + fixed) : (num / Math.pow(10, k * 3) ).toFixed(1 + fixed); // divide by power
    let d = c < 0 ? c : Math.abs(c); // enforce -0 is 0
    let e = d + ['', 'K', 'M', 'B', 'T'][k]; // append power
    return e;
  }

  thirsty() {

    // this.props.actions.push({
    //   key: 'signup',
    //   title: 'Signup',
    //   showBackButton: true
    // }, this.props.navigation.main);

    console.log('thirsty');
    // this.props.actions.push({
    //     key: 'thirst',
    //     showBackButton: true,
    //     title: 'thirsty message',
    //   }, 'home');
  }

  renderRight(props) {
    let statsEl = null;
    let relevance = 0;
    let balance = 0;
    let user = null;
    let rightEl;

    let key = this.default;
    if (this.props.auth.user) {
      user = this.props.auth.user;
      if (user.relevance) relevance = user.relevance;
      if (user.balance) balance = user.balance;
      if (balance > 0) {
        balance = this.abbreviateNumber(balance);
      }
      if (relevance > 0) {
        relevance = this.abbreviateNumber(relevance);
      }

      statsEl = (
        <View>
          <Text style={styles.statsTxt}>  📈
            <Text style={[styles.bebas, styles.quarterLetterSpacing, { fontSize: 13 }]}>
              {relevance}
            </Text>  💵
            <Text style={[styles.bebas, styles.quarterLetterSpacing, { fontSize: 13 }]}>
              {balance}
            </Text>
          </Text>
        </View>
      );
    }

    if (key !== 'myProfile') {
      rightEl = (
        <View style={{ flex: 1, justifyContent: 'center', padding: 10 }}>
          {statsEl}
        </View>
      );
    } else {
      rightEl = (
        <View style={styles.gear}>
          <TouchableHighlight
            underlayColor={'transparent'}
            onPress={() => this.props.showActionSheet()}
          >
            <Image
              style={styles.gearImg}
              source={require('../assets/images/gear.png')}
            />
          </TouchableHighlight>
        </View>
      );
    }

    if (props.scene.route.component === 'profile' && props.scene.route.id !== this.props.auth.user._id) {
      rightEl = null;
      // rightEl = (
      //   <View style={styles.gear}>
      //     <TouchableHighlight
      //       underlayColor={'transparent'}
      //       onPress={() => this.thirsty()}
      //     >
      //       <Text>thirsty</Text>
      //     </TouchableHighlight>
      //   </View>
      // );
    }
    return rightEl;
  }


  renderHeader(props) {
    return (
      <NavigationHeader
        {...props}
        style={{
          backgroundColor: 'white',
          borderBottomColor: '#242425',
          borderBottomWidth: StyleSheet.hairlineWidth,
        }}
        renderTitleComponent={this.renderTitle}
        renderLeftComponent={this.renderLeft}
        renderRightComponent={this.renderRight}
      />
    );
  }

  render() {
    const { navigation } = this.props;
    const scenes = navigation[this.default];

    return (
      <NavigationCardStack
        direction={'horizontal'}
        navigationState={scenes}
        style={{ backgroundColor: 'white' }}
        onNavigateBack={this.back}
        renderScene={this.renderScene}
        renderHeader={this.renderHeader}
        enableGestures
      />
    );
  }
}

const localStyles = StyleSheet.create({
  statsTxt: {
    color: 'black',
    fontSize: 13
  },
  gearImg: {
    height: 20,
    width: 20
  },
  gear: {
    height: 45,
    flex: 1,
    justifyContent: 'center',
    padding: 12,
  },
});

styles = { ...localStyles, ...globalStyles };


function mapStateToProps(state) {
  return {
    tabs: state.tabs,
    navigation: state.navigation,
    auth: state.auth,
    users: state.user
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      {
        ...navigationActions
      }, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CardContainer);
