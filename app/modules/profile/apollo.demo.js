import React, { useEffect } from 'react';
import { View, BodyText } from 'modules/styled/uni';
import { useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';

const SUBSCRIBE = gql`
  subscription {
    userUpdated {
      _id
      balance
      handle
      name
      email
    }
  }
`;

const GET_ME = gql`
  query {
    me(filter: { handle: "slava" }) {
      _id
      handle
      balance
      name
      email
    }
  }
`;

export default function Test() {
  const { data, loading, error, subscribeToMore } = useQuery(GET_ME);
  useEffect(() => {
    const unsubscribe = subscribeToMore({ document: SUBSCRIBE });
    return () => unsubscribe();
  }, [subscribeToMore]);
  if (loading) return <BodyText>Loading...</BodyText>;
  if (error) return <BodyText>ERROR: {error.message}</BodyText>;
  return (
    <View>
      <BodyText>
        handle: {data.me.handle}, email: {data.me.email}, balance={data.me.balance}
      </BodyText>
    </View>
  );
}
