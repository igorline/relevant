import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  Modal,
} from 'react-native';
import { globalStyles, fullWidth, fullHeight } from '../styles/global';

class InvestModal extends Component {
  constructor(props, context) {
    super(props, context);
    this.invest = this.invest.bind(this);
  }

  invest(investAmount) {
    const self = this;
    this.props.actions.invest(this.props.auth.token, investAmount, this.props.post, this.props.auth.user)
    .then((results) => {
      if (results) {
        self.props.actions.triggerAnimation('invest');
      } else {
        console.log('investment failed');
      }
    });
    this.prosp.actions.toggleFunction(false);
  }

  render() {
    return (
      <Modal
          animationType={'fade'}
          transparent
          visible={this.props.visible}
          onRequestClose={() => this.props.toggleFunction()}
        >
          <View style={{ flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.1)' }}>
            <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 5 }}>
              <Text style={{ fontSize: 20, textAlign: 'center' }}>Invest</Text>
              <View style={{ justifyContent: 'center', flexDirection: 'row', flexWrap: 'wrap', flex: 1, overflow: 'visible', marginTop: 10, marginBottom: 10 }}>
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

export default InvestModal;

const localStyles = StyleSheet.create({

});

