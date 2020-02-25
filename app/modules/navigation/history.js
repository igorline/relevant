import { createBrowserHistory } from 'history';
import { isNative } from 'app/styles';

const isNode = !process.env.BROWSER;
const history = !isNative && !isNode && createBrowserHistory();

export default history;
