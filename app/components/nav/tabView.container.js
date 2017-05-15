import React, { Component } from 'react';
import {
  Easing,
} from 'react-native';
import * as NavigationExperimental from 'react-navigation';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Read from '../../containers/read.container';
import Discover from '../../containers/discover.container';
import SinglePost from '../../containers/singlePost.container';
import Activity from '../../containers/activity.container';
// import Messages from './messages.container';
// import Thirst from './thirst.container';
import Profile from '../profile/profile.container';
import Blocked from '../profile/blocked.container';
import { transitionConfig } from '../../utils';
import Card from './card.component';
import * as navigationActions from '../../actions/navigation.actions';
import * as tagActions from '../../actions/tag.actions';
import * as userActions from '../../actions/user.actions';

import PostPeople from '../post/people.container';

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
  }

  shouldComponentUpdate(next) {
    return next.active;
  }

  getDefaultComponent(props) {
    let key = this.default;
    switch (key) {
      case 'discover':
        return <Discover key={key} navigator={this.props.actions} />;
      case 'myProfile':
        return <Profile key={key} navigator={this.props.actions} />;
      case 'activity':
        return <Activity key={key} navigator={this.props.actions} />;
      case 'read':
        return <Read key={key} />;
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
      // case 'comment':
      //   return <Comments navigator={this.props.actions} isTop={props.isTop} scene={props.scene.route} />;

      // case 'thirst':
      //   return <Thirst navigator={this.props.actions} scene={props.scene.route} />;

      case 'singlePost':
        return <SinglePost navigator={this.props.actions} scene={props.scene.route} />;

      // case 'messages':
      //   return <Messages navigator={this.props.actions} />;
      case 'discover':
        return <Discover navigator={this.props.actions} scene={props.scene.route} />;

      case 'profile':
        return <Profile navigator={this.props.actions} scene={props.scene.route} />;

      case 'people':
        return <PostPeople scene={props.scene.route} />;

      case 'blocked':
        return <Blocked scene={props.scene.route} />;

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

  render() {
    const { navigation } = this.props;
    return (
      <NavigationTransitioner
        navigation={{ state: navigation[this.default] }}
        configureTransition={transitionConfig}
        render={transitionProps => (
          <Card
            renderScene={this.renderScene}
            back={this.back}
            auth={this.props.auth}
            scroll={this.props.navigation.scroll}
            globalNav={this.props.navigation}
            {...this.props}
            {...transitionProps}
            header
          />)}
      />
    );
  }
}

function mapStateToProps(state) {
  return {
    navigation: state.navigation,
    auth: state.auth,
    users: state.user,
    tags: state.tags,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      {
        ...userActions,
        ...navigationActions,
        ...tagActions,
      }, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CardContainer);
