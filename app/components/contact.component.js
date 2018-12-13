import React, { Component } from 'react';
import { Text, View } from 'react-native';
import PropTypes from 'prop-types';

class Contact extends Component {
  static propTypes = {
    styles: PropTypes.object,
    givenName: PropTypes.string
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      matchUser: null
    };
  }

  componentDidMount() {}

  crossReference() {
    const self = this;
    const contactNumbersList = [];
    let userIndex = [];
    if (self.props.userIndex) userIndex = self.props.userIndex;

    for (let i = 0; i < self.props.phoneNumbers.length; i++) {
      const altNum = self.props.phoneNumbers[i].number.replace(/\D/g, '');
      const num = Number(altNum);
      contactNumbersList.push(num);

      if (i === self.props.phoneNumbers.length - 1) {
        for (let x = 0; x < contactNumbersList.length; x++) {
          for (let y = 0; y < userIndex.length; y++) {
            if (userIndex[y].phone) {
              if (userIndex[y].phone === contactNumbersList[x]) {
                self.setState({ matchUser: userIndex[y] });
              }
            }
          }
        }
      }
    }
  }

  render() {
    const self = this;
    const styles = this.props.styles;
    const matchUser = self.state.matchUser;

    self.crossReference(self);

    return (
      <View style={styles.center}>
        <Text style={matchUser ? styles.green : null}>
          {this.props.givenName}
          {matchUser ? '  Relevant username: ' + matchUser.name : null}
        </Text>
      </View>
    );
  }
}

export default Contact;
