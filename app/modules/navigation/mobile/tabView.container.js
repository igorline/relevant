import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Discover from 'modules/discover/mobile/discoverTabs.component';
import DiscoverComponent from 'modules/discover/mobile/discover.container';
import Stats from 'modules/stats/mobile/stats.container';
import SinglePost from 'modules/post/mobile/singlePost.container';
import Activity from 'modules/activity/mobile/activity.container';
import Profile from 'modules/profile/mobile/profile.container';
import Blocked from 'modules/profile/mobile/blocked.container';
import Invites from 'modules/invites/mobile/invites.container';
import { transitionConfig } from 'app/utils';
import Transitioner from 'modules/navigation/mobile/Transitioner';
import Card from 'modules/navigation/mobile/card.component';
import * as navigationActions from 'modules/navigation/navigation.actions';
import * as tagActions from 'modules/tag/tag.actions';
import * as userActions from 'modules/user/user.actions';
import VoterList from 'modules/post/mobile/voterList.container';

class TabView extends PureComponent {
  static propTypes = {
    defaultContainer: PropTypes.string,
    actions: PropTypes.object,
    auth: PropTypes.object,
    navigation: PropTypes.object
  };

  constructor(props, context) {
    super(props, context);
    this.default = this.props.defaultContainer;
    this.renderScene = this.renderScene.bind(this);
    this.back = this.back.bind(this);
  }

  getDefaultComponent() {
    const { actions } = this.props;
    const key = this.default;
    switch (key) {
      case 'discover':
        return <Discover key={key} actions={actions} />;
      case 'myProfile':
        return <Profile key={key} navigator={actions} />;
      case 'activity':
        return <Activity key={key} navigator={actions} />;
      case 'stats':
        return <Stats key={key} />;
      default:
        return null;
    }
  }

  back() {
    this.props.actions.pop();
  }

  renderScene(props) {
    const { component } = props.scene.route;

    switch (component) {
      case 'singlePost':
        return <SinglePost navigator={this.props.actions} scene={props.scene.route} />;

      case 'discover':
        return (
          <Discover
            key={props.scene.route.key}
            actions={this.props.actions}
            scene={props.scene.route}
          />
        );

      case 'profile':
        return <Profile navigator={this.props.actions} scene={props.scene.route} />;

      case 'people':
        return <VoterList scene={props.scene.route} />;

      case 'peopleView':
        return (
          <DiscoverComponent
            active
            type={'people'}
            key={'people'}
            scene={props.scene.route}
          />
        );

      case 'blocked':
        return <Blocked scene={props.scene.route} />;

      case 'invites':
        return <Invites scene={props.scene.route} />;

      case 'inviteList':
        return <Invites inviteListView scene={props.scene.route} />;

      default:
        return this.getDefaultComponent(props);
    }
  }

  render() {
    const { navigation } = this.props;
    return (
      <Transitioner
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
          />
        )}
      />
    );
  }
}

function mapStateToProps(state) {
  return {
    navigation: state.navigation,
    auth: state.auth,
    users: state.user,
    tags: state.tags
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      {
        ...userActions,
        ...navigationActions,
        ...tagActions
      },
      dispatch
    )
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TabView);
