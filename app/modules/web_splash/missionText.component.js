import React, { Component } from 'react';
import PropTypes from 'prop-types';
import InviteCta from './inviteCta.component';

export default class MissionText extends Component {
  static propTypes = {
    state: PropTypes.object,
    setLi: PropTypes.func
  };

  render() {
    this.state = this.props.state;
    return (
      <div>
        <panel className={'grey'}>
          <h1>The Promise of the Internet Betrayed</h1>

          <div className={'innerPanel'}>
            <p>
              Once upon a time there was universal optimism about the web. Every tech company’s
              mission was to make the world a better place, and we believed them — the internet
              would revolutionize knowledge, social networks would spread democracy, and automation
              would reduce inequality...
            </p>
            <p className={'subH<'}>
              <b>What happened?</b>
            </p>

            <p className={'quote'}>
              “Without realizing the implications, a handful of tech leaders at Google and Facebook
              have built the most pervasive, centralized systems for steering human attention that
              has ever existed, while enabling skilled actors (addictive apps, bots, foreign
              governments) to hijack our attention for manipulative ends.”
              <span style={{ float: 'right' }}> — Tristan Harris</span>
            </p>
          </div>

          <h1>Perverse Incentives Result in Perverse Innovations</h1>

          <columns>
            <div className={'diagramContainer'}>
              <img src="/img/vicious.svg" />
            </div>

            <div className={'innerPanel'}>
              <p>
                <b>What you measure determines what you make.</b>
              </p>
              <p>
                Networks do not only reflect human behavior, they determine it — creating a vicious
                cycle of perverse incentives fueling perverse innovations.
              </p>
              <p>
                Counting clicks gives you clickbait, chasing engagement gives you addiction,
                personalization gives you filter bubbles and ad analytics give you copy-paste
                journalism — creating a vicious cycle of perverse incentives fueling perverse
                innovations.
              </p>
            </div>
          </columns>
        </panel>

        <panel>
          <h1>OPPORTUNITY & THE BLOCKCHAIN</h1>

          <div className={'innerPanel'}>
            <p>
              Blockchain technology allows us to build an economy around the information we value.
              Instead of manipulating user behavior to extract capital, we can formulate new
              economic incentives that reward the creation and dissemination of quality content.{' '}
            </p>
            <p>
              <b>
                Put simply, if we can attach economic value to human values we can transform the
                information economy.
              </b>
            </p>
          </div>
          <columns>
            <div className={'diagramContainer'}>
              <img src="/img/virtuous1.svg" />
            </div>

            <div className={'innerPanel'}>
              <p className={'listHead'}>
                <b>We can do this in three steps:</b>
              </p>

              <ol className={'ccolumn'}>
                <li>Create a quality metric for information — Relevance</li>
                <li>Create a token backed by the quality metric — Relevant Token</li>
                <li>
                  Develop a platform that uses the quality metric to rank, filter and distribute
                  content — Relevant App
                </li>
              </ol>
            </div>
          </columns>
        </panel>

        <panel className={'grey'}>
          <h1>RELEVANCE: A Quality Metric for Information</h1>

          <columns>
            <div className={'innerPanel'}>
              <p>
                <b>
                  Relevance is the return on attention (ROA): how much value we get back when we pay
                  attention.
                </b>
              </p>

              <p>
                Relevance differs from traditional Web 2.0 engagement metrics in that the latter
                doesn't measure the quality of attention — only it’s quantity. For example:
              </p>

              <p>
                If a person spends two hours looking at cat videos and ten minutes reading about
                climate change, Facebook would infer that cats are more important than climate
                change and that everyone should pay attention to whatever it is that cats are doing.
              </p>

              <p>
                There’s no doubt that there will always be cat videos, but there is less certainty
                that there will always be quality journalism. We are building something to ensure
                there is.
              </p>
            </div>

            <div className={'diagramContainer'} style={{ flex: 1 }}>
              <img src="/img/metric.svg" />
            </div>
          </columns>
        </panel>

        <panel>
          <h1>Relevant Economy</h1>

          <div className={'innerPanel'}>
            <p>
              User activity in the Relevant App produces <b>Relevance</b> — both a social good, and
              a data-rich record of information quality.
            </p>

            <p>
              This data will be stored in the <b>Relevant Knowledge Base</b> — an open,
              decentralized database that maps the relationship between users, content and
              applications. The value of the Relevant Knowledge Base is represented by total market
              cap of <b>Relevant Tokens</b>.
            </p>

            <br />
            <ul>
              <li
                className={'special dropdown ' + (this.state.li === 4 ? 'open' : 'closed')}
                onClick={() => this.props.setLi({ li: this.state.li === 4 ? 0 : 4 })}
              >
                <div className={'row'}>
                  <span>We do not sell our users</span>
                  <marrow>
                    <img src={'/img/blackarrow.png'} />
                  </marrow>
                </div>
                <div>
                  <p>
                    Relevance data is the result of engaged and intentional behaviour — not spying.
                    Relevant does not track, package or sell users as a product. What we measure is
                    the saliency of the content — the issues, positions and publishing platforms
                    that really matter to them.
                  </p>
                </div>
              </li>
              <li
                className={'special dropdown ' + (this.state.li === 5 ? 'open' : 'closed')}
                onClick={() => this.props.setLi({ li: this.state.li === 5 ? 0 : 5 })}
              >
                <div className={'row'}>
                  <span>We do not sell ads</span>
                  <marrow>
                    <img src={'/img/blackarrow.png'} />
                  </marrow>
                </div>
                <div>
                  <p>
                    Relevant does not sell or display advertising of any kind, but the Relevant
                    Knowledge Base offers a new opportunity for ad placement. Instead of linking
                    advertisers to individual users through invasive profiling — the Relevant
                    Knowledge Base enables coupling to high-quality content and sources, whether
                    they are large publishers, individual writers or influencers.
                  </p>
                  <p>
                    Contextually relevant advertising will gain an ever-increasing market share as
                    consumers switch to more privacy-oriented browsers. By identifying the most
                    relevant real estate online, we enable advertisers to pursue sophisticated brand
                    awareness campaigns that go beyond the call-to-action format used by most
                    digital marketers.
                  </p>

                  <p>
                    As a result, our Relevance metric will offer publishers new financial incentives
                    to produce meaningful content, original research and investigative journalism —
                    effectively reversing the damage done by the click-metrics of Web 2.0.
                  </p>
                </div>
              </li>

              <li
                className={'special dropdown ' + (this.state.li === 6 ? 'open' : 'closed')}
                onClick={() => this.props.setLi({ li: this.state.li === 6 ? 0 : 6 })}
              >
                <div className={'row'}>
                  <span>Users own the platform</span>
                  <marrow>
                    <img src={'/img/blackarrow.png'} />
                  </marrow>
                </div>
                <div>
                  <p>
                    Because Relevant data is generated by users, we believe they are the ones that
                    should reap its benefits. The more value users contribute to the platform the
                    more tokens they receive. Early adopters are crucial in shaping the Relevant
                    metric and are the most likely to reap the rewards of the Relevant economy.{' '}
                  </p>
                  <p>
                    To make use of the Relevant Knowledge Base, businesses will have to buy tokens
                    from users. This means that users directly benefit from the value they create.
                  </p>
                </div>
              </li>
            </ul>

            <p />

            <div className={'inlineDiagram'} style={{ flex: 0.6 }}>
              <img src="/img/economyv.svg" />
            </div>
          </div>
        </panel>

        <panel className={'grey'}>
          <h1>Relevant News Reader</h1>

          <columns>
            <div className={'innerPanel'}>
              <p>
                For the past six months we have been beta-testing the Relevant app, a news sharing
                platform that encourages users to rank content according to quality. The app serves
                as a research lab for the Relevance metric and token-backed economy.
              </p>

              <p className={'listHead'}>
                <b>How it works:</b>
              </p>

              <ul>
                <li
                  className={'special dropdown ' + (this.state.li === 1 ? 'open' : 'closed')}
                  onClick={() => this.props.setLi({ li: this.state.li === 1 ? 0 : 1 })}
                >
                  <div className={'row'}>
                    <span>User reputation and ranking system</span>
                    <marrow>
                      <img src={'/img/blackarrow.png'} />
                    </marrow>
                  </div>
                  <div>
                    <p>
                      On Relevant, every article and user is ranked according to their Relevance
                      score. Similar to Reddit, users can upvote or downvote an article — but not
                      every vote is equal.
                    </p>

                    <p>
                      For example: Kim Kardashian might have a high Relevance ranking for fashion,
                      but a low ranking when it comes to science. If she upvotes an article about
                      fashion week — that content will shoot up in Relevance, but if she upvotes an
                      article on climate change — that content’s Relevance value will change very
                      little.
                    </p>

                    <p>
                      Relevant is not a popularity contest. Your Relevance is not tied to the number
                      of followers you have, but by your authority on a given subject.
                    </p>
                  </div>
                </li>

                <li
                  className={'special dropdown ' + (this.state.li === 2 ? 'open' : 'closed')}
                  onClick={() => this.props.setLi({ li: this.state.li === 2 ? 0 : 2 })}
                >
                  <div className={'row'}>
                    <span>A common news feed</span>
                    <marrow>
                      <img src={'/img/blackarrow.png'} />
                    </marrow>
                  </div>
                  <div>
                    <p>
                      The user is not the center of the Relevant universe — information is. What you
                      see is not filtered by who you know or how you feel, but by what is most
                      salient on the platform as a whole. Everyone sees the same feed and users are
                      exposed to a variety of viewpoints and opinions. The feed is a result of
                      communal curation, not your personal preferences.
                    </p>
                  </div>
                </li>

                <li
                  className={'special dropdown ' + (this.state.li === 3 ? 'open' : 'closed')}
                  onClick={() => this.props.setLi({ li: this.state.li === 3 ? 0 : 3 })}
                >
                  <div className={'row'}>
                    <span>Moving beyond the ‘Like’ button</span>
                    <marrow>
                      <img src={'/img/blackarrow.png'} />
                    </marrow>
                  </div>
                  <div>
                    <p>
                      Binary feedback is not sufficient to distinguish between the nuanced array of
                      responses we have to what we see online. At Relevant, we are developing
                      feedback options beyond upvotes and downvotes in order to separate valuable
                      information from noise.
                    </p>
                  </div>
                </li>
              </ul>

              <p>
                At Relevant, we envision a democratic and transparent platform that allows engaged
                experts to participate in the creation of a global knowledge project while providing
                readers with the best discovery tool on the market.
              </p>

              <p>Sign up now and help us build a better information environment for all.</p>
              <br />

              <InviteCta />
            </div>

            <div className={'uprightPhone'}>
              <img src="/img/phone-upright.png" />
            </div>
          </columns>
        </panel>
      </div>
    );
  }
}