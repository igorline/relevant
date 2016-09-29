'use strict';

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableHighlight,
  Linking,
  Picker,
  PickerIOS,
  Animated,
  Easing,
  LayoutAnimation,
  ScrollView,
  DatePickerIOS,
  AlertIOS,
  ActionSheetIOS,
  TouchableWithoutFeedback
} from 'react-native';
import { connect } from 'react-redux';
import Button from 'react-native-button';
import { bindActionCreators } from 'redux';
import * as authActions from '../actions/auth.actions';
import * as postActions from '../actions/post.actions';
import * as animationActions from '../actions/animation.actions';
import * as userActions from '../actions/user.actions';
import * as investActions from '../actions/invest.actions';
import { globalStyles, fullWidth, fullHeight } from '../styles/global';
var postStyles = null;
var moment = require('moment');
var PickerItemIOS = PickerIOS.Item;
import * as Progress from 'react-native-progress';
import Share from 'react-native-share';

class Post extends Component {
  constructor (props) {
    super(props)
    this.state = {
      progress: 0,
      expanded: false,
      investAmount: 50,
      expandedInvest: false,
      aniHeight: new Animated.Value(0),
      posted: null,
      passed: false,
      timeUntilString: null,
      timePassedPercent: null,
      invested: false,
      textInputValue: null,
      time: 0,
      toggleInfo: false,
      timeActive: false,
      editedBody: null,
      editedTitle: null,
      editing: false,
      myPost: false,
      bodyHeight: 0,
      titleHeight: 0,
      buttons: [
        'Share',
        'Irrelevant',
        'Cancel'
      ],
      cancelIndex: 2,
    }
  }

  onShare() {
    var self = this;
    Share.open({
      title: 'Relevant',
      url: self.props.post.link ? self.props.post.link : 'http://relevant-community.herokuapp.com/',
      subject: "Share Link",
      message: self.props.post.title ? 'Relevant post: ' + self.props.post.title : 'Relevant post:'
    },(e) => {
      console.log(e);
    });
  }

  componentDidMount() {
    var self = this;
    this.checkTime(this);
    this.checkInvestments(this.props.post.investments);
    if (self.props.post) {
      self.setState({
        editedBody: self.props.post.body,
        editedTitle: self.props.post.title
      })
      if (self.props.post.user._id == self.props.auth.user._id) {
        self.setState({
          myPost: true,
          buttons: [
            'Share',
            'Edit',
            'Delete',
            'Cancel'
          ],
          destructiveIndex: 2,
          cancelIndex: 3,
        });
      }
    }
  }

  componentWillUpdate(nextProps, nextState) {
    var self = this;
    if (this.props.post.investments != nextProps.post.investments) {
      this.checkInvestments(nextProps.post.investments);
    }
  }

  checkInvestments(investments) {
    var self = this;
    var invested = false;
    if (investments) {
      if (investments.length > 0) {
        investments.forEach(function(investment, i) {
          if (investment.investor == self.props.auth.user._id) invested = true;
          if (i == investments.length - 1) {
            self.setState({invested: invested});
          }
        })
      } else {
        self.setState({invested: false});
      }
    }
  }

  checkTime() {
    var self = this;
    var postTime = moment(self.props.post.createdAt);
    var fromNow = postTime.fromNow();
    var timeNow = moment();
    var dif = timeNow.diff(postTime);
    var threshold = 21600000;
    if (dif >= threshold) {
      self.setState({passed: true});
    } else {
      self.setState({timeUntilString: moment.duration(threshold - dif).humanize(), timePassedPercent: dif/threshold})
    }
    self.setState({posted: fromNow});
  }

  openLink(url) {
    Linking.openURL(url)
  }

  toggleExpanded() {
    var self = this
    self.setState({expanded: self.state.expanded = !self.state.expanded});
  }

