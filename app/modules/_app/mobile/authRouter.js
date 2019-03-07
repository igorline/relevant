import React from 'react';
import { StyleSheet } from 'react-native';
import { withProps } from 'app/utils/nav';
import { createStackNavigator, createAppContainer } from 'react-navigation';

import TwitterSignup from 'modules/auth/mobile/twitterSignup.component';
import ImageUpload from 'modules/auth/mobile/imageUpload.component';
import Forgot from 'modules/auth/mobile/forgot.component';
import ResetPassword from 'modules/auth/mobile/resetPassword.component';
import Auth from 'modules/auth/mobile/auth.component';
import Login from 'modules/auth/mobile/login.component';
import SignUp from 'modules/auth/mobile/signup.component';

import HeaderLeft from 'modules/navigation/mobile/headerLeft.component';
import HeaderRight from 'modules/navigation/mobile/headerRight.component';
import HeaderTitle from 'modules/navigation/mobile/headerTitle.component';

import { darkGrey, fullWidth } from 'app/styles/global';

export const AuthStack = createStackNavigator(
  {
    mainAuth: {
      screen: Auth,
      navigationOptions: { header: null }
    },
    login: {
      screen: withProps(Login),
      path: 'login',
      params: {
        title: 'Sign In'
      }
    },
    signup: {
      screen: withProps(SignUp),
      params: {
        title: 'Sign Up'
      }
    },
    twitterSignup: {
      screen: withProps(TwitterSignup),
      params: {
        title: 'Sign Up'
      }
    },
    imageUpload: {
      screen: withProps(ImageUpload),
      params: {
        title: 'Upload Image'
      }
    },
    forgot: {
      screen: withProps(Forgot),
      params: {
        title: 'Reset Password'
      }
    },
    resetPassword: {
      screen: withProps(ResetPassword),
      uriPrefix: 'Relevant://',
      path: 'user/resetPassword/:token',
      params: {
        title: 'Reset Password'
      }
    }
  },
  {
    initialRouteName: 'mainAuth',
    headerLayoutPreset: 'center',
    defaultNavigationOptions: props => ({
      gesturesEnabled: true,
      gestureResponseDistance: {
        horizontal: fullWidth
      },
      headerStyle: {
        elevation: 0,
        shadowOpacity: 0,
        borderBottomColor: darkGrey,
        borderBottomWidth: StyleSheet.hairlineWidth
      },
      headerTitle: <HeaderTitle {...props} />,
      headerRight: <HeaderRight {...props} />,
      headerLeft: <HeaderLeft {...props} />
    })
  }
);

export const AuthNavigator = createAppContainer(AuthStack);
