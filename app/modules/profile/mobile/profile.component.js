import React, { Component } from 'react';
import { Platform, ActionSheetIOS, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/Ionicons';
import RNBottomSheet from 'react-native-bottom-sheet';
import { View, Divider, Image } from 'modules/styled/uni';
import { colors } from 'styles';
import Bio from './bio.component';
import ProfileStats from '../profile.stats';

const defaultImg = require('app/public/img/default_user.jpg');

let ActionSheet = ActionSheetIOS;

if (Platform.OS === 'android') {
  ActionSheet = RNBottomSheet;
  ActionSheet.showActionSheetWithOptions = RNBottomSheet.showBottomSheetWithOptions;
}

class ProfileComponent extends Component {
  static propTypes = {
    actions: PropTypes.object,
    user: PropTypes.object,
    isOwner: PropTypes.bool,
    scrollTo: PropTypes.func
  };

  constructor(props, context) {
    super(props, context);
    this.setTag = this.setTag.bind(this);
    this.showActionSheet = this.showActionSheet.bind(this);
    this.initTooltips = this.initTooltips.bind(this);
    this.toggleTooltip = this.toggleTooltip.bind(this);
  }

  toggleTooltip() {
    this.props.actions.createToggleAction('relevance', this.tooltipParent);
  }

  initTooltips() {
    this.props.actions.setTooltipData({
      name: 'relevance',
      toggle: () => this.toggleTooltip()
    });
  }

  showActionSheet(id) {
    ActionSheet.showActionSheetWithOptions(
      {
        options: ['Block User', 'Cancel'],
        cancelButtonIndex: 1,
        destructiveIndex: 0
      },
      buttonIndex => {
        switch (buttonIndex) {
          case 0:
            this.props.actions.updateBlock(id);
            break;
          default:
        }
      }
    );
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

  goToTopic(tag) {
    const name = tag.replace('#', '').trim();
    const topic = {
      _id: name,
      categoryName: '#' + name
    };
    this.props.actions.goToTopic(topic);
  }

  render() {
    const { user, isOwner } = this.props;

    const userImage = user && user.image ? { uri: user.image } : defaultImg;

    const optionsEl = !isOwner && (
      <TouchableOpacity
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          paddingVertical: 10,
          paddingHorizontal: 15
        }}
        onPress={() => this.showActionSheet(user._id)}
      >
        <Icon name="ios-more" size={24} color={colors.black} />
      </TouchableOpacity>
    );

    return (
      <View bg={'white'} p={'2 2 0 2'}>
        <Image
          resizeMode={'cover'}
          alignSelf={'center'}
          w={21}
          h={21}
          bradius={10.5}
          source={userImage}
        />
        {optionsEl}

        <View m={'2 0'} fdirection="row" justify={'center'} align={'baseline'}>
          <ProfileStats user={user} isOwner={isOwner} />
        </View>

        {user.bio !== '' || this.props.isOwner ? (
          <Bio
            scrollTo={this.props.scrollTo}
            user={user}
            actions={this.props.actions}
            isOwner={this.props.isOwner}
          />
        ) : null}
        <Divider />
      </View>
    );
  }
}

export default ProfileComponent;
