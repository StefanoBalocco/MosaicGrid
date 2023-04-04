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

		constructor( options: LayoutOptions ) {
			this._container = document.getElementById( options.containerId );
			this._contentClass = options.contentClass;
			this._itemClass = options.itemClass;
			if( this._container ) {
				this._rowHeight = parseFloat( window.getComputedStyle( this._container ).getPropertyValue( 'grid-auto-rows' ) );
				this._rowGap = parseFloat( window.getComputedStyle( this._container ).getPropertyValue( 'grid-row-gap' ) );
			}
			window.addEventListener( 'resize', () => { this.ResizeItems() } );
			this.ResizeItems();
		}

		private ResizeItem( item: HTMLElement ) {
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

		private ResizeItems() {
			if( this._container ) {
				const items = this._container.getElementsByClassName( this._itemClass );
				const cFL = items.length;
				for( let iFL = 0; iFL < cFL; iFL++ ) {
					const item: HTMLElement = <HTMLElement>items[ iFL ];
					this.ResizeItem( item );
					const images = item.getElementsByTagName( 'img' );
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
				}

			}
		}
	}

	export function Create( options: LayoutOptions ): Layout {
		return new Layout( options );
	}
}