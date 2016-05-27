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
  LayoutAnimation,
  ScrollView
} from 'react-native';
import { connect } from 'react-redux';
var Button = require('react-native-button');
import { bindActionCreators } from 'redux';
import * as authActions from '../actions/auth.actions';
import * as postActions from '../actions/post.actions';
import * as userActions from '../actions/user.actions';
import * as investActions from '../actions/invest.actions';
require('../publicenv');
import { globalStyles, fullWidth, fullHeight } from '../styles/global';
var postStyles = null;
var moment = require('moment');
var PickerItemIOS = PickerIOS.Item;
import Shimmer from 'react-native-shimmer';
var Progress = require('react-native-progress');

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

  componentDidMount() {
    this.checkTime(this);
    this.checkInvestments(this.props.post.investments);
  }

  checkInvestments(investments) {
    var self = this;
    console.log('check', investments)
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
          duration: 500
        }
      ).start();
    } else {
      Animated.timing(
        self.state.aniHeight,
        {
          toValue: 0,
          duration: 500
        }
      ).start();
    }
  }

  invest(toggle, functionBool) {
    var self = this;

    if (functionBool) {
      if (!self.state.invested) {
        console.log('create investment');
        this.props.actions.invest(this.props.auth.token, self.state.investAmount, self.props.post, self.props.auth.user).then(function(){
          self.checkInvestments(self.props.post.investments);
        })
        this.props.actions.createSubscription(this.props.auth.token, self.props.post);
      } else {
        console.log('destroy investment')
        this.props.actions.destroyInvestment(this.props.auth.token, self.state.investAmount, self.props.post, self.props.auth.user).then(function(){
           self.checkInvestments(self.props.post.investments);
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


  render() {
    var self = this;
    var pickerStatus = self.state.pickerStatus;
    var post = null;
    var title = null;
    var description = null;
    var image = null;
    var commentString = 'Add comment';
    var link = null;
    var imageEl = null;
    var postUserImage = null;
    var postUserImageEl = null;
    var postUser = null;
    var postUserName = null;
    var body = null;
    var balance = null;
    var createdAt = null;
    var relevance = 0;
    var postStyles = this.props.styles;
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
    var tags = null;
    var tagsEl = null;

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
    var investButtonString = "💰";
    if (expandedInvest) investButtonString = "Submit";
    var previouslyInvested = false;
    var toggleBool = null;

    if (self.state.invested) {
      investButtonString = "❌💰";
      previouslyInvested = true;
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

    if (!expandedInvest) {
      if (post.user._id != self.props.auth.user._id) {
        investButtonEl = (<View style={styles.testShimmer}><Text style={[styles.investButton]} onPress={self.invest.bind(self, toggleBool, functionBool)}>{investButtonString}</Text></View>);
      }
    }


    return (
        <View style={[styles.postContainer]}>
        <TouchableHighlight underlayColor={'transparent'} onPress={link ? self.openLink.bind(null, link) : null}>
          <View>
            <View style={styles.postHeader}>
              {postUserImageEl}
              <View style={styles.postInfo}>
                <View style={[styles.infoLeft, styles.innerInfo]}>
                <Text style={[styles.white, styles.font10]}>Posted by {self.props.post.user.name} &#8226; 📈<Text style={styles.active}>{self.props.post.user.relevance.toFixed(2)}</Text></Text>
                 {tags ? tagsEl : null}
                 </View>
                 <View style={[styles.infoRight, styles.innerInfo]}>
                   {self.state.passed ? <View><Text style={[styles.font10, styles.white, styles.textRight]}>📈<Text style={styles.active}>{relevance.toFixed(2)}</Text></Text><Text style={[styles.font10, styles.white, styles.textRight]}>💵<Text style={styles.active}>{value.toFixed(2)}</Text></Text></View> : <View style={[styles.countdown]}><Progress.Pie style={styles.progressCirc} progress={self.state.timePassedPercent} size={15} /><Text style={[styles.font10, styles.white, styles.textRight]}>Results in {self.state.timeUntilString}</Text></View>}
                  </View>
                </View>
              </View>
            {imageEl}
          </View>
        </TouchableHighlight>
          <TouchableHighlight underlayColor={'transparent'} onPress={link ? self.openLink.bind(null, link) : null}>
            <View style={styles.postSection}>
              <Text style={styles.font20}>{title ? title : 'Untitled'}</Text>
              {link ? <Text style={styles.font10}>from {self.extractDomain(link)}</Text> : null}
              {body ? <View style={[styles.postBody, styles.font15]}><Text numberOfLines={expanded ? 999999 : 2}>{body}</Text></View> : null}
            </View>
          </TouchableHighlight>
          <View style={styles.postSection}>
          {!expanded ? <Text style={styles.font15} onPress={self.toggleExpanded.bind(this, true)}>Read more</Text> : null}
            {expanded ?
              <View>
                <Text style={styles.font15} onPress={self.toggleExpanded.bind(this, false)}>Read less</Text>
              </View>
            : null}
            <Text style={[styles.font15, styles.commentPad]} onPress={self.openComments.bind(self)}>{commentString}</Text>
            <Animated.View style={{height: self.state.aniHeight, overflow: 'hidden'}}>
              <PickerIOS
                selectedValue={self.state.investAmount}
                onValueChange={(investAmount) => this.setState({investAmount: investAmount})}>
                {pickerArray}
              </PickerIOS>
            </Animated.View>
            <View style={expandedInvest ? styles.buttonContainerExpanded : styles.buttonContainer}>
              {expandedInvest ? <Button onPress={self.toggleInvest.bind(self)}>Cancel</Button> : null}
              {expandedInvest ? <Button style={styles.investButton} onPress={self.invest.bind(self, toggleBool, functionBool)}>{investButtonString}</Button> : null}
            {investButtonEl}
            </View>
          </View>
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
    textAlign: 'left',
    paddingTop: 10,
    paddingLeft: 0,
    paddingRight: 0,
    paddingBottom: 10,
    fontSize: 17,
    fontWeight: 'bold',
    color: 'rgba(0,122,255,1)'
  },
  userImage: {
    height: 30,
    width: 30,
    borderRadius: 15
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,1)',
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
  }
});






