import React, {
  Component,
} from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ShadowButton from '../common/ShadowButton';
import Problem from './problem1.component';

import * as actionCreators from '../../../actions/admin.actions';
import Marquee from './marquee';
import Footer from '../common/footer.component';

if (process.env.BROWSER === true) {
  require('./main.css');
}

export class Main extends Component {
  constructor(props, context) {
    super(props, context);
    this.submit = this.submit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.state = {
      email: '',
      name: ''
    };
  }


  handleChange(field, data) {
    this.setState({ [field]: data });
  }

  submit() {
    let { name, email } = this.state;
    if (!name || name == '') {
      return window.alert('missing name');
    }
    if (!email || !email.match(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)) {
      return window.alert('bad email');
    }
    this.props.actions.signupForMailingList({
      name,
      email
    });
    this.setState({ email: '', name: '' });

    window.fbq('track', 'waitlist', {
      name,
    });
  }

  render() {
    return (
      <div className="splashContainer">
        <Marquee {...this.props} />

        <div className="splashContent">

          <mainSection>
            <section className="body">
              <p className="libre">
                <span className="outline">
                  Relevant
                </span> is a social news reader that values <span className="outline">quality</span> over clicks.
                {/* <a href="http://www.apple.com" className="download">
                  <img src="/img/apple.png" />
                  <span className="bebasRegular">download</span>
                </a> */}
              </p>
            </section>

            <section className="invitation">
              <div>
                <p>
                  Sign up for your <br />invitation to Relevant.
                </p>

                <div style={{ display: 'inline-block' }}>
                  <input
                    className="blueInput"
                    value={this.state.name}
                    onChange={(e) => {
                      this.setState({ name: e.target.value });
                    }}
                    autoCorrect="off"
                    type="text"
                    name="name"
                    placeholder="Your name"
                  />

                  <br />

                  <input
                    className="blueInput"
                    value={this.state.email}
                    onChange={(e) => {
                      this.setState({ email: e.target.value });
                    }}
                    autoCapitalize="off"
                    autoCorrect="off"
                    type="email"
                    name="email"
                    placeholder="Your email"
                  />


                </div>

                <ShadowButton
                  style={{ margin: '10px 0 10px 0' }}
                  color={'#3E3EFF'}
                  onClick={this.submit}
                >
                  Submit
                </ShadowButton>
              </div>
            </section>

          </mainSection>

          <div className="phone">
            <img src="/img/hand.jpg" alt="phone" />
          </div>

        </div>


        <panel className={'dark center'}>
          <img src={'/img/rWhite.svg'} />
          <div className={'libre pitch'}>
          <p>
Our mission is to create a token-backed <b>qualitative metric</b> for the information economy — making the <b>human values</b> of veracity, expertise and agency <b>economically valuable</b>. 
          </p>
{/*          <p>
By backing it with a token — we can make the human values of veracity, expertise and agency economically valuable. 
          </p>*/}
          </div>
        </panel>


        <Problem />


        <panel>
          <h1>OPPORTUNITY & THE BLOCKCHAIN</h1>
          <columns>
{/*          <div style={{ flex: 1 }}>
            <img src='/img/ecosystem.png'/>
          </div>*/}
{/*
          <div style={{ flex: .3, padding: '0 50px' }} >
            <img src="/img/blockchain.png" />
          </div>*/}


          <div className={'innerPanel'}>
            <p>
Blockchain technology allows us to build an economy around the information we value. Instead of manipulating user behavior to extract capital, we can formulate new economic incentives that reward the creation and dissemination of quality content.             </p>
            <p>
            <b>
Put simply, if we can attach economic value to human values — we can transform the information economy.
            </b>
            </p>
{/*            <p>
We can do this in three steps:
            </p>
              <ol>
                <li>Create a quality metric for information</li>
                <li>Develop a platform where content can be filtered, ranked and distributed according to that metric</li>
                <li>Create a virtual economy that rewards valuable contributions to that platform</li>
              </ol>*/}
          </div>

          </columns>
        </panel>



        <panel className={'grey'}>
          <h1>RELEVANCE: A Quality Metric for Information</h1>

          <div className={'innerPanel'}>
          <p>
Relevant relies on a qualitative metric — Relevance.
          </p>

          <p><b>
          Relevance is the return on attention (ROA): how much value we get back when we pay attention. 

          </b>
          </p>

          <p>
          Relevance differs from traditional Web 2.0 engagement metrics in that the latter doesn't measure the quality of attention - only it’s quantity. 
          {/*For example:*/}
          </p>
{/*
          <p>
          If a person spends 2 hours looking at cat videos and 10 minutes reading about climate change, Facebook would infer that cats are more important than climate change and that everyone should pay attention to whatever it is that cats are doing.
          </p>

          <p>
This user would probably tell you that climate change is more important to them than cat videos — but Facebook’s algorithms never thought bother to ask. These metrics are not just intellectually problematic but also factually wrong.
  </p>

          <p>
          In contrast, the Relevance metric gives users the option to rate, classify, and annotate their experiences — bringing agency, nuance and meaning back into the information ecosystem. In the short term this will result in better curation and discovery methods. In the long term, this will lead to the total restructuring of the information environment.
          </p>
*/}
          </div>
        </panel>


        <panel>
          <h1>Relevant Economy</h1>

          <div className={'innerPanel'}>

          <p>
User activity in the Relevant App produces Relevance — both a social good, and a data-rich record of information quality. 
          </p>

          <p>
This data will be stored in the Relevant Knowledge Base — an open, decentralized database that maps the relationship between users, content and applications. The value of the Relevant Knowledge Base is represented by total market cap of Relevant Tokens. 
          </p>

          <p>
Because Relevant data is generated by users, we believe they are the ones that should reap its benefits. The more value users contribute to the platform the more tokens they receive. 
          </p>

          <p>
A decentralized protocol will control how these tokens are distributed and control access to the data.
          </p>
{/*
          <p>
A decentralized protocol will control how these tokens are distributed and control access to the data.

          </p>

          <p>
Relevance data is the result of engaged and intentional behaviour — not spying. Relevant does not track, package or sell users as a product. What we measure is the saliency of the content — the issues, positions and publishing platforms that really matter to them. 

          </p>

          <p>
We do not sell ads

          </p>

          <p>
Relevant does not sell or display advertising of any kind, but the Relevant Knowledge Base offers a new opportunity for ad placement. Instead of coupling advertising to individual users through invasive profiling — Relevant data enables coupling to high-quality content and sources, whether they are large publishers, individual writers or influencers. 
          </p>


          <p>
          Context-coupled advertising will gain an ever-increasing market share as consumers switch to more privacy oriented solutions — like browsers that block third-party cookies. By identifying the most relevant real estate in the information environment — we can create a space for advertisers to pursue sophisticated brand awareness campaigns that go beyond the one-off calls to action of most digital advertising.
          </p>

          <p>
This also provides concrete financial incentives for publishers to produce the kind of original research and investigative journalism that has been drowned out thanks to the click-metrics of Web 2.0.

          </p>

          <p>
Relevance as a high-value subset of the attention economy enables an ecosystem of businesses to be built around the Relevant Knowledge Base: from market and social research to polling, education and knowledge production — giving developers and businesses a fuller picture of the global information environment.

          </p>

          <p>
Because access to the Relevant Knowledge Base is paid for in Relevant Tokens, businesses will have to buy tokens from users in exchange for fiat currencies. This means users directly benefit from the value they create.

          </p>
*/}
          </div>

        </panel>



        <panel className={"grey"}>
          <h1>Relevant News Reader</h1>

          <columns>

          <div className={'innerPanel'}>
            <p>
Relevant is a news sharing app that encourages users to rank content according to quality. 
            </p>
            <p>
The app serves as a lab for formulating and experimenting with the Relevance metric and its underlying economy as we work on the decentralized technology to support it.
            </p>
            <p><b>
Here are a few things we have learned:
            </b>
            </p>

            <ul>
              <li className={'special'}>
                Democracy needs expertise
              </li>

              <li className={'special'}>
              A "Like" is not enough
              </li>

              <li className={'special'}>
              Personalization is perverse
              </li>
            </ul>

            <p>
At Relevant, we envision a decentralized, democratic and transparent network that allows engaged experts to participate in the creation of a global knowledge project while providing readers with the best discovery tool on the market. 
            </p>
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
          </div>

          <div style={{ flex: .8 }}>
            <img src="/img/phone-upright.png"/>
          </div>
          </columns>

        </panel>


        <panel>
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
        </panel>


        <Footer />

      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  isAuthenticating: state.auth.isAuthenticating,
  isAuthenticated: state.auth.isAuthenticated,
  statusText: state.auth.statusText,
  user: state.auth.user,
  message: state.socket.message
});

const mapDispatchToProps = (dispatch) => (Object.assign({}, { dispatch }, {
  actions: bindActionCreators(Object.assign({}, actionCreators), dispatch)
}));

export default connect(mapStateToProps, mapDispatchToProps)(Main);
