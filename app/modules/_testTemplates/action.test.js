import { setUser } from 'modules/auth/auth.actions';
import * as types from 'app/core/actionTypes';

describe('actions', () => {
  it('should create an action to add a todo', () => {
    const user = { _id: 1, handle: 'test' };
    const expectedAction = {
      type: types.SET_USER,
      payload: user
    };
    expect(setUser(user)).toEqual(expectedAction);
  });
});
