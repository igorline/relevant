import React, {
  Component,
  PropTypes
} from 'react';
import { Motion, spring, presets } from 'react-motion';

export default class Modal extends Component {
  constructor(props, context) {
    super(props, context);
  }

  componentDidMount() {
  }

  render() {
    // let text = null;
    // let color = 'black';
    // if (this.props.color) color = this.props.color;
    // if (this.props.text) text = this.props.text;

    if (!this.props.visible) return null;

    return (
      <div className="modalParent">
        <div className="modal">
          <img src='/img/x.png' onClick={() => this.props.close()} className="x" />
          {this.props.children}
        </div>
      </div>
    );
  }
}
