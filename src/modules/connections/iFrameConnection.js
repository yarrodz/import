const BaseVertexModel = require('iframe-ai/classes/BaseVertexModel');

class iFrameConnection extends BaseVertexModel {
  constructor(client, properties, id) {
    super(client, 'iFrameConnection', properties, id);
    this.client = client;
  }

  relations = {
    load: [
      { label: 'inUnit', _d: 'out' },
      { label: 'inProject', _d: 'out' },
      { label: 'hasConnection', _d: 'both' }
    ],
    save: [
      { label: 'inUnit', _d: 'out' },
      { label: 'inProject', _d: 'out' },
      { label: 'hasConnection', _d: 'both' }
    ],
    delete: [
      { label: 'inUnit', _d: 'out' },
      { label: 'inProject', _d: 'out' },
      { label: 'hasConnection', _d: 'both' }
    ]
  };

  async load(id) {
    await super.load(id, this.relations.load);
    return this;
  }
}

module.exports = iFrameConnection;
