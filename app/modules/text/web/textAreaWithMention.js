import React, { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import TextareaAutosize from 'react-textarea-autosize';
import { searchUser } from 'modules/user/user.actions';
import { View, StyledTextareaAutocomplete } from 'modules/styled/web';
import { CTALink } from 'modules/styled/uni';
import styled from 'styled-components';
import { colors } from 'app/styles';
import AvatarBox from 'modules/user/avatarbox.component';
import CommentBody from 'modules/comment/commentBody';
import sizing from 'styles/sizing';

const UserSelect = styled(View)`
  cursor: pointer;
  &:hover {
    background: ${colors.lightGrey};
  }
`;

TextAreaWithMention.propTypes = {
  textArea: PropTypes.shape({ current: PropTypes.any }),
  value: PropTypes.string,
  autoFocus: PropTypes.bool,
  leftPadding: PropTypes.number,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  setFocused: PropTypes.func,
  withPreview: PropTypes.bool,
  children: PropTypes.node,
  placeholder: PropTypes.string,
  minheight: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
};

export default function TextAreaWithMention({
  textArea,
  value,
  autoFocus,
  leftPadding,
  onChange,
  onBlur,
  setFocused,
  children,
  withPreview,
  placeholder,
  minheight
}) {
  const dispatch = useDispatch();
  const innerTextAreaRef = useRef();
  const [mode, setMode] = useState('write');

  const showWrite = mode === 'write';
  const showPreview = mode === 'preview';

  useEffect(() => {
    return () => dispatch(searchUser());
  }, []); // eslint-disable-line

  return (
    <View fdirection="column">
      {withPreview && (
        <View mb={0.5}>
          <View p={'.5 1'} mr={1}>
            <CTALink
              c={colors.black}
              td={showWrite ? 'underline' : ''}
              onPress={() => setMode('write')}
              p={1}
            >
              Write
            </CTALink>
          </View>
          <View p={'.5 1'}>
            <CTALink
              c={colors.black}
              td={showPreview ? 'underline' : ''}
              onPress={() => setMode('preview')}
              p={1}
            >
              Preview Markdown
            </CTALink>
          </View>
        </View>
      )}
      {showWrite && (
        <View
          fdirection="row"
          justify-="space-between"
          align="flex-start"
          m="0 0 2.5 0"
          flex={1}
          position={'relative'}
        >
          <StyledTextareaAutocomplete
            containerStyle={{
              display: 'flex',
              flex: 'auto',
              flexDirection: 'column'
            }}
            listStyle={{
              display: 'flex',
              flexWrap: 'wrap',
              listStyleType: 'none',
              padding: 0
            }}
            style={{ flex: 'auto' }}
            innerRef={c => (textArea.current = c)}
            ref={c => (innerTextAreaRef.current = c)}
            rows={2}
            placeholder={placeholder}
            value={value}
            // onKeyDown={handleKeydown}
            onChange={onChange}
            m={0}
            flex={1}
            autoFocus={!!autoFocus}
            pl={leftPadding}
            minheight={minheight}
            onFocus={() => {
              setFocused && setFocused(true);
              setTimeout(() => {
                const p = innerTextAreaRef.current.getCaretPosition();
                if (p === 0) innerTextAreaRef.current.setCaretPosition(value.length);
              });
            }}
            // bug with autocomplete
            // https://github.com/webscopeio/react-textarea-autocomplete/issues/178
            onBlur={e => {
              e.type === 'blur' && onBlur && onBlur(e);
              e.type === 'blur' && setFocused && setFocused(false);
            }}
            textAreaComponent={{ component: TextareaAutosize, ref: 'inputRef' }}
            loadingComponent={() => <span>Loading</span>}
            trigger={{
              '@': {
                dataProvider: async token => {
                  const users = await dispatch(searchUser(token));
                  return users.map(u => ({
                    user: u,
                    name: u.handle
                  }));
                },
                component: Item,
                output: item => '@' + item.name
              }
            }}
          />
          {children}
        </View>
      )}
      {showPreview && (
        <View
          minheight={minheight || sizing(8)}
          p={'1 2 0 2'}
          mb={2}
          fjustify={'center'}
          border={colors.lightBorder}
        >
          <CommentBody noLink comment={{ body: value }} noPostLink />
        </View>
      )}
    </View>
  );
}

Item.propTypes = {
  entity: { user: PropTypes.object }
};

function Item({ entity }) {
  return (
    <UserSelect p={'1 2 1 1'}>
      <AvatarBox user={entity.user} noLink />
    </UserSelect>
  );
}
