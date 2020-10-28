var statement = require('../statements.js');

var aws = {}

const acceptableTypes = [
    'AWSNode',
    'AWSEdge'
]

const awsFuncMap = {
    AWSNode: buildAWSNode,
    AWSEdge: buildAWSEdge
}

aws.awsFuncMap = awsFuncMap;
aws.acceptableTypes = acceptableTypes;

// Create AWS nodes
function buildAWSNode(chunk) {
    let queries = {};
    queries.properties = {
        statement:
            'UNWIND $props AS prop MERGE (n:Base {objectid: prop.source}) ON MATCH SET n:AWS ON CREATE SET n:AWS SET n += prop.map',
        props: [],
    };

    let labels = new Set(chunk.map(x => x[':LABEL']));

    for (let label of labels) {
        // For multiple labels
        let neo4jLabels = label.split(';');
        neo4jLabels = neo4jLabels.map(x => `\`${x}\``);
        neo4jLabels = neo4jLabels.join(':');
        let statement =
            `UNWIND $props AS prop MERGE (n:Base {objectid: prop.source}) ON MATCH SET n:${neo4jLabels} ON CREATE SET n:${neo4jLabels} SET n += prop.map`;

        queries[label] = {
            statement:
                statement,
            props: []
        }
    }

    for (let node of chunk) {
        // Create properties
        let properties = { ...node };
        let source = node[':ID'];
        let label = node[':LABEL'];
        queries[label].props.push({ source: source, map: properties });
    }
    return queries;
}


// Create AWS releations
function buildAWSEdge(chunk) {
    let queries = {};
    for (let edge of chunk) {
        let relationProps = "{";
        for(const prop in edge){
            if ([':START_ID', ':END_ID', ':TYPE'].includes(prop)){
                continue;
            }
            let property = prop.split(':')[0];
            if (property.includes(" ")){
                relationProps += `\`${property}\`:`
            } else { relationProps += `${property}:`}
            if(property === "Description"){
                relationProps += `"${edge[prop]}",`;
            } else {
                relationProps += `'${edge[prop]}',`;
            }
            
        }
        if(relationProps[relationProps.length -1] === ','){
            relationProps = relationProps.slice(0,-1)
        }
        // relationProps = JSON.stringify(relationProps);
        relationProps += '}';
        if(edge[':TYPE'] === undefined){
            console.log(edge);
        }
        let format = ['Base', 'Base', edge[':TYPE'], relationProps];
        let props = { source: edge[':START_ID'], target: edge[':END_ID'] };
        statement.insertNewAWS(queries, format, props);
    }
	console.log(queries);
    return queries;
}

module.exports = aws;