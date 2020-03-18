import React from 'react';
import Enzyme, { mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import AvatarBox, { Name } from 'modules/user/avatarbox.component';
import { MemoryRouter } from 'react-router-dom';

Enzyme.configure({ adapter: new Adapter() });

const user = { _id: 123, handle: 'handle', name: 'Name', relevance: { pagerank: 10 } };
const postTime = new Date().toISOString();

jest.mock('react-redux', () => {
  return {
    useDispatch: () => {},
    connect: el => el
  };
});

function setup() {
  const props = {
    user,
    relevance: false,
    postTime,
    setSelected: jest.fn()
  };

  const enzymeWrapper = mount(
    <MemoryRouter>
      <AvatarBox {...props} />
    </MemoryRouter>
  );

  return {
    props,
    enzymeWrapper
  };
}

describe('components', () => {
  describe('AvatarBox', () => {
    it('should render self and subcomponents', () => {
      const { enzymeWrapper } = setup();
      expect(
        enzymeWrapper
          .find(Name.displayName)
          .first()
          .text()
      ).toBe(`${user.name}`);
      // expect(enzymeWrapper
      // .find(HandleText.displayName).text()).toBe(`@${user.handle} ${postTime}`);
    });

    // it('should call addTodo if length of text is greater than 0', () => {
    //   const { enzymeWrapper, props } = setup();

    //   // this is a workaround for onPress action
    //   enzymeWrapper.find(Wrapper.displayName)
    //   .first()
    //   .props()
    //   .onPress();
    //   expect(props.setSelected.mock.calls.length).toBe(1);
    // });
  });
});
