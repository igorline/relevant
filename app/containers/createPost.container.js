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
  Animated,
  ScrollView,
  TouchableWithoutFeedback,
  TouchableHighlight,
  DeviceEventEmitter,
  Dimensions
} from 'react-native';
import { connect } from 'react-redux';
var Button = require('react-native-button');
import { bindActionCreators } from 'redux';
import * as authActions from '../actions/auth.actions';
import * as postActions from '../actions/post.actions';
import * as notifActions from '../actions/notif.actions';
import * as tagActions from '../actions/tag.actions';
require('../publicenv');
var PickerItemIOS = PickerIOS.Item;
import { globalStyles, fullWidth, fullHeight } from '../styles/global';
import * as utils from '../utils';
import Notification from '../components/notification.component';
var dismissKeyboard = require('react-native-dismiss-keyboard');
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
      tagStage: 1,
      postImage: null,
      catObj: null,
      visibleHeight: Dimensions.get('window').height - 120
    }
  }

  keyboardWillShow (e) {
    let newSize = (Dimensions.get('window').height - e.endCoordinates.height) - 120
    this.setState({visibleHeight: newSize})
  }

  keyboardWillHide (e) {
    this.setState({visibleHeight: Dimensions.get('window').height - 120})
  }

  componentDidMount() {
    var self = this;
    DeviceEventEmitter.addListener('keyboardWillShow', this.keyboardWillShow.bind(this))
    DeviceEventEmitter.addListener('keyboardWillHide', this.keyboardWillHide.bind(this))
    this.props.actions.getParentTags();
  }

  switchType(type) {
    var self = this;
    self.setState({type: type});
  }

  post() {
    var self = this;
    var link = self.state.postLink;
    var body = self.state.postBody;
    var title = self.state.postTitle;
    var tags = [];
    if (!self.state.postLink && self.state.type == 'url') {
       self.props.actions.setNotif(true, 'Add url', false);
       return;
    }

    if (self.state.type == 'url') {
      if (!self.ValidURL()) {
        self.props.actions.setNotif(true, 'not a valid url', false);
        return;
      }
    }

    if (self.state.type != 'url' && !self.state.postTitle) {
      self.props.actions.setNotif(true, 'Add title', false);
      return;
    }

    if (!self.state.postBody) {
       self.props.actions.setNotif(true, 'Add body', false);
       return;
    }

    if (self.state.type == 'image' && !self.state.postImage) {
       self.props.actions.setNotif(true, 'Add an image', false);
       return;
    }

    if (link) {
      if (link.indexOf('http://') == -1 && link.indexOf('https://') == -1) {
        self.setState({postLink: 'http://'+link});
      }
    }

    if (!self.state.postCategory) {
      self.props.actions.setNotif(true, 'Add category', false);
      return;
    }


    if (!self.state.postTags) {
      self.props.actions.setNotif(true, 'Add tags', false);
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

    if (self.state.type == 'url') {
      utils.post.generate(self.state.postLink, body, tags, self.props.auth.token).then(function(results){
        if (!results) {
           self.props.actions.setNotif(true, 'Post error please try again', false)
        } else {
          self.props.actions.setNotif(true, 'Posted', true)
          self.props.routes.Discover();
        }
      });
    }

    if (self.state.type != 'url') {

      if (self.state.type == 'text') {
        var postBody = {
          link: null,
          body: body,
          tags: tags,
          title: title,
          description: null,
          image: null,
          mentions: finalMentions
        };
      }

      if (self.state.type == 'image') {
        var postBody = {
          link: null,
          body: body,
          tags: tags,
          title: title,
          description: null,
          image: self.state.postImage,
          mentions: finalMentions
        };
      }

      self.props.actions.dispatchPost(postBody, self.props.auth.token).then(function(results) {
         if (!results) {
           self.props.actions.setNotif(true, 'Post error please try again', false);
        } else {
          self.props.actions.setNotif(true, 'Posted', true);
          self.props.routes.Discover();
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

  categoryButton() {
    var self = this;
    var newState = self.state.openCategory = !self.state.openCategory;
    self.setState({openCategory: newState});
  }


  render() {
    var self = this;
    var user = null;
    var parentTagsEl = null;
    var tagsString = null;
    var postError = self.state.postError;
    var typeEl = null;
    var pickerArray = [];
    var parentTags = null;
    if (self.props.auth) {
      if (self.props.auth.user) user = self.props.auth.user;
    }

    if (self.props.posts.parentTags) {
      parentTags = self.props.posts.parentTags;
      parentTags.forEach(function(tag, i) {
        pickerArray.push(<PickerItemIOS key={i} label={tag.name} style={styles.font15} value={JSON.stringify(tag)} />);
      })
    }

    typeEl = (<View style={[styles.row, styles.typeBar]}>
        <TouchableHighlight  underlayColor={'transparent'} style={[styles.typeParent, self.state.type == 'url' ? styles.activeBorder : null]} onPress={self.switchType.bind(self, 'url')}>
          <Text style={[styles.type, styles.darkGray, styles.font15, self.state.type == 'url' ? styles.active : null]}>Url</Text>
        </TouchableHighlight>
        <TouchableHighlight  underlayColor={'transparent'} style={[styles.typeParent, self.state.type == 'text' ? styles.activeBorder : null]} onPress={self.switchType.bind(self, 'text')}>
          <Text style={[styles.type, styles.darkGray, styles.font15, self.state.type == 'text' ? styles.active : null]}>Text</Text>
        </TouchableHighlight>
        <TouchableHighlight  underlayColor={'transparent'} style={[styles.typeParent, self.state.type == 'image' ? styles.activeBorder : null]} onPress={self.switchType.bind(self, 'image')}>
          <Text style={[styles.type, styles.darkGray, styles.font15, self.state.type == 'image' ? styles.active : null]}>Image</Text>
        </TouchableHighlight>
      </View>)

    return (
      <View style={[{height: self.state.visibleHeight}]}>
        <ScrollView>
          {typeEl}
          {self.state.stage == 1 && self.state.type == 'url' ? <TextInput numberOfLines={1} style={[styles.font15, styles.linkInput]} placeholder='Enter URL here...' multiline={false} onChangeText={(postLink) => this.setState({postLink})} value={this.state.postLink} returnKeyType='done' /> : null}
          {self.state.stage == 1 && self.state.type == 'image' && !self.state.postImage ? <View style={{flexDirection: 'row', paddingLeft: 10}}><TouchableHighlight style={styles.genericButton} onPress={self.chooseImage.bind(self)}><Text style={styles.buttonText}>Upload an image</Text></TouchableHighlight></View> : null}
          {self.state.stage == 1 && self.state.type == 'image' && self.state.postImage ? <View style={styles.previewImageContainer}>
          <Image source={{uri: self.state.postImage}} style={styles.previewImage} />
          <TouchableHighlight style={styles.genericButton} onPress={self.removeImage.bind(self)}><Text style={styles.buttonText}>Remove image</Text></TouchableHighlight>
          </View> : null}




           {self.state.stage == 1 && self.state.type != 'url' ? <TextInput style={[styles.linkInput, styles.font15]} placeholder='Title here...' multiline={false} onChangeText={(postTitle) => this.setState({postTitle})} value={this.state.postTitle} returnKeyType='done' /> : null}
          {self.state.stage == 1 ? <TextInput style={[styles.bodyInput, styles.font15]} placeholder='Body here...' multiline={true} onChangeText={(postBody) => this.setState({postBody})} value={this.state.postBody} returnKeyType='done' /> : null}

          <View style={styles.buttonParentCenter}><TouchableHighlight onPress={self.categoryButton.bind(self)} style={styles.genericButton}><Text style={styles.buttonText}>{self.state.openCategory ? 'Done' :  'Choose Category'}</Text></TouchableHighlight></View>

          {self.state.catObj ? <Text style={[styles.font15, styles.textCenter]}>{self.state.catObj.name}</Text> :  null}

          {self.state.openCategory ? <PickerIOS
            selectedValue={self.state.postCategory ? self.state.postCategory : null}
            onValueChange={(postCategory) => this.setState({postCategory: postCategory, catObj: JSON.parse(postCategory)})}>
            {pickerArray}
          </PickerIOS> : null}

          <TextInput style={[styles.linkInput, styles.font15]} placeholder='Enter tags... ex. webgl, slowstyle, xxx' multiline={false} onChangeText={(postTags) => this.setState({postTags})} value={this.state.postTags} returnKeyType='done' />

           <View style={styles.buttonParentCenter}><TouchableHighlight style={styles.genericButton} onPress={self.post.bind(self)}><Text style={styles.buttonText}>Submit</Text></TouchableHighlight></View>
        </ScrollView>
        <View pointerEvents={'none'} style={styles.notificationContainer}>
          <Notification />
        </View>
      </View>
    );
  }
}

function mapStateToProps(state) {
  return {
    auth: state.auth,
    router: state.routerReducer,
    notif: state.notif,
    posts: state.posts
   }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({...tagActions, ...authActions, ...postActions, ...notifActions}, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CreatePost)

const localStyles = StyleSheet.create({
  tagStringContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  padding10: {
    padding: 10
  },
  previewImageContainer: {
    padding: 10
  },
  previewImage: {
    height: 100,
    width: 100,
    marginBottom: 10
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
