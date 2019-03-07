// The PageTrust algorithm based on:
// How to rank web pages when negative links are allowed?
// http://perso.uclouvain.be/paul.vandooren/publications/deKerchoveV08b.pdf
// And eigentrust/egentrust++

/* eslint no-loop-func: 0 */
/* eslint camelcase: 0 */
/* eslint no-console: 0 */

function objectToMatrix(_inputs, params) {
  const inputs = Object.keys(_inputs);
  const dictionary = {};
  inputs.forEach((key, i) => (dictionary[key] = i));
  const N = inputs.length;
  const G = [];
  const neg = {};
  const P = [];
  const danglingNodes = [];

  inputs.forEach((el, i) => {
    const upvotes = new Array(N).fill(0);
    const downvotes = new Array(N).fill(0);

    let degree = 0;
    Object.keys(_inputs[el]).forEach(vote => {
      let w = _inputs[el][vote][params.weight];
      const n = _inputs[el][vote][params.negative] || 0;
      // eigentrust++ weights
      w = Math.max((w - n) / (w + n), 0);
      _inputs[el][vote].w = w;
      if (w > 0) degree += w;
    });

    if (degree === 0) {
      danglingNodes.push(i);
      degree = 1;
    }

    Object.keys(_inputs[el]).forEach(vote => {
      const { w } = _inputs[el][vote];
      let n = _inputs[el][vote][params.negative] || 0;
      upvotes[dictionary[vote]] = w / degree;
      if (n) {
        n /= _inputs[el][vote].total;
        neg[i] = neg[i] || {};
        neg[i][dictionary[vote]] = n;
        downvotes[dictionary[vote]] = n;
      }
    });

    G[i] = upvotes;
    P[i] = downvotes;
  });
  // printM(G, 'G');
  // printM(P, 'P');
  return { neg, G, N, P, dictionary, danglingNodes };
}

function formatOutput(x, dictionary, inputs) {
  const result = {};
  Object.keys(inputs).forEach((node, i) => (result[node] = x[i]));
  return result;
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

  const now = new Date();

  const { neg, G, P, N, dictionary, danglingNodes } = objectToMatrix(inputs, params);

  let p = new Array(N).fill(0);
  if (!params.personalization) {
    p = new Array(N).fill(1.0 / N);
  } else {
    const keys = Object.keys(params.personalization);
    const degree = keys.reduce((prev, key) => prev + params.personalization[key], 0);
    keys.forEach(key => {
      p[dictionary[key]] = params.personalization[key] / degree;
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
    const keys = Object.keys(params.nstart);
    const degree = keys.reduce((prev, key) => params.nstart[key] + prev, 0);
    let sum = 0;
    keys.forEach(key => {
      if (!degree) return;
      const i = dictionary[key];
      x[i] = params.nstart[key];
      sum += params.nstart[key];
    });
    console.log('start sum ', sum);
  }

  const tildeP = P.map(arr => arr.slice());
  let iter;
  const T = new Array(N).fill(0)
  .map(() => new Array(N).fill(0));

  let danglesum = 0;

  console.log('matrix setup time ', (new Date().getTime() - now) / 1000 + 's');

  let xlast;
  for (iter = 0; iter < params.max_iter; iter++) {
    xlast = [...x];

    x = new Array(N).fill(0);
    const lastP = P.map(arr => arr.slice());

    danglesum = 0;
    danglingNodes.forEach(node => (danglesum += xlast[node]));
    danglesum *= params.alpha;

    // Iterate through nodes;
    for (let i = 0; i < N; i++) {
      const TNi = new Array(N).fill(0);

      for (let j = 0; j < N; j++) {
        x[i] += params.alpha * G[j][i] * xlast[j];

        TNi[j] =
          params.alpha * G[j][i] * xlast[j] +
          xlast[j] * params.M * (1 - params.alpha) * p[i];
      }
      x[i] += (1.0 - params.alpha) * p[i] + danglesum * danglingWeights[i];

      for (let j = 0; j < N; j++) {
        const denom = x[i] || 1;
        T[i][j] = TNi[j] / denom;
      }

      // x[i] *= (1 - tildeP[i][i]) ** params.beta;

      // UPDATE tildeP
      for (let j = 0; j < N; j++) {
        tildeP[i][j] = 0;
        for (let k = 0; k < N; k++) {
          tildeP[i][j] += T[i][k] * lastP[k][j];
        }
        // UPDATE P
        if (neg[i] && neg[i][j]) P[i][j] = neg[i][j];
        else if (i === j) P[i][j] = 0;
        else P[i][j] = tildeP[i][j];
      }
    }

    // normalize
    const sum = x.reduce((prev, next) => prev + next, 0);
    console.log('sum', sum);

    let err = 0.0;
    x = x.map((el, i) => {
      el /= sum;
      err += Math.abs(el - xlast[i]);
      return el;
    });

    if (err < N * params.tol) {
      console.log('iterations ', iter);
      console.log(err);
      // printM(T, 'T');
      // printM(tildeP, 'tildeP');
      const elapsed = new Date().getTime() - now.getTime();
      console.log('elapsed time: ', elapsed / 1000, 's');
      return formatOutput(x, dictionary, inputs, params);
    }
    console.log('interation', iter, 'error', err);
  }

  // printM(T, 'T');
  // printM(tildeP, 'tildeP');
  console.warn(
    'pagerank: power iteration failed to converge in ' + params.iter_max + ' iterations.'
  );
  return formatOutput(x, dictionary, inputs, params);
}
