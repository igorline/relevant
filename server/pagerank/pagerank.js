// The PageTrust algorithm
/* eslint no-console: 0 */
import initMatrix from './initMatrix';

export default function pagerank(inputs, params) {
  if (!params) params = {};
  if (!params.alpha) params.alpha = 0.97;
  if (!params.personalization) params.personalization = null;
  if (!params.max_iter) params.max_iter = 500;
  if (!params.tol) params.tol = 1.0e-6;
  if (!params.weight) params.weight = 'weight';
  if (!params.negative) params.negative = 'negative';
  if (!params.beta) params.beta = 2;
  if (!params.M) params.M = 1;
  if (!params.fast) params.fast = false;
  if (!params.debug) params.debug = false;

  const now = new Date();
  const { g, N, dictionary, danglingNodes, degreeStore, personalization } = initMatrix(
    inputs,
    params
  );
  const p = setupTrustSeed({ personalization, N, dictionary, g });
  const danglingWeights = initDanglingWeights(params.dangling, p, N);
  let x = initialRank({ params, p, dictionary, N });

  params.debug &&
    console.log('matrix setup time ', (new Date().getTime() - now) / 1000 + 's');

  let iter;
  let err;

  params.alpha = Math.max(1 - 1 / (2 * N), params.alpha);

  for (iter = 0; iter < params.max_iter; iter++) {
    // this enables garbage collector to free up memory between iterations
    ({ x, err } = runLoop(
      {
        x,
        p,
        g,
        N,
        danglingNodes,
        danglingWeights
      },
      params
    ));

    if (err < N * params.tol && iter > 1) {
      params.debug && console.log('iterations ', iter);
      params.debug && console.log(err);
      const elapsed = new Date().getTime() - now.getTime();
      params.debug && console.log('elapsed time: ', elapsed / 1000, 's');
      return formatOutput(x, dictionary, inputs, params, degreeStore);
    }
  }

  console.warn(
    'pagerank: power iteration failed to converge in ' + params.iter_max + ' iterations.'
  );
  return formatOutput(x, dictionary, inputs, params, degreeStore);
}

function setupTrustSeed({ N, dictionary, g, personalization }) {
  // if we don't have a personalization vector, initial trust gets spread over all nodes
  if (!personalization) return new Array(N).fill(1.0 / N);

  const p = new Array(N).fill(0);
  const keys = Object.keys(personalization);
  const degree = keys.reduce((prev, key) => prev + personalization[key], 0);
  keys.forEach(key => {
    p[dictionary[key]] = personalization[key] / degree;
    for (let j = 0; j < N; j++) {
      if (!g[dictionary[key]]) g[dictionary[key]] = { inputs: {} };
      if (!g[dictionary[key]].inputs[j]) g[dictionary[key]].inputs[j] = 0;
    }
  });
  return p;
}

function initDanglingWeights(danglingVector, p) {
  // TODO use a node to direct dangling nodes
  return danglingVector || p;
  // return new Array(N).fill(1.0 / N);
}

function initialRank({ params, p, dictionary, N }) {
  if (!params.nstart) return [...p];

  const x = new Array(N).fill(0);
  const keys = Object.keys(params.nstart);
  const degree = keys.reduce((prev, key) => params.nstart[key] + prev, 0);
  let sum = 0;
  keys.forEach(key => {
    if (!degree) return;
    const i = dictionary[key];
    x[i] = params.nstart[key];
    sum += x[i];
  });
  params.debug && console.log('start sum ', sum);
  return x;
}

function runLoop(loopParams, params) {
  let { x } = loopParams;
  const { p, g, N, danglingNodes, danglingWeights } = loopParams;

  const xlast = [...x];
  x = new Array(N).fill(0);

  let danglesum = 0;
  danglingNodes.forEach(node => (danglesum += xlast[node]));
  danglesum *= params.alpha;

  // Iterate through nodes;
  for (let i = 0; i < N; i++) {
    const upvotes = g[i] ? Object.keys(g[i].inputs) || [] : [];
    for (let key = 0; key < upvotes.length; key++) {
      const j = upvotes[key];
      x[i] += params.alpha * g[i].inputs[j] * xlast[j];
    }

    x[i] += (1.0 - params.alpha) * p[i];

    // add the weights from dangling nodes to make sure sum is 1
    x[i] += danglesum * danglingWeights[i];
  }

  // normalize
  const sum = x.reduce((prev, next) => prev + next, 0);

  let err = 0.0;
  x = x.map((el, i) => {
    el /= sum;
    err += Math.abs(el - xlast[i]);
    return el;
  });

  if (params.debug) {
    const { heapUsed } = process.memoryUsage();
    const mb = Math.round((100 * heapUsed) / 1048576) / 100;
    console.log('Iter - program is using', mb, 'MB of Heap.');
  }

  return { x, err };
}

function formatOutput(x, dictionary, inputs, params, degreeStore) {
  const result = {};
  Object.keys(inputs).forEach(
    (node, i) => (result[node] = { rank: x[i], degree: degreeStore[node] })
  );
  return result;
}
