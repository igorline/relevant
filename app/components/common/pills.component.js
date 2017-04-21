import React from 'react';
import {
  TouchableWithoutFeedback,
  StyleSheet,
  View
} from 'react-native';
import PropTypes from 'prop-types';

let styles;

export default function Pills(props) {
  let indicator = [];
  if (!props.slides) return null;
  if (props.slides.length) {
    props.slides.forEach((slide, i) => {
      let active = false;

      if (props.currentIndex) {
        if (props.currentIndex[i]) active = true;
        if (props.changed && props.changed[i]) active = false;
        if (i === 0 && props.currentIndex[0] && !props.currentIndex[1]) active = true;
      } else if (i === 0) active = true;

      indicator.push(<TouchableWithoutFeedback onPress={() => props.scrollToPage(i)} key={i} >
        <View style={[styles.indicatorItem, { backgroundColor: active ? 'black' : 'white' }]} />
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
    marginLeft: 5,
    marginRight: 5,
    height: 10,
    width: 10,
    borderRadius: 5,
    borderColor: 'black',
    borderWidth: 1,
  },
});


Pills.propTypes = {
  slides: PropTypes.array,
  changed: PropTypes.array,
  currentIndex: PropTypes.array,
  scrollToPage: PropTypes.func
};
