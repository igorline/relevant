import React, { Component } from 'react';
import { data } from './marquee.data';

export default class Marquee extends Component {
  constructor(props, context) {
    super(props, context);

    this.renderMarquee = this.renderMarquee.bind(this);
    this.animate = this.animate.bind(this);

    this.x = {
      0: 0,
      1: 0,
      2: 0
    };
    this.marqueeData = data;
    this.dataBlock = {};
    this.innerEls = {};
    this.widths = [];
    this.iteration = 0;
  }

  componentDidMount() {
    this.renderMarquee(true);
  }

  componentWillUnmount() {
    window.cancelAnimationFrame(this.lastFrame);
  }

  animate() {
    const now = new Date();
    let elapsed = 0;
    if (this.lastTime) elapsed = now - this.lastTime;
    elapsed /= 10;
    this.x = [
      (this.x[0] -= 0.5 * elapsed),
      (this.x[1] -= 0.8 * elapsed),
      (this.x[2] -= 0.65 * elapsed)
    ];
    this.x = this.x.map((x, i) => {
      const w = document.getElementsByClassName('m' + i)[0].offsetWidth / 2;
      if (x <= -w) {
        x += w;
      }
      const rX = Math.round(x * 100) / 100;
      this.dataBlock[i].style.transform = 'translateX(' + rX + 'px) translateZ(0px)';
      return x;
    });
    this.lastTime = now;
    this.lastFrame = window.requestAnimationFrame(() => this.animate());
  }

  renderMarquee(initial) {
    if (!this.marqueeData) return;
    this.marqueeData.forEach((d, i) => {
      if (initial) this.innerEls[i] = [];
      d.forEach((innerData, j) => {
        const color = i === 1 ? '#242425' : '#EDEDED';
        const userData = (
          <div>
            <p style={{ color }}>{innerData.name}</p>
            <p style={{ color }}>{innerData.change > 0 ? '▲' : '▼'}</p>
            <p style={{ color }}>{innerData.change}%</p>
          </div>
        );
        const specialKey = JSON.stringify(j) + JSON.stringify(i) + JSON.stringify(this.iteration);
        const singleEl = (
          <div key={specialKey} className="bebasRegular">
            {userData}
          </div>
        );
        this.innerEls[i].push(singleEl);
      });
    });
    this.setState({});
    this.iteration++;
    if (initial) {
      this.animate();
      this.renderMarquee();
    }
  }

  render() {
    return (
      <div className="marqueeParent">
        <article style={{ backgroundColor: '#444445' }}>
          <section
            className="m0"
            style={{ transform: `translateX(${this.x[0]}px)` }}
            ref={c => {
              this.dataBlock[0] = c;
            }}
          >
            {this.innerEls[0]}
          </section>
        </article>
        <article style={{ backgroundColor: '#EDEDED' }}>
          <section
            className="m1"
            style={{ transform: `translateX(${this.x[1]}px)` }}
            ref={c => {
              this.dataBlock[1] = c;
            }}
          >
            {this.innerEls[1]}
          </section>
        </article>
        <article style={{ backgroundColor: '#444445' }}>
          <section
            className="m2"
            style={{ transform: `translateX(${this.x[2]}px)` }}
            ref={c => {
              this.dataBlock[2] = c;
            }}
          >
            {this.innerEls[2]}
          </section>
        </article>
      </div>
    );
  }
}
