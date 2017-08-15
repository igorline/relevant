import React from 'react';
import {
  TouchableWithoutFeedback,
  StyleSheet,
  View
} from 'react-native';
import PropTypes from 'prop-types';
import { blue } from '../../styles/global';

let styles;

export default function Pills(props) {
  let indicator = [];
  if (!props.slides) return null;
  if (props.slides.length) {
    props.slides.forEach((slide, i) => {
      let active = false;

      if (props.currentIndex === i) active = true;

      indicator.push(<TouchableWithoutFeedback onPress={() => props.scrollToPage(i)} key={i} >
        <View style={[styles.indicatorItem, { backgroundColor: active ? blue : 'lightgrey' }]} />
      </TouchableWithoutFeedback>);
    });
  }
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
    borderRadius: 5,
    // borderColor: 'black',
    // borderWidth: 1,
    // backgroundColor: 'grey'
  },
});


Pills.propTypes = {
  slides: PropTypes.array,
  // changed: PropTypes.array,
  currentIndex: PropTypes.number,
  scrollToPage: PropTypes.func
};
