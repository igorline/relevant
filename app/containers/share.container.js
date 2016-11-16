import {
  StyleSheet,
  View,
  NavigationExperimental,
  Text
} from 'react-native';

import React, { Component } from 'react';
import Modal from 'react-native-modalbox';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ShareExtension from 'react-native-share-extension';
import * as createPostActions from '../actions/createPost.actions';

import * as navigationActions from '../actions/navigation.actions';
import * as authActions from '../actions/auth.actions';
import * as postActions from '../actions/post.actions';
import CreatePost from './createShare.container';
import { fullWidth, fullHeight } from '../styles/global';

const {
  CardStack: NavigationCardStack,
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
    this.props.actions.replaceRoute({
      key: 'createPost',
      component: 'createPost',
      title: 'Share on Relevant',
      next: 'Next',
      back: 'Cancel',
    }, 0, 'home');
  }

  async componentDidMount() {
    try {
      const data = await ShareExtension.data();
      this.setState({
        type: data.type,
        value: data.value,
        data: data
      });
      this.props.actions.setCreaPostState({ postUrl: data.value });
    } catch (e) {
      console.log('share extension error', e);
    }
    this.props.actions.getUser(null, true);
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
      case 'createPost':
        return <CreatePost close={this.closeModal} step={'url'} navProps={props} navigator={this.props.actions} />;
      case 'categories':
        return <CreatePost step={'categories'} navProps={props} navigator={this.props.actions} />;
      case 'createPostFinish':
        return <CreatePost close={this.closeModal} step={'post'} navProps={props} navigator={this.props.actions} />;
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

        <View
          style={{
            alignItems: 'center',
          }}
        >
          <View style={style.modalBody}>
            <Text>{JSON.stringify(this.state.data)}</Text>
            <NavigationCardStack
              key={`scene_${scene.key}`}
              direction={'horizontal'}
              navigationState={scene}
              renderScene={this.renderScene}
              enableGestures={false}
            />
          </View>
        </View>
      </Modal>
    );
  }
}

style = StyleSheet.create({
  modalBody: {
    borderColor: 'lightgrey',
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: 'white',
    height: fullHeight * 0.43,
    width: fullWidth * 0.9,
    marginTop: 65,
    padding: 0,
    overflow: 'hidden'
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

