'use strict';
import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  View,
  Image,
  TextInput
} from 'react-native';
import { connect } from 'react-redux';
var Button = require('react-native-button');
import { bindActionCreators } from 'redux';
import * as authActions from '../actions/authActions';
import * as postActions from '../actions/postActions';
require('../publicenv');
import { globalStyles, fullWidth, fullHeight } from '../styles/global';
var cheerio = require('cheerio-without-node-native');
import * as utils from '../utils';

class Post extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
      postText: null,
      postTitle: null
    }
  }

  componentDidMount() {
  }

  render() {
    var self = this;
    var user = null;
    if (self.props.auth) {
      if (self.props.auth.user) user = self.props.auth.user;
    }

    function post() {
      var link = self.state.postText;
      fetch(link, {
          method: 'GET',
      })
      .then((response) => {
        // console.log(response, 'link response');
        // console.log(response._bodyText, '_bodyText');

      var $ = cheerio.load(response._bodyText);
      var data = {
        'og:type':null,
        'og:title':null,
        'og:description':null,
        'og:image':null,
        'twitter:title':null,
        'twitter:image':null,
        'twitter:description':null,
        'twitter:site':null,
        'twitter:creator':null,
      }
      var meta = $('meta');
      var keys = Object.keys(meta);
      for (var s in data) {
        keys.forEach(function(key) {
          if ( meta[key].attribs
            && meta[key].attribs.property
            && meta[key].attribs.property === s) {
              data[s] = meta[key].attribs.content;
          }
        })
      }
      var description = null;
      var title = null;
      var image = null;

      if (data['og:title']) {
        title = data['og:title'];
      } else if (data['twitter:title']) {
        title = data['twitter:title'];
      }

      if (data['og:description']) {
        description = data['og:description'];
      } else if (data['twitter:description']) {
        description = data['twitter:description'];
      }

      if (data['og:image']) {
        image = data['og:image'];
      } else if (data['twitter:image']) {
        image = data['twitter:image'];
      }

      if (image) {
        utils.s3.toS3Advanced(image).then(function(results){
          if (results.success) {
            var postBody = {
              link: link,
              user: user,
              title: title,
              userId: user._id,
              description: description,
              image: results.url
            };
            console.log(postBody, 'postBody altered');
            self.props.actions.submitPost(postBody);
          } else {
            console.log('err');
          }
        })
      } else {
        var postBody = {
          link: link,
          user: user,
          userId: user._id,
          title: title,
          description: description,
          image: image
        };
        self.props.actions.submitPost(postBody);
      }
      console.log(postBody, 'postBody');


      })
      .catch((error) => {
          console.log(error, 'error');
      });
      self.setState({postText: null, postTitle: null});
    }

    return (
      <View style={styles.fullContainer}>
      {/*<TextInput style={[styles.font20, styles.titleInput]} placeholder='Title' multiline={true} onChangeText={(postTitle) => this.setState({postTitle})} value={this.state.postTitle} onSubmitEditing={post} returnKeyType='done' />*/}
       <TextInput style={[styles.postInput, styles.font20]} placeholder='Enter URL here...' multiline={true} onChangeText={(postText) => this.setState({postText})} value={this.state.postText} onSubmitEditing={post} returnKeyType='done' />
      <Button style={styles.postSubmit} onPress={post}>Submit</Button>
      </View>
    );
  }
}

function mapStateToProps(state) {
  return {
    auth: state.auth,
    router: state.routerReducer
   }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({...authActions, ...postActions}, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Post)

const localStyles = StyleSheet.create({
  postSubmit: {
    padding: 10
  },
  postInput: {
    flex: 1,
    padding: 10,
  },
  titleInput: {
    padding: 10,
    flex: 0.075,
    borderWidth: 0.5,
    borderBottomColor: '#C7C7C7',
    borderRightColor: 'transparent',
    borderLeftColor: 'transparent',
    borderTopColor: 'transparent',
  }
});

var styles = {...localStyles, ...globalStyles};
