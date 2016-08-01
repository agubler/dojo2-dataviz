import projector from 'dojo-widgets/projector';

import max from 'src/data/max';
import createColumnChart, { ColumnChartFactory } from 'src/render/createColumnChart';

const chart = (<ColumnChartFactory<number>> createColumnChart)({
	bottomAxis: {
		inputs: true,
		ticks: { anchor: 'end', length: 5, zeroth: true }
	},
	columnHeight: 150,
	columnSpacing: 3,
	columnWidth: 10,
	divisorOperator: max,
	height: 200,
	inputSeries: [-5, 5, 10],
	leftAxis: {
		inputs: {
			labelSelector({ input }) { return input; }
		},
		ticks: { length: 5, zeroth: true }
	},
	valueSelector(input: number) { return input; },
	width: 100,
	xInset: 30
});

(<any> window).chartWithNegatives = chart;

projector.append([chart]);
projector.attach();
