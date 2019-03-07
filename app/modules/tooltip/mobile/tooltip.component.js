import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as tooltipActions from 'modules/tooltip/tooltip.actions';
import styled from 'styled-components/primitives';

const Wrapper = styled.Text`
  position: absolute;
  top: 0;
  left: 50%;
  width: 0;
  height: 0;
  opacity: 0;
  overflow: hidden;
`;

const defaultData = {
  vertical: 'top',
  horizontal: 'left',
  horizontalOffset: 0,
  verticalOffset: 10
};

class TooltipContainer extends Component {
  static propTypes = {
    text: PropTypes.string,
    name: PropTypes.string,
    actions: PropTypes.object,
    data: PropTypes.object,
    children: PropTypes.object
    // id: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
  };

  toggleTooltip = () => {
    const { name, actions, data, text, children } = this.props;
    if (!this.tooltipAnchor) return;
    this.tooltipAnchor.measureInWindow((x, y, w, h) => {
      const parent = { x, y, w, h };
      if (x + y + w + h === 0) return;
      actions.setTooltipData({
        name,
        parent,
        ...defaultData,
        ...data,
        text: text || children
      });
      actions.showTooltip(name);
    });
  };

  render() {
    return (
      <Wrapper ref={c => (this.tooltipAnchor = c)} onPress={this.toggleTooltip}>
        {this.props.children}
      </Wrapper>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      {
        ...tooltipActions
      },
      dispatch
    )
  };
}

export default connect(
  () => ({}),
  mapDispatchToProps
)(TooltipContainer);
