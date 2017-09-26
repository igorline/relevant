import React from 'react';

export default function() {
  return (
    <panel className={'grey'}>
      <columns>
        <div className={'innerPanel'}>
          <p className={'subH'}>
          The Promise of the Internet Betrayed
          </p>
          <p>
          Once upon a time there was universal optimism about the web. Every tech company’s mission was to make the world a better place, and we believed them. 
          </p>
          <p>
          The internet would revolutionize knowledge, social networks would spread democracy, and automation would reduce inequality...
          </p>
        </div>
      
        <div className={'innerPanel'}>
           <p className={'subH'}>
          The Vicious Cycle: Garbage in Garbage out
          </p>
          <p>
The internet has enabled the rapid acceleration of communication technology, giving us more information faster than ever before. However, the quality of that information is deteriorating and we are beginning to see the consequences on a global scale. 
          </p>
        </div>

        <div className={'innerPanel'}>
           <p className={'subH'}>
          Perverse Incentives => Perverse Innovations
          </p>
          <p>
What you measure determines what you make. Networks do not only reflect human behavior — they determine it. 

          </p>

          <p><b>
The current culture of misinformation is a direct result of the way we measure online behavior.
          </b>
          </p>
          <p>
Counting clicks gives you clickbait, chasing engagement gives you addiction, personalization gives you filter bubbles, ad analytics give you copy-paste journalism, creating a vicious cycle of perverse incentives fueling perverse innovations. 
          </p>

        </div>

      </columns>
    </panel>
  );
}
