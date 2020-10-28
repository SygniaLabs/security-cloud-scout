var groupBy = require('lodash/collection').groupBy;

var statement = {}

const baseInsertStatement =
    'UNWIND $props AS prop MERGE (n:Base {objectid: prop.source}) ON MATCH SET n:{0} ON CREATE SET n:{0} MERGE (m:Base {objectid: prop.target}) ON MATCH SET m:{1} ON CREATE SET m:{1} MERGE (n)-[r:{2} {3}]->(m)';


statement.insertNewAWS = function(queries, formatProps, queryProps) {
    if (formatProps.length < 4) {
        throw new NotEnoughArgumentsException();
    }
    if (queryProps.length == 0) {
        return;
    }

    let hash = `${formatProps[0]}-${formatProps[1]}-${formatProps[2]}-${Object.keys(queries).length}`;
    if (queries[hash]) {
        queries[hash].props = queries[hash].props.concat(queryProps);
    } else {
        queries[hash] = {};
        if (formatProps.length < 4) {
            throw new NotEnoughArgumentsException();
        }
        queries[hash].statement = baseInsertStatement.formatn(...formatProps);
        queries[hash].props = [].concat(queryProps);
    }
}


module.exports = statement;