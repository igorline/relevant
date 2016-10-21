import React, { Component } from 'react';
import {
  StyleSheet,
  NavigationExperimental,
  TouchableHighlight,
  Text
} from 'react-native';
import NavigationHeaderBackButton from 'NavigationHeaderBackButton';
import Profile from './profile.container';
import Categories from '../components/categories.component';
import Read from './read.container';
import CreatePost from './createPost.container';
import Discover from './discover.container';
import SinglePost from './singlePost.container';
import Activity from './activity.container';
import Comments from './comments.container';
import Messages from './messages.container';
import Thirst from './thirst.container';

import { globalStyles, localStyles } from '../styles/global';

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
      case 'profile':
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

    console.log("Current props ", props);

    switch (key) {
      case 'comment':
        return <Comments />;

      case 'thirst':
        return <Thirst />;

      case 'singlePost':
        console.log('should render single post')
        return <SinglePost />;

      case 'messages':
        return <Messages />;

      case 'categories':
        return <Categories />;

      default:
        return this.getDefaultComponent();
    }
  }

  renderTitle(props) {
    console.log("TITLE ", this.props);
    let key = props.scene.route.key;
    let title = props.scene.route.title;

    if (key === 'default') {
      title = this.props.tabs.routes[this.props.tabs.index].title;
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
    console.log('popping');
    this.props.actions.pop();
    this.forceUpdate();
  }

  renderRight(props) {
    return null;
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
        renderScene={this.renderScene}
        renderHeader={this.renderHeader}
      />
    );
  }
}

styles = { ...localStyles, ...globalStyles };


export default CardContainer;
