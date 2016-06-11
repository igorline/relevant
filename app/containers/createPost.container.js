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
      postTags: [],
      autoTags: [],
      preTag: null,
      parentTagsIndex: [],
      type: 'url',
      stage: 1,
      tagStage: 1,
      postImage: null,
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
    this.props.actions.getParentTags().then(function(response) {
      if (response.status) {
        self.setState({parentTagsIndex: response.data});
      } else {
        self.props.actions.setNotif(true, response.data, false)
      }
    });
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
    self.state.postTags.forEach(function(tag) {
      tags.push(tag._id);
    })

    if (!self.state.postTags.length) {
      self.props.actions.setNotif(true, 'Add tags', false);
      return;
    }

    if (self.state.type == 'url') {
      utils.post.generate(link, body, tags, self.props.auth.token).then(function(results){
        if (!results) {
           self.props.actions.setNotif(true, 'Post error please try again', false)
        } else {
          self.props.actions.setNotif(true, 'Posted', true)
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
        };
      }

      self.props.actions.dispatchPost(postBody, self.props.auth.token).then(function(results) {
         if (!results) {
           self.props.actions.setNotif(true, 'Post error please try again', false)
        } else {
          self.props.actions.setNotif(true, 'Posted', true)
        }
      })
    }

    self.setState({postImage: null, postTitle: null, postBody: null, postLink: null, stage: 1});
  }


  componentDidUpdate() {
    var self = this;
  }

  searchTags(tag) {
    var self = this;
    self.setState({preTag: tag});
    if (!tag.length) {
      self.setState({autoTags: []});
      return;
    }
    self.props.actions.searchTags(tag).then(function(tags) {
      self.setState({autoTags: tags.data});
    })
  }

  addTagToPost(tag) {
    var self = this;
    if (self.state.postTags.indexOf(tag) < 0) {
      self.state.postTags.push(tag);
      self.setState({stage: 1, preTag: null, tagStage: 1, autoTags: []});
    } else {
      self.props.actions.setNotif(true, 'Cannot duplicate tag', false)
    }

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


  createTag() {
    var self = this;
    this.props.actions.searchSpecific(this.state.preTag).then(function(results) {
      if (results.status) {
        if (results.data.length) {
          self.addTagToPost(results.data[0]);
        } else {
          self.setState({tagStage: 2});
        }
      } else {
        self.props.actions.setNotif(true, 'Server error', false)
      }
    })
  }

  addParent(parent) {
    var self = this;

    var newTagObj = {
      name: self.state.preTag,
      parents: [parent._id]
    }

    this.props.actions.createTag(self.props.auth.token, newTagObj).then(function(response) {
      if (response.status) {
        self.state.postTags.push(response.data);
        self.props.actions.setNotif(true, 'Created and added tag', true);
        self.setState({stage: 1, preTag: null, tagStage: 1, autoTags: []});
      } else {
        self.props.actions.setNotif(true, 'Error creating tag', false)
      }
    })
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


  next() {
    var self = this;

    if (!self.state.postLink && self.state.type == 'url') {
       self.props.actions.setNotif(true, 'Add url', false);
       return;
    }

    if (!self.ValidURL() && self.state.type == 'url') {
      self.props.actions.setNotif(true, 'not a valid url', false);
      return;
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

    var url = self.state.postLink;
    if (url) {
      if (url.indexOf('http://') == -1 && url.indexOf('https://') == -1) {
        self.setState({postLink: 'http://'+url});
      }
    }

    self.setState({stage: self.state.stage+1});
  }

  prev() {
    var self = this;
    self.setState({stage: self.state.stage-1});
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


  render() {
    var self = this;
    var user = null;
    var parentTagsEl = null;
    var tagsString = null;
    var postError = self.state.postError;
    var typeEl = null;
    if (self.props.auth) {
      if (self.props.auth.user) user = self.props.auth.user;
    }

    if (self.state.parentTagsIndex.length) {
      parentTagsEl = [];
      self.state.parentTagsIndex.forEach(function(parentTag, i) {
        parentTagsEl.push(<TouchableHighlight onPress={self.addParent.bind(self, parentTag)} key={i+'i'} style={styles.list}><Text key={i}>{parentTag.name}</Text></TouchableHighlight>);
      })
    }

    var autoTags = (<Text style={styles.padding10}>No suggested tags</Text>);
    if (self.state.autoTags.length) {
      autoTags = [];
      self.state.autoTags.forEach(function(tag, i) {
        autoTags.push(<TouchableHighlight key={i} onPress={self.addTagToPost.bind(self, tag)} style={[styles.list]}><Text  key={i+
          'x'}>Add tag: {tag.name}</Text></TouchableHighlight>)
      });
    }

    if (self.state.postTags) {
      tagsString = [];
      self.state.postTags.forEach(function(tag, i) {
        tagsString.push(<TouchableHighlight onPress={self.removeTag.bind(self, tag)} style={styles.tagBox}><View style={styles.tagRow}><Image style={styles.tagX} source={require('../assets/images/x.png')} /><Text style={styles.white} key={i}>{tag.name}</Text></View></TouchableHighlight>);
      })
    }

    typeEl = (<View style={[styles.row, styles.typeBar]}>
        <Text onPress={self.switchType.bind(self, 'url')} style={[styles.type, styles.font20, self.state.type == 'url' ? styles.active : null]}>Url</Text>
        <Text onPress={self.switchType.bind(self, 'text')} style={[styles.type, styles.font20, self.state.type == 'text' ? styles.active : null]}>Text</Text>
        <Text onPress={self.switchType.bind(self, 'image')} style={[styles.type, styles.font20, self.state.type == 'image' ? styles.active : null]}>Image</Text>
      </View>)

    return (
      <View style={[{height: self.state.visibleHeight}]}>
        <ScrollView>
          {typeEl}
          {self.state.stage == 1 && self.state.type == 'url' ? <TextInput numberOfLines={1} style={[styles.font20, styles.linkInput]} placeholder='Enter URL here...' multiline={false} onChangeText={(postLink) => this.setState({postLink})} value={this.state.postLink} returnKeyType='done' /> : null}
          {self.state.stage == 1 && self.state.type == 'image' && !self.state.postImage ? <Text onPress={self.chooseImage.bind(self)} style={[styles.padding10, styles.font20, styles.active, styles.lightweight]}>Upload an image</Text> : null}
          {self.state.stage == 1 && self.state.type == 'image' && self.state.postImage ? <View style={styles.previewImageContainer}>
          <Image source={{uri: self.state.postImage}} style={styles.previewImage} />
          <Text style={[styles.active, styles.font20]} onPress={self.removeImage.bind(self)}>Remove image</Text>
          </View> : null}
           {self.state.stage == 1 && self.state.type != 'url' ? <TextInput style={[styles.linkInput, styles.font20]} placeholder='Title here...' multiline={true} onChangeText={(postTitle) => this.setState({postTitle})} value={this.state.postTitle} returnKeyType='done' /> : null}
          {self.state.stage == 1 ? <TextInput style={[styles.bodyInput, styles.font20]} placeholder='Body here...' multiline={true} onChangeText={(postBody) => this.setState({postBody})} value={this.state.postBody} returnKeyType='done' /> : null}

          {self.state.stage == 1 ? <View style={[styles.tagStringContainer, styles.padding10]}><Text style={styles.font20}>Tags: </Text>{tagsString}</View> : null}
          {self.state.stage == 2 && self.state.tagStage == 1 && self.state.postTags.length ? <View style={styles.tagStringContainer}>{tagsString}</View> : null}

          {self.state.stage == 2 && self.state.tagStage == 1 ? <TextInput style={[styles.linkInput, styles.font20]} placeholder='Enter tags...' multiline={false} onChangeText={(postTags) => this.searchTags(postTags)} value={self.state.preTag} returnKeyType='done' /> : null}

          {self.state.stage == 2 && self.state.tagStage == 1 ? <View>{autoTags}</View> : null}

          {self.state.stage == 2 && self.state.tagStage == 1 && self.state.preTag ? <View style={[styles.padding10]}><Text onPress={self.createTag.bind(self)}>Create tag: {self.state.preTag}</Text></View> : null}

          {self.state.stage == 2 && self.state.tagStage == 2 ? <View style={styles.center}><Text style={[styles.font20, styles.padding10]}>Select a parent tag</Text>{parentTagsEl}</View> : null}



          {self.state.stage == 1 ? <View style={styles.buttonParent}><TouchableHighlight style={[styles.genericButton]} onPress={self.next.bind(self)}><Text style={[styles.white]}>Add tags</Text></TouchableHighlight></View>: null}
          {self.state.stage == 2  ? <View style={styles.buttonParentCenter}><TouchableHighlight style={styles.genericButton} onPress={self.prev.bind(self)}><Text style={styles.white}>Cancel</Text></TouchableHighlight></View> : null}
           {self.state.stage == 1 && self.state.postTags.length ? <View style={styles.buttonParentCenter}><TouchableHighlight style={styles.genericButton} onPress={self.post.bind(self)}><Text style={styles.white}>Submit</Text></TouchableHighlight></View> : null}
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
    notif: state.notif
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
  type: {
    flex: 1,
    textAlign: 'center'
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
  tagX: {
    height: 7.5,
    width: 7.5,
    marginRight: 3.5
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
  typeBar: {
    width: fullWidth,
    paddingTop: 20,
    paddingBottom: 20
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
