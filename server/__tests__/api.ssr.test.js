delete process.env.BROWSER;
process.env.API_SERVER = 'https://relevant.community';

const { _request } = require('utils/api');

jest.mock('../../server/api/user/user.controller', () => {
  return {
    test: jest.fn(params => params)
  };
});

const { test } = require('../../server/api/user/user.controller');

const getStore = () => ({
  community: {
    active: 'relevant'
  }
});

const options = {
  query: { search: 'user' },
  params: { _id: '123' },
  endpoint: 'user',
  path: 'test',
  method: 'POST',
  body: { data: 'some data' }
};

describe('server-side request', () => {
  it('generate correct fetch request', async () => {
    await _request(options, getStore);
    expect(test).toMatchSnapshot();
    expect(test).toBeCalled();
  });
});
