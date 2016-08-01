import { Datum } from '../data/interfaces';

/**
 * Limits how values are plotted given the chart size.
 *
 * The first number is the minimum value, which must be less than or equal to zero.
 * The second number is the maximum value, which must be greater than or equal to zero.
 *
 * When [0, 0] no limit applies.
 *
 * For example for a column chart, [0, 50] means inputs with value=50 are plotted with the full column height.
 */
export type Domain = [number, number];

/**
 * Option for defining a domain.
 *
 * If just a number, and less than zero, the resulting domain will be [number, 0]. If greater than zero it'll be
 * [0, number]. Otherwise the domain will be [0, 0].
 */
export type DomainOption = number | Domain;

/**
 * Provides the interface for the invalidate() method from dojo-widgets/mixins/createCachedRenderMixin.
 *
 * It's used in mixins that are designed to be used with a class that contains an invalidate() implementation. Using
 * this interface, and leaving invalidate() optional, better expresses the requirement than using an <any> hammer.
 */
export interface Invalidatable {
	invalidate?(): void;
}

/**
 * Describes a plot point.
 *
 * Note that the rendered shape may not be a "point" at all, and may occupy only a subset of the area described by the
 * point positions. If applicable the area should include any spacing up to the next point.
 *
 * All coordinates assume (0, 0) starts in the top-left corner of the coordinate system.
 */
export interface Point<D extends Datum<any>> {
	/**
	 * Datum represented by the point.
	 */
	datum: D;

	/**
	 * Whether the point is on a negative axis.
	 */
	isNegative: boolean;

	/**
	 * Horizontal start position.
	 */
	x1: number;

	/**
	 * Horizontal end position.
	 */
	x2: number;

	/**
	 * Vertical start position.
	 */
	y1: number;

	/**
	 * Vertical end position.
	 */
	y2: number;
}
