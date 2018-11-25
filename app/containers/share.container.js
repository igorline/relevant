import {
  StyleSheet,
  View,
  Text,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import * as NavigationExperimental from 'react-navigation';
import React, { Component } from 'react';
import Modal from 'react-native-modalbox';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ShareExtension from 'react-native-share-extension';
import * as createPostActions from '../actions/createPost.actions';
import Transitioner from '../components/nav/Transitioner';

import * as navigationActions from '../actions/navigation.actions';
import * as authActions from '../actions/auth.actions';
import * as postActions from '../actions/post.actions';
import CreatePost from '../components/createPost/createPost.container';
import Auth from '../components/auth/auth.container';

import * as utils from '../utils';
import Card from './../components/nav/card.component';

import { fullWidth, fullHeight } from '../styles/global';

let KBView = KeyboardAvoidingView;

let style;

class ShareContainer extends Component {

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
    let community = 'relevant';
    this.props.actions.setCommunity(community);

    utils.token.get()
    .then(() => {
      this.props.actions.replaceRoute({
        key: 'createPost',
        component: 'createPost',
        title: 'Share on Relevant',
        next: 'Next',
        back: 'Cancel',
      }, 0, 'home');
      // need to to do this because the navigator renderer
      // is using this object to display info and above to render transition
      this.props.actions.replaceRoute({
        key: 'createPost',
        component: 'createPost',
        title: 'Share on Relevant',
        next: 'Next',
        left: 'Cancel',
        back: true,
      }, 0, 'createPost');
    })
    .catch(() => {
      this.props.actions.replaceRoute({
        key: 'auth',
        component: 'login'
      }, 0, 'home');
    });
  }

  async componentDidMount() {
    console.log('did mount');
    try {
      const data = await ShareExtension.data();
      this.data = data;
      console.log('sharedata', data);
      this.setState({
        type: data.type,
        value: data.value,
        data
      });

      let url = data.url || data.value;
      if (url) {
        let words = utils.text.getWords(url);
        url = words.find(word => utils.post.URL_REGEX.test(word));
      }
      // console.log('url ', url)
      this.props.actions.setCreaPostState({
        postUrl: url || null,
        postBody: data.selection || !url ? data.value : '',
        createPreview: {}
      });
    } catch (e) {
      console.log('share extension error', e);
    }
    this.props.actions.getUser(null, true);
  }

  componentWillReceiveProps(next) {
    if (!this.props.auth.token && next.auth.token) {
      this.props.actions.replaceRoute({
        key: 'createPost',
        component: 'createPost',
        title: 'Share on Relevant',
        next: 'Next',
        back: 'Cancel',
      }, 0, 'home');
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
    let component = props.scene.route.component;

    switch (component) {
      case 'login':
        return <Auth share authType={component} navProps={props} navigator={this.props.actions} />;
      case 'createPost':
        return <CreatePost share close={this.closeModal} step={'url'} navProps={props} navigator={this.props.actions} />;
      case 'categories':
        return <CreatePost share step={'categories'} navProps={props} navigator={this.props.actions} />;
      case 'createPostFinish':
        return <CreatePost share close={this.closeModal} step={'post'} navProps={props} navigator={this.props.actions} />;
      default:
        return null;
    }
  }

  render() {
    let scene = this.props.navigation;

    return (
      <Modal
        backdrop
        style={{
          backgroundColor: 'transparent',
          flex: 1,
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
            maxHeight: fullHeight * 0.9,
          }}
        >
          <View style={style.modalBody}>
            <Transitioner
              style={{ backgroundColor: 'white', paddingBottom: 0 }}
              navigation={{ state: scene }}
              configureTransition={utils.transitionConfig}
              render={transitionProps => {
                return transitionProps.scene.route.ownCard ? this.renderScene(transitionProps) :
                (<Card
                  style={{ backgroundColor: 'white', paddingBottom: 0 }}
                  renderScene={this.renderScene}
                  // back={this.back}
                  {...this.props}
                  header={false}
                  // scroll={this.props.navigation.sroll}
                  {...transitionProps}
                />);
              }
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
    paddingBottom: 0,
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
    actions: bindActionCreators({
      ...authActions,
      ...postActions,
      ...navigationActions,
      ...createPostActions
    }, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ShareContainer);

