import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components/primitives';
import { isNative } from 'styles';
import { numbers } from 'app/utils';
import Thumb from './thumb.component';

const Container = styled.View`
  position: ${isNative ? 'absolute' : 'fixed'};
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

  const { index, parent } = useSelector(state => state.animation.downvote || {});

  function destroy(key) {
    setAnimEls(els => {
      const { [key]: removeEl, ...newEls } = els;
      return newEls;
    });
  }

  useEffect(() => {
    function runAnimation() {
      if (!parent) return;
      const key = numbers.guid();
      const newEl = {
        [key]: <Thumb destroy={destroy} parent={parent} key={key} id={key} />
      };
      setAnimEls(els => ({ ...els, ...newEl }));
    }
    runAnimation();
  }, [index, parent]);

  return <Container pointerEvents={'none'}>{Object.values(animEls)}</Container>;
}
