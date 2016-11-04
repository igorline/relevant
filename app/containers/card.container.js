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
// import Categories from '../components/categories.component';
import Read from './read.container';
// import CreatePost from './createPost.containerNew';
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
    this.default = this.props.defaultContainer;
    this.renderScene = this.renderScene.bind(this);
    this.renderHeader = this.renderHeader.bind(this);
    this.renderTitle = this.renderTitle.bind(this);
    this.renderLeft = this.renderLeft.bind(this);
    this.renderRight = this.renderRight.bind(this);
    this.back = this.back.bind(this);
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
      // case 'createPost':
        // return <CreatePost {...this.props} navigator={this.props.actions} />;
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

    let key = props.scene.route.key;
    let title = props.scene.route ? props.scene.route.title : null;

    if (key === 'default') {
      let r = this.props.tabs.routes.find(route =>
        this.default === route.key
      );
      title = r.title;
      if (r.key === 'myProfile') {
        title = this.props.auth.user.name;
      } else {
        title = r.title;
      }
    }

    return (
      <NavigationHeader.Title>
        {title}
      </NavigationHeader.Title>
    );
  }

  renderScene(props) {
    let key = props.scene.route.key;

    switch (key) {
      case 'comment':
        return <Comments scene={props.scene.route} />;

      case 'thirst':
        return <Thirst navigator={this.props.actions} />;

      case 'singlePost':
        return <SinglePost navigator={this.props.actions} />;

      case 'messages':
        return <Messages navigator={this.props.actions} />;

      // case 'categories':
      //   return <Categories navigator={this.props.actions} />;

      case 'profile':
        return <Profile scene={props.scene.route} navigator={this.props.actions} />;

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

  renderRight() {
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
      if (balance > 0) balance = balance.toFixed(0);
      if (relevance > 0) relevance = relevance.toFixed(0);
    }
    if (this.props.auth.user) {
      statsEl = (
        <View>
          <Text style={styles.statsTxt}>  📈
            <Text style={styles.active}>{relevance}</Text>  💵
            <Text style={styles.active}>
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
    return rightEl;
  }


  renderHeader(props) {
    return (
      <NavigationHeader
        {...props}
        style={{
          backgroundColor: 'white',
          borderBottomColor: '#f0f0f0',
          borderBottomWidth: 1
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
        onNavigateBack={this.back}
        renderScene={this.renderScene}
        renderHeader={this.renderHeader}
      />
    );
  }
}

const localStyles = StyleSheet.create({
  statsTxt: {
    color: 'black',
    fontSize: 10
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
