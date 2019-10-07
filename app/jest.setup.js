import React from 'react';
import renderer from 'react-test-renderer';
import Enzyme, { mount } from 'enzyme';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { MemoryRouter } from 'react-router-dom';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });

const mockStore = configureMockStore([thunk]);

export function withRenderer({ state, Component, props, options = {} }) {
  const store = mockStore(state);
  return renderer.create(
    <Provider store={store}>
      <MemoryRouter>
        <Component {...props} />
      </MemoryRouter>
    </Provider>,
    options
  );
}

export function withEnzyme({ state, Component, props }) {
  const store = mockStore(state);
  return mount(
    <Provider store={store}>
      <MemoryRouter>
        <Component {...props} />
      </MemoryRouter>
    </Provider>
  );
}

// const ULink = require('../__mocks__/ULink.component').default;
jest.mock('modules/navigation/ULink.component', () => {
  const ULink = require('../__mocks__/ULink.component');
  return ULink;
});
