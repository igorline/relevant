import React from 'react';
import cookie from 'react-cookie';
import { renderToString } from 'react-dom/server';
import { RouterContext, match } from 'react-router';
import { Provider } from 'react-redux';
import qs from 'qs';
import routes from '../app/web/routes';
import configureStore from '../app/web/store/configureStore';
import App from '../app/web/components/app';
import { setUser } from '../app/actions/auth.actions';


function renderFullPage(html, initialState) {
  var styles;
  //load extracted styles in head when in production
  if(process.env.NODE_ENV == 'development') styles = "";
  else styles = '<link rel="stylesheet" href="/styles.css" />';

  return `
    <!doctype html>
    <html>
      <head>
        <title></title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
        ${styles}
      </head>
      <body>
        <div id="app">${html}</div>
         <script>
          window.__INITIAL_STATE__ = ${JSON.stringify(initialState)}
        </script>
        <script src="/bundle.js"></script>
      </body>
    </html>
    `
}

function fetchComponentData(dispatch, components, params, req) {
  const promises = components
    .filter((component) => component && component.fetchData) // 1
    .map((component) => component.fetchData) // 2
    .map(fetchData => {
      console.log(fetchData)
      return fetchData(dispatch, params, req); // 3
    })
    return Promise.all(promises);
}

export default function handleRender(req, res) {

    const params = qs.parse(req.query);
    cookie.plugToRequest(req, res);

    // const initialState = {routing : {path: req.originalUrl}};
    const initialState = {}

    // Create a new Redux store instance
    const store = configureStore(initialState);
    // if (req.user) store.dispatch(setUser(req.user));

    match(
      {routes: routes(store), location: req.originalUrl},
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
          var renderHtml = () => {
            const component = (
              <Provider store={store}>
                <div>
                  <RouterContext {...renderProps}/>
                </div>
              </Provider>
            );
            return renderToString(component);
          }
          //This code pre-fills the data on the server
          fetchComponentData(store.dispatch, renderProps.components, renderProps.params)
            .then(() => {
              console.log("GOT DATA, RENDERING COMPONENTS")
              res.send(renderFullPage(renderHtml(), store.getState()))
            })
            .catch(err => {
              console.log(err);
              return res.end(err.message)
            });

          // res.send(renderFullPage(renderHtml(), store.getState()));
        }
      }
    )
}


