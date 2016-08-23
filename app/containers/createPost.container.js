'use strict';
import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  LayoutAnimation,
  Picker,
  PickerIOS,
  AlertIOS,
  Animated,
  ScrollView,
  TouchableWithoutFeedback,
  TouchableHighlight,
  DeviceEventEmitter,
  Dimensions,
} from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as authActions from '../actions/auth.actions';
import * as postActions from '../actions/post.actions';
import * as notifActions from '../actions/notif.actions';
import * as tagActions from '../actions/tag.actions';
import * as viewActions from '../actions/view.actions';
import { globalStyles, fullWidth, fullHeight } from '../styles/global';
import * as utils from '../utils';
import Notification from '../components/notification.component';
var ImagePickerManager = require('NativeModules').ImagePickerManager;
import { pickerOptions } from '../utils/pickerOptions';

class CreatePost extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
      postLink: null,
      postBody: null,
      postTags: null,
      postCategory: null,
      openCategory: false,
      type: 'url',
      stage: 1,
      urlPreview: null,
      tagStage: 1,
      postImage: null,
      catObj: null,
      visibleHeight: Dimensions.get('window').height - 60
    }
  }

  keyboardWillShow (e) {
    let newSize = (Dimensions.get('window').height - e.endCoordinates.height) - 60
    this.setState({visibleHeight: newSize})
  }

  keyboardWillHide (e) {
    this.setState({visibleHeight: Dimensions.get('window').height - 60})
  }

  componentDidMount() {
    var self = this;
    DeviceEventEmitter.addListener('keyboardWillShow', this.keyboardWillShow.bind(this))
    DeviceEventEmitter.addListener('keyboardWillHide', this.keyboardWillHide.bind(this))
    self.props.actions.getParentTags();
  }

  componentWillUnmount() {
    var self = this;
    self.props.actions.setPostCategory();
  }

  switchType(type) {
    var self = this;
    self.props.actions.setView('post', type);
  }

  post() {
    var self = this;
    var link = self.state.postLink;
    var body = self.state.postBody;
    var title = self.state.postTitle;
    var category = self.props.posts.createPostCategory ? self.props.posts.createPostCategory._id : null;
    var view = self.props.view.post.view;
    var tags = [];
    if (!self.state.postLink && view == 'url') {
        AlertIOS.alert("Add URL");
       return;
    }

    if (view == 'url') {
      if (!self.ValidURL()) {
         AlertIOS.alert("not a valid url");
        return;
      }
    }

    if (view != 'url' && !self.state.postTitle) {
       AlertIOS.alert("Add title");
      return;
    }

    if (!self.state.postBody) {
        AlertIOS.alert("Add body");
       return;
    }

    if (view == 'image' && !self.state.postImage) {
        AlertIOS.alert("Add an image");
       return;
    }

    if (link) {
      if (link.indexOf('http://') == -1 && link.indexOf('https://') == -1) {
        self.setState({postLink: 'http://'+link});
      }
    }

    if (!self.props.posts.createPostCategory) {
       AlertIOS.alert("Add category");
      return;
    }


    if (!self.state.postTags) {
       AlertIOS.alert("Add tags");
      return;
    }

    var bodyTags = self.state.postBody.match(/#\S+/g);
    var bodyMentions = self.state.postBody.match(/@\S+/g);
    var finalTags = [];
    var finalMentions = [];

    if (bodyTags) {
      bodyTags.forEach(function(tag) {
        tag = tag.replace('#', '');
        finalTags.push(tag);
      })
    }
    if (bodyMentions) {
      bodyMentions.forEach(function(name) {
        name = name.replace('@', '');
        finalMentions.push(name);
      })
    }

    var noSpaces = self.state.postTags.replace(/\s*,\s*/g, ',');
    var tagsArray = noSpaces.split(',');
    tags = finalTags.concat(tagsArray);

    if (view == 'url') {
      utils.post.generate(self.state.postLink, body, tags, self.props.auth.token).then(function(results){
        if (!results) {
            AlertIOS.alert("Post error please try again");
        } else {
           AlertIOS.alert("Posted");
          self.props.view.nav.resetTo('discover')
        }
      });
    }

    if (view != 'url') {

      if (view == 'text') {
        var postBody = {
          link: null,
          body: body,
          tags: tags,
          title: title,
          description: null,
          category: category,
          image: null,
          mentions: finalMentions
        };
      }

      if (view == 'image') {
        var postBody = {
          link: null,
          body: body,
          tags: tags,
          title: title,
          category: category,
          description: null,
          image: self.state.postImage,
          mentions: finalMentions
        };
      }

      self.props.actions.dispatchPost(postBody, self.props.auth.token).then(function(results) {
         if (!results) {
            AlertIOS.alert("Post error please try again");
        } else {
           AlertIOS.alert("Posted");
          self.props.actions.setPostCategory(null);
          self.props.view.nav.resetTo('discover');
        }
      })
    }

    self.setState({postImage: null, postTitle: null, postBody: null, postLink: null, stage: 1});
  }


  componentDidUpdate() {
    var self = this;
  }

  isOdd(num) {
    return num % 2;
  }

  ValidURL() {
    var str = this.state.postLink;
    var pattern = new RegExp(/^(https?:\/\/)?((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}|((\d{1,3}\.){3}\d{1,3}))(\:\d+)?(\/[-a-z\d%_.~+]*)*(\?[;&a-z\d%_.~+=-]*)?(\#[-a-z\d_]*)?$/i);
    if(!pattern.test(str)) {
      console.log("not a valid url");
      return false;
    } else {
      return true;
    }
  }

  removeTag(tag) {
    var self = this;
    var index = self.state.postTags.indexOf(tag);
    self.state.postTags.splice(index, 1);
    self.setState({});
  }

  removeImage() {
    var self = this;
    self.setState({postImage: null});
    console.log('remove image', self.state)
  }

  chooseImage() {
    var self = this;
    self.pickImage(function(err, data){
      if(data){
        utils.s3.toS3Advanced(data, self.props.auth.token).then(function(results){
          if (results.success) {
            self.setState({postImage: results.url});
          } else {
            console.log('err');
          }
        })
      }
    });
  }

  pickImage(callback){
    var self = this;
    console.log(self, 'pickImage')
      ImagePickerManager.showImagePicker(pickerOptions, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
        callback("cancelled");
      }
      else if (response.error) {
        console.log('ImagePickerManager Error: ', response.error);
        callback("error");
      }
      else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
        callback("error");
      }
      else {
        callback(null, response.uri);
      }
    });
  }

  createPreview() {
    var self = this;
    utils.post.generatePreview(self.state.postLink).then(function(results) {
      if (results) {
        self.setState({
          urlPreview: {
            image: results.image ? results.image : 'https://s3.amazonaws.com/relevant-images/missing.png',
            title: results.title ? results.title : 'Untitled',
            description: results.description
          }
        })
      }
        console.log(results, 'results')
    })
  }

  goTo(view) {
    var self = this;
    self.props.view.nav.push(view);
  }

  render() {
    var self = this;
    var user = null;
    var parentTagsEl = null;
    var tagsString = null;
    var postError = self.state.postError;
    var typeEl = null;
    var pickerArray = [];
    var view = self.props.view.post.view;
    var parentTags = null;
    var category = self.props.view.post.category;
    var categoryEl = null;
    if (self.props.auth) {
      if (self.props.auth.user) user = self.props.auth.user;
    }


    typeEl = (<View style={[styles.row, styles.typeBar]}>
        <TouchableHighlight  underlayColor={'transparent'} style={[styles.typeParent, view == 'url' ? styles.activeBorder : null]} onPress={self.switchType.bind(self, 'url')}>
          <Text style={[styles.type, styles.darkGray, styles.font15, view == 'url' ? styles.active : null]}>Url</Text>
        </TouchableHighlight>
        <TouchableHighlight  underlayColor={'transparent'} style={[styles.typeParent, view == 'text' ? styles.activeBorder : null]} onPress={self.switchType.bind(self, 'text')}>
          <Text style={[styles.type, styles.darkGray, styles.font15, view == 'text' ? styles.active : null]}>Text</Text>
        </TouchableHighlight>
        <TouchableHighlight  underlayColor={'transparent'} style={[styles.typeParent, view == 'image' ? styles.activeBorder : null]} onPress={self.switchType.bind(self, 'image')}>
          <Text style={[styles.type, styles.darkGray, styles.font15, view == 'image' ? styles.active : null]}>Image</Text>
        </TouchableHighlight>
      </View>)

  var scrollStyles = {};
  if (category) {
    scrollStyles = {
      flex: 1
    }
  } else {
    scrollStyles = {
      height: fullHeight - 120
    }
  }

    return (
      <View style={[{height: self.state.visibleHeight}]}>
     <ScrollView contentContainerStyle={[{flexDirection: 'column'}, scrollStyles]}>
          {typeEl}
          {view == 'url' ? <View style={{borderBottomColor: !self.state.urlPreview ? '#f0f0f0' : 'transparent', borderBottomStyle: 'solid', borderBottomWidth: StyleSheet.hairlineWidth, flex: 0.1}}><TextInput numberOfLines={1} style={[styles.font15, {flex: 1, padding: 10}]} placeholder='Enter URL here...' multiline={false} onChangeText={(postLink) => this.setState({postLink, urlPreview: null})} onSubmitEditing={self.createPreview.bind(self)} value={this.state.postLink} returnKeyType='done' /></View> : null}

          {view == 'image' && !self.state.postImage ? <TouchableHighlight style={{borderBottomColor: '#f0f0f0', borderBottomStyle: 'solid', borderBottomWidth: StyleSheet.hairlineWidth, flex: 0.1, justifyContent: 'center', paddingLeft: 10}} underlayColor={'transparent'} onPress={self.chooseImage.bind(self)}><Text>Upload an image</Text></TouchableHighlight> : null}

          {view == 'image' && self.state.postImage ? <View style={{flex: 0.1, borderBottomColor: '#f0f0f0', borderBottomStyle: 'solid', borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: 'row', paddingLeft: 10, alignItems: 'center'}}>
          <Image source={{uri: self.state.postImage}} style={styles.previewImage} />
          <TouchableHighlight style={[]} onPress={self.removeImage.bind(self)}><Text>Remove image</Text></TouchableHighlight>
          </View> : null}

          {view != 'url' ? <View style={{borderBottomColor: '#f0f0f0', borderBottomStyle: 'solid', borderBottomWidth: StyleSheet.hairlineWidth, flex: 0.1, justifyContent: 'center'}}><TextInput style={[styles.font15, {flex: 1, padding: 10}]} placeholder='Title here...' multiline={false} onChangeText={(postTitle) => this.setState({postTitle})} value={this.state.postTitle} returnKeyType='done' /></View> : null}

          {view == 'url' && self.state.urlPreview ? <View style={{flex: 0.2, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#f0f0f0', borderBottomStyle: 'solid', paddingLeft: 10, paddingRight: 10, paddingBottom: 10}}>
          <View style={{borderRadius: 4, borderColor: '#f0f0f0', borderStyle: 'solid', borderWidth: StyleSheet.hairlineWidth, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'stretch', flex: 1, overflow: 'hidden'}}>
            {self.state.urlPreview.image ? <Image source={{uri: self.state.urlPreview.image}} style={{flex: 0.4, resizeMode: 'cover'}} /> : null }
            <Text style={{flex: 0.6, padding: 5, color: '#808080'}}>{self.state.urlPreview.title}</Text>
          </View></View> : null}

          <View style={{borderBottomColor: '#f0f0f0', borderBottomStyle: 'solid', borderBottomWidth: StyleSheet.hairlineWidth, flex: !self.state.urlPreview ? 0.6 : 0.4}}><TextInput style={[styles.font15, {flex: 1, padding: 10}]} placeholder='Body here...' multiline={true} onChangeText={(postBody) => this.setState({postBody})} value={this.state.postBody} returnKeyType='done' /></View>

         <TouchableHighlight style={{paddingLeft: 10, borderBottomColor: '#f0f0f0', borderBottomStyle: 'solid', borderBottomWidth: StyleSheet.hairlineWidth, flex: 0.1, justifyContent: 'center'}} underlayColor={'transparent'} onPress={self.goTo.bind(self, 'categories')}><Text style={[]}>{self.props.posts.createPostCategory ? self.props.posts.createPostCategory.emoji + ' ' + self.props.posts.createPostCategory.name :  'Choose Category'}</Text></TouchableHighlight>

        <View style={{flex: 0.1, justifyContent: 'center'}}><TextInput style={[styles.font15, {flex: 1, padding: 10}]} placeholder='Enter tags... ex. webgl, slowstyle, xxx' multiline={false} onChangeText={(postTags) => this.setState({postTags})} value={this.state.postTags} returnKeyType='done' /></View>

          <TouchableHighlight underlayColor={'transparent'} style={{backgroundColor: '#007aff', flex: 0.1, justifyContent: 'center'}} onPress={self.post.bind(self)}><Text style={{color: 'white', textAlign: 'center'}}>Submit</Text></TouchableHighlight>
        </ScrollView>
      </View>
    );
  }
}

export default CreatePost

const localStyles = StyleSheet.create({
  tagStringContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  padding10: {
    padding: 10
  },
  previewImage: {
    height: 25,
    width: 25,
    marginRight: 10
  },
  list: {
    flex: 1,
    width: fullWidth,
    padding: 10,
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'black'
  },
  postError: {
    color: 'red',
  },
  nextButton:  {
    width: fullWidth,
    textAlign: 'center',
    padding: 10
  },
  postInput: {
    height: 50,
    padding: 10,
    width: fullWidth,
    textAlign: 'center'
  },
  bodyInput: {
    width: fullWidth,
    height: fullHeight/3,
    padding: 10
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  createPostContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch'
  },
  divider: {
    height: 1,
    width: fullWidth,
    backgroundColor: '#c7c7c7'
  }
});

var styles = {...localStyles, ...globalStyles};
