import React from 'react';
import renderer from 'react-test-renderer';
import AvatarBox from 'modules/user/mobile/avatar.component';

const user = { _id: 123, handle: 'handle', name: 'Name', relevance: { pagerank: 10 } };
const postTime = '1 day ago';

const props = {
  user,
  relevance: false,
  postTime,
  setSelected: jest.fn()
};

test('Snapshot AvatarBox Styled', () => {
  const tree = renderer.create(<AvatarBox {...props} />).toJSON();
  expect(tree).toMatchSnapshot();
});
