import React, { Component } from 'react';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator, TransitionPresets } from 'react-navigation-stack';
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
import TabContainerWithHelp from 'modules/_app/mobile/tabRouterWithHelp';
import { fullWidth } from 'app/styles/global';
import { colors } from 'styles';

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
      screen: TabContainerWithHelp,
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
      header: false,
      navigationOptions: {
        ...TransitionPresets.ModalSlideFromBottomIOS
      }
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

    defaultNavigationOptions: () => ({
      gesturesEnabled: true,
      gestureResponseDistance: {
        horizontal: fullWidth
      },
      cardStyle: {
        backgroundColor: colors.white
      },
      ...TransitionPresets.SlideFromRightIOS
    })
  }
);

export const AppContainer = createAppContainer(RootStack);
