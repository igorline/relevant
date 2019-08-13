import { useSelector } from 'react-redux';

export const useCommunity = () =>
  useSelector(state => state.community.communities[state.community.active]);
