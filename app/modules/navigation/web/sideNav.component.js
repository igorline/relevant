import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import styled from 'styled-components';
import NavProfileComponent from 'modules/profile/navProfile.component';
import CommunityNav from 'modules/community/communityNav.component';
import SideNavFooter from 'modules/navigation/sideNavFooter.component';
import { colors, layout, mixins } from 'app/styles';
import { showModal } from 'modules/navigation/navigation.actions';
import ULink from 'modules/navigation/ULink.component';
import { Image, View } from 'modules/styled/web';

const SideNavContent = styled.div`
  position: sticky;
  background: ${colors.secondaryBG};
  width: ${layout.sideNavWidth};
  max-width: ${layout.sideNavWidth};
  ${layout.universalBorder('right')}
  display: flex;
  z-index: 100;
  height: 100vh;
  top: 0;
`;

const SideNavScroll = styled.div`
  flex-direction: column;
  display: block;
  overflow: scroll;
  flex: 1;
  width: ${layout.sideNavWidth};
`;

const LogoContainer = styled.div`
  position: sticky;
  background: ${colors.secondaryBG};
  height: ${layout.headerHeight};
  top: 0;
  z-index: 10;
  flex: 1;
  ${mixins.border}
`;

const SideNav = props => {
  const logoLink = `/${props.community || 'relevant'}/new`;
  return (
    <SideNavContent flex={1} className={props.className}>
      <SideNavScroll flex={1}>
        <LogoContainer bb>
          <ULink align={'flex-start'} to={logoLink}>
            <View pl={4} h={layout.headerHeight} align={'center'} fdirection={'row'}>
              <Image
                h={4}
                w={22}
                resizeMode={'contain'}
                src={'/img/logo-opt.png'}
                alt={'Relevant'}
              />
            </View>
          </ULink>
        </LogoContainer>
        <View flex={1}>
          <NavProfileComponent />
        </View>
        <View flex={1}>
          <CommunityNav {...props} />
        </View>
        <SideNavFooter />
      </SideNavScroll>
    </SideNavContent>
  );
};

SideNav.propTypes = {
  className: PropTypes.string,
  actions: PropTypes.object,
  community: PropTypes.string
};

const mapStateToProps = state => ({
  community: state.auth.community,
  isAuthenticated: state.auth.isAuthenticated
});

export default connect(
  mapStateToProps,
  dispatch => ({
    actions: bindActionCreators({ showModal }, dispatch)
  })
)(SideNav);
