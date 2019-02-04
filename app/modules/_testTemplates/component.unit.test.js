import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import AvatarBox, { Name, Wrapper, HandleText } from 'modules/user/avatarbox.component';

Enzyme.configure({ adapter: new Adapter() });

const user = { _id: 123, handle: 'handle', name: 'Name', relevance: { pagerank: 10 } };
const postTime = new Date().toISOString();

function setup() {
  const props = {
    user,
    relevance: false,
    postTime,
    setSelected: jest.fn()
  };

  const enzymeWrapper = shallow(<AvatarBox {...props} />);

  return {
    props,
    enzymeWrapper
  };
}

describe('components', () => {
  describe('AvatarBox', () => {
    it('should render self and subcomponents', () => {
      const { enzymeWrapper } = setup();

      expect(enzymeWrapper.find(Name.displayName).first()
      .text()).toBe(`${user.name}`);
      // expect(enzymeWrapper.find(HandleText.displayName).text()).toBe(`@${user.handle} ${postTime}`);
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

