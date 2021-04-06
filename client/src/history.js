import createHistory from "history/createBrowserHistory";
const history = createHistory();
export const history1 = createHistory();

history.pushLater = (...args) => setImmediate(() => history.push(...args));
history1.pushLater = (...args) => setImmediate(() => history1.push(...args));
export default history;
