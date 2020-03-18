import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { darkGrey, fullWidth } from 'app/styles/global';
import { createAppContainer } from 'react-navigation';
import { createBottomTabNavigator } from 'react-navigation-tabs';

import Discover from 'modules/discover/mobile/discoverTabs.component';
import Stats from 'modules/stats/mobile/stats.container';
import Activity from 'modules/activity/mobile/activity.container';
import Profile from 'modules/profile/mobile/profile.container';
import TabBarContainer from 'modules/navigation/mobile/tabBar.container';

import DiscoverComponent from 'modules/discover/mobile/discover.container';
import SinglePost from 'modules/post/mobile/singlePost.container';
import Blocked from 'modules/profile/mobile/blocked.container';
import Invites from 'modules/invites/mobile/invites.container';
import Settings from 'modules/profile/mobile/settings.container';
import GetTokens from 'modules/getTokens/mobile/getTokens.container';
import VoterList from 'modules/post/mobile/voterList.container';
import Wallet from 'modules/wallet/mobile/wallet.container';

import HeaderLeft from 'modules/navigation/mobile/headerLeft.component';
import HeaderRight from 'modules/navigation/mobile/headerRight.component';
import HeaderTitle from 'modules/navigation/mobile/headerTitle.component';
import CommunityMembers from 'modules/community/mobile/communityMembers.component';
import { colors } from 'styles';

import { TransitionPresets, createStackNavigator } from 'react-navigation-stack';

export const DefaultStack = {
  notifications: {
    screen: Settings,
    path: 'user/profile/:id/settings'
  },
  profile: {
    screen: Profile,
    path: 'user/profile/:id'
  },
  singlePost: {
    screen: SinglePost,
    path: ':community/post/:id',
    navigationOptions: {
      title: 'Read'
    }
  },
  singlePostComment: {
    screen: SinglePost,
    path: ':community/post/:id/:comment',
    navigationOptions: {
      title: 'Read'
    }
  },
  discoverView: {
    screen: Discover,
    path: ':community/:sort',
    navigationOptions: {
      title: 'Read'
    }
  },
  discoverTag: {
    screen: Discover,
    path: ':community/:sort/:topic'
    // navigationOptions: {
    //   title: 'Read'
    // }
    // navigationOptions: props => {
    //   return { gesturesEnabled: false, title: 'Read XXX' };
    // }
  },
  statsView: {
    screen: Stats,
    params: {
      icon: Platform.OS === 'android' ? '📈' : '📈',
      title: 'Stats'
    }
  },
  walletView: {
    screen: Wallet,
    params: {
      icon: Platform.OS === 'android' ? '📈' : '📈',
      title: 'Wallet'
    }
  },
  activityView: {
    screen: Activity,
    params: {
      icon: Platform.OS === 'android' ? '⚡' : '⚡',
      title: 'Activity'
    }
  },
  myProfileView: {
    screen: Profile,
    path: 'user/profile',
    params: {
      icon: Platform.OS === 'android' ? '👤' : '👤',
      title: 'Profile'
    }
  },
  blocked: {
    screen: Blocked,
    params: {
      title: 'Blocked'
    }
  },
  invites: {
    screen: Invites,
    params: {
      title: 'Invites'
    }
  },
  getTokens: {
    screen: GetTokens,
    params: {
      title: 'Get Tokens'
    }
  },
  people: {
    screen: VoterList,
    params: {
      title: 'Votes'
    }
  },
  communityMembers: {
    screen: CommunityMembers,
    params: {
      title: 'Community Members'
    }
  },
  peopleView: {
    screen: props => (
      <DiscoverComponent active={true} type={'people'} key={'people'} {...props} />
    )
  },
  inviteList: {
    screen: props => <inviteListView {...props} />,
    params: {
      title: 'Invite List'
    }
  }
};

const defaultStackSettings = {
  headerLayoutPreset: 'center',
  cardOverlayEnabled: true,
  cardShadowEnabled: true,
  mode: 'card',
  cardStyle: {
    elevation: 4
  },

  defaultNavigationOptions: props => ({
    cardStyle: {
      backgroundColor: colors.white
    },
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
    headerLeft: <HeaderLeft {...props} />,
    ...TransitionPresets.SlideFromRightIOS
  })
};

export const TabNavigator = createBottomTabNavigator(
  {
    myProfile: {
      screen: createStackNavigator(DefaultStack, {
        ...defaultStackSettings,
        initialRouteName: 'myProfileView'
      }),
      path: '',
      params: {
        icon: Platform.OS === 'android' ? '👤' : '👤',
        title: 'Profile'
      }
    },
    wallet: {
      screen: createStackNavigator(DefaultStack, {
        ...defaultStackSettings,
        initialRouteName: 'walletView'
      }),
      path: 'user/wallet',
      params: {
        icon: Platform.OS === 'android' ? '💵' : '💵',
        title: 'Wallet'
      }
    },
    // stats: {
    //   screen: createStackNavigator(DefaultStack,
    //     { ...defaultStackSettings, initialRouteName: 'statsView' }
    //   ),
    //   path: 'user/stats',
    //   params: {
    //     icon: Platform.OS === 'android' ? '📈' : '📈',
    //     title: 'Stats',
    //   }
    // },
    createPostTab: {
      screen: () => null,
      path: 'newpost',
      params: {
        icon: Platform.OS === 'android' ? '📝' : '✍️',
        title: 'New Post'
      }
    },
    activity: {
      screen: createStackNavigator(DefaultStack, {
        ...defaultStackSettings,
        initialRouteName: 'activityView'
      }),
      path: 'user/activity',
      params: {
        icon: Platform.OS === 'android' ? '⚡' : '⚡',
        title: 'Activity'
      }
    },
    discover: {
      screen: createStackNavigator(DefaultStack, {
        ...defaultStackSettings,
        initialRouteName: 'discoverView'
      }),
      path: '',
      params: {
        icon: Platform.OS === 'android' ? '📰' : '📰',
        title: 'Read'
      }
    }
  },
  {
    // lazy: false,
    order: ['discover', 'wallet', 'createPostTab', 'activity', 'myProfile'],
    initialRouteName: 'discover',
    tabBarComponent: navProps => <TabBarContainer navigation={navProps.navigation} />
  }
);

export const TabContainer = createAppContainer(TabNavigator);
