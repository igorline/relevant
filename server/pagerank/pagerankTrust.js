// The PageTrust algorithm based on:
// How to rank web pages when negative links are allowed?
// http://perso.uclouvain.be/paul.vandooren/publications/deKerchoveV08b.pdf
// And eigentrust/egentrust++

/* eslint no-loop-func: 0 */
/* eslint camelcase: 0 */
/* eslint no-console: 0 */

// const ADMIN_VOTES = 100;

const ADMIN_MAX_POWER_VOTES = 50;

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

  const pgParams = objectToMatrix(inputs, params);

  const { neg, g, N, dictionary, danglingNodes, danglingObj, degreeStore } = pgParams;
  let { P, avoid } = pgParams;

  let p = new Array(N).fill(0);
  if (!params.personalization) {
    p = new Array(N).fill(1.0 / N);
  } else {
    const keys = Object.keys(params.personalization);
    const degree = keys.reduce((prev, key) => prev + params.personalization[key], 0);
    keys.forEach(key => {
      p[dictionary[key]] = params.personalization[key] / degree;
      for (let j = 0; j < N; j++) {
        if (!g[dictionary[key]]) g[dictionary[key]] = { inputs: {} };
        if (!g[dictionary[key]].inputs[j]) g[dictionary[key]].inputs[j] = 0;
      }
    });
  }

  let danglingWeights = [];
  if (!params.dangling) {
    // Use personalization vector if dangling vector not specified
    danglingWeights = p;
  } else {
    danglingWeights = new Array(N).fill(1 / N);
  }

  let x;
  if (!params.nstart) {
    x = [...p];
  } else {
    x = new Array(N).fill(0);
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
  }

  params.debug &&
    console.log('matrix setup time ', (new Date().getTime() - now) / 1000 + 's');

  let tildeP = P.map(arr => arr.slice());
  let iter;
  let err;

  params.alpha = Math.max(1 - 1 / N, params.alpha);

  for (iter = 0; iter < params.max_iter; iter++) {
    // this enables garbage collector to free up memory
    // between iterations
    ({ x, err, P, tildeP, avoid } = runLoop(
      {
        x,
        p,
        tildeP,
        P,
        g,
        N,
        danglingNodes,
        avoid,
        danglingWeights,
        danglingObj,
        neg,
        iter
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

function runLoop(loopParams, params) {
  const { tildeP, P } = loopParams;
  let {
    x,
    avoid,
    p,
    g,
    N,
    danglingNodes,
    danglingWeights,
    danglingObj,
    neg
  } = loopParams;

  let upvotes;
  let transitions;
  let Ti;

  let xlast = [...x];

  x = new Array(N).fill(0);
  const lastP = P.map(arr => arr.slice());

  let danglesum = 0;
  danglingNodes.forEach(node => (danglesum += xlast[node]));
  danglesum *= params.alpha;

  // Iterate through nodes;
  for (let i = 0; i < N; i++) {
    Ti = {};
    if (p[i]) {
      // Optimized TNi
      xlast.map((xl, j) => (Ti[j] = xl * params.M * (1 - params.alpha) * p[i]));
    }
    upvotes = [];
    if (g[i]) {
      upvotes = Object.keys(g[i].inputs) || [];
    }

    upvotes.forEach(j => {
      x[i] += params.alpha * g[i].inputs[j] * xlast[j];
      // Optimized TNi
      Ti[j] = (Ti[j] || 0) + params.alpha * g[i].inputs[j] * xlast[j];
    });

    transitions = Object.keys(Ti) || [];

    x[i] += (1.0 - params.alpha) * p[i] + danglesum * danglingWeights[i];

    const denom = x[i] || 1;

    x[i] *= (1 - tildeP[i][i]) ** params.beta;

    // UPDATE tildeP
    // TODO can use cacheTildeP but need to create one per community
    if (!params.fast) {
      avoid.forEach(j => {
        tildeP[i][j] = 0;

        transitions.forEach(k => {
          tildeP[i][j] += (Ti[k] / denom) * lastP[k][j];
        });

        // UPDATE P
        if (neg[i] && neg[i][j]) P[i][j] = neg[i][j];
        else if (i === j) P[i][j] = 0;
        else P[i][j] = tildeP[i][j];

        if (P[i][j] > 0.0 && !danglingObj[i] && avoid.indexOf(i) < 0) {
          avoid = [...new Set([...avoid, i])];
        }
      });
    }
    upvotes = null;
    Ti = null;
    transitions = null;

    // if (params.debug) {
    //   const { heapUsed } = process.memoryUsage();
    //   const mb = Math.round((100 * heapUsed) / 1048576) / 100;
    //   console.log('step - program is using', mb, 'MB of Heap.');
    //   console.log('avoid length', avoid.length, N);
    // }
  }

  // normalize
  let sum = x.reduce((prev, next) => prev + next, 0);

  let err = 0.0;
  x = x.map((el, i) => {
    el /= sum;
    err += Math.abs(el - xlast[i]);
    return el;
  });

  xlast = null;
  sum = null;
  p = null;

  g = null;
  danglingNodes = null;
  danglingWeights = null;
  danglingObj = null;
  neg = null;
  // lastP = null;
  // tildeP = null;
  // P = null;

  if (params.debug) {
    const { heapUsed } = process.memoryUsage();
    const mb = Math.round((100 * heapUsed) / 1048576) / 100;
    console.log('Iter - program is using', mb, 'MB of Heap.');
    // console.log('avoid length', avoid.length, N, err);
    // console.log('tildeP', tildeP);
  }
  N = null;
  // avoid = null;

  return { x, err, P, tildeP, avoid, lastP };
}

function objectToMatrix(_inputs, params) {
  const inputs = Object.keys(_inputs);
  const dictionary = {};
  inputs.forEach((key, i) => (dictionary[key] = i));
  const N = inputs.length;
  // const G = [];
  const g = {};
  const neg = {};
  const P = [];
  let avoid = [];
  const danglingNodes = [];
  const danglingObj = {};
  const degreeStore = {};

  inputs.forEach((el, i) => {
    // const upvotes = new Array(N).fill(0);
    const downvotes = new Array(N).fill(0);

    let degree = 0;
    Object.keys(_inputs[el]).forEach(vote => {
      let w = _inputs[el][vote][params.weight];
      const n = _inputs[el][vote][params.negative] || 0;
      // eigentrust++ weights
      // w = Math.max((w - n) / (w + n), 0);
      // eigentrust weights
      w = Math.max(w - n, 0);
      _inputs[el][vote].w = w;
      // TODO - count only positive in degree and normalize?
      if (w > 0) degree += w;
    });

    if (degree === 0) {
      danglingNodes.push(i);
      danglingObj[i] = true;
      degree = 1;
    }
    degreeStore[el] = degree;
    const id_i = dictionary[el];

    if (params.personalization[el]) {
      const adminWeight = 1 / (1 + Math.E ** (6 - (degree * 10) / ADMIN_MAX_POWER_VOTES));
      // console.log(degree, adminWeight);
      params.personalization[el] = adminWeight;
      // params.personalization[el] *
      // Math.min(degree, ADMIN_VOTES) / ADMIN_VOTES;
    }

    Object.keys(_inputs[el]).forEach(vote => {
      const { w } = _inputs[el][vote];
      let n = _inputs[el][vote][params.negative] || 0;
      // upvotes[dictionary[vote]] = w / degree;
      const j = dictionary[vote];

      g[j] = g[j] || {};
      g[j].inputs = g[j].inputs || {};
      g[j].inputsN = g[j].inputsN || {};
      g[j].inputs[id_i] = w / degree;

      if (n) {
        n /= _inputs[el][vote].total;
        neg[i] = neg[i] || {};
        neg[i][dictionary[vote]] = n;

        avoid = [...new Set([...avoid, i])];

        downvotes[dictionary[vote]] = n;
        g[j].inputsN[id_i] = n;
      }
    });
    // G[i] = upvotes;
    P[i] = downvotes;
  });

  if (params.debug) {
    const { heapUsed } = process.memoryUsage();
    const mb = Math.round((100 * heapUsed) / 1048576) / 100;
    console.log('Matrix - program is using', mb, 'MB of Heap.');
  }

  return { neg, g, N, P, dictionary, danglingNodes, avoid, danglingObj, degreeStore };
}

function formatOutput(x, dictionary, inputs, params, degreeStore) {
  const result = {};
  Object.keys(inputs).forEach(
    (node, i) => (result[node] = { rank: x[i], degree: degreeStore[node] })
  );
  return result;
}
