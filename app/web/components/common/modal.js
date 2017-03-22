import React, {
  Component,
  PropTypes
} from 'react';
import { Motion, spring, presets } from 'react-motion';

export default class Modal extends Component {
  constructor(props, context) {
    super(props, context);
  }

  render() {
    if (!this.props.visible) return null;
    return (
      <div className="modalParent">
        <div className="modal">
          <img
            role="button"
            src={'/img/x.png'}
            onClick={() => this.props.close()}
            className="x"
          />
          {this.props.children}
        </div>
      </div>
    );
  }
}
