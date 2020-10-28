var markup = (node) => `
    <dl class='dl-horizontal sya'>
        <h4>${node.label}</h4>
        <dt>Object ID</dt>
        <dd>${node.objectid ? node.objectid : node.props.id}</dd>
        <dt>Raw</dt> 
        <dd>${node.props.raw}</dd>
    </dl>
`

module.exports = markup;
{/* <MappedNodeProps displayMap={displayMap} properties={nodeProps} label={label}
<ExtraNodeProps displayMap={displayMap} properties={nodeProps} label={label} />
<Notes objectid={objectid} type='CloudApp' />
<NodeGallery objectid={objectid} type='CloudApp' visible={visible} /> --> */}