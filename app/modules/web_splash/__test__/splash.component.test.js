import React from 'react';
import renderer from 'react-test-renderer';
import SplashComponent from 'modules/web_splash/splash.component';
import 'jest-styled-components';
import { MemoryRouter } from 'react-router-dom';

const props = {
  cta: <div> CTA WORKS</div>
};

test('Snapshot SplashComponent', () => {
  const tree = renderer
  .create(
    <MemoryRouter>
      <SplashComponent {...props} />
    </MemoryRouter>
  )
  .toJSON();
  expect(tree).toMatchSnapshot();
});
