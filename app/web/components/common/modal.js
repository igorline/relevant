import React, { Component } from 'react';
import PropTypes from 'prop-types';

if (process.env.BROWSER === true) {
  require('./modal.css');
}

export default class Modal extends Component {
  static propTypes = {
    header: PropTypes.object,
    title: PropTypes.string,
    visible: PropTypes.bool,
    close: PropTypes.func,
    children: PropTypes.node,
    footer: PropTypes.node
  };

  render() {
    const header = this.props.header || this.props.title;
    if (!this.props.visible) return null;
    return (
      <div className="modalParent">
        <div className="modalScroll">
          <div className="modal">
            <img
              role="button"
              src={'/img/x.png'}
              onClick={() => this.props.close()}
              className="x"
            />
            {header ? (
              <div className={'modalHeader'}>{this.props.header || this.props.title}</div>
            ) : null}
            <div className={'modalBody'}>{this.props.children}</div>
            <div className={'modalFooter'}>{this.props.footer}</div>
          </div>
        </div>
      </div>
    );
  }
}
