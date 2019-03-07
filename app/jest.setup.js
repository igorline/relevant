// const ULink = require('../__mocks__/ULink.component').default;
jest.mock('modules/navigation/ULink.component', () => {
  const ULink = require('../__mocks__/ULink.component');
  return ULink;
});
