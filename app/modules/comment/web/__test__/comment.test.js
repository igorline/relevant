import { act } from 'react-test-renderer';
import { CommentFormComponent } from 'modules/comment/web/commentForm.component';
import 'jest-styled-components';
import { post, user } from 'mockdata';
import { withRenderer } from 'jest.setup';

const state = {
  auth: { user: user.user1, isAuthenticated: true },
  navigation: { screenSize: 0 }
};

const props = {
  nestingLevel: 0,
  buttonText: 'Comment',
  parentPost: post.linkPost1,
  comment: post.post1,
  additionalNesting: 0,
  history: {}
};

test('Snapshot Comment Form Web', async () => {
  const tree = withRenderer({
    state,
    props,
    Component: CommentFormComponent
  });

  const textArea = tree.root.find(el => el.type === 'textarea');

  act(() => {
    textArea.props.onFocus();
    textArea.props.onChange({ target: { value: 'test input' } });
  });

  expect(textArea.props.value).toBe('test input');
  expect(tree.toJSON()).toMatchSnapshot();

  const buttons = tree.root.findAll(el => el.type === 'button');
  const cancel = buttons.find(b => b.children[0] === 'Cancel');

  act(() => {
    textArea.props.onChange({ target: { value: '' } });
    cancel.props.onMouseDown({});
  });
  expect(textArea.props.value).toBe('');
});
