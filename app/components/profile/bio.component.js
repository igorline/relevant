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

let styles;

class Bio extends Component {

  constructor(props, context) {
    super(props, context);
    this.state = {
      bio: '',
      editing: true
    };
    this.updateBio = this.updateBio.bind(this);
  }

  componentDidMount() {

  }

  async updateBio() {
    try {
      let user = this.props.user;
      user.bio = this.state.bio;
      let success = await this.props.actions.updateUser(user);
      console.log(success);
      if (success) this.setState({ editing: false });
    } catch (err) {
      console.log(err);
    }
  }

  render() {
    let { user } = this.props;
    let bioEdit = (
      <View
        style={[
          styles.commentInputParent,
          {
            height: Math.min(100, this.state.inputHeight),
            borderTopWidth: 0,
          }
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
            { lineHeight: 20 }
          ]}
          multiline
          onChangeText={(bio) => {
            this.setState({ bio });
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

    let bio = (
      <View>
        <Text>{user.bio}</Text>
      </View>
    );

    return (
      <View>
        <Text style={[styles.font12, styles.darkGray, { paddingLeft: 10 }]}>Credentials:</Text>
        {this.state.editing ? bioEdit : bio}
      </View>
    );
  }
}


let localStyles = StyleSheet.create({

});

styles = { ...globalStyles, ...localStyles };

export default Bio;
