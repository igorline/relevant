import React, { Fragment } from 'react';
import { useSelector } from 'react-redux';
import QRCode from 'qrcode.react';
import { Header, BodyText, View } from 'modules/styled/uni';
import { colors } from 'styles';

export default function LinkMobile() {
  // TODO we should use a crypto wallet instead
  const token = useSelector(state => state.auth.token);
  return (
    <Fragment>
      <Header>Mobile Login</Header>
      <View
        p={2}
        mt={4}
        mb={4}
        ml={'auto'}
        mr={'auto'}
        alignSelf={'center'}
        border
        bc={colors.gray}
      >
        <QRCode value={token} />
      </View>
      <BodyText>
        Open the Relevant Mobile App, press "Link Desktop Account" and scan the QR code
      </BodyText>
    </Fragment>
  );
}