  extractDomain(url) {
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


  showActionSheet() {
    var self = this;
    if (self.state.myPost) {
      ActionSheetIOS.showActionSheetWithOptions({
        options: self.state.buttons,
        cancelButtonIndex: self.state.cancelIndex,
        destructiveButtonIndex: self.state.destructiveIndex,
      },
      (buttonIndex) => {
        switch(buttonIndex) {
          case 0:
            self.onShare();
            break;
          case 1:
            self.toggleEditing();
            break;
          case 2:
            self.deletePost();
            break;
          default:
            return;
        }
      });
    } else {
      ActionSheetIOS.showActionSheetWithOptions({
        options: self.state.buttons,
        cancelButtonIndex: self.state.cancelIndex,
        destructiveButtonIndex: self.state.destructiveIndex,
      },
      (buttonIndex) => {
        switch(buttonIndex) {
          case 0:
            self.onShare();
            break;
          case 1:
            self.irrelevant();
            break;
          default:
            return;
        }
      });
    }
  }

  toggleEditing() {
    var self = this;
    self.setState({editing: !self.state.editing})
  }

  saveEdit() {
    var self = this;
    var title = self.state.editedTitle;
    var body = self.state.editedBody;
    var bodyTags = body.match(/#\S+/g);
    var bodyMentions = body.match(/@\S+/g);
    var tags = [];
    var mentions = [];
    var preTags = [];
    if (self.props.post.tags) {
      self.props.post.tags.forEach(function(tag, i) {
        preTags.push(tag.name);
      })
    }

    if (bodyTags) {
      bodyTags.forEach(function(tag) {
        tag = tag.replace('#', '');
        tags.push(tag);
      })
    }
    if (bodyMentions) {
      bodyMentions.forEach(function(name) {
        name = name.replace('@', '');
        mentions.push(name);
      })
    }

    var finalTags = tags.concat(preTags);

    var postBody = {
      user: self.props.auth.user._id,
      _id: self.props.post._id,
      body: body,
      tags: finalTags,
      title: title,
      mentions: mentions
    };

    //Update post action here

    self.props.actions.editPost(postBody, self.props.auth.token).then(function(results) {
      console.log(results, 'edit results')
       if (!results) {
          AlertIOS.alert("Update error please try again");
      } else {
         AlertIOS.alert("Updated");
         self.setState({editing: false});
      }
    })

  }

  toggleInvest() {
    var self = this;
    var expandedInvest = self.state.expandedInvest;
    expandedInvest = !expandedInvest;
    self.setState({'expandedInvest': expandedInvest});
    if (expandedInvest) {
      Animated.timing(
        self.state.aniHeight,
        {
          toValue: 200,
          duration: 300
        }
      ).start();
    } else {
      Animated.timing(
        self.state.aniHeight,
        {
          toValue: 0,
          duration: 300
        }
      ).start();
    }
  }

  invest() {
    var self = this;
    console.log('investing', self.state.investAmount);
    this.props.actions.invest(this.props.auth.token, self.state.investAmount, self.props.post, self.props.auth.user).then(function() {
       if (self.props.route == 'user') self.props.actions.getSelectedUser(self.props.users.selectedUser._id)
    })
    this.props.actions.createSubscription(this.props.auth.token, self.props.post);
    self.setState({investAmount: 50});
  }

  uninvest() {
    var self = this;
    console.log('destroy investment')
    self.props.actions.destroyInvestment(this.props.auth.token, self.state.investAmount, self.props.post, self.props.auth.user).then(function() {
       if (self.props.route == 'user') self.props.actions.getSelectedUser(self.props.users.selectedUser._id)
    })
  }

  openComments() {
    var self = this;
    self.props.actions.setActivePost(self.props.post._id);
    self.props.navigator.push('comments')
  }

  deletePost() {
    var self = this;
    self.props.actions.deletePost(self.props.auth.token, self.props.post);
    console.log('delete')
  }

  irrelevant() {
    var self = this;
    console.log('irrelevant')
    self.props.actions.irrelevant(self.props.auth.token, self.props.post._id);
  }

  toggleOptions() {
    var self = this;
    console.log('toggleOptions')
    self.setState({showOptions: self.state.showOptions = !self.state.showOptions});
  }

  setSelected(user) {
    var self = this;
    if (user._id == self.props.auth.user._id) {
      console.log('going to profile')
      self.props.navigator.resetTo({name: 'profile'})
    } else {
      console.log('setting selected user')
      self.props.actions.getSelectedUser(user._id).then(function(results) {
        if (results) {
          self.props.navigator.resetTo({name: 'user'});
        }
      })
    }
  }

  handlePressIn() {
    var self = this;
    self.setState({timeActive: true});
    increaseTime();
    self.props.actions.triggerAnimation('invest');

    function increaseTime() {
      if (self.state.timeActive) {
        self.setState({time: self.state.time += 1});
        console.log(self.state.time)
        setTimeout(function() {
          increaseTime();
        }, 1000);
      }
    }
  }

  handlePressOut() {
    var self = this;
    self.setState({timeActive: false, investAmount: 50*self.state.time});
    self.invest();
    self.setState({time: 0});
    self.props.actions.stopAnimation();
  }

  toggleInfo() {
    var self = this;
    var newVar = !self.state.toggleInfo;
    self.setState({toggleInfo: newVar});
  }

  render() {
    var self = this;
    var pickerStatus = self.state.pickerStatus;
    var post, title, description, image, link, imageEl, postUserImage, postUserImageEl, postUser, postUserName, body, balance, createdAt, user, comments, functionBool, tags, tagsEl = null;
    var commentString = 'Add comment';
    var relevance = 0;
    var user = null;
    var comments = null;
    var value = 0;
    var bodyEl = null;
    var functionBool = false;
    var expanded = this.state.expanded;
    if (this.props.auth.user) {
      user = this.props.auth.user;
      if (user.balance) balance = user.balance;
    }
    var styles = {...localStyles, ...globalStyles};
    var pickerArray = [];
    var investOptions = [];
    var lastPost = false;
    var expandedInvest = self.state.expandedInvest;
    var toggleBool = null;
    var investButtonEl = null;
    var uninvestButtonEl = null;
    var bodyEditingEl = null;
    var titleEditingEl = null;

    if (this.props.post) {
      post = this.props.post;
      if (post.image) image = post.image;
      if (post.description) description = post.description;
      if (post.title) title = post.title;
      if (post.relevance) relevance = post.relevance;
      if (post.link) link = post.link;
      if (post.body) body = post.body;
      if (post.value) value = post.value;
      if (post.comments) comments = post.comments;
      if (post.tags) {
        if (post.tags.length) tags = post.tags;
      }
      if (post.createdAt) createdAt = post.createdAt;
      if (post.user) {
        postUser = post.user;
        if (postUser.image) postUserImage = postUser.image;
        if (postUser.name) postUserName = postUser.name;
      }
      if (post.lastPost) {
        if (post.lastPost.length) {
          post.lastPost.forEach(function(lastUser) {
            if (lastUser == self.props.auth.user._id) lastPost = true;
          })
        }
      }
    }

    if (self.state.editing) {
      bodyEditingEl = (
        <TextInput 
          multiline={true}
          autoGrow={true}
          style={[styles.darkGray, styles.editingInput, {height: Math.max(35, self.state.bodyHeight)}]} 
          onChange={(event) => {
            this.setState({
              editedBody: event.nativeEvent.text,
              bodyHeight: event.nativeEvent.contentSize.height,
            });
          }}
          value={this.state.editedBody}
        />
      );
    }

    if (comments) {
      if (comments.length == 1) commentString = '1 Comment';
      if (comments.length > 1) commentString = comments.length+' Comments';
    }

    if (tags) {
      tagsEl = [];
      tags.forEach(function(tag, i) {
        tagsEl.push(<Text style={[styles.white, styles.font10]} key={i}>#{tag.name}</Text>)
      })
    }

    if (balance >= 50) pickerArray.push(<PickerItemIOS key={0} label='50' value={50} />);
    if (balance >= 100) pickerArray.push(<PickerItemIOS key={1} label='100' value={100} />);
    if (balance >= 500) pickerArray.push(<PickerItemIOS key={2} label='500' value={500} />);
    if (balance >= 1000) pickerArray.push(<PickerItemIOS key={3} label='1000' value={1000} />);
    if (balance >= 5000) pickerArray.push(<PickerItemIOS key={4} label='5000' value={5000} />);
    if (balance >= 10000) pickerArray.push(<PickerItemIOS key={5} label='10000' value={10000} />);

    if (postUserImage) {
      postUserImageEl = (<TouchableWithoutFeedback onPress={self.setSelected.bind(self, self.props.post.user)}><Image source={{uri: postUserImage}} style={styles.userImage} /></TouchableWithoutFeedback>);
    }

    if (image) {
      imageEl = (<Image resizeMode={'cover'} source={{uri: image}} style={styles.postImage} />);
    }

    if (post.user._id != self.props.auth.user._id && !self.state.invested) {
      investButtonEl = (<TouchableWithoutFeedback
          onPressIn={this.handlePressIn.bind(self)}
          onPressOut={this.handlePressOut.bind(self)} style={[styles.postButton, {marginRight: 5, backgroundColor: '#F0F0F0'}]}>
          <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}><Text style={[styles.font10, styles.postButtonText]}>Invest</Text><Text style={styles.font10}>💰</Text></View>
        </TouchableWithoutFeedback>
      )
    }

    if (post.user._id != self.props.auth.user._id && self.state.invested) {
      uninvestButtonEl = (
        <TouchableWithoutFeedback
          onPress={this.uninvest.bind(self)} style={[styles.postButton, {marginRight: 5, backgroundColor: '#F0F0F0'}]}>
          <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}><Text style={[styles.font10, styles.postButtonText]}>Uninvest</Text></View>
        </TouchableWithoutFeedback>
      )
    }

    if (body) {
      var bodyObj = {};

      var textArr = body.replace((/[@#]\S+/g), function(a){return "`"+a+"`"}).split(/`/);
      textArr.forEach(function(section, i) {
        bodyObj[i] = {};
        bodyObj[i].text = section;
        if (section.indexOf('#') > -1) {
          bodyObj[i].hashtag = true;
          bodyObj[i].mention = false;
        } else if (section.indexOf('@') > -1) {
          bodyObj[i].mention = true;
          bodyObj[i].hashtag = false;
        } else {
          bodyObj[i].hashtag = false;
          bodyObj[i].mention = false;
        }
      })

      bodyEl = Object.keys(bodyObj).map(function(key, i) {
        var text = bodyObj[key].text;
        if (bodyObj[key].hashtag) {
          var tagObj = null;
          self.props.post.tags.forEach(function(tag) {
            if (tag.name == text.substr(1, text.length)) {
              tagObj = tag;
            }
          })
          return (<Text key={i} onPress={tagObj ? self.props.actions.goToTag.bind(null, tagObj) : null} style={styles.active}>{bodyObj[key].text}</Text>)
        } else if (bodyObj[key].mention) {
          var mentionObj = null;
          if (self.props.post.mentions) {
            if (self.props.post.mentions.length) {
              self.props.post.mentions.forEach(function(user) {
                if (user.name) {
                  if (user.name.toLowerCase() == text.substr(1, text.length).toLowerCase()) {
                    mentionObj = user;
                  }
                }
              })
            }
          }
          return (<Text key={i} onPress={mentionObj ? self.setSelected.bind(self, mentionObj) : null} style={mentionObj ? styles.active : null}>{bodyObj[key].text}</Text>)
        } else {
          return (<Text key={i}>{bodyObj[key].text}</Text>);
        }
      });
    }
    var titleEl = null;
    if (!self.state.editing) {
      titleEl = (<Text style={[styles.font20, styles.darkGray]}>{title ? title : 'Untitled'}</Text>)
    } else {
      titleEl = (<TextInput
          multiline={true}
          autoGrow={true}
          style={[styles.darkGray, styles.editingInput, {height: Math.max(35, self.state.titleHeight)}]} 
          onChange={(event) => {
            this.setState({
              editedTitle: event.nativeEvent.text,
              titleHeight: event.nativeEvent.contentSize.height,
            });
          }}
          value={this.state.editedTitle}
        />
      )
    }

    var postInfo = null;

    if (self.state.passed) {
      if (self.state.toggleInfo) {
        postInfo = (<View><Text style={[styles.font10, styles.textRight]}>💵 <Text style={styles.active}>{value.toFixed(2)}</Text></Text></View>);
      } else {
        postInfo = (<View><Text style={[styles.font10, styles.textRight]}>📈 <Text style={styles.active}>{relevance.toFixed(2)}</Text></Text></View>);
      }
    } else {
      postInfo = (<View style={[styles.countdown]}><Progress.Pie style={styles.progressCirc} progress={self.state.timePassedPercent} size={15} /><Text style={[styles.font10, styles.textRight, styles.darkGray]}>Results in {self.state.timeUntilString}</Text></View>);
    }

    return (
      <View style={[styles.postContainer]} onLayout={(event) => {
          var {x, y, width, height} = event.nativeEvent.layout;
          self.setState({postHeight: height, postWidth: width})
        }}>

        <TouchableHighlight underlayColor={'transparent'} onPress={link ? self.openLink.bind(null, link) : null}>
          <View>
            <View style={styles.postHeader}>
              {postUserImageEl}
              <View style={styles.postInfo}>
                <TouchableWithoutFeedback onPress={self.setSelected.bind(self, self.props.post.user)} style={[styles.infoLeft, styles.innerInfo]}>
                  <View><Text style={[styles.font15, styles.darkGray]}>{self.props.post.user.name}</Text></View>
                </TouchableWithoutFeedback>
                <TouchableHighlight underlayColor={'transparent'} onPress={self.toggleInfo.bind(self)} style={[styles.infoRight, styles.innerInfo]}>
                  {postInfo}
                </TouchableHighlight>
              </View>
            </View>
          </View>
        </TouchableHighlight>

        <TouchableHighlight>
          <View>
            <View style={[styles.postBody]}>
              {body && !self.state.editing ? <Text style={styles.darkGray} numberOfLines={expanded ? 999999 : 2}>{bodyEl}</Text> : null}
              {body && self.state.editing ? bodyEditingEl : null}
            </View>
          </View>
        </TouchableHighlight>

        {self.state.editing ? <View style={styles.postButtons}>
          <TouchableHighlight underlayColor={'transparent'} style={styles.postButton} onPress={self.saveEdit.bind(self)}>
            <Text style={[styles.font10, styles.postButtonText]}>Save changes</Text>
          </TouchableHighlight>
          <TouchableHighlight underlayColor={'transparent'} onPress={self.toggleEditing.bind(self)} style={styles.postButton}>
            <Text style={[styles.font10, styles.postButtonText]}>Cancel</Text>
          </TouchableHighlight>
        </View> : null}

        <View style={styles.postButtons}>
          {investButtonEl}
          {uninvestButtonEl}
          <TouchableHighlight underlayColor={'transparent'} style={[styles.postButton, {marginRight: 5}]} onPress={self.toggleExpanded.bind(self)}><Text style={[styles.font10, styles.postButtonText]}>{expanded ? 'Read less' : 'Read more'}</Text></TouchableHighlight>
          <TouchableHighlight underlayColor={'transparent'} style={[styles.postButton, {marginRight: 5}]} onPress={self.openComments.bind(self)}><Text style={[{marginRight: 5}, styles.font10, styles.postButtonText]}>{commentString}</Text></TouchableHighlight>
          <TouchableHighlight underlayColor={'transparent'} style={styles.postButton} onPress={self.showActionSheet.bind(self)}><Text style={[styles.font10, styles.postButtonText]}>...</Text></TouchableHighlight>
        </View>

        <Animated.View style={{height: self.state.aniHeight, overflow: 'hidden'}}>
          <PickerIOS
            selectedValue={self.state.investAmount}
            onValueChange={(investAmount) => this.setState({investAmount: investAmount})}>
            {pickerArray}
          </PickerIOS>
        </Animated.View>

        <View style={expandedInvest ? styles.buttonContainerExpanded : styles.buttonContainer}>
          <View>
            {expandedInvest ? <TouchableHighlight style={styles.investButton} onPress={self.toggleInvest.bind(self)}><Text style={styles.white}>Cancel</Text></TouchableHighlight> : null}
            {expandedInvest ? <TouchableHighlight underlayColor={'transparent'} style={styles.investButton} onPress={self.invest.bind(self, toggleBool, functionBool)}><Text style={styles.white}>Submit</Text></TouchableHighlight> : null}
          </View>
        </View>

        <TouchableHighlight>
          <View>
            {imageEl}
          </View>
        </TouchableHighlight>

        <TouchableHighlight underlayColor={'transparent'} onPress={link ? self.openLink.bind(null, link) : null}>
          <View style={styles.postSection}>
            {lastPost ? <Text style={[styles.lastPost, styles.darkGray]}>Last subscribed post❗️</Text> : null}
            {titleEl}
            {link ? <Text style={[styles.font10, styles.darkGray]}>from {self.extractDomain(link)}</Text> : null}
          </View>
        </TouchableHighlight>

      </View>
    );
  }
}

export default Post;

const localStyles = StyleSheet.create({
  commentPad: {
    paddingTop: 10,
    paddingBottom: 5,
    paddingRight: 0,
    paddingLeft: 0
  },
  opacZero: {
    opacity: 0
  },
  expandedInvest: {
    height: 200,
  },
  hiddenInvest: {
    height: 0,
    overflow: 'hidden'
  },
  postContainer: {
    paddingBottom: 25,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F0F0F0'
  },
  tagsRow: {
    flexDirection: 'row',
    paddingTop: 10,
    paddingBottom: 10,
    alignItems: 'center',
    flexWrap: 'wrap',
    flex: 1
  },
  postSection: {
    paddingTop: 10,
    paddingLeft: 15
  },
  postBody: {
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 15,
    paddingRight: 15
  },
  postImage: {
    height: 200,
    width: fullWidth,
  },
  buttonContainer: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  buttonContainerExpanded: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  innerInfo: {
    flex: 1,
  },
  infoLeft: {
    justifyContent: 'flex-start'
  },
  infoRight: {
    justifyContent: 'flex-end'
  },
  investButton: {
    padding: 10,
    marginRight: 5,
    marginTop: 5,
    borderRadius: 5,
    marginBottom: 5,
    backgroundColor: 'black',
  },
  userImage: {
    height: 25,
    width: 25,
    borderRadius: 12.5
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    paddingLeft: 15,
    paddingRight: 15,
    paddingBottom: 10
  },
  link: {
    flex: 1,
  },
  countdown: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    flexDirection: 'row'
  },
  postInfo: {
    flex: 1,
    paddingLeft: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: "center"
  },
  loading: {
    fontSize: 40,
    fontWeight: '100'
  },
  progressCirc: {
    marginRight: 5
  },
});





