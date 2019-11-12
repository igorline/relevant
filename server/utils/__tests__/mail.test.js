import {
  addUserToEmailList,
  mailgun,
  removeFromEmailList,
  updateUserEmail,
  getMLUser
} from 'server/utils/mail';
import { getUsers } from 'server/test/seedData';

process.env.TEST_SUITE = 'email';

const { MAILGUN_API_KEY, MAILGUN_DOMAIN, MAILER_LITE_KEY } = process.env;

const SHOULD_RUN_TEST = MAILGUN_API_KEY && MAILGUN_DOMAIN && MAILER_LITE_KEY;

describe('email list', () => {
  const list = mailgun.lists('test@mail.relevant.community');
  const newEmail = 'new@new.email';
  let alice;

  if (!SHOULD_RUN_TEST) {
    test.only('skip email test', () => {
      // eslint-disable-next-line
      console.warn(`missing MAILGUN_API_KEY and MAILGUN_DOMAIN, skipping email test`);
    });
  }

  beforeAll(async () => {
    if (SHOULD_RUN_TEST) {
      ({ alice } = getUsers());
      await removeFromEmailList(alice);
      await removeFromEmailList({ email: newEmail });
    }
  });

  test('should add user to email list', async () => {
    delete alice.email;
    await addUserToEmailList(alice);
    const { member } = await getMember(list, alice.email);
    expect(member.name).toBe('@' + alice.handle);
    expect(member.address).toBe(alice.email);

    const mlUser = await getMLUser(alice.email);
    expect(mlUser.name).toBe('@' + alice.handle);
    expect(mlUser.email).toBe(alice.email);
  });

  test('should update user email', async () => {
    const oldEmail = alice.email;
    alice.email = 'new@new.email';
    await updateUserEmail(alice, oldEmail);
    const { member } = await getMember(list, alice.email);
    expect(member.name).toBe('@' + alice.handle);
    expect(member.address).toBe(alice.email);

    const mlUser = await getMLUser(alice.email);
    expect(mlUser.name).toBe('@' + alice.handle);
    expect(mlUser.email).toBe(alice.email);

    const { member: oldRecord } = await getMember(list, oldEmail);
    expect(oldRecord).toBe(null);

    // No great way to test this
    // const oldMlUser = await getMLUser(oldEmail);
    // expect(oldMlUser).toBe(null);
  });

  test('should remove user from list', async () => {
    await removeFromEmailList(alice);
    const { member } = await getMember(list, alice.email);
    expect(member).toBe(null);

    // No great way to test this
    // const oldMlUser = await getMLUser(alice.email);
    // expect(oldMlUser).toBe(null);
  });
});

async function getMember(list, email) {
  return new Promise(resolve =>
    list.members(email).info((err, data) => {
      if (err) return resolve({ member: null }); // eslint-disable-line
      return resolve(data);
    })
  );
}
