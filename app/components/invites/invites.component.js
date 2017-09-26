import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  TouchableHighlight,
  TextInput,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import { globalStyles } from '../../styles/global';
import CustomSpinner from '../../components/CustomSpinner.component';

let styles;

export default class InviteComponent extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      email: '',
      name: '',
      invitedByString: '',
      sending: false
    };
    this.createInvite = this.createInvite.bind(this);
  }

  createInvite() {
    if (this.state.sending) return;
    this.setState({ sending: true });
    let { email, name, invitedByString } = this.state;
    if (!name || !email || !invitedByString) {
      this.setState({ sending: false });
      return Alert.alert('Make sure all feilds are complete');
    }
    let invite = {
      email,
      name,
      invitedByString,
      invitedBy: this.props.auth.user._id,
    };
    return this.props.actions.createInvite(invite)
    .then(createdInvite => {
      this.setState({ sending: false });
      if (createdInvite) {
        this.setState({ name: null, email: null, invitedByString: null });
      }
      // if (createdInvite) this.sendInvite(createdInvite);
    });
  }

  render() {
    return (
      <KeyboardAvoidingView
        behavior={'padding'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'android' ? 24 : 0}
      >

        <ScrollView
          keyboardShouldPersistTaps={'always'}
          keyboardDismissMode={'interactive'}
          scrollEnabled={false}
          contentContainerStyle={styles.fieldsParent}
        >
          <View style={styles.fieldsInner}>
            <View style={styles.fieldsInputParent}>
              <TextInput
                ref={c => this.userInput = c}
                underlineColorAndroid={'transparent'}
                autoCorrect={false}
                autoCapitalize={'none'}
                keyboardType={'email-address'}
                clearTextOnFocus={false}
                placeholder="your friend's email"
                onChangeText={email => this.setState({ email: email.trim() })}
                value={this.state.email}
                style={styles.fieldsInput}
              />
            </View>

            <View style={styles.fieldsInputParent}>
              <TextInput
                ref={c => this.passInput = c}
                underlineColorAndroid={'transparent'}
                autoCapitalize={'none'}
                autoCorrect={false}
                keyboardType={'default'}
                clearTextOnFocus={false}
                placeholder="your friend's name"
                onChangeText={name => this.setState({ name: name.trim() })}
                value={this.state.name}
                style={styles.fieldsInput}
              />
            </View>

            <View style={styles.fieldsInputParent}>
              <TextInput
                ref={c => this.passInput = c}
                underlineColorAndroid={'transparent'}
                autoCapitalize={'none'}
                autoCorrect={false}
                keyboardType={'default'}
                clearTextOnFocus={false}
                placeholder="your name"
                onChangeText={invitedByString => this.setState({ invitedByString: invitedByString.trim() })}
                value={this.state.invitedByString}
                style={styles.fieldsInput}
              />
            </View>

            <Text
              style={[styles.active, styles.link]}
              onPress={this.props.actions.goToInviteList}
            >
              You invited {this.props.inviteList.length} people
            </Text>
          </View>

          <CustomSpinner visible={this.state.sending} />

          <TouchableHighlight
            onPress={this.createInvite}
            underlayColor={'transparent'}
            style={[styles.largeButton]}
          >
            <Text style={styles.largeButtonText}>
              Send Invitation
            </Text>
          </TouchableHighlight>

        </ScrollView>
      </KeyboardAvoidingView>
    );
  }
}

const localStyles = StyleSheet.create({
  votes: {
    alignSelf: 'center',
    fontSize: 17,
  },
  link: {
    textAlign: 'center',
    marginTop: 20,
  },
  button: {
    alignSelf: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderColor: 'grey',
    borderWidth: StyleSheet.hairlineWidth,
  }
});

styles = { ...localStyles, ...globalStyles };

