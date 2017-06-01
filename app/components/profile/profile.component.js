import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
} from 'react-native';
import { globalStyles, fullWidth, darkGrey } from '../../styles/global';
import Percent from '../../components/percent.component';
import { numbers } from '../../utils';
import Bio from './bio.component';

let defaultImg = require('../../assets/images/default_user.jpg');
let styles;

class ProfileComponent extends Component {

  constructor(props, context) {
    super(props, context);
    this.setTag = this.setTag.bind(this);
  }

  componentDidMount() {
    // if (this.props.auth.user &&
    //   this.props.auth.user.onboarding === 'relevance') {
    //   setTimeout(() => this.toggleTooltip(), 1000);
    // }
  }

  goToTopic(tag) {
    let name = tag.replace('#', '').trim();
    let topic = {
      _id: name,
      categoryName: '#' + name
    };
    this.props.actions.goToTopic(topic);
  }

  setTag(tag) {
    if (!this.props.actions) return;
    this.props.actions.selectTag({ _id: tag.replace('#', '') });
    this.props.actions.changeTab('discover');
    this.props.actions.resetRoutes('discover');
  }

  setCat(cat) {
    if (!this.props.actions) return;
    this.props.actions.selectTag({
      _id: cat,
      category: true,
      categoryName: cat.replace('_category_tag', '')
    });
    this.props.actions.changeTab('discover');
    this.props.actions.resetRoutes('discover');
  }

  toggleTooltip() {
    this.tooltipData = {
      vertical: 'bottom',
      horizontal: 'center',
      horizontalOffset: -97,
      name: 'relevance',
      verticalOffset: 0,
      width: 240,
      text: 'See your relevance? The higher your relevance the more your upvotes count and the more coins you\'ll get each day.'
    };

    this.tooltipParent.measureInWindow((x, y, w, h) => {
      let parent = { x, y, w, h };
      this.props.navigator.showTooltip({
        ...this.tooltipData,
        parent
      });
    });
  }

  render() {
    let followers = 0;
    let user = null;
    let userImage = null;
    let relevance = 0;
    let balance = null;
    let userImageEl = null;
    let following = 0;
    let relevanceEl = null;
    let topTags;
    let topCat;

    if (this.props.user) {
      user = this.props.user;
      followers = this.props.user.followers;
      following = this.props.user.following;
      if (user.online) online = true;
      if (user.image) userImage = user.image;
      if (user.relevance) relevance = user.relevance.toFixed(1);
      if (user.balance) balance = user.balance.toFixed(0);

      if (user.topTags) {
        topTags = user.topTags.map((tag, i) => (
          <Text key={tag._id}>
            <Text
              onPress={() => this.goToTopic(tag.tag)}
              style={styles.active}
            >
              #{tag.tag}
            </Text>{i !== user.topTags.length - 1 ? ', ' : ''}
          </Text>
          )
        );
      }
      if (user.topCategory) {
        topCat = (
          <Text>
            <Text
              onPress={() => this.goToTopic(user.topCategory.category)}
              style={styles.active}
            >
              {user.topCategory.category.replace('_category_tag', '')}
            </Text>{user.topTags.length ? ', ' : null}
          </Text>
        );
      }
    }

    if (userImage) {
      userImageEl = (<Image source={{ uri: userImage }} style={styles.uploadAvatar} />);
    } else {
      userImageEl = (<Image source={defaultImg} style={styles.uploadAvatar} />);
    }

    let balanceEl = (
      <View style={[styles.profileRowContainer]}>
        <View style={styles.textRow}>
          <Text style={[styles.font12, styles.darkGrey]}>
            Coins:{' '}
          </Text>
          <Image
            resizeMode={'contain'}
            style={[styles.coin, { width: 14, height: 14 }]}
            source={require('../../assets/images/relevantcoin.png')}
          />
          <Text style={[styles.font12, styles.bebasBold]}>
            {numbers.abbreviateNumber(balance) || 0}
          </Text>
        </View>
      </View>
    );

    let small = fullWidth <= 320 || false;

    relevanceEl = (
      <View style={[styles.profileRow, styles.profileRowContainer]}>
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'flex-end',
            alignSelf: 'flex-end'
          }}
        >
          <Image
            resizeMode={'contain'}
            style={[styles.r, { width: 25, height: 25 }]}
            source={require('../../assets/images/r.png')}
          />
          <Text
            // onPress={() => this.toggleTooltip()}
            style={[styles.profileBig, styles.bebas, { color: darkGrey }]}
          >
            {numbers.abbreviateNumber(relevance)}
            {' '}
          </Text>
        </View>

        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-start' }}>
          <Percent fontSize={26} user={user} />
        </View>
      </View>
    );

    let bottomSection;

    if (topTags) {
      bottomSection = (
        <View style={{ padding: 0 }}>
          <Text style={[styles.font12, styles.darkGrey]}>
            <Text>{user.topTags.length ? 'Expertise: ' : null}</Text>
            <Text style={[styles.font14, styles.georgia]}>
              {topTags}
            </Text>
          </Text>
        </View>
      );
    }

    return (
      <View>
        <View
          style={[{
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            padding: 10,
            paddingTop: 15,
            backgroundColor: 'white',
          }]}
        >
          <View
            style={{
              paddingRight: 10,
              borderRightWidth:
              StyleSheet.hairlineWidth,
              borderRightColor: '#242425'
            }}
          >
            {userImageEl}
          </View>
          <View
            style={{
              flex: 1,
              flexDirection: 'column',
              justifyContent: 'flex-start',
              paddingLeft: 10,
              marginTop: -10
            }}
          >
            <View ref={(c) => this.tooltipParent = c}>
              {relevanceEl}
            </View>
            <View style={[styles.profileRowContainer]}>
              <View style={[styles.profileRow, fullWidth <= 320 ? { flexDirection: 'column' } : null]}>
                <Text style={[styles.font12, styles.darkGrey, styles.profileColumn]}>
                  Subscribers: <Text style={[styles.bebasBold]}>{numbers.abbreviateNumber(followers || 0)}</Text>
                </Text>
                <Text style={[styles.font12, styles.darkGrey, styles.profileColumn]}>
                  Subscribed to: <Text style={[styles.bebasBold]}>{numbers.abbreviateNumber(following || 0)}</Text>
                </Text>
              </View>
            </View>

            {balanceEl}

            <View style={[styles.profileRowContainer, styles.lastRow]}>
              {bottomSection}
            </View>
          </View>

        </View>
        <Bio user={user} actions={this.props.actions} myProfile={this.props.myProfile}/>
      </View>
    );
  }
}

            // <View style={styles.onlineRow}>
            //   <Text style={[styles.darkGrey, styles.georgia]}>
            //     {user.online ? 'Online' : 'Offline'}
            //   </Text>
            //   <View style={user.online ? styles.onlineCirc : styles.offlineCirc} />
            // </View>

let localStyles = StyleSheet.create({
  uploadAvatar: {
    height: fullWidth / 3.2,
    width: fullWidth / 3.2,
    borderRadius: fullWidth / (3.2 * 2),
    resizeMode: 'cover',
  },
  profileRowContainer: {
    paddingVertical: 5,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'black',
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  profileColumn: {
    flex: 1
  },
  profileBig: {
    marginTop: 3,
    fontSize: 26,
    lineHeight: 26,
  },
  textRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
  }
});

styles = { ...globalStyles, ...localStyles };

export default ProfileComponent;
