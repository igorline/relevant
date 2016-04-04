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

    function submitPost() {
      console.log(self.state.postText, 'postText');
      var date = new Date();
      var time = date.getTime();

      fetch('http://localhost:3000/api/post/', {
          credentials: 'include',
          method: 'POST',
          headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userId: user._id,
            body: self.state.postText,
            id: time
        })
      })
      .then((response) => {
        console.log(response, 'response');
      })
      .catch((error) => {
          console.log(error, 'error');
      });
    }

    return (
      <View style={styles.container}>
       <TextInput style={styles.input} placeholder='Post text' multiline={true} onChangeText={(postText) => this.setState({postText})} value={this.state.postText} onSubmitEditing={submitPost} returnKeyType='done' />
      <Button onPress={submitPost}>Submit</Button>
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
    actions: bindActionCreators(authActions, dispatch)
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
    left: 0,
    bottom: 20,
    padding: 10,
    flex: 1,
    alignSelf: 'center',
  }
});

