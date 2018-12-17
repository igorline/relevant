import React from 'react';
import { TouchableWithoutFeedback, StyleSheet, View } from 'react-native';
import PropTypes from 'prop-types';
import { blue } from '../../styles/global';

let styles;

export default function Pills(props) {
  const { scrollToPage, currentIndex, slides } = props;
  if (!slides || !slides.length) return null;

  const indicator = props.slides.map((slide, i) => {
    let active = false;
    if (currentIndex === i) active = true;

    return (
      <TouchableWithoutFeedback onPress={() => scrollToPage(i)} key={i}>
        <View style={[styles.indicatorItem, { backgroundColor: active ? blue : 'lightgrey' }]} />
      </TouchableWithoutFeedback>
    );
  });
  return <View style={styles.pillContainer}>{indicator}</View>;
}

styles = StyleSheet.create({
  pillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  indicatorItem: {
    marginLeft: 3,
    marginRight: 3,
    height: 5,
    width: 5,
    borderRadius: 5
  }
});

Pills.propTypes = {
  slides: PropTypes.array,
  currentIndex: PropTypes.number,
  scrollToPage: PropTypes.func
};
