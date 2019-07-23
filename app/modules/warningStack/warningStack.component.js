import React, { Fragment } from 'react';
import { Button, BodyText, Title } from 'modules/styled/uni';
import { Warning } from './warningStack.styles';
// import Modal from 'modules/ui/web/modal';

// TODO -- Add custom amount, account support
export function renderWarning(warning, connectAddress) {
  return (
    <Fragment>
      <Warning id={warning.id} styling={warning.styling}>
        <Title>{warning.title}</Title>
        <BodyText>{warning.message}</BodyText>
      </Warning>
      {getCorrectButton(warning, connectAddress)}
    </Fragment>
  );
}

// eslint-disable-next-line react/prop-types
export function getCorrectButton({ id, buttonText, onClick }, connectAddress) {
  return id === 1 ? (
    <Button mr={'auto'} mt={4} onClick={() => onClick()}>
      {buttonText}
    </Button>
  ) : id === 2 ? (
    <Button mr={'auto'} mt={4} onClick={() => connectAddress()}>
      {buttonText}
    </Button>
  ) : (
    <Button mr={'auto'} mt={4} disabled={true}>
      {buttonText}
    </Button>
  );
}

// Own modal implementation
// export const WarningStack = ({ warningStack, visible, close, children }) =>
//   visible ? (
//     <Modal visible={visible} close={close} title={warningStack[0].title}>
//       {children}
//     </Modal>
//   ) : (
//     <Fragment>{children}</Fragment>
//   );
