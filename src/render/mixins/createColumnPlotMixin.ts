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
		const { columnHeight, columnSpacing, columnWidth: displayWidth, domain } = plot;

		let displayHeightCorrection = 1;
		let positiveHeight = columnHeight;

		// Ensure that, when rendered, the distance from the bottom of the most negative column (or 0 if there are no
		// negative columns), to the top of the most positive column (or 0 if there are no positive columns), is equal
		// to the columnHeight. In other words the columnHeight should control the height of the chart irrespective of
		// the input values.
		// {
			let mostNegative = 0;
			let mostPositive = 0;
			for (const { relativeValue } of series) {
				if (relativeValue < mostNegative) {
					mostNegative = relativeValue;
				}
				if (relativeValue > mostPositive) {
					mostPositive = relativeValue;
				}
			}
			const delta = mostPositive - mostNegative;
			displayHeightCorrection /= delta;
			// if (mostNegative < 0) {
			// 	positiveHeight = displayHeightCorrection * columnHeight;
			// }
		// }

		// Further correct the displayHeight if a domain minimum and/or maximum is specified. Only negative columns
		// who's value equals the domain minimum, or positive columns who's value equals the domain maximum, must be
		// rendered with the full column height.
		if (domain[0] !== 0 || domain[1] !== 0) {
			const values = series.map(({ value }) => value);
			// Ensure maxValue is at least 0. It may be negative if the series does not contain any positive
			// columns, even though the domain accounts for them.
			let maxValue = Math.max(0, ...values);
			// Ensure minValue is at most 0. It may be positive if the series does not contain any negative
			// columns, even though the domain accounts for them.
			let minValue = Math.min(0, ...values);

			// Ignore domains where the first value is positive, or the second negative. These are not valid domains
			// for column charts.
			if (domain[0] < 0) {
				if (domain[1] === 0) {
					// Ignore maxValue, no values are supposed to exceed 0.
					// TODO: Should this raise an error if minValue is >= 0?
					displayHeightCorrection *= minValue / domain[0];
					positiveHeight = 0;
				}
				else if (domain[1] > 0) {
					// Assume series does not consist soley of 0 value inputs.
					const delta = (maxValue - minValue);
					const correction = delta / (domain[1] - domain[0]);
					displayHeightCorrection *= correction;
					// positiveHeight = maxValue / delta * correction * columnHeight;
				}
			}
			else if (domain[0] === 0 && domain[1] > 0) {
				// Ignore minValue, no values are supposed to be below 0.
				// TODO: Should this raise an error if maxValue is <= 0?
				displayHeightCorrection *= maxValue / domain[1];
				// positiveHeight = columnHeight;
			}
		}

		positiveHeight = mostPositive > 0 ? displayHeightCorrection * columnHeight : 0;

		return series.map((column, index) => {
			const displayHeight = column.relativeValue * displayHeightCorrection * columnHeight;
			const x1 = (displayWidth + columnSpacing) * index;
			const x2 = x1 + displayWidth + columnSpacing;
			const y1 = (displayHeight < 0 ? positiveHeight : positiveHeight - displayHeight);
			const y2 = (displayHeight < 0 ? positiveHeight - displayHeight : positiveHeight);
			return {
				datum: column,
				displayHeight: Math.abs(displayHeight),
				displayWidth,
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
