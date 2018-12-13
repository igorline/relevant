import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, Alert, Image } from 'react-native';
import * as investActions from '../../actions/invest.actions';
import { globalStyles, fullWidth, fullHeight, blue, borderGrey } from '../../styles/global';
import * as animationActions from '../../actions/animation.actions';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

let styles;

class InvestModal extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      selected: 0
    };
  }

  render() {
    const betOptions = [0, 1, 5, 15, 50, 100];
    const betEl = betOptions.map((i, n) => {
      let border;
      const selected = n === this.state.selected;
      if (n !== 2 && n !== 5) {
        border = true;
      }
      return (
        <TouchableOpacity
          key={i}
          style={[
            styles.investOption,
            border ? styles.border : null,
            selected ? styles.selected : null
          ]}
          onPress={() => this.setState({ selected: n })}
        >
          <View style={styles.textRow}>
            <Image
              resizeMode={'contain'}
              style={[styles.r, { width: 19, height: 17 }]}
              source={require('../../assets/images/relevantcoin.png')}
            />
            <Text style={styles.statNumber}>{i}</Text>
          </View>
        </TouchableOpacity>
      );
    });

    return (
      <Modal
        animationType={'fade'}
        transparent
        visible={this.props.visible}
        onRequestClose={() => this.props.toggleFunction()}
      >
        <View
          style={{
            padding: 20,
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.3)'
          }}
        >
          <View style={styles.modal}>
            <Text style={{ fontSize: 17, fontWeight: 'bold', textAlign: 'center' }}>
              Will this be one of the top{'\n'} posts of the week?
            </Text>
            <View
              style={{
                justifyContent: 'center',
                flexDirection: 'row',
                flexWrap: 'wrap',
                marginTop: 10,
                marginBottom: 10
              }}
            >
              {betEl}
            </View>
            <Text style={[styles.smallInfo, { textAlign: 'center', paddingHorizontal: 20 }]}>
              If you're right, you will recieve a payout at the end of the week proprtional to the
              amount of the bet
            </Text>

            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              <TouchableOpacity style={styles.uiBtton} onPress={() => this.props.toggleFunction()}>
                <Text style={styles.uiText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.uiBtton} onPress={() => this.props.toggleFunction()}>
                <Text style={styles.uiText}>Place Bet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }
}

function mapStateToProps(state) {
  return {
    auth: state.auth
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      {
        ...investActions,
        ...animationActions
      },
      dispatch
    )
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(InvestModal);

const localStyles = StyleSheet.create({
  modal: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 5,
    paddingBottom: 0
  },
  uiText: {
    color: blue,
    fontSize: 17,
    padding: 20
  },
  uiButton: {
    flex: 1
  },
  border: {
    // borderRightColor: borderGrey,
    // borderRightWidth: 1,
  },
  selected: {
    borderBottomColor: blue
  },
  investOption: {
    borderBottomColor: 'white',
    borderBottomWidth: 4,
    margin: 0,
    marginVertical: 10,
    padding: 10,
    paddingHorizontal: 10,
    width: 79,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center'
  }
});

styles = { ...localStyles, ...globalStyles };
