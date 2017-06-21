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

  componentDidMount() {
    if (this.props.myProfile && !this.props.user.bio) {
      // this.setState({ editing: true });
    }
  }

  async updateBio(text) {
    let user = this.props.user;
    let bio = text;
    let oldBio = user.bio;
    try {
      user.bio = bio;
      this.setState({ editing: false });
      let success = await this.props.actions.updateUser({ ...user, bio });
      if (success) {
        this.bio = null;
        // this.setState({ editing: false });
      } else {
        this.bio = bio;
        user.bio = oldBio;
        this.setState({ editing: true });
      }
    } catch (err) {
      this.bio = bio;
      user.bio = oldBio;
      this.setState({ editing: true });
      console.log(err);
    }
  }

  render() {
    let { user } = this.props;
    let editButton;

    let bioEdit = (<TextEdit
      style={[styles.bioText]}
      text={this.bio || user.bio}
      placeholder={'Add your credentials - what are the topics you know most about and why'}
      toggleFunction={() => {
        this.bio = null;
        this.setState({ editing: false });
      }}
      saveEditFunction={this.updateBio}
    />);

    if (this.props.myProfile && !this.state.editing) {
      editButton = (
        <Text
          onPress={() =>
            this.setState({
              editing: true,
            })
          }
          style={{ paddingLeft: 10 }}
        >
          <Icon name="ios-create-outline" size={22} color={blue} />
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
          style={[styles.bioText, { fontFamily: 'Georgia', flex: 1 }, styles.darkGrey]}
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

    return (
      <View style={[(user && user.bio) || this.props.myProfile ? styles.bio : null]}>
        {this.state.editing ? bioEdit : bio }
      </View>
    );
  }
}


let localStyles = StyleSheet.create({
  bioText: {
    fontSize: 30 / 2,
    lineHeight: 42 / 2,
    paddingTop: 5,
  },
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
