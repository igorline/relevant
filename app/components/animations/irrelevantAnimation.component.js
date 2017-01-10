import React, { Component } from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as animationActions from '../../actions/animation.actions';
import { globalStyles, fullWidth, fullHeight } from '../../styles/global';
import Thumb from './thumb.component';
import { numbers } from '../../utils';

let styles;

class IrrelevantAnimation extends Component {
  constructor(props, context) {
    super(props, context);
    this.destroy = this.destroy.bind(this);
    this.num = 0;
    this.state = {
      thumbs: {
      },
    };
  }

  componentWillReceiveProps(next) {
    if (next.animation !== this.props.animation) {
      this.runAnimation();
    }
  }

  componentWillUnmount() {
    this.clearAll();
  }

  clearAll() {
    this.num = 0;
    this.setState({ thumbs: {} });
  }

  destroy(key) {
    delete this.state.thumbs[key];
    this.setState({ thumbs: this.state.thumbs });
  }

  runAnimation() {
    let key = numbers.guid();

    this.state.thumbs[key] = <Thumb destroy={this.destroy} key={key} id={key} />;
    this.setState({ thumbs: this.state.thumbs });
  }

  render() {
    let thumbs = Object.keys(this.state.thumbs).map(key => this.state.thumbs[key]);
    return (
      <View pointerEvents="none" style={styles.heartsContainer}>
        {thumbs}
      </View>
    );
  }
}

function mapStateToProps(state) {
  return {
    animation: state.animation.irrelevant,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      ...animationActions,
    }, dispatch)
  };
}

const localStyles = StyleSheet.create({
  heartsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor: 'red',
    position: 'absolute',
    top: (fullHeight / 2) - 60,
    left: (fullWidth / 2) - 60,
    height: 120,
    width: 120,
    zIndex: 1000
  },
});

styles = { ...globalStyles, ...localStyles };

// export default IrrelevantAnimation;

export default connect(mapStateToProps, mapDispatchToProps)(IrrelevantAnimation);
