import {
  StyleSheet,
  View,
  Text,
  KeyboardAvoidingView
} from 'react-native';
import * as NavigationExperimental from 'react-navigation';
import React, { Component } from 'react';
import Modal from 'react-native-modalbox';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ShareExtension from 'react-native-share-extension';
import * as createPostActions from '../actions/createPost.actions';

import * as navigationActions from '../actions/navigation.actions';
import * as authActions from '../actions/auth.actions';
import * as postActions from '../actions/post.actions';
import CreatePost from '../components/createPost/createPost.container';
import Auth from '../components/auth/auth.container';
import * as utils from '../utils';
import Card from './../components/nav/card.component';

import { fullWidth, fullHeight } from '../styles/global';

const {
  Transitioner: NavigationTransitioner,
} = NavigationExperimental;

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
    utils.token.get()
    .then(() => {
      this.props.actions.replaceRoute({
        key: 'createPost',
        component: 'createPost',
        title: 'Share on Relevant',
        next: 'Post',
        back: 'Cancel',
      }, 0, 'home');
    })
    .catch(() => {
      this.props.actions.replaceRoute({
        key: 'auth',
        component: 'login'
      }, 0, 'home');
    });
  }

  async componentDidMount() {
    try {
      const data = await ShareExtension.data();
      this.setState({
        type: data.type,
        value: data.value,
        data
      });
      this.props.actions.setCreaPostState({
        postUrl: data.url,
        postBody: data.selection,
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
        next: 'Post',
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
        style={{ backgroundColor: 'transparent' }}
        animationType={'fade'}
        position="top"
        transparent
        isOpen={this.state.isOpen}
        onClosed={this.onClose}
      >
        <KeyboardAvoidingView
          behavior={'padding'}
          style={{
            alignItems: 'center',
            flex: 1,
            maxHeight: fullHeight * 0.9,
          }}
        >
          <View style={style.modalBody}>
            <NavigationTransitioner
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
    width: fullWidth * 0.95,
    marginTop: 65,
    marginBottom: 20,
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

