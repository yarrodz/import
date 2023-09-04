// @ts-nocheck
const BaseVertexModel = require('iframe-ai/classes/BaseVertexModel');
const connector = require('iframe-db-connector');
const { P, TextP } = connector.process;
const __ = connector.process.statics;

class iFrameScheduler extends BaseVertexModel {
  constructor(client, properties, id) {
    super(client, 'iFrameScheduler', properties, id);
    this.client = client;
  }

  relations = {
    load: [
      { label: 'inUnit', _d: 'out' },
      { label: 'process', _d: 'out' }
    ],
    save: [
      { label: 'inUnit', _d: 'out' },
      { label: 'process', _d: 'out' }
    ],
    delete: [
      { label: 'inUnit', _d: 'out' },
      { label: 'process', _d: 'out' }
    ]
  };

  async insert(properties) {
    await super.insert(properties, true, this.relations.save);
    this.properties.__.inUnit = this.properties.__.inUnit
      ? this.properties.__.inUnit[0]
      : undefined;
    this.properties.__.process = this.properties.__.process
      ? this.properties.__.process[0]
      : undefined;
    return this;
  }

  async save() {
    await super.save(true, this.relations.save);
    this.properties.__.inUnit = this.properties.__.inUnit
      ? this.properties.__.inUnit[0]
      : undefined;
    this.properties.__.process = this.properties.__.process
      ? this.properties.__.process[0]
      : undefined;
    return this;
  }

  async load(id) {
    await super.load(id, this.relations.load);
    this.properties.__.inUnit = this.properties.__.inUnit
      ? this.properties.__.inUnit[0]
      : undefined;
    this.properties.__.process = this.properties.__.process
      ? this.properties.__.process[0]
      : undefined;
    return this;
  }

