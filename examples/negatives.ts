import projector from 'dojo-widgets/projector';

import max from 'src/data/max';
import createColumnChart, { ColumnChartFactory } from 'src/render/createColumnChart';

const basic = (<ColumnChartFactory<number>> createColumnChart)({
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
		labels: { anchor: 'end' },
		range: { stepSize: 5 },
		ticks: { length: 5, zeroth: true }
	},
	valueSelector(input: number) { return input; },
	width: 100,
	xInset: 30
});

const domain = (<ColumnChartFactory<number>> createColumnChart)({
	bottomAxis: {
		inputs: true,
		ticks: { anchor: 'end', length: 5, zeroth: true }
	},
	columnHeight: 200,
	columnSpacing: 3,
	columnWidth: 10,
	divisorOperator: max,
	domain: [-10, 10],
	height: 200,
	inputSeries: [-5, 5, 10],
	leftAxis: {
		inputs: {
			labelSelector({ input }) { return String(input); }
		},
		labels: { anchor: 'end' },
		ticks: { anchor: 'end', length: 5, zeroth: true }
	},
	valueSelector(input: number) { return input; },
	width: 100,
	xInset: 30
});

const allNegative = (<ColumnChartFactory<number>> createColumnChart)({
	bottomAxis: {
		inputs: true,
		ticks: { anchor: 'end', length: 5, zeroth: true }
	},
	columnHeight: 150,
	columnSpacing: 3,
	columnWidth: 10,
	divisorOperator: max,
	height: 200,
	inputSeries: [-5, -10],
	leftAxis: {
		inputs: {
			labelSelector({ input }) { return String(input); }
		},
		labels: { anchor: 'end' },
		ticks: { anchor: 'end', length: 5, zeroth: true }
	},
	valueSelector(input: number) { return input; },
	width: 100,
	xInset: 30
});

const allNegativeDomain = (<ColumnChartFactory<number>> createColumnChart)({
	bottomAxis: {
		inputs: true,
		ticks: { anchor: 'end', length: 5, zeroth: true }
	},
	columnHeight: 200,
	columnSpacing: 3,
	columnWidth: 10,
	divisorOperator: max,
	domain: -15,
	height: 200,
	inputSeries: [-5, -10],
	leftAxis: {
		inputs: {
			labelSelector({ input }) { return String(input); }
		},
		labels: { anchor: 'end' },
		ticks: { anchor: 'end', length: 5, zeroth: true }
	},
	valueSelector(input: number) { return input; },
	width: 100,
	xInset: 30
});

(<any> window).basic = basic;
(<any> window).domain = domain;
(<any> window).allNegative = allNegative;
(<any> window).allNegativeDomain = allNegativeDomain;

projector.append([
	basic, domain,
	allNegative, allNegativeDomain
]);
projector.attach();
