import React, {
  Component,
} from 'react';
import MissionText from './missionText.component';
import ShadowButton from '../common/ShadowButton';
import InviteCta from './inviteCta.component';

export default class Mission extends Component {
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
Our mission is to create a token-backed <b>qualitative metric</b> for the information economy — making the <b>human values</b> of veracity, expertise and agency <b>economically valuable</b>.
          </p>
{/*          <p>
By backing it with a token — we can make the human values of veracity, expertise and agency economically valuable.
          </p>*/}

          </div>
{/*
          <a className={'cta'} href="/"
            target={'_blank'}
          >
            Read Introduction Paper
          </a>*/}
        </panel>


        <MissionText state={this.state} setLi={state => this.setState(state)} />



        <panel className={"grey"}>
          <h1>Relevant News Reader</h1>

          <columns>

          <div className={'innerPanel'}>
            <p>
For the past six months we have been beta-testing the Relevant app, a news sharing platform that encourages users to rank content according to quality. The app serves as a research lab for the Relevance metric and token-backed economy.            
            </p>


            <p><b>
How it works:
            </b>
            </p>

            <ul>
              <li
                className={'special dropdown ' + (this.state.li === 1 ? 'open' : 'closed')}
                onClick={() => this.setState({ li: this.state.li === 1 ? 0 : 1 })}
              >
                <row>
                  <span>User reputation and ranking system</span>
                  <marrow><img src={'/img/blackarrow.png'}/></marrow>
                </row>
                <div>
                  <p>
                    On Relevant, every article and user is ranked according to their Relevance score. Similar to Reddit, users can upvote or downvote an article — but not every vote is equal.
                  </p>

                  <p>
                    For example: Kim Kardashian might have a high Relevance ranking for fashion, but a low ranking when it comes to science. If she upvotes an article about fashion week — that content will shoot up in Relevance, but if she upvotes an article on climate change — that content’s Relevance value will change very little.
                  </p>

                  <p>
                    Relevant is not a popularity contest. Your Relevance is not tied to the number of followers you have, but by your authority on a given subject.
                  </p>
                </div>
              </li>

              <li
                className={'special dropdown ' + (this.state.li === 2 ? 'open' : 'closed')}
                onClick={() => this.setState({ li: this.state.li === 2 ? 0 : 2 })}
              >
                <row>
                  <span>A common news feed</span>
                  <marrow><img src={'/img/blackarrow.png'}/></marrow>
                </row>
                <div>
                  <p>
                    The user is not the center of the Relevant universe — information is. What you see is not filtered by who you know or how you feel, but by what is most salient on the platform as a whole. Everyone sees the same feed and users are exposed to a variety of viewpoints and opinions. The feed is a result of communal curation, not your personal preferences. 
                  </p>
                </div>
              </li>

              <li className={'special dropdown ' + (this.state.li === 3 ? 'open' : 'closed')}
                onClick={() => this.setState({ li: this.state.li === 3 ? 0 : 3 })}
              >
                <row>
                  <span>Moving beyond the ‘Like’ button</span>
                  <marrow><img src={'/img/blackarrow.png'}/></marrow>
                </row>
                <div>
                  <p>
Binary feedback is not sufficient to distinguish between the nuanced array of responses we have to what we see online. At Relevant, we are developing feedback options beyond upvotes and downvotes in order to separate valuable information from noise.
                  </p>
                </div>
              </li>
            </ul>
{/*            <p>
At Relevant, we envision a democratic and transparent platform that allows engaged experts to participate in the creation of a global knowledge project while providing readers with the best discovery tool on the market.
            </p>*/}


{/*
            <p>
            Contribute to the creation of a global knowledge project.
            <br/>
Earn Relevant Tokens.
            <br/>
Discover great content.
            </p>*/}

            <p>
At Relevant, we envision a democratic and transparent platform that allows engaged experts to participate in the creation of a global knowledge project while providing readers with the best discovery tool on the market.
            </p>

            <p>
Sign up now and help us build a better information environment for all. 
            </p>
            <br />

{/*            <p>
For example: Kim Kardashian might have a high Relevance ranking for fashion, but a low ranking when it comes to science. If she upvotes an article about fashion week - that content will shoot up in Relevance, but if she upvotes an article on climate change - the content’s Relevance value will change very little.
            </p>
            <p>
Relevant is not a popularity contest. Your Relevance is not tied to the number of followers you have, but your authority on a given subject. You build that authority by making valuable contributions to the platform.
            </p>
            <p>
This allows engaged experts to participate in the curation of a global knowledge project, while providing passive users the best discovery tool on the market.
            </p>

*/}
          <InviteCta />

          </div>

          <div className={'uprightPhone'}>
            <img src="/img/phone-upright.png"/>
          </div>

          </columns>


        </panel>


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
        </panel>*/}

      </div>
    );
  }
}
