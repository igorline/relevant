import React from 'react';
import { StyleSheet } from 'react-native';
import { withProps } from 'app/utils/nav';
import { createAppContainer } from 'react-navigation';
import { TransitionPresets, createStackNavigator } from 'react-navigation-stack';
import UrlComponent from 'modules/createPost/mobile/url.component';
import Categories from 'modules/createPost/mobile/categories.component';

import HeaderLeft from 'modules/navigation/mobile/headerLeft.component';
import CreatePostHeaderRight from 'modules/createPost/mobile/createPostHeaderRight.component';
import HeaderTitle from 'modules/navigation/mobile/headerTitle.component';

import { darkGrey, fullWidth } from 'app/styles/global';

export const CreatePostStack = createStackNavigator(
  {
    createPostUrl: {
      screen: withProps(UrlComponent),
      params: {
        left: 'Cancel',
        next: 'Next'
      }
    },
    createPostTags: {
      screen: withProps(Categories),
      params: {
        title: 'Select Tags'
      }
    }
  },
  {
    initialRouteName: 'createPostUrl',
    headerLayoutPreset: 'center',
    cardOverlayEnabled: true,
    cardShadowEnabled: true,

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
      headerRight: <CreatePostHeaderRight {...props} />,
      headerLeft: <HeaderLeft {...props} />,
      ...TransitionPresets.SlideFromRightIOS
    })
  }
);

export const CreatePostNavigator = createAppContainer(CreatePostStack);
