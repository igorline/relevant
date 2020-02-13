import React from 'react';
import renderer from 'react-test-renderer';
import Banner from 'modules/navigation/banner';
import 'jest-styled-components';
import { MemoryRouter } from 'react-router-dom';

const props = {
  cta: 'SIGN_UP'
};

jest.mock('react-redux', () => {
  const state = {
    navigation: { screenSize: 0 }
  };
  return {
    useDispatch: () => {},
    connect: el => el,
    useSelector: fn => fn(state)
  };
});

test('Snapshot SplashComponent', () => {
  const tree = renderer
    .create(
      <MemoryRouter>
        <Banner {...props} overRideDismiss />
      </MemoryRouter>
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
