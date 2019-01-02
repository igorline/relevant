import { StyleSheet, View, KeyboardAvoidingView } from 'react-native';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Modal from 'react-native-modalbox';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ShareExtension from 'react-native-share-extension';
import * as createPostActions from 'modules/createPost/createPost.actions';
import Transitioner from 'modules/navigation/mobile/Transitioner';

import * as navigationActions from 'modules/navigation/navigation.actions';
import * as authActions from 'modules/auth/auth.actions';
import * as postActions from 'modules/post/post.actions';
import CreatePost from 'modules/createPost/mobile/createPost.container';
import Auth from 'modules/auth/mobile/auth.container';

import * as utils from 'app/utils';
import Card from 'modules/navigation/mobile/card.component';

import { fullWidth, fullHeight } from 'app/styles/global';

const KBView = KeyboardAvoidingView;

let style;

class ShareContainer extends Component {
  static propTypes = {
    actions: PropTypes.object,
    auth: PropTypes.object,
    navigation: PropTypes.object
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
    this.renderScene = this.renderScene.bind(this);
  }

  componentWillMount() {
    const community = 'relevant';
    this.props.actions.setCommunity(community);
    utils.token
    .get()
    .then(() => {
      this.props.actions.replaceRoute(
        {
          key: 'createPost',
          component: 'createPost',
          title: 'Share on Relevant',
          next: 'Next',
          back: 'Cancel'
        },
        0,
        'home'
      );
      // need to to do this because the navigator renderer
      // is using this object to display info and above to render transition
      this.props.actions.replaceRoute(
        {
          key: 'createPost',
          component: 'createPost',
          title: 'Share on Relevant',
          next: 'Next',
          left: 'Cancel',
          back: true
        },
        0,
        'createPost'
      );
    })
    .catch(() => {
      this.props.actions.replaceRoute(
        {
          key: 'auth',
          component: 'login'
        },
        0,
        'home'
      );
    });
  }

  async componentDidMount() {
    try {
      const data = await ShareExtension.data();
      this.data = data;
      this.setState({
        type: data.type,
        value: data.value,
        data
      });

      let url = data.url || data.value;
      if (url) {
        const words = utils.text.getWords(url);
        url = words.find(word => utils.post.URL_REGEX.test(word));
      }
      this.props.actions.setCreaPostState({
        postUrl: url || null,
        postBody: data.selection || !url ? data.value : '',
        createPreview: {}
      });
    } catch (e) {
      // console.log('share extension error', e);
    }
    this.props.actions.getUser(null, true);
  }

  componentWillReceiveProps(next) {
    if (!this.props.auth.token && next.auth.token) {
      this.props.actions.replaceRoute(
        {
          key: 'createPost',
          component: 'createPost',
          title: 'Share on Relevant',
          next: 'Next',
          back: 'Cancel'
        },
        0,
        'home'
      );
    }
  }

  onClose() {
    ShareExtension.close();
  }

  closeModal() {
    this.setState({
      isOpen: false
    });
  }

  renderScene(props) {
    const { component } = props.scene.route;

    switch (component) {
      case 'login':
        return (
          <Auth
            share
            authType={component}
            navProps={props}
            navigator={this.props.actions}
          />
        );
      case 'createPost':
        return (
          <CreatePost
            share
            close={this.closeModal}
            step={'url'}
            navProps={props}
            navigator={this.props.actions}
          />
        );
      case 'categories':
        return (
          <CreatePost
            share
            step={'categories'}
            navProps={props}
            navigator={this.props.actions}
          />
        );
      case 'createPostFinish':
        return (
          <CreatePost
            share
            close={this.closeModal}
            step={'post'}
            navProps={props}
            navigator={this.props.actions}
          />
        );
      default:
        return null;
    }
  }

  render() {
    const scene = this.props.navigation;

    return (
      <Modal
        backdrop
        style={{
          backgroundColor: 'transparent',
          flex: 1
        }}
        swipeToClose={false}
        animationType={'fade'}
        position="top"
        transparent
        isOpen={this.state.isOpen}
        onClosed={this.onClose}
      >
        <KBView
          behavior={'padding'}
          style={{
            alignItems: 'center',
            flex: 1,
            maxHeight: fullHeight * 0.9
          }}
        >
          <View style={style.modalBody}>
            <Transitioner
              style={{ backgroundColor: 'white', paddingBottom: 0 }}
              navigation={{ state: scene }}
              configureTransition={utils.transitionConfig}
              render={transitionProps =>
                transitionProps.scene.route.ownCard ? (
                  this.renderScene(transitionProps)
                ) : (
                  <Card
                    style={{ backgroundColor: 'white', paddingBottom: 0 }}
                    renderScene={this.renderScene}
                    // back={this.back}
                    {...this.props}
                    header={false}
                    // scroll={this.props.navigation.sroll}
                    {...transitionProps}
                  />
                )
              }
            />
          </View>
        </KBView>
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
    // maxHeight: fullHeight * 0.9,
  }
});

function mapStateToProps(state) {
  return {
    auth: state.auth,
    post: state.post,
    user: state.user,
    navigation: state.navigation.home
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      {
        ...authActions,
        ...postActions,
        ...navigationActions,
        ...createPostActions
      },
      dispatch
    )
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ShareContainer);
