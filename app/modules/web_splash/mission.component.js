import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Footer from 'modules/navigation/web/footer.component';

export default class Mission extends Component {
  static propTypes = {
    location: PropTypes.object
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      li: 0
    };
  }

  render() {
    return (
      <div>
        <panel className={'dark center mission'}>
          <img src={'/img/rWhite.svg'} />

          <div className={'libre pitch'}>
            <p>
              Our mission is to create a token-backed <b>qualitative metric</b> for the information
              economy — making the <b>human values</b> of veracity, expertise and agency{' '}
              <b>economically valuable</b>
            </p>
          </div>
        </panel>

        <panel className={'grey center mission'}>
          <a
            className={'cta'}
            href="https://blog.relevant.community/relevant-an-introduction-5b79ef7afa9"
            target={'_blank'}
          >
            Read
            <br />
            Introduction
            <br />
            Paper
          </a>
        </panel>

        {/*        <MissionText state={this.state} setLi={state => this.setState(state)} />

*/}

        {/*        <panel>
          <h1>Development Roadmap</h1>
          <div className={'innerPanel'}>
            <ol>
              <li>
              Develop Proof-of-Concept Relevance metric - Completed
              </li>

              <li>
Build a centralized mobile news sharing app to test Relevant metric - Completed
              </li>

              <li>
Proof of Concept economic incentives - In progress
              </li>

              <li>
Desktop browser version of app - In progress
              </li>

              <li>
Integrate cryptocurrency token into the app - Winter 2018
              </li>

              <li>
Blockchain-based record of Relevance metric - Spring 2018
              </li>

              <li>
Decentralized Relevant database fully integrated with Currency - Fall 2018
              </li>
            </ol>

          </div>
        </panel> */}
        <Footer location={this.props.location} />
      </div>
    );
  }
}
