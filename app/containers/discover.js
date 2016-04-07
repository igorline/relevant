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
import * as userActions from '../actions/userActions';
import { globalStyles } from '../styles/global';

class Discover extends Component {
  componentDidMount() {
    this.props.actions.userIndex();
  }

  render() {
    var self = this;
    var usersEl = null;

    function setSelected(id) {
      self.props.actions.getSelectedUser(id, self.props.auth.token);
    }

    var userIndex = null;
    if (this.props.auth.userIndex) {
      userIndex = this.props.auth.userIndex;
      usersEl = userIndex.map(function(user, i) {
      return (
         <Text onPress={setSelected.bind(null, user._id)}>{user.name}</Text>
      );
    });

    }


    return (
      <View style={styles.container}>
        <Text style={styles.font20}>Users</Text>
        {usersEl}
      </View>
    );
  }
}

function mapStateToProps(state) {
  return {
    auth: state.auth,
    router: state.routerReducer,
    users: state.user
   }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({...authActions, ...userActions}, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Discover)

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 20,
    borderStyle: 'solid',
    borderColor: 'transparent'
  },
});

var styles = {...localStyles, ...globalStyles};

