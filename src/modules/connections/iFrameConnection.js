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

  async insert(properties) {
    await super.insert(properties, true, this.relations.save);
    this.properties.__.inUnit = this.properties.__.inUnit
      ? this.properties.__.inUnit[0]
      : undefined;
    return this;
  }

  async save() {
    await super.save(true, this.relations.save);
    this.properties.__.inUnit = this.properties.__.inUnit
      ? this.properties.__.inUnit[0]
      : undefined;
    return this;
  }

  async load(id) {
    await super.load(id, this.relations.load);
    this.properties.__.inUnit = this.properties.__.inUnit
      ? this.properties.__.inUnit[0]
      : undefined;
    return this;
  }
}

module.exports = { iFrameConnection };
