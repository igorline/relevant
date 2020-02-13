import React from 'react';
import renderer from 'react-test-renderer';
import SplashComponent from 'modules/web_splash/splash.component';
import 'jest-styled-components';
import { MemoryRouter } from 'react-router-dom';

const props = {
  cta: 'SIGN_UP'
};

jest.mock('react-redux', () => {
  return {
    useDispatch: () => {},
    connect: el => el
  };
});

test('Snapshot SplashComponent', () => {
  const tree = renderer
    .create(
      <MemoryRouter>
        <SplashComponent {...props} overRideDismiss />
      </MemoryRouter>
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
