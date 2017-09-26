import React from 'react';

if (process.env.BROWSER === true) {
  require('./footer.css');
}

export default function () {
  return (
    <footer>
      <div className="footerIconContainer">

        <a href="https://twitter.com/relevantfeed" target='_blank'>
          <img className="footerIcon" src='/img/twitter.svg' />
        </a>

        <a href="https://join.slack.com/t/relevantcommunity/shared_invite/enQtMjIwMjEwNzUzMjUzLTFkOTkwNzFjN2EzMjFhYTVkZDZmYzU1ZGFlZmY4MzdjNGMyOWIwYjhmYTE2OTQ1NmJlOWVmNjkyODNjM2I4YWI" target="_blank">
          <img className="footerIcon" src='/img/slack.svg' />
        </a>

        <a href="mailto:contact@4real.io" target='_blank'>
          <img className="footerIcon" src='/img/email.svg' />
        </a>

      </div>

      <div className="copyrightParent">
        <p>
          Copyright 2017. All rights reserved.
        </p>
        <p>
          Relevant is created by <a href="http://4real.io/">4Real</a> & <a href="http://www.phillipfivel.com/">Phillip Fivel Nessen</a>
        </p>
      </div>
    </footer>
  );
}
