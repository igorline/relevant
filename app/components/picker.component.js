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
  Picker
} from 'react-native';
import { connect } from 'react-redux';
var Button = require('react-native-button');
import { bindActionCreators } from 'redux';
import * as authActions from '../actions/auth.actions';
import * as postActions from '../actions/post.actions';
import * as userActions from '../actions/user.actions';
require('../publicenv');
import { globalStyles, fullWidth, fullHeight } from '../styles/global';


class PickerComponent extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
      investAmount: 0
    }
  }

  componentDidMount() {

  }

  invest() {
    var self = this;
    var invest = {
      postId: this.props.posts.investPost._id,
      sign: 1,
      amount: self.state.investAmount
    };
    this.props.actions.invest(this.props.auth.token, invest);
    this.props.actions.closeInvest();
  }



  render() {
    var self = this;
    var pickerStatus = self.props.posts.pickerStatus;
    var parentStyles = self.props.styles;
    var styles = {...localStyles, ...parentStyles};
    var balance = self.props.auth.user.balance;
    var pickerArray = [];
    var investPost = null;
    var investors = null;
    if (self.props.posts.investPost) {
      investPost = self.props.posts.investPost;
      if (investPost.investors) investors = investPost.investors;
    }
    if (balance >= 50) pickerArray.push(<Picker.Item label='50' value={50} />);
    if (balance >= 100) pickerArray.push(<Picker.Item label='100' value={100} />);
    if (balance >= 500) pickerArray.push(<Picker.Item label='500' value={500} />);
    if (balance >= 1000) pickerArray.push(<Picker.Item label='1000' value={1000} />);
    if (balance >= 5000) pickerArray.push(<Picker.Item label='5000' value={5000} />);
    if (balance >= 10000) pickerArray.push(<Picker.Item label='10000' value={10000} />);

    let investButtonString = "Sumbit";
    if (investors) {
      var invested = investors.filter(el => {
        return el.user == self.props.auth.user._id
      })
      if (invested.length) investButtonString = "Change investment"
    }

    return (
          <View pointerEvents={!pickerStatus ? 'none' : ''} style={[styles.pickerContainer, !pickerStatus ? styles.displayNone : '']}>
            <Picker
              selectedValue={this.state.investAmount}
              onValueChange={(investAmount) => this.setState({investAmount: investAmount})} style={styles.picker}>
              {pickerArray}
            </Picker>
            <View style={[styles.buttonParent, styles.row]}>
            <Button onPress={self.props.actions.closeInvest}>Close</Button>
            <Button onPress={self.invest.bind(this)}>{investButtonString}</Button>
            </View>
          </View>
    );
  }
}

export default PickerComponent;

const localStyles = StyleSheet.create({
  pickerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    flexDirection: 'column',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
buttonParent: {
  position: 'absolute',
  bottom: 0,
  width: fullWidth,
  justifyContent: 'space-around',
  padding: 20
},
displayNone: {
  opacity: 0
}
});









