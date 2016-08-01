import compose, { ComposeFactory } from 'dojo-compose/compose';
import { Handle } from 'dojo-core/interfaces';
import WeakMap from 'dojo-shim/WeakMap';
import { h, VNode } from 'maquette/maquette';
import { Observable } from 'rxjs/Rx';

import { DivisorOperator, InputObservable, ValueSelector } from '../../data/interfaces';
import columnar, { Column } from '../../data/columnar';

import { Domain, DomainOption, Invalidatable, Point } from '../interfaces';
import createInputSeries, {
	InputSeries,
	InputSeriesOptions,
	InputSeriesState
} from './createInputSeriesMixin';

export { Column };

function normalizeDomain(domain: DomainOption): Domain {
	return Array.isArray(domain) ? domain : [domain < 0 ? domain : 0, domain > 0 ? domain : 0];
}

export interface ColumnPoint<T> extends Point<Column<T>> {
	displayHeight: number;
	displayWidth: number;
	offsetLeft: number;
}

export interface ColumnPlotState<T> extends InputSeriesState<T> {
	/**
	 * Controls the maximum height of each column.
	 */
	columnHeight?: number;

	/**
	 * Controls the space between each column.
	 */
	columnSpacing?: number;

	/**
	 * Controls the width of each column.
	 */
	columnWidth?: number;

	/**
	 * Controls the range for which values are plotted with the full columnHeight. The height is distributed across the
	 * negative and positive values commensurate with the range. Any input values that exceed the minimum or maximum
	 * will still be plotted proportionally (but exceeding the height limits).
	 *
	 * If a single number is provided, if that number is greater than zero it implies a domain of [0, number]. If it's
	 * less than zero it implies a domain of [number, 0]. If zero it implies there are no minimum or maximum values,
	 * same for a domain of [0, 0].
	 */
	domain?: DomainOption;
}

export interface ColumnPlotOptions<T, S extends ColumnPlotState<T>> extends InputSeriesOptions<T, S> {
	/**
	 * Controls the maximum height of each column.
	 */
	columnHeight?: number;

	/**
	 * Controls the space between each column.
	 */
	columnSpacing?: number;

	/**
	 * Controls the width of each column.
	 */
	columnWidth?: number;

	/**
	 * Operates on the input series observable to compute the divisor, which is used to determine the height of the
	 * columns.
	 *
	 * If not provided, and a `divisorOperator()` implementation has been mixed in, that implementation is used.
	 * Otherwise the divisor will be set to `1`.
	 */
	divisorOperator?: DivisorOperator<T>;

	/**
	 * Controls the range for which values are plotted with the full columnHeight. The height is distributed across the
	 * negative and positive values commensurate with the range. Any input values that exceed the minimum or maximum
	 * will still be plotted proportionally (but exceeding the height limits).
	 *
	 * If a single number is provided, if that number is greater than zero it implies a domain of [0, number]. If it's
	 * less than zero it implies a domain of [number, 0]. If zero it implies there are no minimum or maximum values,
	 * same for a domain of [0, 0].
	 */
	domain?: DomainOption;

	/**
	 * Select the value from the input. Columns height is determined by this value.
	 *
	 * If not provided, and a `valueSelector()` implementation has been mixed in, that implementation is used. Otherwise
	 * values will be hardcoded to `0`.
	 */
	valueSelector?: ValueSelector<T>;
}

export interface ColumnPlotMixin<T> {
	/**
	 * Controls the maximum height of each column.
	 */
	columnHeight: number;

	/**
	 * Controls the space between each column.
	 */
	columnSpacing: number;

	/**
	 * Controls the width of each column.
	 */
	columnWidth: number;

	/**
	 * Operates on the input series observable to compute the divisor, which is used to determine the height of the
	 * columns.
	 *
	 * Can be overriden by specifying a `divisorOperator()` option. If neither is available a static divisor of `1`
	 * will be used.
	 */
	divisorOperator?: DivisorOperator<T>;

	/**
	 * Controls the range for which values are plotted with the full columnHeight. The height is distributed across the
	 * negative and positive values commensurate with the range. Any input values that exceed the minimum or maximum
	 * will still be plotted proportionally (but exceeding the height limits).
	 */
	domain: Domain;

	/**
	 * Select the value from the input. Columns height is determined by this value.
	 *
	 * Can be overriden by specifying a `valueSelector()` option. If neither is available all values will be hardcoded
	 * to `0`.
	 */
	valueSelector?: ValueSelector<T>;

	/**
	 * Plot "points" for each column.
	 */
	plot(): ColumnPoint<T>[];

