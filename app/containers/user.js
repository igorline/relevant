'use strict';
import React, {
    AppRegistry,
    Component,
    StyleSheet,
    Text,
    View,
    Image,
    TextInput,
    Dimensions
}
from 'react-native';
import {
    globalStyles, fullWidth, fullHeight
}
from '../styles/global';

var FileUpload = require('NativeModules').FileUpload;
import {
    connect
}
from 'react-redux';
var Button = require('react-native-button');
import * as authActions from '../actions/authActions';
import * as postActions from '../actions/postActions';
import {
    bindActionCreators
}
from 'redux';
var ImagePickerManager = require('NativeModules').ImagePickerManager;
require('../publicenv');
import * as utils from '../utils';

class User extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = {}
    }

    componentDidMount() {}

    render() {
      // console.log(this, 'user self')
      var self = this;
      var user = null;
      var userImage = null;
      var name = null;
      var relevance = null;
      const {actions} = this.props;
      var userImageEl = null;
      var postsEl = null;

      if (this.props.users.selectedUser) {
          user = this.props.users.selectedUser;
          if (user.name) name = this.props.users.selectedUser.name;
          if (user.image) userImage = this.props.users.selectedUser.image;
          if (user.relevance) {
              relevance = this.props.users.selectedUser.relevance;
          } else {
              relevance = 0;
          }
      }

      if (userImage) {
        userImageEl = (<Image source={{uri: userImage}} style={styles.uploadAvatar} /> );
      }

      var changeNameEl = (<View style={styles.pictureWidth}><Text style={styles.twenty}>{name}</Text></View>);

      if (self.props.users.posts) {
        if (self.props.users.posts.length > 0) {
          postsEl = self.props.users.posts.map(function(post, i) {
            return (<Text onPress={self.props.actions.getActivePost.bind(null, post._id)}>{post.title}</Text>);
          });
        } else {
          postsEl = (<View><Text>0 Posts</Text></View>);
        }
      } else {
        postsEl = (<View><Text>0 Posts</Text></View>);
      }

      return (
        <View style={styles.profileContainer}>
          <View style={styles.row}>
            <View>{userImageEl}</View>
            <View style={[styles.insideRow, styles.insidePadding]}>
              <Text>Relevance: <Text style={styles.active}>{relevance}</Text ></Text>
              <Text>more info more info</Text>
            </View>
          </View>
          <View style={styles.column}>
            <Text style={styles.font20}>Posts</Text>
            {postsEl}
          </View>
        </View>
      );
  }
}


function mapStateToProps(state) {
  return {
    auth: state.auth,
    posts: state.posts,
    users: state.user,
    router: state.routerReducer
   }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({...authActions, ...postActions}, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(User)

const localStyles = StyleSheet.create({
  uploadAvatar: {
    height: 100,
    width: 100,
    resizeMode: 'cover'
  },
  profileContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    backgroundColor: 'white',
  },
  row: {
    flexDirection: 'row',
    width: fullWidth,
    padding: 20
  },
  column: {
    flexDirection: 'column',
    width: fullWidth,
    paddingRight: 20,
    paddingLeft: 20,
    paddingBottom: 20,
  },
  insideRow: {
    flex: 1,
  },
  insidePadding: {
    paddingLeft: 10,
    paddingRight: 10
  },
  pictureWidth: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'nowrap'
  },
});
var styles = {...localStyles, ...globalStyles};