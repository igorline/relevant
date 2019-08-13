import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components/primitives';
import { numbers } from 'app/utils';
import Thumb from './thumb.component';

const Container = styled.View`
  position: absolute
  z-index: 10000;
  left: 0;
  top: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export default function DownvoteAnimation() {
  const [animEls, setAnimEls] = useState({});

  const animation = useSelector(state => state.animation);
  const { downvote: irrelevantAnimation } = animation;

  function destroy(key) {
    setAnimEls(els => {
      const { [key]: removeEl, ...newEls } = els;
      return newEls;
    });
  }

  function runAnimation() {
    const parent = animation.parents.downvote;
    if (!parent) return;
    const key = numbers.guid();
    const newEl = {
      [key]: <Thumb destroy={destroy} parent={parent} key={key} id={key} />
    };
    setAnimEls(els => ({ ...els, ...newEl }));
  }

  useEffect(() => {
    runAnimation();
  }, [irrelevantAnimation]);

  return <Container pointerEvents={'none'}>{Object.values(animEls)}</Container>;
}
