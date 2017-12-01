
function eigenTrust(users, params) {
  const defaults = {
    alpha: 0.95,
    error: 0.0001,
    maxIter: 200,
    initialTrust: [],
  };
  let { alpha, error, maxIter, initalTrust } = { ...defaults, ...params };



}

export default eigenTrust;