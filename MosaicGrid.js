"use strict";
var MosaicGrid;
(function (MosaicGrid) {
    class Layout {
        constructor(options) {
            this._rowHeight = 0;
            this._rowGap = 0;
            this._container = document.getElementById(options.containerId);
            this._contentClass = options.contentClass;
            this._itemClass = options.itemClass;
            if (this._container) {
                this._rowHeight = parseFloat(window.getComputedStyle(this._container).getPropertyValue('grid-auto-rows'));
                this._rowGap = parseFloat(window.getComputedStyle(this._container).getPropertyValue('grid-row-gap'));
            }
            window.addEventListener('resize', () => { this.ResizeItems(); });
            this.ResizeItems();
        }
        ResizeItem(item) {
            if (0 < (this._rowHeight + this._rowGap)) {
                const content = item.getElementsByClassName(this._contentClass);
                if (content && (1 === content.length)) {
                    let height = parseFloat(window.getComputedStyle(item).getPropertyValue('border-top-width'));
                    height += parseFloat(window.getComputedStyle(item).getPropertyValue('border-bottom-width'));
                    height += content[0].getBoundingClientRect().height;
                    item.style.gridRowEnd = 'span ' + Math.ceil((height + this._rowGap) / (this._rowHeight + this._rowGap));
                }
            }
        }
        ResizeItems() {
            if (this._container) {
                const items = this._container.getElementsByClassName(this._itemClass);
                const cFL = items.length;
                for (let iFL = 0; iFL < cFL; iFL++) {
                    const item = items[iFL];
                    this.ResizeItem(item);
                    const images = item.getElementsByTagName('img');
                    if (0 < images.length) {
                        const cSL = images.length;
                        for (let iSL = 0; iSL < cSL; iSL++) {
                            if (!images[iSL].complete) {
                                const promise = new Promise((resolve) => {
                                    images[iSL].onload = () => { resolve(item); };
                                    images[iSL].onerror = () => { resolve(item); };
                                    if (images[iSL].complete) {
                                        resolve(item);
                                    }
                                });
                                promise.then((item) => { this.ResizeItem(item); }).catch(() => { });
                            }
                        }
                    }
                }
            }
        }
    }
    function Create(options) {
        return new Layout(options);
    }
    MosaicGrid.Create = Create;
})(MosaicGrid || (MosaicGrid = {}));
