import React, { Component } from 'react';
import PropTypes from 'prop-types';

if (process.env.BROWSER === true) {
  require('./popup.css');
}

export default class Popup extends Component {
  static propTypes = {
    options: PropTypes.array,
    children: PropTypes.node
  };

  state = {
    visible: false
  };

  hidePopup(e) {
    if (this.el === e.target) return;
    if (this.state.visible) {
      this.setState({ visible: false });
    }
  }

  componentDidMount() {
    window.addEventListener('click', this.hidePopup.bind(this));
  }

  componentWillUnmount() {
    window.removeEventListener('click', this.hidePopup.bind(this));
  }

  render() {
    const { visible } = this.state;
    let popupOptions = (
      <div className={'popupOptions'}>
        {this.props.options.map(option => (
          <div key={option.text} onClick={option.action}>
            {option.text}
          </div>
        ))}
      </div>
    );
    if (!visible) popupOptions = null;

    return (
      <div
        onClick={e => {
          this.setState({ visible: !visible });
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <span ref={c => (this.el = c)} className={'popup'}>
          {this.props.children}
        </span>
        {popupOptions}
      </div>
    );
  }
}
