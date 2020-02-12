const ADMIN_MAX_POWER_VOTES = 50;

export default function initMatrix(nodes, params) {
  const nodeIds = Object.keys(nodes);

  const dictionary = {};
  nodeIds.forEach((key, i) => (dictionary[key] = i));
  const N = nodeIds.length;
  const g = {};
  const danglingNodes = [];
  const degreeStore = {};
  const personalization = {};

  nodeIds.forEach((nodeId, i) => {
    const node = nodes[nodeId];

    if (!node.degree) danglingNodes.push(i);

    const { degree } = node;
    degreeStore[nodeId] = degree;

    if (params.personalization[nodeId]) {
      // this is usually 1 but can be adjusted via custom params
      const customWeight = params.personalization[nodeId];
      const adminWeight =
        customWeight / (1 + Math.E ** (6 - (degree * 10) / ADMIN_MAX_POWER_VOTES));
      personalization[nodeId] = adminWeight;
    }

    g[i] = g[i] || { inputs: {} };

    // compute incoming weights for edge targets of el
    Object.keys(node.inputs).forEach(id => {
      if (!nodes[id]) return;
      const w = node.inputs[id];
      const { degree: d } = nodes[id];
      // normalize
      g[i].inputs = g[i].inputs || {};
      g[i].inputs[dictionary[id]] = w / d;
    });
  });

  // add Hypothetical Nodes
  // Hypothetical Nodes that consumes dangling nodes
  const danglingInputs = {};
  danglingNodes.forEach(dNode => (danglingInputs[dNode] = 1));

  const danglingId = dictionary.danglingConsumer;
  if (g[danglingId]) {
    g[danglingId].inputs = {
      [danglingId]: 1,
      ...danglingInputs
    };
  }

  if (params.debug) {
    console.log('number of nodes', N); // eslint-disable-line
    const { heapUsed } = process.memoryUsage();
    const mb = Math.round((100 * heapUsed) / 1048576) / 100;
    console.log('Matrix - program is using', mb, 'MB of Heap.'); // eslint-disable-line
  }

  return {
    g,
    N,
    dictionary,
    danglingNodes,
    degreeStore,
    personalization
  };
}
