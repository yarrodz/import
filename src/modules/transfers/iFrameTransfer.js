const BaseVertexModel = require('iframe-ai/classes/BaseVertexModel');
const connector = require('iframe-db-connector');
const __ = connector.process.statics;

class iFrameTransfer extends BaseVertexModel {
  constructor(client, properties, id) {
    super(client, 'iFrameTransfer', properties, id);
    this.client = client;
  }

  relations = {
    load: [
      { label: 'inUnit', _d: 'out' },
      { label: 'inProject', _d: 'out' },
      { label: 'inImport', _d: 'out' }
    ],
    save: [
      { label: 'inUnit', _d: 'out' },
      { label: 'inProject', _d: 'out' },
      { label: 'inImport', _d: 'out' }
    ],
    delete: [
      { label: 'inUnit', _d: 'out' },
      { label: 'inProject', _d: 'out' },
      { label: 'inImport', _d: 'out' }
    ]
  };

  async load(id) {
    await super.load(id, this.relations.load);
    return this;
  }
}

module.exports = iFrameTransfer;
