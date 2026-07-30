import test from 'ava';
import { JSDOM } from 'jsdom';
import MosaicGridOriginal from '../../dist/MosaicGrid.js';
// @ts-expect-error MosaicGrid.min.js intentionally shares the original public API.
import MosaicGridMinified from '../../dist/MosaicGrid.min.js';

// ── JSDOM bootstrap ───────────────────────────────────────────────────────────

const dom: JSDOM = new JSDOM( '<html><body></body></html>', { url: 'http://localhost' } );
const window: Window & typeof globalThis = dom.window as unknown as Window & typeof globalThis;

globalThis.window = window;
globalThis.document = window.document;
globalThis.HTMLElement = window.HTMLElement;
globalThis.Node = window.Node;

let _rafQueue: FrameRequestCallback[] = [];

globalThis.requestAnimationFrame = ( callback: FrameRequestCallback ): number => {
	_rafQueue.push( callback );
	return _rafQueue.length;
};
window.requestAnimationFrame = globalThis.requestAnimationFrame;

function flushRaf(): void {
	const pending: FrameRequestCallback[] = _rafQueue.splice( 0 );
	const cL1: number = pending.length;

	for( let iL1: number = 0; iL1 < cL1; iL1++ ) {
		pending[ iL1 ]( 0 );
	}
}

function clearRaf(): void {
	_rafQueue = [];
}

// ── getComputedStyle mock ─────────────────────────────────────────────────────

const _styleRegistry: WeakMap<Element, Readonly<Record<string, string>>> = new WeakMap();

