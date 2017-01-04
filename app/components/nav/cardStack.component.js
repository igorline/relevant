import React, { Component } from 'react';
import {
  NavigationExperimental,
  Easing
} from 'react-native';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Read from './read.container';
import Discover from './discover.container';
import SinglePost from './singlePost.container';
import Activity from './activity.container';
import Comments from './comments.container';
import Messages from './messages.container';
import Thirst from './thirst.container';
import Profile from './profile.container';

import Card from './../components/nav/card.component';
import * as navigationActions from '../actions/navigation.actions';

const {
  Transitioner: NavigationTransitioner,
} = NavigationExperimental;


class CardContainer extends Component {

  constructor(props, context) {
    super(props, context);
    this.default = this.props.defaultContainer;
    this.renderScene = this.renderScene.bind(this);
    this.back = this.back.bind(this);
    this.thirsty = this.thirsty.bind(this);
    this.configureTransition = this.configureTransition.bind(this);
  }

  getDefaultComponent(props) {
    let key = this.default;

    switch (key) {
      case 'discover':
        return <Discover key={key} {...this.props} navigator={this.props.actions} />;
      case 'myProfile':
        return <Profile key={key} {...this.props} navigator={this.props.actions} />;
      case 'activity':
        return <Activity key={key} {...this.props} navigator={this.props.actions} />;
      case 'read':
        return <Read key={key} {...this.props} navigator={this.props.actions} />;
      default:
        return null;
    }
  }

  back() {
    this.props.actions.pop();
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

      case 'profile':
        return <Profile navigator={this.props.actions} scene={props.scene.route} />;

      default:
        return this.getDefaultComponent(props);
    }
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

  configureTransition() {
    const easing = Easing.out(Easing.ease);
    return {
      duration: 250,
      easing,
    };
  }

  render() {
    const { navigation } = this.props;

    return (
      <NavigationTransitioner
        navigationState={navigation[this.default]}
        render={transitionProps => (
          <Card
            {...transitionProps}
            renderScene={this.renderScene}
            back={this.back}
            {...this.props}
          />)}
      />
    );
  }
}

function mapStateToProps(state) {
  return {
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
