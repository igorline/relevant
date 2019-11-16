import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components/primitives';
import { isNative } from 'styles';
import Vote from './vote.component';
import VoteNumber from './upvoteNumber.component';

const HANDLE_ANIMATIONS = ['upvote', 'bet'];

const Container = styled.View`
  position: ${isNative ? 'absolute' : 'fixed'};
  z-index: 10000;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
`;

export default function UpvoteAnimation() {
  const type = useSelector(state => state.animation.currentType);
  const { index, parent, horizontal, amount } = useSelector(state =>
    HANDLE_ANIMATIONS.includes(type) ? state.animation[type] : {}
  );

  const [voteEls, setVoteEls] = useState([]);
  const [numEls, setNumEls] = useState([]);

  useEffect(() => {
    function initAnimation() {
      if (!parent) return;
      setVoteEls([...Array(10).keys()]);
      if (!amount) return;
      setNumEls([...Array(1).keys()]);
    }
    initAnimation();

    return () => {
      setVoteEls([]);
      setNumEls([]);
    };
  }, [index, parent, amount]);

  if (!HANDLE_ANIMATIONS.includes(type)) return null;

  function destroy(key, coinKey) {
    if (typeof key === 'number') {
      setVoteEls(els => [...els.slice(0, key), ...els.slice(key + 1)]);
    }
    if (typeof coinKey === 'number') {
      setNumEls(els => [...els.slice(0, coinKey), ...els.slice(coinKey + 1)]);
    }
  }

  return (
    <Container pointerEvents={'none'}>
      {voteEls.map(i => (
        <Vote
          type={type}
          horizontal={horizontal}
          destroy={destroy}
          parent={parent}
          key={i}
          specialKey={i}
        />
      ))}
      {numEls.map(i => (
        <VoteNumber
          destroy={destroy}
          parent={parent}
          amount={amount}
          key={i}
          specialKey={i}
          horizontal={horizontal}
        />
      ))}
    </Container>
  );
}
