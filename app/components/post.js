'use strict';
import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableHighlight,
  LinkingIOS
} from 'react-native';
import { connect } from 'react-redux';
var Button = require('react-native-button');
import { bindActionCreators } from 'redux';
import * as authActions from '../actions/authActions';
import * as postActions from '../actions/postActions';
import * as userActions from '../actions/userActions';
require('../publicenv');
import { globalStyles, fullWidth, fullHeight } from '../styles/global';
var postStyles = null;


class Post extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
      expanded: false
    }
  }

  componentDidMount() {
  }

  invest() {
    var invest = {
      postId: this.props.post._id,
      sign: 1,
      amount: 1
    };
    this.props.actions.invest(this.props.auth.token, invest);
  }

  openLink(url) {
      LinkingIOS.openURL(url)
  }

  toggleExpanded(self, bool) {
    self.setState({expanded: bool});
  }

  extractDomain(url) {
    console.log(url, 'extract url')
    var domain;
    if (url.indexOf("://") > -1) {
      domain = url.split('/')[2];
    } else {
      domain = url.split('/')[0];
    }
    domain = domain.split(':')[0];

    if (domain.indexOf('www.') > -1) {
      var noPrefix = domain.replace("www.","");
    } else {
      var noPrefix = domain;
    }
    return noPrefix;
  }

  render() {
    var self = this;
    var post = null;
    var title = null;
    var description = null;
    var image = null;
    var link = null;
    var imageEl = null;
    var postUserImage = null;
    var postUserImageEl = null;
    var postUser = null;
    var postUserName = null;
    var body = null;
    var postStyles = this.props.styles;
    var user = null;
    var expanded = this.state.expanded;
    if (this.props.auth.user) user = this.props.auth.user;
    var styles = {...localStyles, ...postStyles, ...globalStyles};

    if (this.props.post) {
      post = this.props.post;
      if (post.image) image = post.image;
      if (post.description) description = post.description;
      if (post.title) title = post.title;
      if (post.link) link = post.link;
      if (post.body) body = post.body;

      if (post.user) {
        postUser = post.user;
        if (postUser.image) postUserImage = postUser.image;
        if (postUser.name) postUserName = postUser.name;
      }
    }

    if (postUserImage) {
      postUserImageEl = (<Image source={{uri: postUserImage}} style={styles.userImage} />);
    }

    if (image) {
      imageEl = (<Image resizeMode={'cover'} source={{uri: image}} style={styles.postImage} />);
    }

    let investButtonString = "Invest";
    if( post.investors){
      var invested = post.investors.filter(el => {
        return el.user == user._id
      })
      if (invested.length) investButtonString = "UnInvest"
    }

    return (
        <View style={[styles.postContainer]}>
          <View style={styles.postHeader}>
            {postUserImageEl}
            <View style={styles.postInfo}>
              {postUserName ? <Text>posted by {postUserName}</Text> : null}
            </View>
          </View>
          {imageEl}
          <View style={styles.postBody}>
            <Text style={styles.font20}>{title ? title : 'Untitled'}</Text>
            {link ? <Text>from {self.extractDomain(link)}  <Text style={styles.active} onPress={self.openLink.bind(null, link)}>Open Article</Text></Text> : null}
            {body ? <Text>{body}</Text> : null}
            {!expanded ? <Text onPress={self.toggleExpanded.bind(null, this, true)}>Read more</Text> : null}
            {expanded ?
              <View>
                <Button onPress={this.invest.bind(this)} containerStyle={styles.buttonContainer} style={styles.button}>
                  {investButtonString}
                </Button>
                <Text onPress={self.toggleExpanded.bind(null, this, false)}>Read less</Text>
              </View>
            : null}
          </View>
        </View>
    );
  }
}

export default Post;

const localStyles = StyleSheet.create({
  postContainer: {
    marginBottom: 25,
    textAlign: 'left',
  },
  postBody: {
    padding: 15
  },
  postImage: {
    height: 200,
    width: fullWidth,
  },
  userImage: {
    height: 30,
    width: 30,
    borderRadius: 15
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    padding: 10
  },
  link: {
    flex: 1,
  },
  postInfo: {
    flex: 1,
    paddingLeft: 5
  }
});






