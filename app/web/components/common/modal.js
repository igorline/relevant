import React, {
  Component,
  PropTypes
} from 'react';
import { Motion, spring, presets } from 'react-motion';

if (process.env.BROWSER === true) {
  require('./modal.css');
}

export default class Modal extends Component {
  constructor(props, context) {
    super(props, context);
  }

  render() {
    let header = this.props.header || this.props.title;
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
          {header ? <div className={'modalHeader'}>
            {this.props.header || this.props.title}
          </div> : null}
          <div className={'modalBody'}>
            {this.props.children}
          </div>
          <div className={'modalFooter'}>
            {this.props.footer}
          </div>
        </div>
      </div>
    );
  }
}