  async qq(query, sortings, first_only = false, author, label) {
    const processCondition = (traversal, condition) => {
      if (condition.operator) {
        // This is a complex condition with its own operator and conditions array
        let subTraversal = __.and(); // Default to 'and' operator
        if (condition.operator === 'or') {
          subTraversal = __.or();
        }
        for (let subCondition of condition.conditions) {
          subTraversal = processCondition(subTraversal, subCondition);
        }
        traversal = traversal.where(subTraversal);
      } else {
        // This is a simple condition
        const property = condition.property;
        if (condition.type === 'equals') {
          const value = condition.value;
          traversal = traversal.where(__.has(property, value));
        } else if (condition.type === 'hasEdge') {
          const { direction, label, value } = condition;
          if (direction === 'out') {
            traversal = traversal.where(__.out(label).hasId(value));
          } else if (direction === 'in') {
            traversal = traversal.where(__.in_(label).hasId(value));
          }
        } else if (condition.type === 'math') {
          const operation = condition.operation;
          const value = condition.value;
          traversal = traversal.where(
            __.values(property).is(P[operation](value))
          );
        } else if (condition.type === 'regex') {
          const regex = condition.regex;
          traversal = traversal.where(
            __.values(property).is(TextP.regex(regex))
          );
        } else if (condition.type === 'gps') {
          const lat = condition.gps_lat;
          const lon = condition.gps_long;
          const maxDistance = condition.maxDistance;
          traversal = traversal.where(
            __.and(
              __.values('gps_lat').is(
                P.inside(lat - maxDistance, lat + maxDistance)
              ),
              __.values('gps_long').is(
                P.inside(lon - maxDistance, lon + maxDistance)
              )
            )
          );
        } else if (condition.type === 'containing') {
          const value = condition.value;
          traversal = traversal.where(
            __.values(property).is(TextP.containing(value))
          );
        } else if (condition.type === 'startingWith') {
          const value = condition.value;
          traversal = traversal.where(
            __.values(property).is(TextP.startingWith(value))
          );
        } else if (condition.type === 'endingWith') {
          const value = condition.value;
          traversal = traversal.where(
            __.values(property).is(TextP.endingWith(value))
          );
        } else if (condition.type === 'notContaining') {
          const value = condition.value;
          traversal = traversal.where(
            __.values(property).is(TextP.notContaining(value))
          );
        } else if (condition.type === 'notStartingWith') {
          const value = condition.value;
          traversal = traversal.where(
            __.values(property).is(TextP.notStartingWith(value))
          );
        } else if (condition.type === 'notEndingWith') {
          const value = condition.value;
          traversal = traversal.where(
            __.values(property).is(TextP.notEndingWith(value))
          );
        } else if (condition.type === 'notRegex') {
          const regex = condition.regex;
          traversal = traversal.where(
            __.values(property).is(TextP.notRegex(regex))
          );
        } else if (condition.type === 'within') {
          const values = condition.values;
          traversal = traversal.where(
            __.values(property).is(P.within(...values))
          );
        } else if (condition.type === 'without') {
          const values = condition.values;
          traversal = traversal.where(
            __.values(property).is(P.without(...values))
          );
        } else if (condition.type === 'between') {
          const value1 = condition.value1;
          const value2 = condition.value2;
          traversal = traversal.where(
            __.values(property).is(P.between(value1, value2))
          );
        } else if (condition.type === 'inside') {
          const value1 = condition.value1;
          const value2 = condition.value2;
          traversal = traversal.where(
            __.values(property).is(P.inside(value1, value2))
          );
        } else if (condition.type === 'outside') {
          const value1 = condition.value1;
          const value2 = condition.value2;
          traversal = traversal.where(
            __.values(property).is(P.outside(value1, value2))
          );
        } else if (
          condition.type === 'eq' ||
          condition.type === 'gt' ||
          condition.type === 'gte' ||
          condition.type === 'lt' ||
          condition.type === 'lte' ||
          condition.type === 'neq'
        ) {
          const value = condition.value;
          traversal = traversal.where(
            __.values(property).is(P[condition.type](value))
          );
        } else if (condition.type === 'not') {
          const value = condition.value;
          traversal = traversal.where(__.values(property).is(P.not(value)));
        } else if (condition.type === 'date_is') {
          const date = new Date(condition.date).getTime();
          traversal = traversal.where(
            __.values(condition.property).is(P.eq(date))
          );
        } else if (condition.type === 'date_from') {
          const date = new Date(condition.date).getTime();
          traversal = traversal.where(
            __.values(condition.property).is(P.gte(date))
          );
        } else if (condition.type === 'date_to') {
          const date = new Date(condition.date).getTime();
          traversal = traversal.where(
            __.values(condition.property).is(P.lte(date))
          );
        } else if (condition.type === 'date_between') {
          const startDate = new Date(condition.startDate).getTime();
          const endDate = new Date(condition.endDate).getTime();
          traversal = traversal.where(
            __.values(condition.property).is(P.between(startDate, endDate))
          );
        }
      }
      return traversal;
    };

    await this.init();
    // console.log('this.label:  ', this.label);
    let traversal = this.traversal.V().hasLabel(this.label);

    if (author) {
      traversal = traversal.where(__.in_('createdBy').hasId(author));
    }

    traversal = processCondition(traversal, query);

    // console.log('traversal: ', traversal);

    //  sorting and other steps
    for (let key in sortings) {
      if (sortings.hasOwnProperty(key)) {
        let order =
          sortings[key] === 'desc'
            ? connector.process.order.desc
            : connector.process.order.asc;
        traversal = traversal.order().by(__.values(key), order);
      }
    }

    // Include the records in the traversal

    if (first_only) {
      traversal = traversal.project('data').by(__.valueMap(true));

      let result = await traversal.next();

      if (result === null || result.value === null) {
        return null;
      } else {
        let data = result.value.get('data');
        let node = {};

        for (let [key, value] of data) {
          node[key] = Array.isArray(value) ? value[0] : value;
        }

        return node;
      }
    } else {
      traversal = traversal
        .project('scheduler', 'process', 'unit')
        .by(__.valueMap(true))
        .by(__.in_('process').valueMap(true).fold())
        .by(__.in_('inUnit').valueMap(true).fold());

      let results = await traversal.toList();

      // Convert the Map objects to regular objects
      for (let i = 0; i < results.length; i++) {
        let result = results[i];
        let scheduler = {};
        for (let [key, value] of result.get('scheduler')) {
          scheduler[key] = Array.isArray(value) ? value[0] : value;
        }
        scheduler.label = 'iFrameScheduler';
        let processes = result.get('process');
        //   console.log('imports: ', imports);
        for (let j = 0; j < processes.length; j++) {
          let process = processes[j];
          let newProcess = {};
          for (let [key, value] of process) {
            newProcess[key] = Array.isArray(value) ? value[0] : value;
          }
          newProcess.label = 'iFrameProcess';
          processes[j] = newProcess;
        }

        let units = result.get('unit');
        //   console.log('units: ', units);
        for (let j = 0; j < units.length; j++) {
          let unit = units[j];
          let newUnit = {};
          for (let [key, value] of unit) {
            newUnit[key] = Array.isArray(value) ? value[0] : value;
          }
          newUnit.label = 'iFrameUnit';
          units[j] = newUnit;
        }

        results[i] = { ...scheduler, process: processes[0], unit: units[0] };
      }

      return results;
    }
  }
}

module.exports = iFrameScheduler;
