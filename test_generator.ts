
const { generateGraphData } = require('./data/generator.ts');

try {
    console.log('Testing generator...');
    const data = generateGraphData();
    console.log('Nodes generated:', data.nodes.length);
    console.log('Links generated:', data.links.length);
    console.log('First node:', data.nodes[0]);
    console.log('Success!');
} catch (e) {
    console.error('Generator failed:', e);
}
