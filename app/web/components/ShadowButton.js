import React, {
  Component,
  PropTypes
} from 'react';
import { Motion, spring, presets } from 'react-motion';

export default class shadowButton extends Component {
  constructor(props, context) {
    super(props, context);
  }

  componentDidMount() {
  }

  render() {
    let text = null;
    let color = 'black';
    let backgroundColor = '#EDEDED';
    if (this.props.backgroundColor) backgroundColor = this.props.backgroundColor;
    if (this.props.color) color = this.props.color;
    if (this.props.text) text = this.props.text;

    return (
      <div className="shadowParent" onClick={() => this.props.action()}>
        <div style={{ backgroundColor: color }} className="shadow" />
        <div style={{ borderColor: color, backgroundColor }} className="button">
          <p style={{ color }}>{text}</p>
        </div>
      </div>
    );
  }
}
