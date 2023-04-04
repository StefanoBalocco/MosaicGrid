namespace MosaicGrid {
	type LayoutOptions = {
		containerId: string,
		itemClass: string,
		contentClass: string
	};
	class Layout {
		private _container: ( HTMLElement | null );
		private _contentClass: string;
		private _itemClass: string;
		private _rowHeight: number = 0;
		private _rowGap: number = 0;
		private _resizeHandler: () => void;

		constructor( containerId: string, itemClass: string, contentClass: string ) {
			this._container = document.getElementById( containerId );
			this._contentClass = contentClass;
			this._itemClass = itemClass;
			this._resizeHandler = () => { this.ResizeItems };
			if( this._container ) {
				window.addEventListener( 'resize', this._resizeHandler );
				this.ResizeItems();
			}
		}

		public Destroy() {
			window.removeEventListener( 'resize', this._resizeHandler );
			this._container = null;
		}

		private ResizeItem( item: HTMLElement ) {
			const images: HTMLCollectionOf<HTMLImageElement> = item.getElementsByTagName( 'img' );
			if( 0 < images.length ) {
				const cSL = images.length;
				for( let iSL = 0; iSL < cSL; iSL++ ) {
					if( !images[ iSL ].complete ) {
						const promise: Promise<HTMLElement> = new Promise( ( resolve ) => {
							images[ iSL ].onload = () => { resolve( item ) };
							images[ iSL ].onerror = () => { resolve( item ) };
							if( images[ iSL ].complete ) { resolve( item ); }
						} );
						promise.then( ( item: HTMLElement ) => { this.ResizeItem( item ); } ).catch( () => { } );
					}
				}
			}
			if( 0 < ( this._rowHeight + this._rowGap ) ) {
				const content = item.getElementsByClassName( this._contentClass );
				if( content && ( 1 === content.length ) ) {
					let height = parseFloat( window.getComputedStyle( item ).getPropertyValue( 'border-top-width' ) );
					height += parseFloat( window.getComputedStyle( item ).getPropertyValue( 'border-bottom-width' ) );
					height += content[ 0 ].getBoundingClientRect().height;
					item.style.gridRowEnd = 'span ' + Math.ceil( ( height + this._rowGap ) / ( this._rowHeight + this._rowGap ) );
				}
			}
		}

		public ResizeItems() {
			if( this._container ) {
				this._rowHeight = parseFloat( window.getComputedStyle( this._container ).getPropertyValue( 'grid-auto-rows' ) );
				this._rowGap = parseFloat( window.getComputedStyle( this._container ).getPropertyValue( 'grid-row-gap' ) );
				const items: HTMLCollectionOf<HTMLElement> = <HTMLCollectionOf<HTMLElement>>this._container.getElementsByClassName( this._itemClass );
				const cFL = items.length;
				for( let iFL = 0; iFL < cFL; iFL++ ) {
					const item: HTMLElement = items[ iFL ];
					this.ResizeItem( item );
				}
			}
		}

		public AppendItems( items: HTMLCollectionOf<HTMLElement> ) {
			if( this._container ) {
				const cFL = items.length;
				for( let iFL = 0; iFL < cFL; iFL++ ) {
					const item = this._container.appendChild( items[ iFL ] );
					this.ResizeItem( item );
				}
			}
		}

		public PrependItems( items: HTMLCollectionOf<HTMLElement> ) {
			if( this._container ) {
				if( 0 < this._container.childNodes.length ) {
					const cFL = items.length;
					for( let iFL = 0; iFL < cFL; iFL++ ) {
						const item = this._container.insertBefore( items[ iFL ], this._container.childNodes[ 0 ] );
						this.ResizeItem( item );
					}
				} else {
					this.AppendItems( items )
				}
			}
		}
	}

	export function Create( options: LayoutOptions ): Layout {
		return new Layout( options.containerId, options.itemClass, options.contentClass );
	}
}