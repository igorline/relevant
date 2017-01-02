import React, { Component } from 'react';
import {
  StyleSheet,
  TouchableHighlight,
  Text,
  View,
  Image,
  Animated,
} from 'react-native';

import { abbreviateNumber } from '../../utils';
import { globalStyles } from '../../styles/global';

let styles;

class CardHeader extends Component {

  constructor(props, context) {
    super(props, context);
    this.renderHeader = this.renderHeader.bind(this);
    this.renderTitle = this.renderTitle.bind(this);
    this.renderLeft = this.renderLeft.bind(this);
    this.renderRight = this.renderRight.bind(this);
  }

  renderLeft(props) {
    if (!props.scene.route.back) return <View style={styles.leftButton} />;

    // return <BackButton style={{ justifyContent: 'flex-start' }} onPress={this.back} />;

    return (<TouchableHighlight
      style={[styles.leftButton]}
      underlayColor={'transparent'}
      onPress={this.props.back}
    >
      <Text
        style={[
          { fontSize: 17 },
          styles.active,
          styles.leftButtonText,
        ]}
      >
        {props.scene.route.left || '◀'}
      </Text>
    </TouchableHighlight>);
  }

  renderTitle(props) {
    let title = props.scene.route ? props.scene.route.title : '';
    let component = props.scene.route.component;

    if (title === 'Profile' && this.props.auth.user) {
      title = this.props.auth.user.name;
    }

    let clipped = title;

    if (title && title.length > 20) {
      clipped = title.substring(0, 18);
      clipped += '...';
    }

    if (title === 'Read' || component === 'login' || component === 'signup' || component === 'imageUpload') {
      return (
        <View style={{ alignItems: 'center', paddingVertical: 6, backgroundColor: 'transparent' }}>
          <Image
            source={require('../../assets/images/logo.png')}
            resizeMode={'contain'}
            style={{ width: 130, height: 25 }}
          />
        </View>
      );
    }

    return (
      <View style={[styles.titleComponent]}>
        <Text style={styles.navTitle}>{clipped}</Text>
      </View>
    );
  }

  renderRight(props) {
    let statsEl = null;
    let relevance = 0;
    let balance = 0;
    let user = null;
    let rightEl;

    let key = this.props.defaultContainer;
    if (this.props.auth.user) {
      user = this.props.auth.user;
      if (user.relevance) relevance = user.relevance;
      if (user.balance) balance = user.balance;
      if (balance > 0) {
        balance = abbreviateNumber(balance);
      }
      if (relevance > 0) {
        relevance = abbreviateNumber(relevance);
      }

      statsEl = (
        <Text style={styles.statsTxt}>  📈
          <Text style={[styles.bebas, styles.quarterLetterSpacing, { fontSize: 13 }]}>
            {relevance}
          </Text>  💵
          <Text style={[styles.bebas, styles.quarterLetterSpacing, { fontSize: 13 }]}>
            {balance}
          </Text>
        </Text>
      );
    }

    if (key !== 'myProfile') {
      rightEl = statsEl;
    } else {
      rightEl = (
        <TouchableHighlight
          style={styles.gear}
          underlayColor={'transparent'}
          onPress={() => this.props.showActionSheet()}
        >
          <Image
            style={styles.gearImg}
            source={require('../../assets/images/gear.png')}
          />
        </TouchableHighlight>
      );
    }

    if (props.scene.route.component === 'profile' && props.scene.route.id !== this.props.auth.user._id) {
      rightEl = null;
      // rightEl = (
      //   <View style={styles.gear}>
      //     <TouchableHighlight
      //       underlayColor={'transparent'}
      //       onPress={() => this.thirsty()}
      //     >
      //       <Text>thirsty</Text>
      //     </TouchableHighlight>
      //   </View>
      // );
    }
    return <View style={styles.rightButton}>{rightEl}</View>;
  }


  renderHeader(props, headerStyle) {
    let style = [styles.header, headerStyle];
    if (this.props.share) {
      style = [styles.header, styles.shareHeader, headerStyle];
    }

    return (
      <Animated.View
        style={[headerStyle, style]}
      >
        {this.renderLeft(props)}
        {this.renderTitle(props)}
        {this.props.renderRight ? this.props.renderRight(props) : this.renderRight(props)}
      </Animated.View>

    );
  }

  render() {
    return this.renderHeader(this.props, this.props.style);
  }
}

const localStyles = StyleSheet.create({
  titleComponent: {
    justifyContent: 'flex-end',
  },
  backArrow: {
    paddingTop: 4,
  },
  leftButton: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
    paddingVertical: 10,
  },
  rightButton: {
    flex: 1,
    marginRight: 15,
    paddingVertical: 10,
  },
  statsTxt: {
    color: 'black',
    fontSize: 13,
    textAlign: 'right',
  },
  gearImg: {
    height: 20,
    width: 20,
    justifyContent: 'center'
  },
  gear: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
});

styles = { ...localStyles, ...globalStyles };

export default CardHeader;