	/**
	 * Create VNodes for each column given its points.
	 */
	renderPlot(points: ColumnPoint<T>[]): VNode[];
}

/**
 * Renders columns. To be mixed into dojo-widgets/createWidget.
 */
export type ColumnPlot<T, S extends ColumnPlotState<T>> =
	InputSeries<T, S> & Invalidatable & ColumnPlotMixin<T>;

export interface ColumnPlotFactory<T> extends ComposeFactory<
	ColumnPlot<T, ColumnPlotState<T>>,
	ColumnPlotOptions<T, ColumnPlotState<T>>
> {
	<T, S extends ColumnPlotState<T>>(options?: ColumnPlotOptions<T, S>): ColumnPlot<T, S>;
}

const columnSeries = new WeakMap<ColumnPlot<any, ColumnPlotState<any>>, Column<any>[]>();
const shadowColumnHeights = new WeakMap<ColumnPlot<any, ColumnPlotState<any>>, number>();
const shadowColumnSpacings = new WeakMap<ColumnPlot<any, ColumnPlotState<any>>, number>();
const shadowColumnWidths = new WeakMap<ColumnPlot<any, ColumnPlotState<any>>, number>();
const shadowDomains = new WeakMap<ColumnPlot<any, ColumnPlotState<any>>, Domain>();

