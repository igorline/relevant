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
  Linking,
  Picker,
  PickerIOS,
  Animated,
  Easing,
  LayoutAnimation,
  ScrollView
} from 'react-native';
import { connect } from 'react-redux';
var Button = require('react-native-button');
import { bindActionCreators } from 'redux';
import * as authActions from '../actions/auth.actions';
import * as postActions from '../actions/post.actions';
import * as animationActions from '../actions/animation.actions';
import * as userActions from '../actions/user.actions';
import * as investActions from '../actions/invest.actions';
require('../publicenv');
import { globalStyles, fullWidth, fullHeight } from '../styles/global';
var postStyles = null;
var moment = require('moment');
var PickerItemIOS = PickerIOS.Item;
var Progress = require('react-native-progress');
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
    }
  }

  onShare() {
    var self = this;
    Share.open({
      share_text: self.props.post.title,
      share_URL: self.props.post.link ? self.props.post.link : 'http://relevant-community.herokuapp.com/',
      title: "Share Link"
    },(e) => {
      console.log(e);
    });
  }

  componentDidMount() {
    this.checkTime(this);
    this.checkInvestments(this.props.post.investments);
  }

  testAni() {
    var self = this;
    self.props.actions.triggerAnimation('invest');
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

  toggleExpanded(bool) {
    this.setState({expanded: bool});
  }

  componentWillUpdate(nextProps) {
    var self = this;
    if (this.props.post.investments != nextProps.post.investments) {
      this.checkInvestments(nextProps.post.investments);
    }
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
          duration: 500,
          easing: Easing.linear
        }
      ).start();
    } else {
      Animated.timing(
        self.state.aniHeight,
        {
          toValue: 0,
          duration: 500,
          easing: Easing.linear
        }
      ).start();
    }
  }

  invest(toggle, functionBool) {
    var self = this;

    if (functionBool) {
      if (!self.state.invested) {
        console.log('create investment');
        this.props.actions.invest(this.props.auth.token, self.state.investAmount, self.props.post, self.props.auth.user).then(function() {
           if (self.props.router.currentRoute == 'User') self.props.actions.getSelectedUser(self.props.users.selectedUser._id)
        })
        this.props.actions.createSubscription(this.props.auth.token, self.props.post);
      } else {
        console.log('destroy investment')
        this.props.actions.destroyInvestment(this.props.auth.token, self.state.investAmount, self.props.post, self.props.auth.user).then(function() {
           if (self.props.router.currentRoute == 'User') self.props.actions.getSelectedUser(self.props.users.selectedUser._id)
        })
      }
    }
    if (toggle) this.toggleInvest(this);
    self.setState({investAmount: 50});
  }

  openComments() {
    var self = this;
    self.props.actions.setActivePost(self.props.post._id);
    self.props.routes.Comments();
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

  setSelected(user) {
    var self = this;
    if (user._id == self.props.auth.user._id) {
      console.log('going to profile')
      self.props.routes.Profile();
    } else {
      console.log('setting selected user')
      self.props.actions.getSelectedUser(user._id);
    }
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
      postUserImageEl = (<Image source={{uri: postUserImage}} style={styles.userImage} />);
    }

    if (image) {
      imageEl = (<Image resizeMode={'cover'} source={{uri: image}} style={styles.postImage} />);
    }

    var expandedInvest = self.state.expandedInvest;
    var investButtonString = "Invest 💰";
    var toggleBool = null;

    if (self.state.invested) {
      investButtonString = "Uninvest ❌💰";
      toggleBool = false;
      functionBool = true;
    } else {
      if (expandedInvest) {
        toggleBool = true;
        functionBool = true;
      } else {
        toggleBool = true;
        functionBool = false;
      }
    }

    var investButtonEl = null;

    if (post.user._id != self.props.auth.user._id) {
      if (!self.state.invested) {
        investButtonEl = (<Text style={[styles.font10, styles.postButton]} onPress={self.toggleInvest.bind(self)}>Invest 💰</Text>);
      }
    }


  var bodyEl = null;

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

      bodyEl = Object.keys(bodyObj).map(function(key) {
        var text = bodyObj[key].text;
        if (bodyObj[key].hashtag) {
          var tagObj = null;
          self.props.post.tags.forEach(function(tag) {
            if (tag.name == text.substr(1, text.length)) {
              tagObj = tag;
            }
          })
          return (<Text onPress={tagObj ? self.props.actions.goToTag.bind(null, tagObj) : null} style={styles.active}>{bodyObj[key].text}</Text>)
        } else if (bodyObj[key].mention) {
          var mentionObj = null;
          if (self.props.post.mentions) {
            if (self.props.post.mentions.length) {
              self.props.post.mentions.forEach(function(user) {
                if (user.name.toLowerCase() == text.substr(1, text.length).toLowerCase()) {
                  mentionObj = user;
                }
              })
            }
          }
          return (<Text onPress={mentionObj ? self.setSelected.bind(self, mentionObj) : null} style={mentionObj ? styles.active : null}>{bodyObj[key].text}</Text>)
        } else {
          return (<Text>{bodyObj[key].text}</Text>);
        }
      });
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
                <View style={[styles.infoLeft, styles.innerInfo]}>
                  <Text style={[styles.font15, styles.darkGray]}>{self.props.post.user.name}</Text>
                  {/*tags ? tagsEl : null*/}
                </View>
                <View style={[styles.infoRight, styles.innerInfo]}>
                  {self.state.passed ? <View><Text style={[styles.font10, styles.textRight]}>📈<Text style={styles.active}>{relevance.toFixed(2)}</Text></Text><Text style={[styles.font10, styles.textRight]}>💵<Text style={styles.active}>{value.toFixed(2)}</Text></Text></View> : <View style={[styles.countdown]}><Progress.Pie style={styles.progressCirc} progress={self.state.timePassedPercent} size={15} /><Text style={[styles.font10, styles.textRight, styles.darkGray]}>Results in {self.state.timeUntilString}</Text></View>}
                </View>
              </View>
            </View>
          </View>
        </TouchableHighlight>
        <TouchableHighlight>
          <View>
          {body ? <View style={[styles.postBody, styles.font15]}><Text style={styles.darkGray} numberOfLines={expanded ? 999999 : 2}>{bodyEl}</Text></View> : null}
          </View>
        </TouchableHighlight>

        <View style={styles.postButtons}>
          {!expanded ? <Text style={[styles.font10, styles.postButton]} onPress={self.toggleExpanded.bind(this, true)}>Read more</Text> : null}
          {expanded ?
              <Text style={[styles.font10, styles.postButton]} onPress={self.toggleExpanded.bind(this, false)}>Read less</Text>
          : null}
          <Text style={[styles.font10, styles.postButton]} onPress={self.openComments.bind(self)}>{commentString}</Text>
          <Text style={[styles.font10, styles.postButton]} onPress={self.onShare.bind(self)}>Share</Text>
          {self.props.post.user._id == self.props.auth.user._id ? <Text style={[styles.font10, styles.postButton]} onPress={self.deletePost.bind(self)}>Delete</Text> : null}
          {self.props.post.user._id != self.props.auth.user._id ? <Text style={[styles.font10, styles.postButton]} onPress={self.irrelevant.bind(self)}>Irrelevant</Text> : null}
          <Text style={[styles.font10, styles.postButton]} onPress={self.testAni.bind(self)}>testAni</Text>
          {investButtonEl}
        </View>

        <Animated.View style={{height: self.state.aniHeight, overflow: 'hidden'}}>
          <PickerIOS
            selectedValue={self.state.investAmount}
            onValueChange={(investAmount) => this.setState({investAmount: investAmount})}>
            {pickerArray}
          </PickerIOS>
        </Animated.View>

        <View style={expandedInvest ? styles.buttonContainerExpanded : styles.buttonContainer}>
          {expandedInvest ? <TouchableHighlight style={styles.investButton} onPress={self.toggleInvest.bind(self)}><Text style={styles.white}>Cancel</Text></TouchableHighlight> : null}
          {expandedInvest ? <TouchableHighlight underlayColor={'transparent'} style={styles.investButton} onPress={self.invest.bind(self, toggleBool, functionBool)}><Text style={styles.white}>Submit</Text></TouchableHighlight> : null}
          {/*investButtonEl*/}
        </View>

        <TouchableHighlight>
          <View>
            {imageEl}
          </View>
        </TouchableHighlight>
        <TouchableHighlight underlayColor={'transparent'} onPress={link ? self.openLink.bind(null, link) : null}>
          <View style={styles.postSection}>
            {lastPost ? <Text style={[styles.lastPost, styles.darkGray]}>Last subscribed post❗️</Text> : null}
            <Text style={[styles.font20, styles.darkGray]}>{title ? title : 'Untitled'}</Text>
            {link ? <Text style={[styles.font10, styles.darkGray]}>from {self.extractDomain(link)}</Text> : null}
          </View>
        </TouchableHighlight>
      </View>
    );
  }
}

export default Post;

const localStyles = StyleSheet.create({
  postButtons: {
    flexDirection: 'row',
    paddingLeft: 15,
    paddingRight: 15,
    paddingBottom: 10,
    paddingTop: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  postButton: {
    backgroundColor: '#F0F0F0',
    padding: 10,
    color: '#808080',
    borderRadius: 2
  },
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
    marginBottom: 25,
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
    padding: 10
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
  lastPost: {
  }
});





