function displayData (selectedID = '940') {

    //get the data
    d3.json('samples.json').then(function(data) {
        
        const metadata = data.metadata.filter(sample => sample.id === +selectedID)[0];
        const sampleData = data.samples.filter(sample => sample.id === selectedID)[0];

        //populate the drop down menu with the sample names
        const dropDown = d3.select('#selDataset');
        dropDown.selectAll('option')
        .data(data.metadata)
        .enter()
        .append('option')
        .attr('value', d=>d.id)
        .text(d=>d.id);

        //get the otu_ids, sample_values, and otu_labels for the top 10 values
        const topTenVals = sampleData.sample_values.slice(0,10).reverse().map(value => +value);
        const topTenOTUs = sampleData.otu_ids.slice(0,10).reverse().map(value => +value);
        const topTenLabels = sampleData.otu_labels.slice(0,10).reverse();

        //trim down the labels
        var trimmedLabels = [];
        trimmedLabels = topTenLabels.map(label => {
            var lastTwo = label.split(';');
            const last = lastTwo.pop();
            const secondLast = lastTwo.pop();
            return `${secondLast ? secondLast : ''} ${last}`;
        });

        //reformat the OTU id strings
        var formattedOTUs = topTenOTUs.map(otu => `OTU ${otu}`);

        //create the bar chart
        const trace1 = {
            y: formattedOTUs,
            x: topTenVals,
            type: 'bar',
            orientation: 'h',
            text: trimmedLabels
        };

        const layout1 = {
            title: `Sample ${selectedID}`,
            xaxis: {
                    automargin: true,
                    tickangle: 'auto',
                    title: 'Measured Value'},
            yaxis: {
                    automargin: true,
                    tickangle: 'auto',
                    title: 'OTU ID'}
        }

        Plotly.newPlot('bar', [trace1], layout1);

        //create the bubble chart

        const maxMarkerSize = 50;
        const colorsArr = topTenOTUs.map(value => {
            return `hsl(${255*(value/d3.max(topTenOTUs))},100,40)`;
        });

        const trace2 = {
            x: topTenOTUs,
            y: topTenVals,
            text: trimmedLabels,
            mode: 'markers',
            marker: {
                color: colorsArr,
                size: topTenVals,
                sizeref: 1.5 * (d3.max(topTenVals)) / (maxMarkerSize**2),
                sizemode: 'area'
            }
        };

        const layout2 = {
            title: `Sample ${selectedID}`
        };

        Plotly.newPlot('bubble', [trace2], layout2);

        //display the metadata
        let infoPanel = d3.select('#sample-metadata').append('ul');

        //this is not how this is supposed to go, but it works
        d3.selectAll('ul').html('');

        infoPanel.selectAll('li')
        .data(Object.entries(metadata))
        .enter()
        .append('li')
        .text(d => `${d.join(': ')}`)
        .merge(infoPanel)
        .exit()
        .remove();

    }).catch(function(error) {
        console.log(error);
        throw error;
    });
}
//start out displaying the data
displayData();

d3.select('#selDataset').on('change', () => {
    const selectedID = d3.event.target.value;
	displayData(selectedID);
});