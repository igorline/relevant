'use strict';
import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  View,
  Image,
  TextInput
} from 'react-native';
import { connect } from 'react-redux';
var Button = require('react-native-button');
import { bindActionCreators } from 'redux';
import * as authActions from '../actions/authActions';
import * as postActions from '../actions/postActions';
require('../publicenv');

class Post extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
      postText: null
    }
  }

  componentDidMount() {
  }

  render() {
    var self = this;
    var user = null;
    if (self.props.auth) {
      if (self.props.auth.user) user = self.props.auth.user;
    }

    function post() {
      self.props.actions.submitPost(user._id, self.state.postText);
      self.setState({postText: null});
    }

    return (
      <View style={styles.container}>
       <TextInput style={styles.input} placeholder='Relevant text here...' multiline={true} onChangeText={(postText) => this.setState({postText})} value={this.state.postText} onSubmitEditing={post} returnKeyType='done' />
      <Button onPress={post}>Submit</Button>
      </View>
    );
  }
}

function mapStateToProps(state) {
  return {
    auth: state.auth,
    router: state.routerReducer
   }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({...authActions, ...postActions}, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Post)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingBottom: 10
  },
  input: {
    position: 'absolute',
    top: 0,
    right: 0,
    fontSize: 20,
    left: 0,
    bottom: 20,
    padding: 10,
    flex: 1,
    alignSelf: 'center',
  }
});

