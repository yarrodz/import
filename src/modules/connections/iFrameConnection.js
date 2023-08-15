const BaseVertexModel = require('iframe-ai/classes/BaseVertexModel');

class iFrameConnection extends BaseVertexModel {
  constructor(client, properties, id) {
    super(client, 'iFrameConnection', properties, id);
    this.client = client;
  }

  relations = {
    load: [{ label: 'inUnit', _d: 'out' }],
    save: [{ label: 'inUnit', _d: 'out' }],
    delete: [{ label: 'inUnit', _d: 'out' }]
  };

  async getAll(options) {
    const { source, unitId } = options;

    await super.init();

    let traversal = this.traversal.V().hasLabel('iFrameConnection');

    if (source) {
      traversal = traversal.has("source", source);
    }

    if (unitId) {
      traversal = traversal.where(__.in_('inUnit').hasId(unitId));
    }

    return await traversal
      .valueMap()
      .toList()
      .then((processes) => processes.map((process) => this.toJSON(process)));
  }

  async load(id) {
    await super.load(id, this.relations.load);
    return this;
  }

  toJSON(input) {
    if (input instanceof Map) {
      let obj = {};
      for (let [k, v] of input) {
        // Filter out "label" key
        if (k.typeName === 'T' && k.elementName === 'label') continue;
        obj[k.elementName || k] = this.toJSON(v);
      }
      return obj;
    } else if (Array.isArray(input)) {
      if (input.length === 1) {
        return this.toJSON(input[0]);
      } else {
        return input.map((item) => this.toJSON(item));
      }
    } else {
      return input;
    }
  }
}

module.exports = iFrameConnection;
