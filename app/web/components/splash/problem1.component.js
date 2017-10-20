import React, { Component } from 'react';

export default class Problem extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      more: false
    };
  }

  render () {
    return (
      <panel className={'grey'}>

        <columns>

        <div className={'innerPanel'}>

          <p>
  Once upon a time there was universal optimism about the web. Every tech company’s mission was to make the world a better place, and we believed them. 
          </p>
          <p>
            The internet would revolutionize knowledge, social networks would spread democracy, and automation would reduce inequality.
            <span className={'more'}
              onClick={() => this.setState({ more: !this.state.more })}
            >
{/*              {this.state.more ? ' ...read less' : ' ...read more'}*/}
            </span>
          </p>

          <h1 style={{ paddingTop: 20 }}>What happened to the Internet?</h1>

{/*
          <div style={{ display: this.state.more ? 'block' : 'none' }}>
            <p>
  As they scaled, Web 2.0 platforms had to face the economic realities of running a business that offered free services. In order to generate income, they had no choice but to turn their users into products — exploiting user behavior to capture, monopolize and privatize data as a means to maximize ad revenue. 
            </p>
          </div>*/}



          <p className={'quote'}>
“Without realizing the implications, a handful of tech leaders at Google and Facebook have built the most pervasive, centralized systems for steering human attention that has ever existed, while enabling skilled actors (addictive apps, bots, foreign governments) to hijack our attention for manipulative ends.”
          <span style={{ float: 'right' }}> — Tristan Harris</span>
          </p>

          <p><b>
The current culture of misinformation is a direct result of the way we measure online behavior.
          </b>
          </p>

           {/* <img src="/img/clicks-diagram.png" />*/}

        </div>

{/*
        <div className={'sidebar'} style={{ flex: 0.3 }}>
          <p className={'sidebarSection'}>
            Preverse Incentives
            <arrow>⇵</arrow>
            Preverse Innovations
          </p>

          <p className={'sidebarSection'}>
            Counting Clicks
            <arrow>⇵</arrow>
            Clickbait
          </p>

          <p className={'sidebarSection'}>
            Algorithmic Personalization
            <arrow>⇵</arrow>
            Filter Bubble & Fake News
          </p>

          <p className={'sidebarSection'}>
            Analytics
            <arrow>⇵</arrow>
            Copy/Paste Journalism
          </p>
        </div>
*/}
        </columns>


      </panel>
    )
  }
}
