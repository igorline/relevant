/**
 * @jest-environment node
 */

import * as render from '../render';

jest.mock('../render', () => ({
  ...jest.requireActual('../render'),
  handleRouteData: jest.fn()
}));

// const render = jest.genMockFromModule('./../render');
// render.handleRender = jest.fn(
//   (...args) => require.requireActual('./../render').handleRender(...args)
// );
// render.initStore = jest.fn(
//   (...args) => require.requireActual('./../render').initStore(...args)
// );

// const render = require('../render');

jest.mock('core/web/configureStore', () => {
  const mockState = {
    auth: { community: 'relevant' },
    posts: {},
  };
  return () => ({
    getState: jest.fn(() => mockState),
    dispatch: jest.fn(),
    subscribe: jest.fn(),
  });
});

describe('render', () => {
  describe('handleRender', async () => {
    beforeEach(() => {
    //   // we don't care about what this does, that's a different unit test
    //   render.handleRouteData = jest.fn(() => Promise.resolve(true));
    //   // same here
    //   render.renderApp = jest.fn(() => 'app');
    //   render.renderFullPage = jest.fn(() => 'html');
    });

    it('should send page', async () => {
      const req = { url: 'url', confirmed: false };
      const res = { send: jest.fn() };
      const store = render.initStore(req);
      await render.handleRender(req, res);

      expect(render.handleRouteData).toHaveBeenCalledWith({ req, store });
      // expect(renderMock.renderFullPage).toHaveBeenCalledWith('app', store.getState());
      // expect(res.send).toHaveBeenCalled('html');
    });
  });
});
