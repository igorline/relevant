import React, { Component } from 'react';
import PropTypes from 'prop-types';
import InviteCta from './inviteCta.component';


if (process.env.BROWSER === true) {
  require('modules/navigation/web/header.css');
}

export default class RequestInvite extends Component {
  static propTypes = {
    type: PropTypes.string,
    cta: PropTypes.node
  };

  constructor(props, context) {
    super(props, context);
    this.onScroll = this.onScroll.bind(this);
  }

  componentDidMount() {
    window.addEventListener('scroll', this.onScroll);
  }

  onScroll() {
    if (!this.phone) return;
    this.phone.style.transform = '';
    const top = this.phone.getBoundingClientRect().top - 169;
    const y = Math.max(-top / 3, 0);
    this.phone.style.transform = `translateX(0) translateY(${y}px)`;
  }

  render() {
    let img = '/img/hand.jpg';
    let cta = <InviteCta />;
    if (this.props.type === 'app') {
      img = '/img/hand-transparent.png';
      cta = this.props.cta;
    }
    return (
      <div ref={c => (this.container = c)} className="splashContent">
        <div className="mainSection">
          <section className="body">
            <p className="libre big">
              <div className="outline">Relevant</div> Curated by communities, not clicks
            </p>
            <p className="subH">
              Join the thought leaders, build trust and earn rewards.
            </p>
            {/* <a href="http://www.apple.com" className="download">
                <img src="/img/apple.png" />
                <span className="bebasRegular">download</span>
              </a> */}
          </section>
          {cta}
        </div>
        <div className="phone">
          <img ref={c => (this.phone = c)} src={img} alt="phone" />
        </div>
      </div>
    );
  }
}
