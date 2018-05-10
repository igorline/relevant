import React, {
  Component,
} from 'react';

import InviteCta from './inviteCta.component';

export default class RequestInvite extends Component {
  constructor(props, context) {
    super(props, context);
    this.onScroll = this.onScroll.bind(this);
  }

  componentDidMount() {
    window.addEventListener('scroll', this.onScroll);
  }

  onScroll(e) {
    if (!this.phone) return;
    this.phone.style.transform = '';
    let top = this.phone.getBoundingClientRect().top - 169;
    let y = Math.max(-top / 3, 0);
    this.phone.style.transform = `translateX(0) translateY(${y}px)`;
  }

  render() {
    let img = "/img/hand.jpg";
    let cta = <InviteCta />;
    if (this.props.type === 'app') {
      img = "/img/hand-transparent.png";
      cta = this.props.cta;
    }
    return (
      <div ref={c => this.container = c} className="splashContent">

        <mainSection>
          <section className="body">
            <p className="libre big">
              <span className="outline">
                Relevant
              </span> is a social platform that values <span className="outline">quality</span> over clicks.
            </p>
            <p className="subH">
              Join the community and help us build a better information environment for all.
            </p>
              {/* <a href="http://www.apple.com" className="download">
                <img src="/img/apple.png" />
                <span className="bebasRegular">download</span>
              </a> */}
          </section>

          {cta}

        </mainSection>
        <div className="phone">
          <img ref={c => this.phone = c} src={img} alt="phone" />
        </div>
      </div>
    );
  }
}
