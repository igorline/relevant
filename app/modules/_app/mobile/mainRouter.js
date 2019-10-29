import React, { Component } from 'react';
import { createStackNavigator, createAppContainer } from 'react-navigation';
import {
  StackViewStyleInterpolator,
  StackViewTransitionConfigs
} from 'react-navigation-stack';
import { KeyboardAvoidingView, StatusBar, Platform } from 'react-native';
import PropTypes from 'prop-types';

// root routes
import AuthContainer from 'modules/auth/mobile/auth.container';
import ArticleView from 'modules/navigation/mobile/articleView.container';
import ErrorComponent from 'modules/ui/mobile/error.component';
import StallScreen from 'modules/navigation/mobile/stallScreen.component';
import {
  CreatePostNavigator,
  CreatePostStack
} from 'modules/_app/mobile/createPostRouter';
import { TabContainer } from 'modules/_app/mobile/tabRouter';

class CreatePostWrapper extends Component {
  static propTypes = {
    navigation: PropTypes.object
  };

  static router = CreatePostStack.router;

  render() {
    return (
      <KeyboardAvoidingView
        behavior={'padding'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'android' ? StatusBar.currentHeight : 0}
      >
        <CreatePostNavigator navigation={this.props.navigation} />
      </KeyboardAvoidingView>
    );
  }
}

export const RootStack = createStackNavigator(
  {
    auth: {
      screen: AuthContainer,
      header: false,
      path: ''
    },
    main: {
      screen: TabContainer,
      path: ''
    },
    stall: {
      screen: StallScreen
    },
    error: {
      screen: ErrorComponent,
      path: 'error'
    },
    articleView: {
      screen: ArticleView
    },
    createPost: {
      screen: CreatePostWrapper,
      header: false
    }
    // this will be community drawer
    // categories: {
    //   screen: (props) => <CreatePostContainer {...props} step={'url'} />
    // },
  },
  {
    initialRouteName: 'main',
    headerMode: 'none',
    headerLayoutPreset: 'center',
    cardOverlayEnabled: true,
    cardShadowEnabled: true,

    transitionConfig: () => ({
      ...StackViewTransitionConfigs.SlideFromRightIOS,

      screenInterpolator: props => {
        // Transitioning to search screen (navigate)
        if (props.scene.route.routeName === 'createPost') {
          return StackViewStyleInterpolator.forVertical(props);
        }

        const last = props.scenes[props.scenes.length - 1];

        // Transitioning from search screen (goBack)
        if (last.route.routeName === 'createPost') {
          return StackViewStyleInterpolator.forVertical(props);
        }

        return StackViewStyleInterpolator.forHorizontal(props);
      }
    })
  }
);

export const AppContainer = createAppContainer(RootStack);
