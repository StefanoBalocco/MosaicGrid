type Nullable<T> = T | null;
type Undefinedable<T> = T | undefined;

class MosaicGridLayout {
	private readonly _container: HTMLElement;
	private readonly _style: CSSStyleDeclaration;
	private readonly _itemClass: string;
	private readonly _resizeHandler: () => void;
	private _resizeRequested: boolean = false;

	constructor( container: HTMLElement, itemClass: string ) {
		this._style = window.getComputedStyle( container );
		this._container = container;
		this._itemClass = itemClass;
		this._resizeHandler = (): void => {
			if( !this._resizeRequested ) {
				this._resizeRequested = true;
				requestAnimationFrame(
					() => {
						if( this._resizeRequested ) {
							this.ResizeItems();
							this._resizeRequested = false;
						}
					}
				);
			}
		};
		window.addEventListener( 'resize', this._resizeHandler );
		this.ResizeItems();
	}

	public Destroy(): void {
		window.removeEventListener( 'resize', this._resizeHandler );
		this._resizeRequested = false;
	}

	private get _rowHeight(): number {
		return ( parseFloat( this._style.getPropertyValue( 'grid-auto-rows' ) ) || 0 );
	}

	private get _rowGap(): number {
		return ( parseFloat( this._style.getPropertyValue( 'grid-row-gap' ) ) || 0 );
	}

	private ResizeItem( rowHeight: number, rowGap: number, item: HTMLElement ): void {
		const images: NodeListOf<HTMLImageElement> = item.querySelectorAll<HTMLImageElement>( 'img' );
		if( 0 < images.length ) {
			const cSL: number = images.length;
			for( let iSL: number = 0; iSL < cSL; iSL++ ) {
				if( !images[ iSL ].complete ) {
					images[ iSL ].onload = images[ iSL ].onerror = () => {
						this.ResizeItem( this._rowHeight, this._rowGap, item );
					};
				}
			}
		}
		if( 0 < ( rowHeight + rowGap ) ) {
			const content: NodeListOf<HTMLElement> = item.querySelectorAll<HTMLElement>( ':scope > div' );
			if( 1 === content.length ) {
				const style: CSSStyleDeclaration = window.getComputedStyle( item );
				const height: number = ( parseFloat( style.getPropertyValue( 'border-top-width' ) ) || 0 )
															 + ( parseFloat( style.getPropertyValue( 'border-bottom-width' ) ) || 0 )
															 + ( parseFloat( style.getPropertyValue( 'margin-top' ) ) || 0 )
															 + ( parseFloat( style.getPropertyValue( 'margin-bottom' ) ) || 0 )
															 + ( parseFloat( style.getPropertyValue( 'padding-top' ) ) || 0 )
															 + ( parseFloat( style.getPropertyValue( 'padding-bottom' ) ) || 0 )
															 + content[ 0 ].getBoundingClientRect().height;
				if( ( 1 === rowHeight ) && ( 0 === rowGap ) ) {
					item.style.gridRowEnd = 'span ' + Math.floor( height + rowGap );
				} else {
					item.style.gridRowEnd = 'span ' + Math.ceil( ( height + rowGap ) / ( rowHeight + rowGap ) );
				}
			}
		}
	}

	private _AppendOrPrepend( items: NodeListOf<HTMLElement>, append: boolean = true ): void {
		append = append || !( 0 < this._container.childNodes.length );
		const rowHeight: number = this._rowHeight;
		const rowGap: number = this._rowGap;
		const cFL: number = items.length;
		for( let iFL: number = cFL; iFL > 0; iFL-- ) {
			const item: HTMLElement = items[ iFL - 1 ];
			if( append ) {
				const position: number = cFL - iFL;
				if( position ) {
					this._container.childNodes[ this._container.childNodes.length - position ].before( item );
				} else {
					this._container.append( item );
				}
			} else {
				this._container.firstChild!.before( item );
			}
			this.ResizeItem( rowHeight, rowGap, item );
		}
	}

	public ResizeItems(): void {
		const items: NodeListOf<HTMLElement> = this._container.querySelectorAll<HTMLElement>( '.' + this._itemClass );
		const rowHeight: number = this._rowHeight;
		const rowGap: number = this._rowGap;
		const cFL: number = items.length;
		for( let iFL: number = 0; iFL < cFL; iFL++ ) {
			this.ResizeItem( rowHeight, rowGap, items[ iFL ] );
		}
	}

	public AppendItems( items: NodeListOf<HTMLElement> ): void {
		this._AppendOrPrepend( items );
	}

	public PrependItems( items: NodeListOf<HTMLElement> ): void {
		this._AppendOrPrepend( items, false );
	}
}

export function MosaicGrid( containerId: string, itemClass: string ): Undefinedable<MosaicGridLayout> {
	let returnValue: Undefinedable<MosaicGridLayout>;
	const container: Nullable<HTMLElement> = document.getElementById( containerId );
	if( container ) {
		returnValue = new MosaicGridLayout( container, itemClass );
	}
	return returnValue;
}
