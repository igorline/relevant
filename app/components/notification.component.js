'use strict';
import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableHighlight,
  LinkingIOS,
  Animated
} from 'react-native';
import { connect } from 'react-redux';
var Button = require('react-native-button');
import { bindActionCreators } from 'redux';
import * as notifActions from '../actions/notif.actions';
require('../publicenv');
import { globalStyles, fullWidth, fullHeight } from '../styles/global';

class Notification extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
      notifOpac: new Animated.Value(0),
    }
  }

  componentDidUpdate() {
    var self = this;
    if (this.props.notif.active) {
      this.flashNotif();
    }
  }

  flashNotif() {
    var self = this;
     Animated.timing(
       self.state.notifOpac,
       {toValue: 1}
     ).start();
    setTimeout(function() {
       Animated.timing(
       self.state.notifOpac,
       {toValue: 0}
     ).start();
    }, 2000);
  }


  render() {
    var self = this;
    var parentStyles = this.props.styles;
    var styles = {...localStyles, ...parentStyles};
    var message = this.props.message;
    var bool = self.props.bool;
    console.log(this.props, 'notification props')

    return (
      <Animated.View style={[styles.parent, bool ? styles.green : styles.red, {opacity: self.state.notifOpac}]}>
        <Text style={styles.notifText}>{self.props.notif.text}</Text>
      </Animated.View>
    );
  }
}

function mapStateToProps(state) {
  return {
    notif: state.notif
   }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({...notifActions }, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Notification)


const localStyles = StyleSheet.create({
parent: {
  width: fullWidth,
  padding: 10,
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center'
},
notifText: {
  color: 'white',
  fontSize: 20,
},
red: {
  backgroundColor: 'red'
},
green: {
  backgroundColor: 'green'
}
});






