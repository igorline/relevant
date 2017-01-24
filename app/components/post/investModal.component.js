import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  Modal,
  Alert,
} from 'react-native';
import * as investActions from '../../actions/invest.actions';
import { globalStyles, fullWidth, fullHeight } from '../../styles/global';
import * as animationActions from '../../actions/animation.actions';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
let styles;

class InvestModal extends Component {
  constructor(props, context) {
    super(props, context);
    this.invest = this.invest.bind(this);
  }

  invest(investAmount) {
    // console.log(investAmount, 'amount');
    // console.log(this.props.post, 'post');
    // console.log(this.props.auth.token, 'token');
    // console.log(this.props.auth.user, 'user');

    this.props.actions.invest(this.props.auth.token, investAmount, this.props.post, this.props.auth.user)
    .then((results) => {
      if (results) {
        this.props.actions.triggerAnimation('invest');
        setTimeout(() => {
          let name = this.props.post.embeddedUser.name;
          Alert.alert('You have subscribed to recieve ' + results.subscription.amount + ' posts from ' + name);
        }, 1500);
      }
    });
    this.props.toggleFunction(false);
  }

  render() {
    return (
      <Modal
        animationType={'fade'}
        transparent
        visible={this.props.visible}
        onRequestClose={() => this.props.toggleFunction()}
      >
        <View style={{ padding: 20, flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.1)' }}>
          <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 5 }}>
            <Text style={{ fontSize: 20, textAlign: 'center' }}>Invest</Text>
            <View style={{ justifyContent: 'center', flexDirection: 'row', flexWrap: 'wrap', overflow: 'visible', marginTop: 10, marginBottom: 10 }}>
              <TouchableHighlight style={styles.investOption} underlayColor={'black'} onPress={() => this.invest(50)}>
                <Text style={styles.modalButtonText}>50</Text>
              </TouchableHighlight>
              <TouchableHighlight style={styles.investOption} underlayColor={'black'} onPress={() => this.invest(100)}>
                <Text style={styles.modalButtonText}>100</Text>
              </TouchableHighlight>
              <TouchableHighlight style={styles.investOption} underlayColor={'black'} onPress={() => this.invest(500)}>
                <Text style={styles.modalButtonText}>500</Text>
              </TouchableHighlight>
              <TouchableHighlight style={styles.investOption} underlayColor={'black'} onPress={() => this.invest(1000)}>
                <Text style={styles.modalButtonText}>1000</Text>
              </TouchableHighlight>
              <TouchableHighlight style={styles.investOption} underlayColor={'black'} onPress={() => this.invest(2000)}>
                <Text style={styles.modalButtonText}>2000</Text>
              </TouchableHighlight>
              <TouchableHighlight style={styles.investOption} underlayColor={'black'} onPress={() => this.invest(5000)}>
                <Text style={styles.modalButtonText}>5000</Text>
              </TouchableHighlight>
              <TouchableHighlight style={styles.investOption} underlayColor={'black'} onPress={() => this.invest(10000)}>
                <Text style={styles.modalButtonText}>10000</Text>
              </TouchableHighlight>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
              <TouchableHighlight
                style={styles.investOption}
                underlayColor={'black'}
                onPress={() => this.props.toggleFunction()}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableHighlight>
            </View>
          </View>
        </View>
      </Modal>
    );
  }
}

function mapStateToProps(state) {
  return {
    auth: state.auth,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      {
        ...investActions,
        ...animationActions,
      }, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(InvestModal);

const localStyles = StyleSheet.create({
  investOption: {
    margin: 5,
    borderWidth: 1,
    borderColor: 'black',
    padding: 5,
    borderRadius: 5,
    width: 75,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
});

styles = { ...localStyles, ...globalStyles };

