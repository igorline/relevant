import gql from 'graphql-tag';

export const MY_MEMBERSHIPS = gql`
  query myMemberships($communityId: MongoID) {
    myMemberships(filter: { communityId: $communityId }) {
      _id
      unread
      user
      community
      communityId
      pagerank
    }
  }
`;

export const MEMBER_BY_ID = gql`
  query MemberById($_id: MongoID!) {
    memberById(_id: $_id) {
      _id
      unread
      user
      community
      communityId
      pagerank
    }
  }
`;

export const CLEAR_UNREAD = gql`
  mutation UpdateUnread($_id: ID!) {
    updateUnread(record: { _id: $_id, unread: 0 }) {
      record {
        _id
        unread
        pagerank
        embeddedUser {
          handle
        }
      }
    }
  }
`;

export const INC_UNREAD = gql`
  subscription IncrementUread($communities: [ID!]!) {
    updateUnread(communities: $communities) {
      communityId
      community
    }
  }
`;
