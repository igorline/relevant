import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  TouchableWithoutFeedback,
  Image,
  Modal,
} from 'react-native';
import * as Progress from 'react-native-progress';
import UserName from './userNameSmall.component';

import { globalStyles, fullWidth, fullHeight } from '../styles/global';
let styles;
let moment = require('moment');

class PostInfo extends Component {
  constructor(props, context) {
    super(props, context);
    this.setTag = this.setTag.bind(this);
    this.abbreviateNumber = this.abbreviateNumber.bind(this);
    this.setSelected = this.setSelected.bind(this);
    this.state = {
      passed: false,
      invested: false,
      timeUntilString: null,
      timePassedPercent: 0,
      time: 0,
      posted: null,
      toggleInfo: false,
    };
  }

  componentDidMount() {
    if (this.props.post) this.checkTime(this);
  }

  setTag(tag) {
    if (!tag) return;
    this.props.actions.selectTag(tag);
    this.props.navigator.changeTab('discover');
  }

  setSelected() {
    this.props.navigator.goToProfile({
      name: this.props.post.embeddedUser.name,
      _id: this.props.post.user
    });
  }

  abbreviateNumber(num) {
    let fixed = 0;
    if (num === null) { return null; };
    if (num === 0) { return '0'; };
    if (typeof num !== 'number') num = Number(num);
    fixed = (!fixed || fixed < 0) ? 0 : fixed;
    let b = (num).toPrecision(2).split('e');
    let k = b.length === 1 ? 0 : Math.floor(Math.min(b[1].slice(1), 14) / 3);
    let c = k < 1 ? num.toFixed(0 + fixed) : (num / Math.pow(10, k * 3)).toFixed(1 + fixed);
    let d = c < 0 ? c : Math.abs(c);
    let e = d + ['', 'K', 'M', 'B', 'T'][k];
    return e;
  }

  checkTime() {
    const self = this;
    if (self.props.post) {
      let postTime = moment(self.props.post.createdAt);
      let fromNow = postTime.fromNow();
      let timeNow = moment();
      let dif = timeNow.diff(postTime);
      let threshold = 21600000;
      if (dif >= threshold) {
        self.setState({ passed: true });
      } else {
        self.setState({
          timeUntilString: moment.duration(threshold - dif).humanize(),
          timePassedPercent: dif / threshold,
        });
      }
      self.setState({ posted: fromNow });
    }
  }

  // toggleInfo() {
  //   const self = this;
  //   let newVar = !self.state.toggleInfo;
  //   self.setState({ toggleInfo: newVar });
  // }

  render() {
    const self = this;
    let postUserImage = null;
    let postUserImageEl = null;
    let postInfo = null;
    let post = null;
    let relevance = 0;
    let value = null;
    let postUser;
    let name;

    if (this.props.post) {
      post = this.props.post;
      if (post.relevance) relevance = post.relevance;
      if (post.value) value = post.value;
      if (post.user) {
        postUser = post.embeddedUser || post.user;
        if (postUser.name) name = postUser.name;
        if (postUser.image) postUserImage = postUser.image;
      }
    };

    // if (this.props.post.tags) {
    //   tagsEl = [];
    //   tags.forEach((tag, i) => {
    //     tagsEl.push(<Text onPress={() => this.setTag(tag)} style={[styles.white, styles.font10]} key={i}>###{tag.name}</Text>);
    //   });
    // }

    if (postUserImage) {
      postUserImageEl = (<TouchableWithoutFeedback
        onPress={() => this.setSelected(this.props.post.user)}
      >
        <Image source={{ uri: postUserImage }} style={styles.userImage} />
      </TouchableWithoutFeedback>);
    }

    if (self.state.passed) {
      postInfo = (<View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
        <Text style={[styles.font10, styles.textRight, styles.bebas, styles.halfLetterSpacing, { marginRight: 5 }]}>💵&nbsp;
          {this.abbreviateNumber(value)}
        </Text>
        <Text style={[styles.font10, styles.textRight, styles.bebas, styles.halfLetterSpacing]}>📈&nbsp;
          {this.abbreviateNumber(relevance)}
        </Text>
      </View>);
    } else {
      postInfo = (
        <View style={[styles.countdown]}>
          <Progress.Pie
            style={styles.progressCirc}
            progress={self.state.timePassedPercent}
            size={15}
          />
          <Text
            style={[styles.font10, styles.textRight, styles.darkGray, styles.bebas]}
          >
            Results in {self.state.timeUntilString}
          </Text>
        </View>);
    }

    return (<View style={styles.postHeader}>
      <View style={styles.postInfo}>
        <UserName
          user={{ image: postUserImage, name, _id: this.props.post.user }}
          setSelected={this.setSelected}
        />
        <View
          style={[styles.infoRight, styles.innerInfo]}
        >
          {postInfo}
        </View>
      </View>
    </View>);
  }
}

export default PostInfo;

const localStyles = StyleSheet.create({
  countdown: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    flexDirection: 'row',
  },
  postInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 10,
  },
  progressCirc: {
    marginRight: 5,
  },
  infoLeft: {
    justifyContent: 'flex-start',
  },
  infoRight: {
    justifyContent: 'flex-end',
  },
  innerInfo: {
    flex: 1,
  },
});

styles = { ...globalStyles, ...localStyles };

