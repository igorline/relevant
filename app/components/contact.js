'use strict';
import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  View,
  TextInput
} from 'react-native';
var Button = require('react-native-button');
import * as authActions from '../actions/authActions';

class Contact extends Component {

  componentDidMount(){
    this.userIndex()
  }


  userIndex() {
    var self = this;
    fetch('http://localhost:3000/api/user', {
        credentials: 'include',
        method: 'GET'
      })
      .then((response) => response.json())
      .then((responseJSON) => {
        self.setState({userIndex: responseJSON});
      })
      .catch((error) => {
        console.log(error, 'error');
      });
  }

  render() {
    var self = this;
    var contactsList = null;
    var usersNumberList = [];
    var contactNumbersList = [];
    var userIndex = [];
    var match = -1;

    if (this.state) {
      if (this.state.userIndex) userIndex = this.state.userIndex;
    }

    for (var i = 0; i < userIndex.length; i++) {
      if (userIndex[i].phone) {
        usersNumberList.push(userIndex[i].phone);
      }
      if (i == userIndex.length - 1) crossReference();
    };

    function crossReference() {
      for (var i = 0; i < self.props.phoneNumbers.length; i++) {
        var altNum = self.props.phoneNumbers[i].number.replace(/\D/g,'');
        var num = Number(altNum);
        contactNumbersList.push(num);
        if (i == self.props.phoneNumbers.length - 1) {
          for (var i = 0; i < contactNumbersList.length; i++) {
            match = usersNumberList.indexOf(contactNumbersList[i])
          };
        }
      }
    }

    return (
      <View style={styles.center}>
        <Text style={match < 0 ? null : styles.green}>{this.props.firstName}</Text>
      </View>
    );
  }
}

export default Contact

const styles = StyleSheet.create({
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  green: {
    color: 'green',
    fontSize: 35
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center'
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
  },
    margin: {
    margin: 10
  }
});

