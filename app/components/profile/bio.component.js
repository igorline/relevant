import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { globalStyles, blue } from '../../styles/global';
import TextBody from '../post/textBody.component';
import TextEdit from '../common/textEdit.component';

let styles;

class Bio extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      editing: false
    };
    this.updateBio = this.updateBio.bind(this);
  }

  componentWillMount() {
  }

  componentDidMount() {
    if (this.props.myProfile && !this.props.user.bio) {
      this.setState({ editing: true });
    }
  }

  async updateBio(text) {
    try {
      let user = this.props.user;
      let bio = text;
      let success = await this.props.actions.updateUser({ ...user, bio });
      if (success) {
        this.setState({ editing: false });
      }
    } catch (err) {
      console.log(err);
    }
  }

  render() {
    let { user } = this.props;
    let editButton;
    let header;

    let bioEdit = (<TextEdit
      text={user.bio}
      placeholder={'Add your credentials - what are the topics you know most about and why'}
      toggleFunction={() => this.setState({ editing: false })}
      saveEditFunction={this.updateBio}
    />);

    if (this.props.myProfile && !this.state.editing) {
      editButton = (
        <Text
          onPress={() => {
            this.setState({
              editing: true,
              bio: this.state.bio === '' ? user.bio : this.state.bio
            });
          }}
          style={{ marginLeft: 10 }}
        >
          <Icon name="ios-create-outline" size={20} color={blue} />
        </Text>
      );
    }

    if (user.bio && user.bio !== '') {
      header = (
        <Text style={[styles.font12, styles.darkGray, { marginBottom: 5 }]}>
          Credentials:{'\n'}
        </Text>
      );
    }

    let CTA = (
      <Text
        style={[styles.active, { flex: 1, fontSize: 12 }]}
        onPress={() => this.setState({ editing: true })}
      >
        Add your credentials to build your relevance!
      </Text>
    );

    let bio = (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TextBody
          actions={this.props.actions}
          style={{ fontFamily: 'Georgia', flex: 1 }}
        >
          {user.bio}
        </TextBody>
        {editButton}
      </View>
    );

    if (this.props.myProfile && (!user.bio || user.bio.trim() === '')) {
      bio = (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {CTA}
          {editButton}
        </View>
      );
    }

    if (this.state.editing) {
      bio = null;
      header = null;
    }

    return (
      <View style={[(user && user.bio) || this.props.myProfile ? styles.bio : null]}>
        {this.state.editing ? bioEdit : bio }
      </View>
    );
  }
}


let localStyles = StyleSheet.create({
  bio: {
    marginHorizontal: 10,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: 'grey',
  },
});

styles = { ...globalStyles, ...localStyles };

export default Bio;
