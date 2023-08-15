const BaseVertexModel = require('iframe-ai/classes/BaseVertexModel');
const connector = require('iframe-db-connector');
const __ = connector.process.statics;

class iFrameProcess extends BaseVertexModel {
  constructor(client, properties, id) {
    super(client, 'iFrameProcess', properties, id);
    this.client = client;
  }

  relations = {
    load: [
      { label: 'inUnit', _d: 'out' },
      { label: 'inProject', _d: 'out' },
      { label: 'hasConnection', _d: 'out' }
    ],
    save: [
      { label: 'inUnit', _d: 'out' },
      { label: 'inProject', _d: 'out' },
      { label: 'hasConnection', _d: 'out' }
    ],
    delete: [
      { label: 'inUnit', _d: 'out' },
      { label: 'inProject', _d: 'out' },
      { label: 'hasConnection', _d: 'out' }
    ]
  };

  async getAll(options) {
    const { type, unitId, connectionId } = options;

    await super.init();

    let traversal = this.traversal.V().hasLabel('iFrameProcess');

    if (type) {
      traversal = traversal.has("type", type);
    }

    if (unitId) {
      traversal = traversal.where(__.in_('inUnit').hasId(unitId));
    }

    if (connectionId) {
      traversal = traversal.where(__.in_('hasConnection').hasId(connectionId));
    }

    return await traversal
      .valueMap()
      .toList()
      .then((processes) => processes.map((process) => this.toJSON(process)));
  }

  async insert(properties) {
    await super.insert(properties, true, this.relations.save);
    return this;
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

module.exports = iFrameProcess;
