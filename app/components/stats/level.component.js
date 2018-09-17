import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image
} from 'react-native';
import { globalStyles, fullWidth, borderGrey } from '../../styles/global';

let styles;

// export default function Level(props) {
export default class Level extends Component {
  constructor(props, context) {
    super(props, context);
  }

  componentWillReceiveProps(next) {
    let level = Math.floor(next.level / 10);
    // if (this.scrollView && this.scrollView.getItemLayout) {
    //   this.scrollView.getItemLayout(() => {
    //     this.scrollView.scrollToIndex({ index: level, viewPosition: 0.5, animated: true });
    //   });
    // }
  }

  render() {
    let props = this.props;
    let data = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(l => ({ level: l }));

    let level = Math.floor(props.level / 10);
    let img = require('../../assets/images/icons/lock.png');

    let renderItem = ({ item }) => {
      let style = [styles.statNumber];
      if (item.level === level) {
        style = [styles.statNumber, { fontSize: 175, marginBottom: -30 }];
      }
      let divider = <View style={styles.statSeparator} />;
      let itemEl = <Text style={[...style, { paddingHorizontal: 23 }]}>{item.level}</Text>;
      if (item.level > level) {
        itemEl = (<Image
          source={img}
          style={{ width: 14, height: 11, resizeMode: 'contain', paddingHorizontal: 23 }}
        />);
      }
      return (
        <View style={{ justifyContent: 'center', flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {itemEl}
            { item.level !== 10 ? divider : null}
          </View>
        </View>
      );
    };

    return (
      <FlatList
        ref={c => this.scrollView = c}
        horizontal
        data={data}
        extraData={this.props}
        renderItem={renderItem}
        ListHeaderComponent={() => <View style={{ flex: 1, width: fullWidth / 2 }} />}
        ListFooterComponent={() => <View style={{ flex: 1, width: fullWidth / 2 }} />}
        keyExtractor={(item) => item.level.toString()}
        style={{ marginTop: 35 }}
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        removeClippedSubviews={false}
        initialNumToRender={20}
        onLayout={() => {
          setTimeout(() => {
            this.scrollView.scrollToIndex({ index: level, viewPosition: 0.5, animated: true });
          }, 1);
        }}
      />
    );
  }
}

let localStyles = StyleSheet.create({
  statSeparator: {
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: borderGrey,
    height: 20
  },
  samallNumber: {

  }
});

styles = { ...globalStyles, ...localStyles };

