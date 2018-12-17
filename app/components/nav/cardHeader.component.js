import React, { Component } from 'react';
import {
  StyleSheet,
  TouchableHighlight,
  Text,
  View,
  Image,
  Animated,
  StatusBar,
  TouchableOpacity,
  Platform
} from 'react-native';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  globalStyles,
  fullWidth,
  darkGrey,
  mainPadding,
  smallScreen
} from '../../styles/global';
import Stats from '../post/stats.component';

let styles;

class CardHeader extends Component {
  static propTypes = {
    actions: PropTypes.object,
    scene: PropTypes.object,
    back: PropTypes.func,
    users: PropTypes.object,
    auth: PropTypes.object,
    defaultContainer: PropTypes.string,
    showActionSheet: PropTypes.func,
    share: PropTypes.bool,
    renderRight: PropTypes.func,
    style: PropTypes.array
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      search: false
    };
    this.renderTitle = this.renderTitle.bind(this);
    this.renderLeft = this.renderLeft.bind(this);
    this.renderRight = this.renderRight.bind(this);
    this.toggleSearch = this.toggleSearch.bind(this);
  }

  toggleSearch() {
    this.setState({ search: !this.state.search });
  }

  renderLeft(props) {
    let back;
    let backEl;
    let options;
    const { key, component } = props.scene.route;

    if (key === 'discover' || key === 'mainDiscover' || component === 'discover') {
      options = (
        <TouchableOpacity
          onPress={() => this.props.actions.toggleTopics()}
          style={{ padding: 0, paddingHorizontal: 10 }}
        >
          <Icon name="ios-options" size={23} style={{ height: 26 }} color={darkGrey} />
        </TouchableOpacity>
      );
    }

    if (props.scene.route.back) {
      back = <Icon name="ios-arrow-back" size={28} color={darkGrey} />;

      if (this.props.scene.route.left) {
        back = (
          <Text style={[{ fontSize: 17 }, styles.active]}>
            {this.props.scene.route.left}
          </Text>
        );
      }

      backEl = (
        <TouchableOpacity
          onPress={this.props.back}
          style={{ justifyContent: 'center', padding: 0, paddingHorizontal: 10 }}
        >
          {back}
        </TouchableOpacity>
      );
    }
    return (
      <View style={[styles.leftButton, { flexDirection: 'row' }]}>
        {backEl}
        {options}
      </View>
    );
  }

  renderBottomArrow() {
    if (!this.titleAction) return null;
    return (
      <TouchableOpacity
        style={{ position: 'absolute', bottom: -1, left: fullWidth / 2 - 11 }}
        onPress={this.titleAction}
      >
        <Image
          style={styles.arrow}
          resizeMode={'contain'}
          source={require('../../assets/images/downarrow.png')}
        />
      </TouchableOpacity>
    );
  }

  renderTitle(props) {
    if (this.state.search) return null;
    let title = props.scene.route ? props.scene.route.title : '';
    const { component, key } = props.scene.route;

    title = title ? title.trim() : null;

    if (component === 'profile') {
      if (this.props.users.users[props.scene.route.id]) {
        title = this.props.users.users[props.scene.route.id].name;
      }
    }

    if (key === 'discover' || key === 'mainDiscover' || component === 'discover') {
      if (key === 'mainDiscover') {
        return (
          <TouchableOpacity
            style={{
              alignItems: 'center'
            }}
            onPress={this.titleAction}
          >
            <View>
              <Image
                source={require('../../assets/images/logo.png')}
                resizeMode={'contain'}
                style={{ width: 120, height: 20, marginBottom: 2 }}
              />
            </View>
          </TouchableOpacity>
        );
      }
    }

    if (title === 'Profile' && this.props.auth.user) {
      title = this.props.auth.user.name;
    }

    let clipped = title;

    if (title && title.length > 20) {
      clipped = title.substring(0, smallScreen ? 14 : 18);
      clipped += '...';
    }

    if (
      title === 'Read' ||
      component === 'login' ||
      component === 'signup' ||
      component === 'imageUpload' ||
      component === 'twitterSignup'
    ) {
      return (
        <View
          style={{
            alignItems: 'center',
            paddingVertical: 6,
            backgroundColor: 'transparent'
          }}
        >
          <Image
            source={require('../../assets/images/logo.png')}
            resizeMode={'contain'}
            style={{ width: 130, height: 25 }}
          />
        </View>
      );
    }

    return (
      <View ref={c => (this.title = c)} style={[styles.titleComponent]}>
        <TouchableOpacity onPress={this.titleAction ? this.titleAction : () => null}>
          <Text style={[styles.navTitle]}>{clipped}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  renderRight(props) {
    if (this.state.search) return null;
    let statsEl = null;
    let rightEl;

    const key = this.props.defaultContainer;

    if (this.props.auth && this.props.auth.user) {
      const { component } = props.scene.route;
      statsEl = (
        <Stats
          type={'nav'}
          discover={component === 'mainDiscover'}
          parent={this}
          entity={this.props.auth.user}
        />
      );
    }

    if (key !== 'myProfile') {
      rightEl = statsEl;
    } else {
      let gear;
      if (Platform.OS === 'ios') {
        gear = <Text style={{ paddingBottom: 5, fontSize: 17 }}>⚙️</Text>;
      } else {
        gear = <Icon name="ios-settings-outline" size={24} color={darkGrey} />;
      }
      rightEl = (
        <TouchableHighlight
          style={styles.gear}
          underlayColor={'transparent'}
          onPress={() => this.props.showActionSheet()}
        >
          {gear}
        </TouchableHighlight>
      );
    }

    return (
      <View style={styles.rightButton}>
        <View style={{ paddingRight: 10 }}>{rightEl}</View>
      </View>
    );
  }

  renderHeader(props, headerStyle) {
    let style = [styles.header, headerStyle];
    if (this.props.share) {
      style = [styles.header, styles.shareHeader, headerStyle];
    }

    return (
      <Animated.View style={[headerStyle, style]}>
        <StatusBar hidden={false} />
        {this.renderLeft(props)}
        {this.renderTitle(props)}
        {this.props.renderRight ? this.props.renderRight(props) : this.renderRight(props)}
        {/* this.renderBottomArrow() */}
      </Animated.View>
    );
  }

  render() {
    return this.renderHeader(this.props, this.props.style);
  }
}

const localStyles = StyleSheet.create({
  titleComponent: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  arrow: {
    alignSelf: 'center',
    backgroundColor: 'transparent',
    width: 22,
    height: 15
  },
  backArrow: {
    paddingTop: 4
  },
  leftButton: {
    flex: 1,
    marginLeft: mainPadding - 10,
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  rightButton: {
    flex: 1,
    marginRight: mainPadding - 10,
    justifyContent: 'center'
  },
  gearImg: {
    height: 20,
    width: 20,
    justifyContent: 'center'
  },
  gear: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  searchInput: {
    flex: 1,
    textAlign: 'left',
    paddingLeft: 10
  },
  closeParent: {
    position: 'absolute',
    top: 12,
    right: 10,
    width: 20,
    height: 20,
    backgroundColor: 'rgba(0,0,0,0)',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  close: {
    color: 'grey',
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8
  }
});

styles = { ...localStyles, ...globalStyles };

export default CardHeader;
