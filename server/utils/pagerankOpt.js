// The PageTrust algorithm based on:
// How to rank web pages when negative links are allowed?
// http://perso.uclouvain.be/paul.vandooren/publications/deKerchoveV08b.pdf
// And eigentrust/egentrust++

/* eslint no-loop-func: 0 */

function printM(m, name) {
  console.log(name, ':\n', JSON.stringify(m).replace(/\]\,\[/g, '],\n['));
}

// let cacheP;
// let cacheT;
// let cacheTildeP;
// let full = true;

function objectToMatrix(_inputs, params) {
  let inputs = Object.keys(_inputs);
  let dictionary = {};
  inputs.forEach((key, i) => dictionary[key] = i);
  let N = inputs.length;
  let G = [];
  let g = {};
  let neg = {};
  let P = [];
  let avoid = [];
  let danglingNodes = [];
  let danglingObj = {};

  inputs.forEach((el, i) => {
    let upvotes = new Array(N).fill(0);
    let downvotes = new Array(N).fill(0);

    let degree = 0;
    Object.keys(_inputs[el]).forEach(vote => {
      let w = _inputs[el][vote][params.weight];
      let n = _inputs[el][vote][params.negative] || 0;
      // eigentrust++ weights
      // w = Math.max((w - n) / (w + n), 0);
      // eigentrust weights
      w = Math.max((w - n), 0);
      _inputs[el][vote].w = w;
      if (w > 0) degree += w;
    });

    if (degree === 0) {
      danglingNodes.push(i);
      danglingObj[i] = true;
      degree = 1;
    }
    let id_i = dictionary[el];

    Object.keys(_inputs[el]).forEach(vote => {
      let w = _inputs[el][vote].w;
      let n = _inputs[el][vote][params.negative] || 0;
      upvotes[dictionary[vote]] = w / degree;
      let j = dictionary[vote];

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
    G[i] = upvotes;
    P[i] = downvotes;
  });

  // let u = dictionary['darkmatter'];
  // console.log('darkmatter', g[u]);
  // Object.keys(g[u].inputs).forEach(i => {
  //   let voter = Object.keys(_inputs)[i];
  //   console.log(voter, i);
  // });
  // printM(G, 'G');
  // printM(P, 'P');

  let heapUsed = process.memoryUsage().heapUsed;
  let mb = Math.round(100 * heapUsed / 1048576) / 100;
  console.log('Matrix - program is using', mb, 'MB of Heap.');

  return { neg, g, G, N, P, dictionary, danglingNodes, avoid, danglingObj };
}

function formatOutput(x, dictionary, inputs) {
  let result = {};
  Object.keys(inputs).forEach((node, i) => result[node] = x[i]);
  return result;
}

function runLoop(loopParams, params) {
  let {
    x,
    p,
    tildeP,
    P,
    g,
    avoid,
    danglingWeights,
    danglingObj,
    neg,
    xlast,
    danglesum,
    i,
    lastP
  } = loopParams;

  let upvotes;
  let transitions;
  let Ti;

  // Iterate through nodes;
  Ti = {};
  if (p[i]) {
    // Optimized TNi
    xlast.map((xl, j) => Ti[j] = xl * params.M * (1 - params.alpha) * p[i]);
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

  // if (dictionary['ann'] === i) {
  //   console.log(tildeP[i][i]);
  // }

  let denom = x[i] || 1;
  x[i] *= (1 - tildeP[i][i]) ** params.beta;

  // UPDATE tildeP
  // TODO can use cacheTildeP but need to create one per community
  if (!params.fast) {
    avoid.forEach(j => {
      tildeP[i][j] = 0;

      transitions.forEach(k => {
        tildeP[i][j] += Ti[k] / denom * lastP[k][j];
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
  transitions = null;
  Ti = null;
  xlast = null;
  lastP = null;
  return { x, P, tildeP, avoid };
}

export default function pagerank(inputs, params) {
  if (!params) params = {};
  if (!params.alpha) params.alpha = 0.85;
  if (!params.personalization) params.personalization = null;
  if (!params.max_iter) params.max_iter = 500;
  if (!params.tol) params.tol = 1.0e-6;
  if (!params.weight) params.weight = 'weight';
  if (!params.negative) params.negative = 'negative';
  if (!params.beta) params.beta = 2;
  if (!params.M) params.M = 1;
  if (!params.fast) params.fast = false;

  let now = new Date();

  let {
    neg,
    g,
    P,
    N,
    dictionary,
    danglingNodes,
    avoid,
    danglingObj
  } = objectToMatrix(inputs, params);

  let p = new Array(N).fill(0);
  if (!params.personalization) {
    p = new Array(N).fill(1.0 / N);
  } else {
    let keys = Object.keys(params.personalization);
    let degree = keys.reduce((prev, key) => prev + params.personalization[key], 0);
    keys.forEach(key => {
      p[dictionary[key]] = params.personalization[key] / degree;
      for (let j = 0; j < N; j++) {
        if (!g[dictionary[key]]) g[dictionary[key]] = { inputs: {} };
        if (!g[dictionary[key]].inputs[j]) g[dictionary[key]].inputs[j] = 0;
      }
    });
    // console.log('personalization ', p);
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
    // console.log('start ', params.nstart);
    x = new Array(N).fill(0);
    let keys = Object.keys(params.nstart);
    let degree = keys.reduce((prev, key) => params.nstart[key] + prev, 0);
    let sum = 0;
    keys.forEach(key => {
      if (!degree) return;
      let i = dictionary[key];
      x[i] = params.nstart[key];
      sum += x[i];
    });
    console.log('start sum ', sum);
  }

  console.log('matrix setup time ', ((new Date()).getTime() - now) / 1000 + 's');

  let tildeP = P.map(arr => arr.slice());
  let iter;
  let err;

  for (iter = 0; iter < params.max_iter; iter++) {
    let xlast = [...x];

    x = new Array(N).fill(0);
    let lastP = P.map(arr => arr.slice());

    let danglesum = 0;
    danglingNodes.forEach(node => danglesum += xlast[node]);
    danglesum *= params.alpha;

    for (let i = 0; i < N; i++) {
      // this enables garbage collector to free up memory
      // between iterations
      ({ x, P, tildeP, avoid } = runLoop({
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
        iter,
        xlast,
        danglesum,
        i,
        lastP
      }, params));
    }

    let heapUsed = process.memoryUsage().heapUsed;
    let mb = Math.round(100 * heapUsed / 1048576) / 100;
    console.log('Iter - program is using', mb, 'MB of Heap.');
    console.log('avoid length', avoid.length, N);

    // normalize
    let sum = x.reduce((prev, next) => prev + next, 0);
    console.log('sum', sum);

    err = 0.0;
    x = x.map((el, i) => {
      el /= sum;
      err += Math.abs(el - xlast[i]);
      return el;
    });


    if (err < N * params.tol && iter > 1) {
      console.log('iterations ', iter);
      console.log(err);
      let elapsed = (new Date()).getTime() - now.getTime();
      console.log('elapsed time: ', elapsed / 1000, 's');
      return formatOutput(x, dictionary, inputs, params);
    }
  }

  // printM(T, 'T');
  // printM(tildeP, 'tildeP');
  console.warn('pagerank: power iteration failed to converge in ' +
               params.iter_max + ' iterations.');
  return formatOutput(x, dictionary, inputs, params);
}
