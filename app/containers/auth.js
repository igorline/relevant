'use strict';
import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  View,
  TextInput
} from 'react-native';
import { connect } from 'react-redux';
var Button = require('react-native-button');
import Login from '../components/login';
import * as authActions from '../actions/authActions';
import { bindActionCreators } from 'redux';

class Auth extends Component {
  componentDidMount() {
  }

  render() {
    var self = this;
    var auth;
    var message = '';
    this.props.auth.statusText ? message = this.props.auth.statusText : null;
    const { isAuthenticated, user } = this.props.auth;
    const { logout } = this.props.actions;


    if(isAuthenticated){
      auth = (
        <View style={styles.center}>
          <Text style={styles.welcome}>{user ? user.name : null}</Text>
          <Text>{message}</Text>
          <Button onPress={logout}>Logout</Button>
        </View>
        )
    }
    else {
      auth = (
        <Login { ...this.props }/>
      )
    }
    // else if( route.path == 'signup') {
    //   auth = (
    //     <Text>Sign up</Text>
    //   )
    // }

    return (
      <View style={styles.container}>
        {auth}
      </View>
    );
  }
}
export default Auth

// const mapStateToProps = (state) => ({
//   router : state.router,
//   auth : state.auth
// });
// const mapDispatchToProps = (dispatch) => ({
//   actions: bindActionCreators(authActions, dispatch)
// });

// export default connect(mapStateToProps, mapDispatchToProps)(Auth);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 20,
    borderStyle: 'solid',
    borderColor: 'transparent'
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  input: {
    borderColor: '#cccccc',
    borderStyle: 'solid',
    borderWidth: 1,
    height: 30,
    width: 250,
    alignSelf: 'center'
  },
  marginTop: {
    marginTop: 10
  }
});

