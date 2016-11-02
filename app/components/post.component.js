import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableHighlight,
  Linking,
  PickerIOS,
  Animated,
  AlertIOS,
  ActionSheetIOS,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import * as Progress from 'react-native-progress';
import Share from 'react-native-share';
import { globalStyles, fullWidth, fullHeight } from '../styles/global';

let moment = require('moment');

class Post extends Component {
  constructor(props) {
    super(props);
    this.invest = this.invest.bind(this);
    this.setSelected = this.setSelected.bind(this);
    this.openLink = this.openLink.bind(this);
    this.toggleInfo = this.toggleInfo.bind(this);
    this.saveEdit = this.saveEdit.bind(this);
    this.toggleEditing = this.toggleEditing.bind(this);
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
      modalVisible: false,
      buttons: [
        'Share',
        'Irrelevant',
        'Cancel',
      ],
      cancelIndex: 2,
    };
  }

  componentDidMount() {
    const self = this;
    if (self.props.post) {
      this.checkTime(this);
      this.checkInvestments(this.props.post.investments);
      self.setState({
        editedBody: self.props.post.body,
        editedTitle: self.props.post.title
      });
      if (self.props.post.user && self.props.auth.user) {
        if (self.props.post.user._id === self.props.auth.user._id) {
          self.setState({
            myPost: true,
            buttons: [
              'Share',
              'Edit',
              'Delete',
              'Cancel',
            ],
            destructiveIndex: 2,
            cancelIndex: 3,
          });
        }
      }
    }
  }

  componentWillUpdate(nextProps) {
    if (this.props.post) {
      if (this.props.post.investments !== nextProps.post.investments) {
        this.checkInvestments(nextProps.post.investments);
      }
    }
  }

  onShare() {
    const self = this;
    Share.open({
      title: 'Relevant',
      url: self.props.post.link ? self.props.post.link : 'http://relevant-community.herokuapp.com/',
      subject: "Share Link",
      message: self.props.post.title ? 'Relevant post: ' + self.props.post.title : 'Relevant post:'
    },(e) => {
      console.log(e);
    });
  }

  extractDomain(url) {
    let domain;
    if (url.indexOf("://") > -1) {
      domain = url.split('/')[2];
    } else {
      domain = url.split('/')[0];
    }
    domain = domain.split(':')[0];

    let noPrefix = domain;

    if (domain.indexOf('www.') > -1) {
      noPrefix = domain.replace("www.","");
    }
    return noPrefix;
  }

  showActionSheet() {
    const self = this;
    if (self.state.myPost) {
      ActionSheetIOS.showActionSheetWithOptions({
        options: self.state.buttons,
        cancelButtonIndex: self.state.cancelIndex,
        destructiveButtonIndex: self.state.destructiveIndex,
      },
      (buttonIndex) => {
        switch (buttonIndex) {
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
        switch (buttonIndex) {
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
    const self = this;
    self.setState({ editing: !self.state.editing });
  }

  saveEdit() {
    const self = this;
    let title = self.state.editedTitle;
    let body = self.state.editedBody;
    let bodyTags = body.match(/#\S+/g);
    let bodyMentions = body.match(/@\S+/g);
    let tags = [];
    let mentions = [];
    let preTags = [];
    if (self.props.post.tags) {
      self.props.post.tags.forEach((tag, i) => {
        preTags.push(tag.name);
      });
    }

    if (bodyTags) {
      bodyTags.forEach((eachTag) => {
        let tagReplace = eachTag.replace('#', '');
        tags.push(tagReplace);
      });
    }
    if (bodyMentions) {
      bodyMentions.forEach((eachName) => {
        let nameReplace = eachName.replace('@', '');
        mentions.push(nameReplace);
      });
    }

    let finalTags = tags.concat(preTags);
    let postBody = {
      user: self.props.auth.user._id,
      _id: self.props.post._id,
      body,
      tags: finalTags,
      title,
      mentions,
    };

    // Update post action here

    self.props.actions.editPost(postBody, self.props.auth.token).then((results) => {
      console.log(results, 'edit results');
      if (!results) {
        AlertIOS.alert('Update error please try again');
      } else {
        AlertIOS.alert('Updated');
        self.setState({ editing: false });
      }
    });
  }

  openComments() {
    this.props.actions.setSelectedPost(this.props.post._id);
    this.props.navigator.push({
      key: 'comment',
      title: 'Comments',
      back: true,
      id: this.props.post._id
    });
  }

  goToPost(id) {
    this.props.actions.setSelectedPost(id);
    this.props.navigator.push({
      key: 'singlePost',
      back: true,
    });
  }

  deletePost() {
    this.props.actions.deletePost(this.props.auth.token, this.props.post);
  }

  irrelevant() {
    const self = this;
    console.log('irrelevant');
    self.props.actions.irrelevant(self.props.auth.token, self.props.post._id);
  }

  toggleOptions() {
    const self = this;
    console.log('toggleOptions');
    self.setState({ showOptions: self.state.showOptions = !self.state.showOptions });
  }

  setSelected(user) {
    this.props.actions.setSelectedUser(user._id);
    this.props.navigator.push({
      key: 'profile',
      title: user.name,
      back: true,
      id: user._id
    });
  }

  checkInvestments(investments) {
    const self = this;
    let invested = false;
    if (investments) {
      if (investments.length > 0) {
        investments.forEach((investment, i) => {
          if (investment.investor === self.props.auth.user._id) invested = true;
          if (i === investments.length - 1) {
            self.setState({ invested });
          }
        });
      } else {
        self.setState({ invested: false });
      }
    }
  }

  toggleModal() {
    const self = this;
    console.log('toggleModal');
    self.setState({ modalVisible: !self.state.modalVisible });
  }

  invest(investAmount) {
    console.log('investing', investAmount);
    this.props.actions.triggerAnimation('invest');
    this.props.actions.invest(this.props.auth.token, investAmount, this.props.post, this.props.auth.user);
    this.setState({ modalVisible: false });
  }

  openLink(url) {
    Linking.openURL(url);
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

  toggleExpanded() {
    const self = this;
    self.setState({ expanded: self.state.expanded = !self.state.expanded });
  }

  toggleInfo() {
    const self = this;
    let newVar = !self.state.toggleInfo;
    self.setState({ toggleInfo: newVar });
  }

  render() {
    const self = this;
    let post = null;
    let title = null;
    let image = null;
    let link = null;
    let imageEl = null;
    let postUserImage = null;
    let postUserImageEl = null;
    let postUser = null;
    let body = null;
    let user = null;
    let comments = null;
    let tags = null;
    let tagsEl = null;
    let commentString = 'Add comment';
    let relevance = 0;
    let value = 0;
    let bodyEl = null;
    let expanded = this.state.expanded;
    let name = null;
    let styles = { ...localStyles, ...globalStyles };
    let pickerArray = [];
    let lastPost = false;
    let investButtonEl = null;
    let bodyEditingEl = null;
    let titleEl = null;

    if (this.props.post) {
      post = this.props.post;
      if (post.image) image = post.image.match('http') ? post.image : 'https:' + post.image;
      if (post.title) title = post.title;
      if (post.relevance) relevance = post.relevance;
      if (post.link) link = post.link;
      if (post.body) body = post.body;
      if (post.value) value = post.value;
      if (post.comments) comments = post.comments;
      if (post.tags) if (post.tags.length) tags = post.tags;
      if (post.user) {
        postUser = post.user;
        if (postUser.image) postUserImage = postUser.image;
      }
      if (post.lastPost) {
        if (post.lastPost.length) {
          post.lastPost.forEach((lastUser) => {
            if (lastUser === self.props.auth.user._id) lastPost = true;
          });
        }
      }
    }

    if (self.state.editing) {
      bodyEditingEl = (
        <TextInput
          multiline
          autoGrow
          style={[styles.darkGray, styles.editingInput, { height: Math.max(35, self.state.bodyHeight) }]}
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
      if (comments.length === 1) commentString = '1 Comment';
      if (comments.length > 1) commentString = comments.length + ' Comments';
    }

    if (tags) {
      tagsEl = [];
      tags.forEach((tag, i) => {
        tagsEl.push(<Text style={[styles.white, styles.font10]} key={i}>#{tag.name}</Text>);
      });
    }

    // if (balance >= 50) pickerArray.push(<PickerItemIOS key={0} label='50' value={50} />);
    // if (balance >= 100) pickerArray.push(<PickerItemIOS key={1} label='100' value={100} />);
    // if (balance >= 500) pickerArray.push(<PickerItemIOS key={2} label='500' value={500} />);
    // if (balance >= 1000) pickerArray.push(<PickerItemIOS key={3} label='1000' value={1000} />);
    // if (balance >= 5000) pickerArray.push(<PickerItemIOS key={4} label='5000' value={5000} />);
    // if (balance >= 10000) pickerArray.push(<PickerItemIOS key={5} label='10000' value={10000} />);

    if (postUserImage) {
      postUserImageEl = (<TouchableWithoutFeedback
        onPress={() => this.setSelected(self.props.post.user)}
      >
        <Image source={{ uri: postUserImage }} style={styles.userImage} />
      </TouchableWithoutFeedback>);
    }

    if (image) {
      imageEl = (<Image resizeMode={'cover'} source={{ uri: image }} style={styles.postImage} />);
    }

    if (post && post.user) {
      if (post.user._id !== this.props.auth.user._id) {
        investButtonEl = (<TouchableWithoutFeedback
          onPress={() => self.toggleModal()}
          style={[styles.postButton, { marginRight: 5, backgroundColor: '#F0F0F0' }]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}><Text style={[styles.font10, styles.postButtonText]}>Invest</Text><Text style={styles.font10}>💰</Text></View>
        </TouchableWithoutFeedback>);
      }

      // if (post.user._id != self.props.auth.user._id && self.state.invested) {
      //   uninvestButtonEl = (
      //     <TouchableWithoutFeedback
      //       onPress={this.uninvest.bind(self)} style={[styles.postButton, {marginRight: 5, backgroundColor: '#F0F0F0'}]}>
      //       <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}><Text style={[styles.font10, styles.postButtonText]}>Uninvest</Text></View>
      //     </TouchableWithoutFeedback>
      //   )
      // }
    }

    if (body) {
      let bodyObj = {};

      let textArr = body.replace((/[@#]\S+/g), (a) => { return '`' + a + '`'; }).split(/`/);
      textArr.forEach((section, i) => {
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
      });

      bodyEl = Object.keys(bodyObj).map((key, i) => {
        let text = bodyObj[key].text;
        if (bodyObj[key].hashtag) {
          let tagObj = null;
          self.props.post.tags.forEach((tag) => {
            if (tag.name === text.substr(1, text.length)) {
              tagObj = tag;
            }
          });
          return (<Text
            key={i}
            onPress={tagObj ? () => self.props.actions.goToTag(tagObj) : null}
            style={styles.active}
          >
            {bodyObj[key].text}
          </Text>);
        } else if (bodyObj[key].mention) {
          let mentionObj = null;
          if (self.props.post.mentions) {
            if (self.props.post.mentions.length) {
              self.props.post.mentions.forEach((eachUser) => {
                if (eachUser.name) {
                  if (eachUser.name.toLowerCase() === text.substr(1, text.length).toLowerCase()) {
                    mentionObj = eachUser;
                  }
                }
              });
            }
          }
          return (<Text
            key={i}
            onPress={mentionObj ? () => self.setSelected(mentionObj) : null}
            style={mentionObj ? styles.active : null}
          >
            {bodyObj[key].text}
          </Text>);
        } else {
          return (<Text key={i}>{bodyObj[key].text}</Text>);
        }
      });
    }
 
    if (!self.state.editing) {
      titleEl = (<Text style={[styles.font20, styles.darkGray]}>{title ? title : 'Untitled'}</Text>);
    } else {
      titleEl = (<TextInput
        multiline
        autoGrow
        style={[styles.darkGray, styles.editingInput, { height: Math.max(35, self.state.titleHeight) }]}
        onChange={(event) => {
          this.setState({
            editedTitle: event.nativeEvent.text,
            titleHeight: event.nativeEvent.contentSize.height,
          });
        }}
        value={this.state.editedTitle}
      />);
    }

    let postInfo = null;

    if (self.state.passed) {
      if (self.state.toggleInfo) {
        postInfo = (<View>
          <Text style={[styles.font10, styles.textRight]}>💵&nbsp;
            <Text style={styles.active}>{value.toFixed(2)}</Text>
          </Text>
        </View>);
      } else {
        postInfo = (<View>
          <Text style={[styles.font10, styles.textRight]}>📈&nbsp;
            <Text style={styles.active}>{relevance.toFixed(2)}</Text>
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
            style={[styles.font10, styles.textRight, styles.darkGray]}
          >
            Results in {self.state.timeUntilString}
          </Text>
        </View>);
    }

    return (
      <View
        style={[styles.postContainer]}
        onLayout={(event) => {
          let { x, y, width, height } = event.nativeEvent.layout;
          self.setState({ postHeight: height, postWidth: width });
        }}
      >
        <TouchableHighlight underlayColor={'transparent'} onPress={link ? () => self.openLink(link) : null}>
          <View>
            <View style={styles.postHeader}>
              {postUserImageEl}
              <View style={styles.postInfo}>
                <TouchableWithoutFeedback
                  onPress={() => self.setSelected(user)}
                  style={[styles.infoLeft, styles.innerInfo]}
                >
                  <View><Text style={[styles.font15, styles.darkGray]}>{name}</Text></View>
                </TouchableWithoutFeedback>
                <TouchableHighlight
                  underlayColor={'transparent'}
                  onPress={() => self.toggleInfo()}
                  style={[styles.infoRight, styles.innerInfo]}
                >
                  {postInfo}
                </TouchableHighlight>
              </View>
            </View>
          </View>
        </TouchableHighlight>

        <TouchableHighlight>
          <View>
            <View style={[styles.postBody]}>
              {body && !self.state.editing ?
                <Text style={styles.darkGray} numberOfLines={expanded ? 999999 : 2}>{bodyEl}</Text>
              : null}
              {body && self.state.editing ? bodyEditingEl : null}
            </View>
          </View>
        </TouchableHighlight>

        {self.state.editing ? <View style={styles.postButtons}>
          <TouchableHighlight underlayColor={'transparent'} style={styles.postButton} onPress={() => self.saveEdit()}>
            <Text style={[styles.font10, styles.postButtonText]}>Save changes</Text>
          </TouchableHighlight>
          <TouchableHighlight
            underlayColor={'transparent'}
            onPress={() => self.toggleEditing()}
            style={styles.postButton}
          >
            <Text style={[styles.font10, styles.postButtonText]}>Cancel</Text>
          </TouchableHighlight>
        </View> : null}

        <View style={styles.postButtons}>
          {investButtonEl}
          <TouchableHighlight underlayColor={'transparent'} style={[styles.postButton, { marginRight: 5 }]} onPress={() => self.toggleExpanded()}><Text style={[styles.font10, styles.postButtonText]}>{expanded ? 'Read less' : 'Read more'}</Text></TouchableHighlight>
          <TouchableHighlight underlayColor={'transparent'} style={[styles.postButton, { marginRight: 5 }]} onPress={() => self.openComments()}><Text style={[{ marginRight: 5 }, styles.font10, styles.postButtonText]}>{commentString}</Text></TouchableHighlight>
          <TouchableHighlight underlayColor={'transparent'} style={styles.postButton} onPress={() => self.showActionSheet()}><Text style={[styles.font10, styles.postButtonText]}>...</Text></TouchableHighlight>
        </View>

        <Animated.View style={{ height: self.state.aniHeight, overflow: 'hidden' }}>
          <PickerIOS
            selectedValue={self.state.investAmount}
            onValueChange={(investAmount) => this.setState({ investAmount })}
          >
            {pickerArray}
          </PickerIOS>
        </Animated.View>

        <TouchableHighlight>
          <View>
            {imageEl}
          </View>
        </TouchableHighlight>

        <TouchableHighlight underlayColor={'transparent'} onPress={link ? () => self.openLink(link) : null}>
          <View style={styles.postSection}>
            {lastPost ? <Text style={[styles.lastPost, styles.darkGray]}>
              Last subscribed post❗️
            </Text> : null}
            {titleEl}
            {link ?
              <Text style={[styles.font10, styles.darkGray]}>from {self.extractDomain(link)}</Text>
            : null}
          </View>
        </TouchableHighlight>

        <Modal
          animationType={'fade'}
          transparent
          visible={this.state.modalVisible}
          onRequestClose={() => this.toggleModal()}
        >
          <View style={{ flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.1)' }}>
            <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 5 }}>
              <View style={{ justifyContent: 'center', flexDirection: 'row', flexWrap: 'wrap', flex: 1, overflow: 'visible' }}>
                <TouchableHighlight style={styles.investOption} underlayColor={'black'} onPress={() => this.invest(50)}>
                  <Text>50</Text>
                </TouchableHighlight>
                <TouchableHighlight style={styles.investOption} underlayColor={'black'} onPress={() => this.invest(100)}>
                  <Text>100</Text>
                </TouchableHighlight>
                <TouchableHighlight style={styles.investOption} underlayColor={'black'} onPress={() => this.invest(500)}>
                  <Text>500</Text>
                </TouchableHighlight>
                <TouchableHighlight style={styles.investOption} underlayColor={'black'} onPress={() => this.invest(1000)}>
                  <Text>1000</Text>
                </TouchableHighlight>
                <TouchableHighlight style={styles.investOption} underlayColor={'black'} onPress={() => this.invest(2000)}>
                  <Text>2000</Text>
                </TouchableHighlight>
                <TouchableHighlight style={styles.investOption} underlayColor={'black'} onPress={() => this.invest(5000)}>
                  <Text>5000</Text>
                </TouchableHighlight>
                <TouchableHighlight style={styles.investOption} underlayColor={'black'} onPress={() => this.invest(10000)}>
                  <Text>10000</Text>
                </TouchableHighlight>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                {/* <TouchableHighlight
                  style={styles.investOption}
                  underlayColor={'transparent'}
                >
                  <Text>Invest</Text>
                </TouchableHighlight>*/}
                <TouchableHighlight
                  style={styles.investOption}
                  underlayColor={'transparent'}
                  onPress={() => this.toggleModal()}
                >
                  <Text>Cancel</Text>
                </TouchableHighlight>
              </View>
            </View>
          </View>
        </Modal>
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
    paddingLeft: 0,
  },
  opacZero: {
    opacity: 0,
  },
  expandedInvest: {
    height: 200,
  },
  hiddenInvest: {
    height: 0,
    overflow: 'hidden',
  },
  postContainer: {
    paddingBottom: 25,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F0F0F0',
  },
  investOption: {
    margin: 5,
    borderWidth: 1,
    borderColor: 'black',
    padding: 5,
    borderRadius: 5,
    width: 75,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center'
  },
  tagsRow: {
    flexDirection: 'row',
    paddingTop: 10,
    paddingBottom: 10,
    alignItems: 'center',
    flexWrap: 'wrap',
    flex: 1,
  },
  postSection: {
    paddingTop: 10,
    paddingLeft: 15,
  },
  postBody: {
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 15,
    paddingRight: 15,
  },
  postImage: {
    height: 200,
    width: fullWidth,
  },
  buttonContainer: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  buttonContainerExpanded: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  innerInfo: {
    flex: 1,
  },
  infoLeft: {
    justifyContent: 'flex-start',
  },
  infoRight: {
    justifyContent: 'flex-end',
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
    borderRadius: 12.5,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    paddingLeft: 15,
    paddingRight: 15,
    paddingBottom: 10,
  },
  link: {
    flex: 1,
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
  loading: {
    fontSize: 40,
    fontWeight: '100',
  },
  progressCirc: {
    marginRight: 5,
  },
});
