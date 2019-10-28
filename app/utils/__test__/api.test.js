import { _request } from 'utils/api';
import fetchMock from 'fetch-mock';

fetchMock.post('*', { hello: 'world' });

const getStore = () => ({
  community: {
    active: 'relevant'
  }
});

const options = {
  query: { search: 'user' },
  params: { _id: '123' },
  endpoint: 'user',
  method: 'POST',
  body: { data: 'some data' }
};

describe('client request', () => {
  it('generate correct fetch request', async () => {
    await _request(options, getStore);
    expect(fetchMock.lastCall()).toMatchSnapshot();
  });
});
