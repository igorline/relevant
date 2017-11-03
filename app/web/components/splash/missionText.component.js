import React, { Component } from 'react';

export default class MissionText extends Component {
  constructor(props, context) {
    super(props, context);
  }

  render() {
    this.state = this.props.state;
    return (
      <div>
        <panel className={'grey'}>
          <h1>The Promise of the Internet Betrayed</h1>


          <div className={'innerPanel'}>

            <p>
              Once upon a time there was universal optimism about the web. Every tech company’s mission was to make the world a better place, and we believed them — the internet would revolutionize knowledge, social networks would spread democracy, and automation would reduce inequality...
            </p>
            <p className={'subH'}><b>What happened?</b></p>

            <p className={'quote'}>
              “Without realizing the implications, a handful of tech leaders at Google and Facebook have built the most pervasive, centralized systems for steering human attention that has ever existed, while enabling skilled actors (addictive apps, bots, foreign governments) to hijack our attention for manipulative ends.”
              <span style={{ float: 'right' }}> — Tristan Harris</span>
            </p>
          </div>

          <h1>Perverse Incentives Result in Perverse Innovations</h1>


          <columns>

            <div className={'diagramContainer'}>
              <img src="/img/vicious.svg" />
            </div>

            <div className={'innerPanel'}>

              <p><b>
    What you measure determines what you make.</b></p>
              <p>
    Networks do not only reflect human behavior, they determine it — creating a vicious cycle of perverse incentives fueling perverse innovations. 
              </p>
              <p>
    Counting clicks gives you clickbait, chasing engagement gives you addiction, personalization gives you filter bubbles and ad analytics give you copy-paste journalism — creating a vicious cycle of perverse incentives fueling perverse innovations. 

              </p>


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

          <panel>
              <h1>OPPORTUNITY & THE BLOCKCHAIN</h1>

            <div className={'innerPanel'}>

              <p>
  Blockchain technology allows us to build an economy around the information we value. Instead of manipulating user behavior to extract capital, we can formulate new economic incentives that reward the creation and dissemination of quality content.             </p>
              <p>
              <b>
  Put simply, if we can attach economic value to human values we can transform the information economy.
              </b>
              </p>


              </div>
            <columns>



            <div className={'diagramContainer'}>
              <img src="/img/virtuous1.svg" />
            </div>


            <div className={'innerPanel'}>
              <p className={'listHead'}><b>
  We can do this in three steps:
              </b>
              </p>


                <ol className={'ccolumn'}>
                  <li>Create a quality metric for information — Relevance</li>
                  <li>Create a token backed by the quality metric — Relevant Token</li>
                  <li>Develop a platform that uses the quality metric to rank, filter and distribute content — Relevant App</li>
                </ol>
            </div>



            </columns>

          </panel>



          <panel className={'grey'}>
            <h1>RELEVANCE: A Quality Metric for Information</h1>

            <columns>
            <div className={'innerPanel'}>

            <p><b>
            Relevance is the return on attention (ROA): how much value we get back when we pay attention.
            </b>
            </p>

            <p>
            Relevance differs from traditional Web 2.0 engagement metrics in that the latter doesn't measure the quality of attention — only it’s quantity.
            For example:
            </p>

            <p>
  If a person spends two hours looking at cat videos and ten minutes reading about climate change, Facebook would infer that cats are more important than climate change and that everyone should pay attention to whatever it is that cats are doing.
            </p>

            <p>
  There’s no doubt that there will always be cat videos, but there is less certainty that there will always be quality journalism. We are building something to ensure there is. 
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
  User activity in the Relevant App produces <b>Relevance</b> — both a social good, and a data-rich record of information quality.
            </p>

            <p>
  This data will be stored in the <b>Relevant Knowledge Base</b> — an open, decentralized database that maps the relationship between users, content and applications. The value of the Relevant Knowledge Base is represented by total market cap of <b>Relevant Tokens</b>.
            </p>

  {/*          <div className={'dropdown'}>
                <row>
                  <span><b>We do not sell our users</b></span>
                  <marrow><img src={'/img/blackarrow.png'} /></marrow>
                </row>
            </div>
            <p><b>
            We do not sell ads
            </b><span className={'more'}> ...read more</span></p>

  */}
            <br/>
            <ul>
              <li className={'special dropdown ' + (this.state.li === 4 ? 'open' : 'closed')}
                onClick={() => this.props.setLi({ li: this.state.li === 4 ? 0 : 4 })}
              >
                <row>
                  <span>We do not sell our users</span>
                  <marrow><img src={'/img/blackarrow.png'} /></marrow>
                </row>
                <div>
                  <p>
                    Relevance data is the result of engaged and intentional behaviour — not spying. Relevant does not track, package or sell users as a product. What we measure is the saliency of the content — the issues, positions and publishing platforms that really matter to them. 
                  </p>
                </div>
              </li>
              <li className={'special dropdown ' + (this.state.li === 5 ? 'open' : 'closed')}
                onClick={() => this.props.setLi({ li: this.state.li === 5 ? 0 : 5 })}
              >
                <row>
                  <span>We do not sell ads</span>
                  <marrow><img src={'/img/blackarrow.png'}/></marrow>
                </row>
                <div>
                  <p>
                    Relevant does not sell or display advertising of any kind, but the Relevant Knowledge Base offers a new opportunity for ad placement. Instead of linking advertisers to individual users through invasive profiling — the Relevant Knowledge Base enables coupling to high-quality content and sources, whether they are large publishers, individual writers or influencers. 
                  </p>
                  <p>
  Contextually relevant advertising will gain an ever-increasing market share as consumers switch to more privacy-oriented browsers. By identifying the most relevant real estate online, we enable advertisers to pursue sophisticated brand awareness campaigns that go beyond the call-to-action format used by most digital marketers. 
                  </p>

                  <p>
  As a result, our Relevance metric will offer publishers new financial incentives to produce meaningful content, original research and investigative journalism — effectively reversing the damage done by the click-metrics of Web 2.0.
                  </p>
                </div>
              </li>

              <li className={'special dropdown ' + (this.state.li === 6 ? 'open' : 'closed')}
                onClick={() => this.props.setLi({ li: this.state.li === 6 ? 0 : 6 })}
              >
                <row>
                  <span>Users own the platform</span>
                  <marrow><img src={'/img/blackarrow.png'}/></marrow>
                </row>
                <div>
                  <p>
  Because Relevant data is generated by users, we believe they are the ones that should reap its benefits. The more value users contribute to the platform the more tokens they receive. Early adopters are crucial in shaping the Relevant metric and are the most likely to reap the rewards of the Relevant economy.                 </p>
                  <p>
  To make use of the Relevant Knowledge Base, businesses will have to buy tokens from users. This means that users directly benefit from the value they create.
                  </p>
                </div>
              </li>


            </ul>


            <p>
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

            <div className={'inlineDiagram'} style={{ flex: .6 }}>
              <img src="/img/economyv.svg" />
            </div>


            </div>



        </panel>

    </div>


    );
  }
}
