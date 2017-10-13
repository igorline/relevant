import React from 'react';
import cookie from 'react-cookie';
import { renderToString } from 'react-dom/server';
import { RouterContext, match } from 'react-router';
import { Provider } from 'react-redux';
// import qs from 'qs';
import routes from '../app/web/routes';
import configureStore from '../app/web/store/configureStore';
// import App from '../app/web/components/app';
import { setUser } from '../app/actions/auth.actions';


// console.log(router)
// router.stack.forEach(l => {
//   console.log(l.route)
// })

function renderFullPage(html, initialState) {
  let styles;
  // html = ''

  // load extracted styles in head when in production
  if (process.env.NODE_ENV === 'development') styles = '';
  else styles = '<link rel="stylesheet" href="/styles.css" />';

  let meta = fetchMeta(initialState)

  let app = `<!doctype html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">

        <title>Relevant: A Social News Reader</title>

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

function fetchMeta(initialState) {
  let title, description, image, url;
  if (initialState.posts.posts) {
    const post_id = Object.keys(initialState.posts.posts)[0]
    if (post_id) {
      const post = initialState.posts.posts[post_id]
      title = post.title
      image = post.image
      url = 'https://relevant.community/post/' + post_id
    }
  }
  title = title || 'Relevant: A Social News Reader'
  image = image || 'https://relevant.community/img/fbfimg.png'
  url = url || 'https://relevant.community/'
  description = 'Relevant promotes reliable information and rewards expertise. Instead of relying on quantity (# of likes, followers), Relevant’s algorithm relies on a quality metric - relevance score. This system is designed to penalise clickbait and fake news while promoting useful and reliable information.'
  return { title, description, image, url }
}

function fetchComponentData(dispatch, components, params, req) {
  const promises = components
    .filter((component) => component && component.fetchData) // 1
    .map((component) => {
      return component.fetchData;
    }) // 2
    .map(fetchData => {
      return fetchData(dispatch, params, req); // 3
    });
  return Promise.all(promises);
}

export default function handleRender(req, res) {
  // const params = qs.parse(req.query);
  cookie.plugToRequest(req, res);

  // this sets the inital auth state
  let confirm = {};
  console.log('req ', req.unconfirmed);
  if (req.unconfirmed) confirm = { auth: { confirmed: false } };
  const initialState = { ...confirm };

  // Create a new Redux store instance
  const store = configureStore(initialState);
  if (req.user) store.dispatch(setUser(req.user));

  match(
    { routes: routes(store), location: req.originalUrl },
    (error, redirectLocation, renderProps) => {
      if (redirectLocation) {
        res.redirect(redirectLocation.pathname + redirectLocation.search);
      } else if (error) {
        console.error('ROUTER ERROR:', error);
        res.status(500);
      } else if (!renderProps) {
        res.status(500);
      } else {
        // console.log("RENDERING", req.originalUrl)
        let renderHtml = () => {
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
        fetchComponentData(store.dispatch, renderProps.components, renderProps.params)
          .then((data) => {
            console.log('GOT DATA, RENDERING COMPONENTS');
            // Here we can use the data to render the appropriate meta tags
            res.send(renderFullPage(renderHtml(data), store.getState()));
          })
          .catch(err => {
            console.log(err);
            return res.end(err.message);
          });

        // res.send(renderFullPage(renderHtml(), store.getState()));
      }
    }
  );
}
