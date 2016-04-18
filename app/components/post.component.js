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
  LinkingIOS,
  Picker,
  Animated,
  LayoutAnimation
} from 'react-native';
import { connect } from 'react-redux';
var Button = require('react-native-button');
import { bindActionCreators } from 'redux';
import * as authActions from '../actions/auth.actions';
import * as postActions from '../actions/post.actions';
import * as userActions from '../actions/user.actions';
require('../publicenv');
import { globalStyles, fullWidth, fullHeight } from '../styles/global';
var postStyles = null;
var moment = require('moment');


class Post extends Component {
  constructor (props: any) {
    super(props)
    this.state = {
      expanded: false,
      investAmount: 50,
      expandedInvest: false,
      aniHeight: new Animated.Value(0),
      posted: null,
      passed: false,
      timeUntilString: null,
      timePassedPercent: null
    }
  }

  componentDidMount() {
    this.props.post.created_at;
    this.checkTime(this)
  }

  checkTime() {
    var self = this;
    var postTime = moment(self.props.post.created_at);
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
      LinkingIOS.openURL(url)
  }

  toggleExpanded(bool) {
    this.setState({expanded: bool});
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
    var invest = {
      postId: this.props.post._id,
      sign: 1,
      amount: self.state.investAmount
    };
    if (functionBool) this.props.actions.invest(this.props.auth.token, invest);
    if (toggle) this.toggleInvest(this);
    self.setState({investAmount: 50});
  }


  render() {
    var self = this;
    var pickerStatus = self.state.pickerStatus;
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
    var balance = null;
    var createdAt = null;
    var postStyles = this.props.styles;
    var user = null;
    var value = 0;
    var functionBool = false;
    var expanded = this.state.expanded;
    if (this.props.auth.user) user = this.props.auth.user;
    if (user && user.balance) balance = user.balance;
    var styles = {...localStyles, ...postStyles};
    var pickerArray = [];

    if (this.props.post) {
      post = this.props.post;
      if (post.image) image = post.image;
      if (post.description) description = post.description;
      if (post.title) title = post.title;
      if (post.link) link = post.link;
      if (post.body) body = post.body;
      if (post.value) value = post.value;
      if (post.created_at) createdAt = post.created_at;
      if (post.user) {
        postUser = post.user;
        if (postUser.image) postUserImage = postUser.image;
        if (postUser.name) postUserName = postUser.name;
      }
    }

    if (balance >= 50) pickerArray.push(<Picker.Item label='50' value={50} />);
    if (balance >= 100) pickerArray.push(<Picker.Item label='100' value={100} />);
    if (balance >= 500) pickerArray.push(<Picker.Item label='500' value={500} />);
    if (balance >= 1000) pickerArray.push(<Picker.Item label='1000' value={1000} />);
    if (balance >= 5000) pickerArray.push(<Picker.Item label='5000' value={5000} />);
    if (balance >= 10000) pickerArray.push(<Picker.Item label='10000' value={10000} />);

    if (postUserImage) {
      postUserImageEl = (<Image source={{uri: postUserImage}} style={styles.userImage} />);
    }

    if (image) {
      imageEl = (<Image resizeMode={'cover'} source={{uri: image}} style={styles.postImage} />);
    }

    var expandedInvest = self.state.expandedInvest;
    var investButtonString = "Inve$t";
    if (expandedInvest) investButtonString = "$ubmit";
    var previouslyInvested = false;
    var toggleBool = null;

    if (post.investors) {
      var invested = post.investors.filter(el => {
        return el.user == user._id
      })
      if (invested.length) {
        investButtonString = "UnInve$t";
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
            <Text>Posted {self.state.posted}</Text>
            {self.state.passed ? <Text>Current value: {value}</Text> : <View><Text>Value available in {self.state.timeUntilString}{'\n'}{Math.round(self.state.timePassedPercent*100)}% complete</Text></View>}
            <Animated.View style={{height: self.state.aniHeight, overflow: 'hidden'}}>
              <Picker
                selectedValue={self.state.investAmount}
                onValueChange={(investAmount) => this.setState({investAmount: investAmount})}>
                {pickerArray}
              </Picker>
            </Animated.View>
            <View style={expandedInvest ? styles.buttonContainerExpanded : styles.buttonContainer}>
              {expandedInvest ? <Button onPress={self.toggleInvest.bind(self)}>Cancel</Button> : null}
              {expandedInvest ? <Button style={styles.investButton} onPress={self.invest.bind(self, toggleBool, functionBool)}>{investButtonString}</Button> : null}
              {!expandedInvest ? <Button style={styles.investButton} onPress={self.invest.bind(self, toggleBool, functionBool)}>{investButtonString}</Button> : null}
            </View>
            {!expanded ? <Text onPress={self.toggleExpanded.bind(this, true)}>Read more</Text> : null}
            {expanded ?
              <View>
                <Text onPress={self.toggleExpanded.bind(this, false)}>Read less</Text>
              </View>
            : null}
          </View>
        </View>
    );
  }
}

export default Post;

const localStyles = StyleSheet.create({
  opacZero: {
    opacity: 0
  },
  // picker: {
  //   overflow: 'hidden'
  // },
  expandedInvest: {
    height: 200,
  },
  hiddenInvest: {
    height: 0,
    overflow: 'hidden'
  },
  postContainer: {
    marginBottom: 25,
    textAlign: 'left',
  },
  postBody: {
    padding: 15,
    textAlign: 'left'
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
  investButton: {
    textAlign: 'left',
    paddingTop: 10,
    paddingLeft: 0,
    padingRight: 0,
    paddingBottom: 10
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






