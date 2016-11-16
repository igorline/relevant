import React, { Component } from 'react';
import { Provider } from 'react-redux';
import ShareContainer from './share.container';

import configureStore from '../store/configureStore';

const store = configureStore();
export default class Share extends Component {
  render() {
    return (
      <Provider store={store}>
        <ShareContainer />
      </Provider>
    );
  }
}
