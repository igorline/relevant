const ADMIN_MAX_POWER_VOTES = 50;

export default function initMatrix(nodes, params) {
  const nodeIds = Object.keys(nodes);
  const dictionary = {};
  nodeIds.forEach((key, i) => (dictionary[key] = i));
  const N = nodeIds.length;
  let g = {};
  const danglingNodes = [];
  const degreeStore = {};
  const personalization = {};

  nodeIds.forEach((nodeId, i) => {
    const node = nodes[nodeId];

    // Compute degree of each node by summing all edge weights
    let degree = computeNodeDegree(node, params);

    if (degree === 0) {
      danglingNodes.push(i);
      degree = 1;
    }

    degreeStore[nodeId] = degree;

    if (params.personalization[nodeId]) {
      const adminWeight = 1 / (1 + Math.E ** (6 - (degree * 10) / ADMIN_MAX_POWER_VOTES));
      personalization[nodeId] = adminWeight;
      // console.log(nodeId);
      // console.log(adminWeight, degree);
    }

    // compute incoming weights for edge targets of el
    g = incomingWeights({ dictionary, nodeId, g, degree, nodes, params });
  });

  if (params.debug) {
    const { heapUsed } = process.memoryUsage();
    const mb = Math.round((100 * heapUsed) / 1048576) / 100;
    console.log('Matrix - program is using', mb, 'MB of Heap.'); // eslint-disable-line
  }

  // console.log(personalization);

  return {
    g,
    N,
    dictionary,
    danglingNodes,
    degreeStore,
    personalization
  };
}

function computeNodeDegree(node, params) {
  let degree = 0;
  Object.keys(node).forEach(outEdge => {
    const w = node[outEdge][params.weight];
    const n = node[outEdge][params.negative] || 0;

    // save the incoming weights for each node
    node[outEdge].w = Math.max(w - n, 0);

    // count both n and w for degree
    degree += Math.max(w + n, 0);
  });
  return degree;
}

function incomingWeights({ dictionary, nodeId, g, degree, nodes, params }) {
  const nodeIndex = dictionary[nodeId];

  Object.keys(nodes[nodeId]).forEach(edge => {
    const { w } = nodes[nodeId][edge];
    const n = nodes[nodeId][edge][params.negative] || 0;
    const j = dictionary[edge];

    g[j] = g[j] || {};
    g[j].inputs = g[j].inputs || {};
    g[j].inputsN = g[j].inputsN || {};

    // normalized incoming weight
    if (w) g[j].inputs[nodeIndex] = w / degree;
    if (n) g[j].inputsN[nodeIndex] = n / degree;
  });
  return g;
}
