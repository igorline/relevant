import { useSelector } from 'react-redux';
import {
  useQuery,
  useApolloClient,
  useMutation,
  useSubscription
} from '@apollo/react-hooks';
import { MY_MEMBERSHIPS, CLEAR_UNREAD, INC_UNREAD } from './queries';

export function useUnread(community, active) {
  const myMemberships = useMembers();
  const membership =
    myMemberships && myMemberships.find(m => m.communityId === community._id);
  const unread = membership && membership.unread;
  useSubscribeToUnread(membership);
  useResetUnread(unread, membership, active);
  return unread;
}

export function useTotalUnread() {
  const myMemberships = useMembers();
  return myMemberships.reduce((a, m) => a + m.unread, 0);
}

export function useMembers() {
  const user = useSelector(state => state.auth.user);
  const { data = { myMemberships: [] } } = useQuery(MY_MEMBERSHIPS, {
    skip: !user,
    ssr: false
  });
  const { myMemberships } = data;
  return myMemberships;
}

function useSubscribeToUnread(membership) {
  const myMemberships = useMembers();
  const client = useApolloClient();
  const { communityId } = membership || {};
  useSubscription(INC_UNREAD, {
    ssr: false,
    variables: { communities: [communityId] },
    onSubscriptionData: () => {
      membership.unread++;
      client.writeQuery({ query: MY_MEMBERSHIPS, data: { myMemberships } });
    }
  });
}

function useResetUnread(unread, membership, active) {
  const client = useApolloClient();
  const [clearUnread] = useMutation(CLEAR_UNREAD);
  const myMemberships = useMembers();

  if (unread && active) {
    membership.unread = 0;
    client.writeQuery({ query: MY_MEMBERSHIPS, data: { myMemberships } });
    clearUnread({ variables: { _id: membership._id } });
  }
}
