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
import NavigationHeaderBackButton from 'NavigationHeaderBackButton';
import Categories from '../components/categories.component';
import Read from './read.container';
import CreatePost from './createPost.container';
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

  getDefaultComponent() {
    let key = this.default;

    switch (key) {
      case 'discover':
        return <Discover {...this.props} navigator={this.props.actions} />;
      case 'myProfile':
        return <Profile {...this.props} navigator={this.props.actions} />;
      case 'activity':
        return <Activity {...this.props} navigator={this.props.actions} />;
      case 'createPost':
        return <CreatePost {...this.props} navigator={this.props.actions} />;
      case 'read':
        return <Read {...this.props} navigator={this.props.actions} />;
      default:
        return null;
    }
  }

  getView() {
    let routes = this.props.navigation.routes;
    let index = this.props.navigation.index;
    return routes[index];
  }

  renderScene(props) {
    let key = props.scene.route.key;

    switch (key) {
      case 'comment':
        return <Comments />;

      case 'thirst':
        return <Thirst navigator={this.props.actions} />;

      case 'singlePost':
        return <SinglePost navigator={this.props.actions} />;

      case 'messages':
        return <Messages navigator={this.props.actions} />;

      case 'categories':
        return <Categories navigator={this.props.actions} />;

      case 'profile':
        return <Profile navigator={this.props.actions} />;

      default:
        return this.getDefaultComponent();
    }
  }

  renderTitle(props) {
    let key = props.scene.route.key;
    let title = props.scene.route ? props.scene.route.title : null;

    if (key === 'default') {
      let r = this.props.tabs.routes.find(route => {
        return this.default === route.key;
      });
      console.log(r)
      title = r.title;
    }

    if (key === 'profile') {
      if (this.props.users.selectedUserData) {
        if (this.props.users.selectedUserData.name) title = this.props.users.selectedUserData.name;
      }
    }

    if (key == 'singlePost') {
      if (this.props.posts.selectedPostData) {
        if (this.props.posts.selectedPostData.title) title = this.props.posts.selectedPostData.title;
      }
    }

    return (
      <NavigationHeader.Title>
        {title}
      </NavigationHeader.Title>
    );
  }

  renderLeft(props) {
    let back = null;
    if (props.scene.route.back) {
      back = (
        <NavigationHeaderBackButton onPress={this.back} />
      );
    }
    return back;
  }

  back() {
    this.props.actions.pop();
  }

  renderRight(props) {
    let statsEl = null;
    let relevance = 0;
    let balance = 0;
    let user = null;

    let key = this.default;
    //console.log("RIGHT KEY ", key)
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
    if (key !== 'profile') {
      return (
        <View style={{ flex: 1, justifyContent: 'center', padding: 10 }}>
          {statsEl}
        </View>
      );
    } else if (key === 'profile' &&
      this.props.users.selectedUserId === this.props.auth.user._id) {
      return (
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
    // return null;
  }


  renderHeader(props) {
    return (
      <NavigationHeader
        {...props}
        style={{
          backgroundColor: 'white',
          borderBottomColor: '#f0f0f0',
          borderBottomWidth: StyleSheet.hairlineWidth
        }}
        renderTitleComponent={this.renderTitle}
        renderLeftComponent={this.renderLeft}
        renderRightComponent={this.renderRight}
      />
    );
  }

  render() {
    return (
      <NavigationCardStack
        direction={'horizontal'}
        navigationState={this.props.navigation}
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
        push: route => navigationActions.push(route),
        pop: () => navigationActions.pop(),

      }, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CardContainer);

// export default CardContainer;
