import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Progress from 'react-native-progress';
import UserName from '../userNameSmall.component';
import { globalStyles } from '../../styles/global';
import Stats from './stats.component';
// import Tooltip from '../tooltip.component';

let ToolTip = require('react-native-tooltip');

let styles;
let moment = require('moment');

class PostInfo extends Component {
  constructor(props, context) {
    super(props, context);
    this.setTag = this.setTag.bind(this);
    this.setSelected = this.setSelected.bind(this);
    this.state = {
      passed: false,
      invested: false,
      timeUntilString: null,
      timePassedPercent: 0,
      time: 0,
      posted: null,
      input: null
    };
  }

  componentDidMount() {
    if (this.props.post) this.checkTime(this.props);
  }

  componentWillReceiveProps(next) {
    this.checkTime(next);
  }

  setTag(tag) {
    if (!tag) return;
    this.props.actions.selectTag(tag);
    this.props.actions.changeTab('discover');
  }

  setSelected() {
    if (!this.props.actions) return;
    if (this.props.scene && this.props.scene.id === this.props.post.user._id) return false;
    this.props.actions.goToProfile({
      name: this.props.post.embeddedUser.name,
      _id: this.props.post.user._id || this.props.post.user
    });
  }

  checkTime(props) {
    if (props.post) {
      let postTime = moment(props.post.createdAt);
      let fromNow = postTime.fromNow();
      let timeNow = moment();
      let dif = timeNow.diff(postTime);
      let threshold = 21600000;
      let passed = true;
      // if (dif >= threshold) passed = true;

      this.setState({
        passed,
        timeUntilString: moment.duration(threshold - dif).humanize(),
        timePassedPercent: dif / threshold,
      });

      this.setState({ posted: fromNow });
    }
  }

  render() {
    let postUserImage = null;
    let postInfo = null;
    let post = null;
    let postUser;
    let name;

    if (this.props.post) {
      post = this.props.post;
      if (post.user) {
        postUser = post.embeddedUser || post.user;
        if (postUser.name) name = postUser.name;
        if (postUser.image) postUserImage = postUser.image;
      }
    }

    if (this.state.passed) {
      // postInfo = (<Stats type={'value'} entity={post} />);
    } else {
      postInfo = (
        <View style={[styles.countdown]}>
          <ToolTip
            ref={(tooltip) => { this.tooltip = tooltip; }}
            actions={[
              { text: 'Post value revealed 6 hours after creation' }
            ]}
            underlayColor={'transparent'}
            arrowDirection={'up'}
          >
            <View style={{ flexDirection: 'row' }}>
              <Progress.Pie
                style={styles.progressCirc}
                color={'#4d4eff'}
                progress={this.state.timePassedPercent}
                size={17}
              />
              <Text
                style={[styles.font17, styles.textRight, styles.darkGray, styles.bebas]}
              >
                {this.state.timeUntilString}
              </Text>
            </View>
          </ToolTip>
        </View>
      );
    }

    let user = post.user;
    if (user && !user.name) {
      user = {};
      user._id = post.user;
      user.image = post.embeddedUser.image;
      user.name = post.embeddedUser.name;
    }

    return (<View style={styles.postHeader}>
      <View style={styles.postInfo}>
        <UserName
          big={this.props.big}
          user={user}
          setSelected={this.setSelected}
        />
        <View
          style={[styles.infoRight, styles.innerInfo]}
        >
          {this.props.repost ? null : postInfo}
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
    overflow: 'visible',
    alignItems: 'center',
    justifyContent: 'center',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'visible',
    paddingTop: 15,
    paddingBottom: 0,
  },
  progressCirc: {
    marginTop: -1,
    marginRight: 5,
  },
  infoLeft: {
    justifyContent: 'flex-start',
  },
  infoRight: {
    justifyContent: 'flex-end',
    overflow: 'visible',
  },
  innerInfo: {
    flex: 1,
    overflow: 'visible',
  },
});

styles = { ...globalStyles, ...localStyles };

