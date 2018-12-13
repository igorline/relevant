import React from 'react';
import { renderToString } from 'react-dom/server';
import { RouterContext, match } from 'react-router';
import { Provider } from 'react-redux';
import routes from '../app/web/routes';
import configureStore from '../app/web/store/configureStore';
import { setUser, setCommunity } from '../app/actions/auth.actions';

function fetchMeta(initialState) {
  let title;
  let description;
  let image;
  let url;
  const { community } = initialState.auth;
  if (initialState.posts.posts) {
    const postId = Object.keys(initialState.posts.posts)[0];
    if (postId) {
      let post = initialState.posts.posts[postId];
      if (post.metaPost) {
        post = initialState.posts.links[post.metaPost] || {};
      }
      title = post.title;
      image = post.image;
      description = post.body;
      url = `https://relevant.community/${community}/post/${postId}`;
    }
  }
  title = title || 'Relevant: A Social News Reader';
  image = image || 'https://relevant.community/img/fbimg.png';
  url = url || 'https://relevant.community/';
  description =
    description ||
    'Relevant is a social news reader that values quality over clicks. Our mission is to create a token-backed qualitative metric for the information economy — making the human values of veracity, expertise and agency economically valuable.';
  return { title, description, image, url };
}

function renderFullPage(html, initialState) {
  let styles;

  // load extracted styles in head when in production
  if (process.env.NODE_ENV === 'development') styles = '';
  else styles = '<link rel="stylesheet" href="/styles.css" />';

  const meta = fetchMeta(initialState);

  const app = `<!doctype html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">

        <title>Relevant: A Social News Reader</title>
        <link rel="icon" href="https://relevant.community/favicon.ico?v=2" />
        <meta name="description" content="${meta.description}" />
        <meta property="og:description" content="${meta.description}" />
        <meta property="og:title" content="${meta.title}" />
        <meta property="og:url" content="${meta.url}" />
        <meta property="og:image" content="${meta.image}" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@4realglobal" />
        <meta name="twitter:title" content="${meta.title}" />
        <meta name="twitter:description" content="${meta.description}" />
        <meta name="twitter:image" content="${meta.image}" />

        ${styles}

        <!-- Global site tag (gtag.js) - Google Analytics -->
        <script async src="https://www.googletagmanager.com/gtag/js?id=UA-51795165-6"></script>
        <script>
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'UA-51795165-6');
        </script>

        <!-- Facebook Pixel Code -->
        <script>
        !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
        n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
        document,'script','https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '286620198458049', {
        em: 'insert_email_variable'
        });
        fbq('track', 'PageView');
        </script>
        <noscript><img height="1" width="1" style="display:none"
        src="https://www.facebook.com/tr?id=286620198458049&ev=PageView&noscript=1"
        /></noscript>
        <!-- DO NOT MODIFY -->
        <!-- End Facebook Pixel Code -->
      </head>
      <body>
        <div id="app">${html}</div>
        <script>
          window.__INITIAL_STATE__ = ${JSON.stringify(initialState)}
        </script>
        <script src="/bundle.js"></script>
      </body>
    </html>
  `;

  return app;
}

function fetchComponentData(dispatch, components, params, req) {
  const promises = components
  .filter(component => component && component.fetchData)
  .map(component => component.fetchData)
  .map(fetchData => fetchData(dispatch, params, req));
  return Promise.all(promises);
}

export default function handleRender(req, res) {
  // const params = qs.parse(req.query);
  const auth = {};
  if (req.unconfirmed) auth.confirmed = false;

  // TODO how to deal with this better?
  auth.community = 'relevant';
  const initialState = { auth };

  // Create a new Redux store instance
  const store = configureStore(initialState);

  // TODO check this! better to use 'default user community'
  // or most recent community
  store.dispatch(setCommunity(auth.community));

  if (req.user) store.dispatch(setUser(req.user));

  match(
    { routes: routes(store), location: req.originalUrl },
    (err, redirectLocation, renderProps) => {
      if (redirectLocation) {
        return res.redirect(redirectLocation.pathname + redirectLocation.search);
      } else if (err) {
        // console.error('ROUTER ERROR:', error);
        // res.status(500);
        return res.end(err.message);
      } else if (!renderProps) {
        // res.status(500);
        return res.end(new Error('missing render props'));
      }

      const renderHtml = () => {
        const component = (
          <Provider store={store}>
            <div className="parent">
              <RouterContext {...renderProps} />
            </div>
          </Provider>
        );
        return renderToString(component);
      };

      // This code pre-fills the data on the server
      return fetchComponentData(store.dispatch, renderProps.components, renderProps.params)
      .then(data => {
        // Here we can use the data to render the appropriate meta tags
        res.send(renderFullPage(renderHtml(data), store.getState()));
      })
      .catch(error => res.end(error.message));
    }
  );
}
