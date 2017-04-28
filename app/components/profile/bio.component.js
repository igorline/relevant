import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableHighlight
} from 'react-native';
import { globalStyles, fullWidth } from '../../styles/global';
import TextBody from '../post/textBody.component';

let styles;

class Bio extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      bio: '',
      editing: false
    };
    this.updateBio = this.updateBio.bind(this);
  }

  componentWillMount() {
  }

  async updateBio() {
    try {
      let user = this.props.user;
      user.bio = this.state.bio;
      let success = await this.props.actions.updateUser(user);
      if (success) {
        this.setState({ editing: false });
        this.textInput.blur();
      }
    } catch (err) {
      console.log(err);
    }
  }

  render() {
    let { user } = this.props;
    let editButton;
    let header;

    let bioEdit = (
      <View
        style={[
          styles.commentInputParent,
          {
            height: Math.min(100, this.state.inputHeight),
            borderTopWidth: 0,
            flex: this.state.editing ? 1 : 0,
          },
          this.state.editing ? {} : { width: 0, height: 0 }
        ]}
      >
        <TextInput
          // autoCapitalize
          // autoCorrect
          ref={(c) => { this.textInput = c; }}
          keyboardType={'default'}
          clearTextOnFocus={false}
          placeholder="Your credentials"
          style={[
            styles.commentInput,
            styles.font15,
            { lineHeight: 20 },
            styles.bioInput,
          ]}
          multiline
          onChangeText={(bio) => {
            this.setState({ bio });
          }}
          onBlur={() => {
            this.setState({ editing: false });
          }}
          onContentSizeChange={(event) => {
            let h = event.nativeEvent.contentSize.height;
            this.setState({
              inputHeight: Math.max(50, h)
            });
          }}
          value={this.state.bio}
        />
        <TouchableHighlight
          underlayColor={'transparent'}
          style={[styles.commentSubmit]}
          onPress={() => this.updateBio()}
        >
          <Text style={[styles.font15, styles.active]}>Submit</Text>
        </TouchableHighlight>
      </View>
    );

    if (this.props.myProfile && !this.state.editing) {
      editButton = (
        <Text
          onPress={() => {
            this.setState({ editing: true, bio: user.bio || '' });
            this.textInput.focus();
          }}
          style={styles.active}
        >
          Edit
        </Text>
      );
    }

    if (user.bio && user.bio !== '') {
      header = (
        <Text style={[styles.font12, styles.darkGray, { marginBottom: 5 }]}>
          Credentials:{' '}
        </Text>
      );
    }

    let bio = (
      <TextBody
        actions={this.props.actions}
        style={{ fontFamily: 'Georgia' }}
      >
        {user.bio}
      </TextBody>
    );

    if (this.state.editing) {
      bio = null;
      header = null;
    } else {
      // bioEdit = null;
    }

    return (
      <View style={styles.bio}>
        <Text style={{ flex: this.state.editing ? 0 : 1 }}>
          {/*header*/}
          {bio}
          {' '}
        </Text>
        {editButton}
        {bioEdit}
      </View>
    );
  }
}


let localStyles = StyleSheet.create({
  bio: {
    marginHorizontal: 10,
    paddingVertical: 10,
    flexDirection: 'row',
    // borderTopWidth: StyleSheet.hairlineWidth,

    // borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: 'grey',
  },
  bioInput: {
    paddingHorizontal: 0,
    // padding: 0,
    // margin: 0,
    fontSize: 14,
    // borderWidth: StyleSheet.hairlineWidth,
    // borderColor: 'grey',
  }
});

styles = { ...globalStyles, ...localStyles };

export default Bio;
