import React from 'react';
import renderer from 'react-test-renderer';
import SplashComponent from 'modules/navigation/banner';
import 'jest-styled-components';
import { MemoryRouter } from 'react-router-dom';

const props = {
  cta: 'SIGN_UP'
};

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
