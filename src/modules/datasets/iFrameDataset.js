const BaseVertexModel = require('iframe-ai/classes/BaseVertexModel');
const connector = require('iframe-db-connector');
const __ = connector.process.statics;
const Promise = require('bluebird');

class iFrameDataset extends BaseVertexModel {
  constructor(client, properties, id) {
    super(client, 'iFrameDataset', properties, id);
    this.client = client;
  }

  relations = {
    load: [
      { label: 'inUnit', _d: 'out' },
      { label: 'hasRecord', _d: 'both' },
      { label: 'fromImport', _d: 'out' }
    ],
    save: [
        { label: 'inUnit', _d: 'out' },
        { label: 'hasRecord', _d: 'both' },
        { label: 'fromImport', _d: 'out' }
    ],
    delete: [
        { label: 'inUnit', _d: 'out' },
        { label: 'hasRecord', _d: 'both' },
        { label: 'fromImport', _d: 'out' }
    ]
  };

  async bulkSave(datasets) {
    const traversal = await this.client.getTraversal();
    try {
        console.log('bulkSave')
        await Promise.map(datasets, async (dataset) => {
            const { unitId, importId, sourceId, records } = dataset;

            const existingDatasetVertex = await traversal
                .V()
                .hasLabel("iFrameDataset")
                .has("sourceId", sourceId)
                .where(__.out("inUnit").hasId(unitId))
                .where(__.out("fromImport").hasId(importId))
                .next();

            if (existingDatasetVertex.value) {
                // console.log('Update');
                //Archive dataset existing records then create new
                await traversal
                    .V()
                    .hasLabel("iFrameRecord")
                    .where(__.in_("hasRecord").hasId(existingDatasetVertex.value.id))
                    .property('archived', true)
                    .iterate();

                await this.bulkInsertRecords(traversal, records, existingDatasetVertex.value.id);
            } else {
                // console.log('Insert');
                const insertedDatasetVertex = await traversal
                    .addV('iFrameDataset')
                    .property('sourceId', sourceId)
                    .next();

                await traversal.V(insertedDatasetVertex.value.id)
                    .addE('inUnit')
                    .to(__.V(unitId))
                    .iterate();

                await traversal.V(insertedDatasetVertex.value.id)
                    .addE('fromImport')
                    .to(__.V(importId))
                    .iterate();

                await this.bulkInsertRecords(traversal, records, insertedDatasetVertex.value.id);
            }
        }, { concurrency: datasets.length });
    } catch (error) {
        console.error(`Error while bulkSave: ${error}`);
        throw error;
    }
  }

  async bulkInsertRecords(traversal, records, datasetVertexId) {
    try {
        await Promise.map(records, async (record) => {
            const { featureId, value } = record;

            const recordVertex = await traversal.addV('iFrameRecord')
                .property('value', value)
                .property('archived', false)
                .next();

            await traversal.V(datasetVertexId)
                .addE('hasRecord')
                .to(__.V(recordVertex.value.id))
                .iterate();

            await traversal.V(recordVertex.value.id)
                .addE('inFeature')
                .to(__.V(featureId))
                .iterate();
        }, { concurrency: records.length });
    } catch (error) {
        console.error(`Error while bulkInsertRecords: ${error}`);
        throw error;
    }
  }
}

module.exports = iFrameDataset;
