import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  KeyboardAvoidingView,
  AppState,
  Dimensions
} from 'react-native';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ShareExtension from 'react-native-share-extension';
import RNExitApp from 'react-native-exit-app';

import * as createPostActions from 'modules/createPost/createPost.actions';
import * as navigationActions from 'modules/navigation/navigation.actions';
import * as authActions from 'modules/auth/auth.actions';
import * as postActions from 'modules/post/post.actions';
import * as communityActions from 'modules/community/community.actions';

import Auth from 'modules/auth/mobile/auth.component';

import { createAppContainer } from 'react-navigation';
import { TransitionPresets, createStackNavigator } from 'react-navigation-stack';

import UrlComponent from 'modules/createPost/mobile/url.component';
import Categories from 'modules/createPost/mobile/categories.component';

import HeaderLeft from 'modules/navigation/mobile/headerLeft.component';
import CreatePostHeaderRight from 'modules/createPost/mobile/createPostHeaderRight.component';
import HeaderTitle from 'modules/navigation/mobile/headerTitle.component';
import { setTopLevelNavigator, withProps } from 'app/utils/nav';

import { text, storage, post } from 'app/utils';
import { darkGrey } from 'app/styles/global';

// Nasty hack because for some reason Dimensions.get('window') returns 0,0
const fullWidth = Dimensions.get('screen').width;
const fullHeight = Dimensions.get('screen').height;
// Modal animation depends on getting the width of the screen
Dimensions.get = () => ({ width: fullWidth, height: fullHeight });
const Modal = require('react-native-modalbox').default;

let style;

export const ShareStack = createStackNavigator(
  {
    createPostUrl: {
      screen: withProps(UrlComponent),
      params: {
        title: 'Share On Relevant',
        left: 'Close',
        next: 'Next',
        share: true
      }
    },
    createPostTags: {
      screen: withProps(Categories),
      params: {
        title: 'Post Category',
        share: true
      }
    },
    shareAuth: {
      screen: withProps(Auth),
      params: {
        left: 'Close',
        share: true
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
        borderBottomWidth: StyleSheet.hairlineWidth,
        height: 45
      },
      headerTitle: <HeaderTitle {...props} />,
      headerRight: <CreatePostHeaderRight {...props} />,
      headerLeft: <HeaderLeft {...props} />,
      ...TransitionPresets.SlideFromRightIOS
    })
  }
);

const ShareAppContainer = createAppContainer(ShareStack);

class ShareContainer extends Component {
  static propTypes = {
    actions: PropTypes.object,
    auth: PropTypes.object
  };

  state = {
    token: null
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      isOpen: true,
      type: '',
      value: '',
      data: {}
    };
    this.closeModal = this.closeModal.bind(this);
    AppState.addEventListener('change', this.handleAppStateChange.bind(this));
  }

  async componentDidMount() {
    try {
      const community = 'relevant';
      this.props.actions.setCommunity(community);
      const token = await storage.getToken();

      this.setState({ token });
      if (!token) this.props.actions.replace('shareAuth');

      const { actions } = this.props;
      const resp = await this.props.actions.getUser();
      const { auth } = this.props;
      if (resp && auth && auth.user && auth.user.community) {
        await actions.getCommunities();
        actions.setCommunity(auth.user.community);
      }
    } catch (e) {
      // console.log('e', e);
    }

    try {
      const { actions } = this.props;
      const data = await ShareExtension.data();
      this.data = data;
      this.setState({
        type: data.type,
        value: data.value,
        data
      });
      let url = data.url || data.value;
      if (url) {
        const words = text.getWords(url);
        url = words.find(word => post.URL_REGEX.test(word));
      }
      actions.setCreatePostState({
        postUrl: url || null,
        postBody: data.selection || !url ? data.value : '',
        createPreview: {}
      });
    } catch (e) {
      // console.log('share extension error', e);
    }
  }

  handleAppStateChange(currentAppState) {
    if (currentAppState === 'extension' && !this.state.token) {
      storage.getToken().then(tk => {
        this.setState({ token: tk });
        if (tk) this.props.actions.replace('createPostUrl');
      });
    }
  }

  onClose() {
    ShareExtension.close();
    // Share extension fails to exit the React app, so if you try to open it two times in a row it fails
    RNExitApp.exitApp();
  }

  closeModal() {
    this.setState({
      isOpen: false
    });
  }

  render() {
    return (
      <Modal
        backdrop
        style={{
          backgroundColor: 'transparent',
          flex: 1
        }}
        coverScreen
        keyboardTopOffset={0}
        swipeToClose={false}
        position="top"
        entry="bottom"
        isOpen={this.state.isOpen}
        onClosed={this.onClose}
      >
        <KeyboardAvoidingView
          behavior={'padding'}
          style={{
            alignItems: 'center',
            flex: 1,
            maxHeight: fullHeight * 0.9
          }}
        >
          <View style={style.modalBody}>
            <ShareAppContainer
              ref={navigatorRef => {
                setTopLevelNavigator(navigatorRef);
              }}
              screenProps={{ close: this.closeModal, share: true }}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    );
  }
}

style = StyleSheet.create({
  modalBody: {
    borderRadius: 10,
    backgroundColor: 'white',
    flexGrow: 1,
    flex: 1,
    width: fullWidth * 0.95,
    marginTop: fullHeight * 0.05,
    marginBottom: 30,
    padding: 0,
    overflow: 'hidden',
    paddingBottom: 0
  }
});

function mapStateToProps(store) {
  return {
    auth: store.auth,
    community: store.community
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      {
        ...authActions,
        ...postActions,
        ...navigationActions,
        ...createPostActions,
        ...communityActions
      },
      dispatch
    )
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ShareContainer);
