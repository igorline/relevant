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
  TouchableHighlight
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
      stage: 1,
      tagStage: 1
    }
  }

  componentDidMount() {
    var self = this;
    this.props.actions.getParentTags().then(function(response) {
      if (response.status) {
        self.setState({parentTagsIndex: response.data});
      } else {
        self.props.actions.setNotif(true, response.data, false)
      }
    });
  }

  post() {
    var self = this;
    var link = self.state.postLink;
    var body = self.state.postBody;
    var tags = [];
    self.state.postTags.forEach(function(tag) {
      tags.push(tag._id);
    })

    if (!self.state.postTags.length) {
      self.props.actions.setNotif(true, 'Add tags', false);
      return;
    }

    utils.post.generate(link, body, tags, self.props.auth.token).then(function(results){
      if (!results) {
         self.props.actions.setNotif(true, 'Post error please try again', false)
      } else {
        self.props.actions.setNotif(true, 'Posted', true)
      }
    });
    self.setState({postText: null, postLink: null, stage: 1});
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
      self.props.actions.setNotif(true, 'Added tag '+tag.name, true);
      self.setState({preTag: null, tagStage: 1, autoTags: []});
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
    console.log('create tag ', this.state.preTag);
    this.setState({tagStage: 2});
  }

  addParent(parent) {
    var self = this;

    var newTagObj = {
      name: self.state.preTag,
      parents: [parent._id]
    }

    this.props.actions.createTag(self.props.auth.token, newTagObj).then(function(response) {
      //console.log(response, 'createTag response');
      if (response.status) {
        self.state.postTags.push(response.data);
        self.props.actions.setNotif(true, 'Created and added tag', true);
        self.setState({preTag: null, tagStage: 1, autoTags: []});
      } else {
        self.props.actions.setNotif(true, 'Error creating tag', false)
      }
    })
  }


  next() {
    var self = this;

    if (!self.state.postLink) {
       self.props.actions.setNotif(true, 'Add url', false);
       return;
    }

    if (!self.state.postBody && self.state.stage > 1) {
       self.props.actions.setNotif(true, 'Add text', false);
       return;
    }

    if (!self.ValidURL()) {
      self.props.actions.setNotif(true, 'not a valid url', false);
      return;
    }

    var url = self.state.postLink;
    if (url.indexOf('http://') == -1 && url.indexOf('https://') == -1) {
      self.setState({postLink: 'http://'+url});
    }

    self.setState({stage: self.state.stage+1});
  }

  prev() {
    var self = this;
    self.setState({stage: self.state.stage-1});
  }


  render() {
    var self = this;
    var user = null;
    var parentTagsEl = null;
    var tagsString = null;
    var postError = self.state.postError;
    if (self.props.auth) {
      if (self.props.auth.user) user = self.props.auth.user;
    }

    if (self.state.parentTagsIndex.length) {
      parentTagsEl = [];
      self.state.parentTagsIndex.forEach(function(parentTag, i) {
        parentTagsEl.push(<TouchableHighlight onPress={self.addParent.bind(self, parentTag)} key={i+'i'} style={styles.list}><Text key={i}>{parentTag.name}</Text></TouchableHighlight>);
      })
    }

    var autoTags = (<Text>No suggested tags</Text>);
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
        tagsString.push(<Text style={styles.tagBox} key={i}>#{tag.name}</Text>);
      })
    }

    var headline = null;
    switch(self.state.stage) {
      case 1:
        headline = 'Add URL';
        break;
      case 2:
        headline = 'Add relevant text';
        break;
      case 3:
        headline = 'Add tags';
        break;
      default:
        return;
    }


    return (
      <TouchableWithoutFeedback onPress={()=> dismissKeyboard()}>
      <View style={styles.fullContainer}>
        <Text style={[styles.font20, styles.textCenter]}>{headline}</Text>
        {self.state.stage == 1 ? <TextInput numberOfLines={1} style={[styles.font20, styles.linkInput]} placeholder='Enter URL here...' multiline={false} onChangeText={(postLink) => this.setState({postLink})} value={this.state.postLink} returnKeyType='done' /> : null}
        {self.state.stage == 2 ? <TextInput style={[styles.bodyInput, styles.font20]} placeholder='Relevant text here...' multiline={true} onChangeText={(postBody) => this.setState({postBody})} value={this.state.postBody} returnKeyType='done' /> : null}
        {self.state.stage == 3 && self.state.tagStage == 1 && self.state.postTags.length ? <View style={styles.tagStringContainer}>{tagsString}</View> : null}

        {self.state.stage == 3 && self.state.tagStage == 1 ? <TextInput style={[styles.linkInput, styles.font20]} placeholder='Enter tags...' multiline={false} onChangeText={(postTags) => this.searchTags(postTags)} value={self.state.preTag} returnKeyType='done' /> : null}

        {self.state.stage == 3 && self.state.tagStage == 1 ? <View>{autoTags}</View> : null}

        {self.state.stage == 3 && self.state.tagStage == 1 && self.state.preTag ? <View style={[styles.padding10]}><Text onPress={self.createTag.bind(self)}>Create tag: {self.state.preTag}</Text></View> : null}

        {self.state.stage == 3 && self.state.tagStage == 2 ? <View style={styles.center}><Text style={[styles.font20, styles.padding10]}>Select a parent tag</Text>{parentTagsEl}</View> : null}
         {self.state.stage == 3 && self.state.tagStage == 1 && self.state.postTags.length ? <Button style={styles.nextButton} onPress={self.post.bind(self)}>Submit</Button> : null}

        {self.state.stage == 1 || self.state.stage == 2  && self.state.tagStage == 1 ? <Button style={styles.nextButton} onPress={self.next.bind(self)}>Next</Button> : null}
        {self.state.stage == 2 || self.state.stage == 3 && self.state.tagStage == 1 ? <Button style={styles.nextButton} onPress={self.prev.bind(self)}>Prev</Button> : null}
        <View pointerEvents={'none'} style={styles.notificationContainer}>
          <Notification />
        </View>
      </View>
      </TouchableWithoutFeedback>
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
    flexDirection: 'row'
  },
  padding10: {
    padding: 10
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
  linkInput: {
    height: 50,
    width: fullWidth,
    padding: 10,
    textAlign: 'center',
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
