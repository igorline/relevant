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

  setSelected(user) {
    if (!user) return;
    this.props.navigator.goToProfile({
      name: this.props.post.embeddedUser.name,
      _id: this.props.post.user
    });
  }

  abbreviateNumber(num) {
    let fixed = 0;
    if (num === null) { return null; } // terminate early
    if (num === 0) { return '0'; } // terminate early
    if (typeof num !== 'number') num = Number(num);
    fixed = (!fixed || fixed < 0) ? 0 : fixed; // number of decimal places to show
    let b = (num).toPrecision(2).split('e'); // get power
    let k = b.length === 1 ? 0 : Math.floor(Math.min(b[1].slice(1), 14) / 3); // floor at decimals, ceiling at trillions
    let c = k < 1 ? num.toFixed(0 + fixed) : (num / Math.pow(10, k * 3) ).toFixed(1 + fixed); // divide by power
    let d = c < 0 ? c : Math.abs(c); // enforce -0 is 0
    let e = d + ['', 'K', 'M', 'B', 'T'][k]; // append power
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

  toggleInfo() {
    const self = this;
    let newVar = !self.state.toggleInfo;
    self.setState({ toggleInfo: newVar });
  }

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
        onPress={() => this.setSelected(self.props.post.user)}
      >
        <Image source={{ uri: postUserImage }} style={styles.userImage} />
      </TouchableWithoutFeedback>);
    }

    if (self.state.passed) {
      if (self.state.toggleInfo) {
        postInfo = (<View>
          <Text style={[styles.font10, styles.textRight, styles.bebas, styles.halfLetterSpacing]}>💵&nbsp;
            {this.abbreviateNumber(value)}
          </Text>
        </View>);
      } else {
        postInfo = (<View>
          <Text style={[styles.font10, styles.textRight, styles.bebas, styles.halfLetterSpacing]}>📈&nbsp;
            {this.abbreviateNumber(relevance)}
          </Text>
        </View>);
      }
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
      {postUserImageEl}
      <View style={styles.postInfo}>
        <TouchableWithoutFeedback
          onPress={() => self.setSelected(self.props.post.user)}
          style={[styles.infoLeft, styles.innerInfo]}
        >
          <View>
            <Text style={[styles.font15, styles.darkGray, styles.bebas]}>
              {name}
            </Text>
          </View>
        </TouchableWithoutFeedback>
        <TouchableHighlight
          underlayColor={'transparent'}
          onPress={() => self.toggleInfo()}
          style={[styles.infoRight, styles.innerInfo]}
        >
          {postInfo}
        </TouchableHighlight>
      </View>
    </View>);
  }
}

export default PostInfo;

const localStyles = StyleSheet.create({
  userImage: {
    height: 25,
    width: 25,
    borderRadius: 12.5,
  },
  countdown: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    flexDirection: 'row',
  },
  postInfo: {
    flex: 1,
    paddingLeft: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    paddingLeft: 15,
    paddingRight: 15,
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

