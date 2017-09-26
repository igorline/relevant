import React from 'react';

export default function() {
  return (
    <panel className={'grey'}>
      <h1>The Vicious Cycle: Garbage in Garbage out</h1>
         <div className={'innerPanel'}>

          <p className={'quote'}>
“Without realizing the implications, a handful of tech leaders at Google and Facebook have built the most pervasive, centralized systems for steering human attention that has ever existed, while enabling skilled actors (addictive apps, bots, foreign governments) to hijack our attention for manipulative ends.”
          <span style={{ float: 'right' }}> — Tristan Harris</span>
          </p>

          <p><b>
The current culture of misinformation is a direct result of the way we measure online behavior.
          </b>
          </p>

          <p>
Counting clicks gives you clickbait, chasing engagement gives you addiction, personalization gives you filter bubbles, ad analytics give you copy-paste journalism, creating a vicious cycle of perverse incentives fueling perverse innovations. 
          </p>

         {/* <img src="/img/clicks-diagram.png" />*/}

       </div>


    </panel>
  )
}