window.getComputedStyle = ( element: Element, _pseudoElt?: string | null ): CSSStyleDeclaration => {
	const registered: Readonly<Record<string, string>> = _styleRegistry.get( element ) ?? {};

	return {
		getPropertyValue( property: string ): string {
			const returnValue: string = registered[ property ];

			if( undefined !== returnValue ) {
				return returnValue;
			}

			return '';
		}
	} as CSSStyleDeclaration;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function resetDom(): void {
	document.body.innerHTML = '';
	_styleRegistry.delete( document.body );
	clearRaf();
}

function setComputedProperties( element: Element, properties: Readonly<Record<string, string>> ): void {
	_styleRegistry.set( element, properties );
}

function createContainer( id: string, rowHeight: string, rowGap: string ): HTMLElement {
	const container: HTMLElement = document.createElement( 'div' );
	container.id = id;
	container.className = 'grid';

	document.body.append( container );

	setComputedProperties( container, {
		'grid-auto-rows': rowHeight,
		'grid-row-gap': rowGap
	} );

	return container;
}

function createItem( id: string, contentHeight: number, properties?: Readonly<Record<string, string>> ): HTMLElement {
	const item: HTMLElement = document.createElement( 'div' );
	item.id = id;
	item.className = 'item';

	const inner: HTMLElement = document.createElement( 'div' );
	inner.getBoundingClientRect = (): DOMRect => {
		return {
			x: 0,
			y: 0,
			width: 0,
			height: contentHeight,
			top: 0,
			right: 0,
			bottom: contentHeight,
			left: 0,
			toJSON: (): Record<string, number> => ( { x: 0, y: 0, width: 0, height: contentHeight } )
		} as DOMRect;
	};

	item.append( inner );

	if( properties ) {
		setComputedProperties( item, properties );
	}

	return item;
}

function setContentHeight( item: HTMLElement, height: number ): DOMRect {
	const returnValue: DOMRect = {
		x: 0,
		y: 0,
		width: 0,
		height: height,
		top: 0,
		right: 0,
		bottom: height,
		left: 0,
		toJSON: (): Record<string, number> => ( { x: 0, y: 0, width: 0, height: height } )
	} as DOMRect;

	const inner: HTMLDivElement | null = item.querySelector<HTMLDivElement>( ':scope > div' );

	if( inner ) {
		inner.getBoundingClientRect = (): DOMRect => returnValue;
	}

	return returnValue;
}

interface ImageItem {
	readonly item: HTMLElement;
	readonly image: HTMLImageElement;
}

function createImageItem( id: string, contentHeight: number, complete: boolean ): ImageItem {
	const item: HTMLElement = createItem( id, contentHeight );
	const inner: HTMLDivElement | null = item.querySelector<HTMLDivElement>( ':scope > div' );
	const image: HTMLImageElement = document.createElement( 'img' );

	Object.defineProperty( image, 'complete', { configurable: true, value: complete } );

	if( inner ) {
		inner.append( image );
	}

	return { item, image };
}

function childIds( container: HTMLElement ): string[] {
	const returnValue: string[] = [];
	const cL1: number = container.children.length;

	for( let iL1: number = 0; iL1 < cL1; iL1++ ) {
		returnValue.push( ( container.children[ iL1 ] as HTMLElement ).id );
	}

	return returnValue;
}

// ── Targets ───────────────────────────────────────────────────────────────────

const targets: readonly { tag: string; mosaicGrid: typeof MosaicGridOriginal; }[] = [
	{
		tag: '[MosaicGrid-original]',
		mosaicGrid: MosaicGridOriginal
	},
	{
		tag: '[MosaicGrid-minified]',
		mosaicGrid: MosaicGridMinified as typeof MosaicGridOriginal
	}
];

// ── Tests ─────────────────────────────────────────────────────────────────────

for( const target of targets ) {
	const { tag, mosaicGrid } = target;

	test.serial( `${ tag } Missing container returns undefined`, ( t ) => {
		resetDom();

		const result: unknown = mosaicGrid( 'missing', 'item' );

		t.is( result, undefined );
	} );

	test.serial( `${ tag } General resize branch sets gridRowEnd to span 3`, ( t ) => {
		resetDom();

		const container: HTMLElement = createContainer( 'test', '10px', '2px' );
		const item: HTMLElement = createItem( 'item-1', 7, {
			'border-top-width': '1px',
			'border-bottom-width': '2px',
			'margin-top': '3px',
			'margin-bottom': '4px',
			'padding-top': '5px',
			'padding-bottom': '6px'
		} );
		container.append( item );

		const layout: ReturnType<typeof MosaicGridOriginal> = mosaicGrid( 'test', 'item' );

		if( layout ) {
			t.teardown( () => { layout.Destroy(); } );
			t.is( item.style.gridRowEnd, 'span 3' );
		} else {
			t.fail( 'Expected a MosaicGridLayout instance, got undefined' );
		}
	} );

	test.serial( `${ tag } One-pixel special branch sets gridRowEnd to span 5`, ( t ) => {
		resetDom();

		const container: HTMLElement = createContainer( 'test', '1px', '0px' );
		const item: HTMLElement = createItem( 'item-1', 5.9 );
		container.append( item );

		const layout: ReturnType<typeof MosaicGridOriginal> = mosaicGrid( 'test', 'item' );

		if( layout ) {
			t.teardown( () => { layout.Destroy(); } );
			t.is( item.style.gridRowEnd, 'span 5' );
		} else {
			t.fail( 'Expected a MosaicGridLayout instance, got undefined' );
		}
	} );

	test.serial( `${ tag } Zero divisor guard leaves pre-set gridRowEnd intact`, ( t ) => {
		resetDom();

		const container: HTMLElement = createContainer( 'test', '0px', '0px' );
		const item: HTMLElement = createItem( 'item-1', 10 );
		item.style.gridRowEnd = 'span 9';
		container.append( item );

		const layout: ReturnType<typeof MosaicGridOriginal> = mosaicGrid( 'test', 'item' );

		if( layout ) {
			t.teardown( () => { layout.Destroy(); } );
			t.is( item.style.gridRowEnd, 'span 9' );
		} else {
			t.fail( 'Expected a MosaicGridLayout instance, got undefined' );
		}
	} );

	test.serial( `${ tag } Negative rowHeight+rowGap guard leaves pre-set gridRowEnd intact`, ( t ) => {
		resetDom();

		const container: HTMLElement = createContainer( 'test', '-2px', '1px' );
		const item: HTMLElement = createItem( 'item-1', 10 );
		item.style.gridRowEnd = 'span 9';
		container.append( item );

		const layout: ReturnType<typeof MosaicGridOriginal> = mosaicGrid( 'test', 'item' );

		if( layout ) {
			t.teardown( () => { layout.Destroy(); } );
			t.is( item.style.gridRowEnd, 'span 9' );
		} else {
			t.fail( 'Expected a MosaicGridLayout instance, got undefined' );
		}
	} );

	test.serial( `${ tag } Invalid content guard leaves gridRowEnd empty`, ( t ) => {
		resetDom();

		const container: HTMLElement = createContainer( 'test', '10px', '2px' );
		const item: HTMLElement = document.createElement( 'div' );
		item.id = 'item-1';
		item.className = 'item';
		// no direct child div
		container.append( item );

		const layout: ReturnType<typeof MosaicGridOriginal> = mosaicGrid( 'test', 'item' );

		if( layout ) {
			t.teardown( () => { layout.Destroy(); } );
			t.is( item.style.gridRowEnd, '' );
		} else {
			t.fail( 'Expected a MosaicGridLayout instance, got undefined' );
		}
	} );

	test.serial( `${ tag } AppendItems preserves existing children and appends new ones`, ( t ) => {
		resetDom();

		const container: HTMLElement = createContainer( 'test', '10px', '2px' );
		const a: HTMLElement = createItem( 'a', 5 );
		const b: HTMLElement = createItem( 'b', 5 );
		container.append( a, b );

		const c: HTMLElement = createItem( 'c', 5 );
		const d: HTMLElement = createItem( 'd', 5 );
		const temp: HTMLElement = document.createElement( 'div' );
		temp.append( c, d );
		const nodeList: NodeListOf<HTMLElement> = temp.querySelectorAll<HTMLElement>( '.item' );

		const layout: ReturnType<typeof MosaicGridOriginal> = mosaicGrid( 'test', 'item' );

		if( layout ) {
			t.teardown( () => { layout.Destroy(); } );
			layout.AppendItems( nodeList );
			t.deepEqual( childIds( container ), [ 'a', 'b', 'c', 'd' ] );
		} else {
			t.fail( 'Expected a MosaicGridLayout instance, got undefined' );
		}
	} );

	test.serial( `${ tag } PrependItems inserts before existing children`, ( t ) => {
		resetDom();

		const container: HTMLElement = createContainer( 'test', '10px', '2px' );
		const a: HTMLElement = createItem( 'a', 5 );
		const b: HTMLElement = createItem( 'b', 5 );
		container.append( a, b );

		const c: HTMLElement = createItem( 'c', 5 );
		const d: HTMLElement = createItem( 'd', 5 );
		const temp: HTMLElement = document.createElement( 'div' );
		temp.append( c, d );
		const nodeList: NodeListOf<HTMLElement> = temp.querySelectorAll<HTMLElement>( '.item' );

		const layout: ReturnType<typeof MosaicGridOriginal> = mosaicGrid( 'test', 'item' );

		if( layout ) {
			t.teardown( () => { layout.Destroy(); } );
			layout.PrependItems( nodeList );
			t.deepEqual( childIds( container ), [ 'c', 'd', 'a', 'b' ] );
		} else {
			t.fail( 'Expected a MosaicGridLayout instance, got undefined' );
		}
	} );

	test.serial( `${ tag } PrependItems on empty container adds children`, ( t ) => {
		resetDom();

		const container: HTMLElement = createContainer( 'test', '10px', '2px' );

		const a: HTMLElement = createItem( 'a', 5 );
		const b: HTMLElement = createItem( 'b', 5 );
		const temp: HTMLElement = document.createElement( 'div' );
		temp.append( a, b );
		const nodeList: NodeListOf<HTMLElement> = temp.querySelectorAll<HTMLElement>( '.item' );

		const layout: ReturnType<typeof MosaicGridOriginal> = mosaicGrid( 'test', 'item' );

		if( layout ) {
			t.teardown( () => { layout.Destroy(); } );
			layout.PrependItems( nodeList );
			t.deepEqual( childIds( container ), [ 'a', 'b' ] );
		} else {
			t.fail( 'Expected a MosaicGridLayout instance, got undefined' );
		}
	} );

	test.serial( `${ tag } Destroy removes resize listener`, ( t ) => {
		resetDom();

		const container: HTMLElement = createContainer( 'test', '10px', '2px' );
		const item: HTMLElement = createItem( 'item-1', 7 );
		container.append( item );

		const layout: ReturnType<typeof MosaicGridOriginal> = mosaicGrid( 'test', 'item' );

		if( layout ) {
			t.teardown( () => { layout.Destroy(); } );
			item.style.gridRowEnd = '';
			layout.Destroy();
			window.dispatchEvent( new window.Event( 'resize' ) );
			// After destroy, the resize handler should not fire; gridRowEnd stays empty.
			t.is( item.style.gridRowEnd, '' );
		} else {
			t.fail( 'Expected a MosaicGridLayout instance, got undefined' );
		}
	} );

	test.serial( `${ tag } Resize handler schedules and applies a recalculation`, ( t ) => {
		resetDom();

		const container: HTMLElement = createContainer( 'test', '10px', '0px' );
		const item: HTMLElement = createItem( 'item-1', 5 );
		container.append( item );

		const layout: ReturnType<typeof MosaicGridOriginal> = mosaicGrid( 'test', 'item' );

		if( layout ) {
			t.teardown( () => {
				clearRaf();
				layout.Destroy();
			} );
			t.is( item.style.gridRowEnd, 'span 1' );

			setContentHeight( item, 15 );

			window.dispatchEvent( new window.Event( 'resize' ) );

			t.is( item.style.gridRowEnd, 'span 1' );
			t.is( _rafQueue.length, 1 );

			flushRaf();

			t.is( item.style.gridRowEnd, 'span 2' );
			t.is( _rafQueue.length, 0 );
		} else {
			t.fail( 'Expected a MosaicGridLayout instance, got undefined' );
		}
	} );

	test.serial( `${ tag } Resize handler coalesces a second pending event`, ( t ) => {
		resetDom();

		const container: HTMLElement = createContainer( 'test', '10px', '0px' );
		const item: HTMLElement = createItem( 'item-1', 5 );
		container.append( item );

		const layout: ReturnType<typeof MosaicGridOriginal> = mosaicGrid( 'test', 'item' );

		if( layout ) {
			t.teardown( () => {
				clearRaf();
				layout.Destroy();
			} );

			setContentHeight( item, 15 );
			window.dispatchEvent( new window.Event( 'resize' ) );
			window.dispatchEvent( new window.Event( 'resize' ) );

			t.is( _rafQueue.length, 1 );
			flushRaf();
			t.is( item.style.gridRowEnd, 'span 2' );
		} else {
			t.fail( 'Expected a MosaicGridLayout instance, got undefined' );
		}
	} );

	test.serial( `${ tag } Destroy makes a pending resize callback inert`, ( t ) => {
		resetDom();

		const container: HTMLElement = createContainer( 'test', '10px', '0px' );
		const item: HTMLElement = createItem( 'item-1', 5 );
		container.append( item );

		const layout: ReturnType<typeof MosaicGridOriginal> = mosaicGrid( 'test', 'item' );

		if( layout ) {
			t.teardown( () => {
				clearRaf();
				layout.Destroy();
			} );
			t.is( item.style.gridRowEnd, 'span 1' );

			setContentHeight( item, 15 );

			window.dispatchEvent( new window.Event( 'resize' ) );
			t.is( _rafQueue.length, 1 );

			layout.Destroy();

			flushRaf();
			t.is( item.style.gridRowEnd, 'span 1' );

			window.dispatchEvent( new window.Event( 'resize' ) );
			t.is( _rafQueue.length, 0 );
		} else {
			t.fail( 'Expected a MosaicGridLayout instance, got undefined' );
		}
	} );

	test.serial( `${ tag } Incomplete images install shared handlers and recalculate on load and error`, ( t ) => {
		resetDom();

		const container: HTMLElement = createContainer( 'test', '10px', '0px' );
		const { item, image } = createImageItem( 'item-1', 5, false );
		container.append( item );

		const layout: ReturnType<typeof MosaicGridOriginal> = mosaicGrid( 'test', 'item' );

		if( layout ) {
			t.teardown( () => {
				clearRaf();
				image.onload = null;
				image.onerror = null;
				layout.Destroy();
			} );
			t.is( item.style.gridRowEnd, 'span 1' );

			if( image.onload && image.onerror ) {
				t.is( image.onload, image.onerror );

				setContentHeight( item, 25 );
				image.dispatchEvent( new window.Event( 'load' ) );
				t.is( item.style.gridRowEnd, 'span 3' );

				setContentHeight( item, 5 );
				image.dispatchEvent( new window.Event( 'error' ) );
				t.is( item.style.gridRowEnd, 'span 1' );
			} else {
				t.fail( 'Expected image handlers to be set' );
			}
		} else {
			t.fail( 'Expected a MosaicGridLayout instance, got undefined' );
		}
	} );

	test.serial( `${ tag } Complete images leave handlers unset`, ( t ) => {
		resetDom();

		const container: HTMLElement = createContainer( 'test', '10px', '0px' );
		const { item, image } = createImageItem( 'item-1', 5, true );
		container.append( item );

		const layout: ReturnType<typeof MosaicGridOriginal> = mosaicGrid( 'test', 'item' );

		if( layout ) {
			t.teardown( () => {
				clearRaf();
				image.onload = null;
				image.onerror = null;
				layout.Destroy();
			} );
			t.is( image.onload, null );
			t.is( image.onerror, null );
		} else {
			t.fail( 'Expected a MosaicGridLayout instance, got undefined' );
		}
	} );
}
