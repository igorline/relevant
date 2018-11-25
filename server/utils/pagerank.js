/* eslint-disable */

function pagerank(G, params) {
  // based on networkx.pagerank 1.9.1 (Python)
  // https://github.com/networkx/networkx/blob/master/networkx/algorithms/link_analysis/pagerank_alg.py

  // set default parameters
  if (!params) params = {};
  if (!params.alpha) params.alpha = 0.85;
  if (!params.personalization) params.personalization = null;
  if (!params.max_iter) params.max_iter = 100;
  if (!params.tol) params.tol = 1.0e-6;
  if (!params.weight) params.weight = 'weight';
  if (!params.negativeWeights) params.negativeWeights = {};

  // Begin tools
  let values = function values(obj) {
    let xs = [];
    for (let key in obj) xs.push(obj[key]);
    return xs;
  };

  let sum = function sum(xs) {
    return xs.reduce((prev, current, idx, xs) => {
      return prev + current;
    });
  };
  // End tools

  var N = Object.keys(G).length;
  if (N === 0) return {};

  // Create a copy in (right) stochastic form
  var W = {};
  var P = params.negativeWeights; // negative link

  for (var node in G) {
    var nodes = G[node];
    var nodeW = 0;

    // downvotes
    var nodesN = P[node] || {};
    var nodeWN = 0;

    for (var node_ in nodes) {
      nodeW += nodes[node_][params.weight];

      // downvotes
      nodeWN += nodesN[node_][params.weight] || 0;
    }
  }


  // TODO what should this be?
  let MIN_DEGREE = 15;

  for (var node in G) {
    var nodes = G[node];
    var new_nodes = {};
    var node_degree = 0.0;
    var node_degree_negative = 0.0;
    for (var node_ in nodes) {
      node_degree += nodes[node_][params.weight];
    }
    for (var node_ in nodes) {
      let adjust = 1;
      new_nodes[node_] = {
        'weight':
          (params.weight ? nodes[node_][params.weight] : 1.0) / Math.max(MIN_DEGREE, node_degree * adjust)
      };
    }
    W[node] = new_nodes;
  }

  // Choose fixed starting vector if not given
  var x = {};
  if (!params.nstart) {
    for (var node in W) x[node] = 1.0 / N;
  }
  else {
    // Normalized nstart vector
    var sum_ = sum(Object.values(params.nstart));
    for (var node in params.nstart)
      x[node] = params.nstart[node] / sum_;
  }
  //console.log(x);

  var p = {};
  if (!params.personalization) {
    // Assign uniform personalization vector if not given
    for (var node in W) p[node] = 1.0 / N;
  }
  else {
    // TODO: check missing nodes
    for (var node in W) p[node] = 0;
    var sum_ = sum(Object.values(params.personalization));
    for (var node in params.personalization) {
      p[node] = params.personalization[node] / sum_;
      console.log(node, p[node]);
    }
  }

  var dangling_weights = {};
  if (!params.dangling) {
    // Use personalization vector if dangling vector not specified
    dangling_weights = p;
  }
  else {
    // TODO: check missing nodes
    var sum_ = sum(Object.values(params.dangling));
    for (var node in params.dangling)
      dangling_weights[node] = params.dangling[node] / sum_;
  }
  var dangling_nodes = [];
  for (var node in W) {
    if (Object.keys(W[node]).length == 0) // need review
      dangling_nodes.push(node);
  }
  //console.log(dangling_nodes);

  // power iteration: make up to max_iter iterations
  for (var iter_count = 0; iter_count < params.max_iter; iter_count++) {
    var xlast = x;
    x = {};
    for (var node in xlast) x[node] = 0.0;
    var sum_ = 0.0;
    dangling_nodes.forEach(function(node) {
      sum_ += xlast[node]
    });
    var danglesum = params.alpha * sum_;

    let mean = 0;
    for (var node in xlast) {
      if (!xlast[node]) xlast[node] = 0;
      mean += xlast[node]
    }

    // console.log(xlast);
    mean /= Object.keys(xlast).length;
    // console.log('mean', mean);

    for (var node in x) {
      // this matrix multiply looks odd because it is
      // doing a left multiply x^T=xlast^T*W
      for (var nbr in W[node]) {
        // todo - adjust this to account for time discounting
        // let adjust = Math.max(MIN_DEGREE, params.users[nbr].postCount + 1);
        // adjust = Math.log(adjust);
        let adjust = 1;

        // if (!xlast[node]) xlast[node] = 0;

        x[nbr] += params.alpha * xlast[node] * W[node][nbr]['weight'] / adjust;
      }

      x[node] += danglesum * dangling_weights[node] + (1.0 - params.alpha) * p[node];
      // normalize
      x[node] /= mean;
    }

    // check convergence, l1 norm
    var err = 0.0;
    Object.keys(x).forEach(function(node) {
      err += Math.abs(x[node] - xlast[node]);
    });
    if (err < N * params.tol)
      return x;
  }

  console.warn('pagerank: power iteration failed to converge in ' +
               params.iter_max + ' iterations.');
  return x;
}

// node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = pagerank;
}