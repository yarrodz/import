const BaseVertexModel = require('iframe-ai/classes/BaseVertexModel');

class iFrameProcess extends BaseVertexModel {
  constructor(client, properties, id) {
    super(client, 'iFrameProcess', properties, id);
    this.client = client;
  }

  relations = {
    load: [
      { label: 'inUnit', _d: 'out' },
      { label: 'hasConnection', _d: 'out' }
    ],
    save: [
      { label: 'inUnit', _d: 'out' },
      { label: 'hasConnection', _d: 'out' }
    ],
    delete: [
      { label: 'inUnit', _d: 'out' },
      { label: 'hasConnection', _d: 'out' }
    ]
  };

  async insert(properties) {
    await super.insert(properties, true, this.relations.save);
    this.properties.__.inUnit = this.properties.__.inUnit
      ? this.properties.__.inUnit[0]
      : undefined;
    this.properties.__.hasConnection = this.properties.__.hasConnection
      ? this.properties.__.hasConnection[0]
      : undefined;
    return this;
  }

  async save() {
    await super.save(true, this.relations.save);
    this.properties.__.inUnit = this.properties.__.inUnit
      ? this.properties.__.inUnit[0]
      : undefined;
    this.properties.__.hasConnection = this.properties.__.hasConnection
      ? this.properties.__.hasConnection[0]
      : undefined;
    return this;
  }

  async load(id) {
    await super.load(id, this.relations.load);
    this.properties.__.inUnit = this.properties.__.inUnit
      ? this.properties.__.inUnit[0]
      : undefined;
    this.properties.__.hasConnection = this.properties.__.hasConnection
      ? this.properties.__.hasConnection[0]
      : undefined;
    return this;
  }
}

module.exports = iFrameProcess;