const createColumnPlot: ColumnPlotFactory<any> = compose({
	get columnHeight() {
		const plot: ColumnPlot<any, ColumnPlotState<any>> = this;
		const { columnHeight = shadowColumnHeights.get(plot) } = plot.state || {};
		return columnHeight;
	},

	set columnHeight(columnHeight) {
		const plot: ColumnPlot<any, ColumnPlotState<any>> = this;
		if (plot.state) {
			plot.setState({ columnHeight });
		}
		else {
			shadowColumnHeights.set(plot, columnHeight);
		}
		plot.invalidate();
	},

	get columnSpacing() {
		const plot: ColumnPlot<any, ColumnPlotState<any>> = this;
		const { columnSpacing = shadowColumnSpacings.get(plot) } = plot.state || {};
		return columnSpacing;
	},

	set columnSpacing(columnSpacing) {
		const plot: ColumnPlot<any, ColumnPlotState<any>> = this;
		if (plot.state) {
			plot.setState({ columnSpacing });
		}
		else {
			shadowColumnSpacings.set(plot, columnSpacing);
		}
		plot.invalidate();
	},

	get columnWidth() {
		const plot: ColumnPlot<any, ColumnPlotState<any>> = this;
		const { columnWidth = shadowColumnWidths.get(plot) } = plot.state || {};
		return columnWidth;
	},

	set columnWidth(columnWidth) {
		const plot: ColumnPlot<any, ColumnPlotState<any>> = this;
		if (plot.state) {
			plot.setState({ columnWidth });
		}
		else {
			shadowColumnWidths.set(plot, columnWidth);
		}
		plot.invalidate();
	},

	get domain() {
		const plot: ColumnPlot<any, ColumnPlotState<any>> = this;
		const { domain = shadowDomains.get(plot) } = plot.state || {};
		return normalizeDomain(domain);
	},

	set domain(domain) {
		const plot: ColumnPlot<any, ColumnPlotState<any>> = this;
		if (plot.state) {
			plot.setState({ domain });
		}
		else {
			shadowDomains.set(plot, domain);
		}
		plot.invalidate();
	},

	plot<T>(): ColumnPoint<T>[] {
		const plot: ColumnPlot<T, ColumnPlotState<T>> = this;
		const series = columnSeries.get(plot);
		const { columnHeight, columnSpacing, columnWidth: displayWidth, domain: [domainMin, domainMax] } = plot;

		let mostNegativeRelValue = 0;
		let mostNegativeValue = 0;
		let mostPositiveRelValue = 0;
		let mostPositiveValue = 0;
		for (const { relativeValue, value } of series) {
			if (relativeValue < mostNegativeRelValue) {
				mostNegativeRelValue = relativeValue;
			}
			else if (relativeValue > mostPositiveRelValue) {
				mostPositiveRelValue = relativeValue;
			}

			if (value < mostNegativeValue) {
				mostNegativeValue = value;
			}
			else if (value > mostPositiveValue) {
				mostPositiveValue = value;
			}
		}

		// Ensure that, when rendered, the distance from the bottom of the most negative column (or 0 if there are no
		// negative columns), to the top of the most positive column (or 0 if there are no positive columns), is equal
		// to the columnHeight. In other words the columnHeight should control the height of the chart irrespective of
		// the input values.
		let displayHeightCorrection = 1;
		if (mostNegativeValue < 0) {
			displayHeightCorrection /= mostPositiveRelValue - mostNegativeRelValue;
		}

		// Further correct the displayHeight if a domain minimum and/or maximum is specified. Only negative columns
		// who's value equals the domain minimum, or positive columns who's value equals the domain maximum, must be
		// rendered with the full column height.
		if (domainMin < 0) {
			if (domainMax === 0) {
				displayHeightCorrection *= mostNegativeValue / domainMin;
			}
			else if (domainMax > 0) {
				displayHeightCorrection *= (mostPositiveValue - mostNegativeValue) / (domainMax - domainMin);
			}
		}
		else if (domainMin === 0 && domainMax > 0) {
			displayHeightCorrection *= mostPositiveValue / domainMax;
		}
		// FIXME: Should this raise an error if domainMin > 0 or domainMax < 0? These are not valid domains for column
		// charts.

		// Maximum height of positive columns.
		let positiveHeight = mostPositiveValue === 0 ? 0 : columnHeight;
		if (mostNegativeValue < 0) {
			positiveHeight *= displayHeightCorrection;
		}

		return series.map((column, index) => {
			const isNegative = column.relativeValue < 0;
			const displayHeight = column.relativeValue * displayHeightCorrection * columnHeight;
			const x1 = (displayWidth + columnSpacing) * index;
			const x2 = x1 + displayWidth + columnSpacing;
			const y1 = isNegative ? positiveHeight : positiveHeight - displayHeight;
			const y2 = isNegative ? positiveHeight - displayHeight : positiveHeight;
			return {
				datum: column,
				displayHeight: Math.abs(displayHeight),
				displayWidth,
				isNegative,
				offsetLeft: columnSpacing / 2,
				x1,
				x2,
				y1,
				y2
			};
		});
	},

	renderPlot<T>(points: ColumnPoint<T>[]) {
		return points.map(({ datum, displayHeight, displayWidth, offsetLeft, x1, y1 }) => {
			return h('rect', {
				key: datum.input,
				height: String(displayHeight),
				width: String(displayWidth),
				x: String(x1 + offsetLeft),
				y: String(y1)
			});
		});
	}
}).mixin({
	mixin: createInputSeries,

	initialize<T>(
		instance: ColumnPlot<T, ColumnPlotState<T>>,
		{
			columnHeight = 0,
			columnSpacing = 0,
			columnWidth = 0,
			domain = [0, 0] as Domain,
			divisorOperator,
			valueSelector
		}: ColumnPlotOptions<T, ColumnPlotState<T>> = {}
	) {
		shadowColumnHeights.set(instance, columnHeight);
		shadowColumnSpacings.set(instance, columnSpacing);
		shadowColumnWidths.set(instance, columnWidth);
		shadowDomains.set(instance, normalizeDomain(domain));

		if (!divisorOperator) {
			// Allow a divisorOperator implementation to be mixed in.
			divisorOperator = (observable: InputObservable<T>, valueSelector: ValueSelector<T>) => {
				if (instance.divisorOperator) {
					return instance.divisorOperator(observable, valueSelector);
				}

				// Default to 1, don't throw at runtime.
				return Observable.of(1);
			};
		}

		if (!valueSelector) {
			// Allow a valueSelector implementation to be mixed in.
			valueSelector = (input: T) => {
				if (instance.valueSelector) {
					return instance.valueSelector(input);
				}

				// Default to 0, don't throw at runtime.
				return 0;
			};
		}

		// Initialize with an empty series since InputSeries only provides a series once it's available.
		columnSeries.set(instance, []);

		let handle: Handle = null;
		const subscribe = (inputSeries: Observable<T[]>) => {
			if (handle) {
				handle.destroy();
			}

			const subscription = columnar(inputSeries, valueSelector, divisorOperator)
				.subscribe((series) => {
					columnSeries.set(instance, series);
					instance.invalidate();
				});

			handle = instance.own({
				destroy() {
					subscription.unsubscribe();
				}
			});
		};

		// InputSeries may emit 'inputserieschange' before this initializer can listen for it.
		// Access the series directly.
		if (instance.inputSeries) {
			subscribe(instance.inputSeries);
		}
		// Update the series if it changes.
		instance.own(instance.on('inputserieschange', ({ observable }) => subscribe(observable)));

		instance.own({
			destroy() {
				columnSeries.delete(instance);
				shadowColumnHeights.delete(instance);
				shadowColumnWidths.delete(instance);
				shadowDomains.delete(instance);
			}
		});
	}
});

export default createColumnPlot;
