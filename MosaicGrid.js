"use strict";
var MosaicGrid;
(function (MosaicGrid) {
    class Layout {
        constructor(containerId, itemClass) {
            this._rowHeight = 0;
            this._rowGap = 0;
            this._container = document.getElementById(containerId);
            this._itemClass = itemClass;
            this._resizeHandler = () => { this.ResizeItems(); };
            if (this._container) {
                window.addEventListener('resize', this._resizeHandler);
                this.ResizeItems();
            }
        }
        Destroy() {
            window.removeEventListener('resize', this._resizeHandler);
            this._container = null;
        }
        ResizeItem(item) {
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
            if (0 < (this._rowHeight + this._rowGap)) {
                const content = item.querySelectorAll(':scope > div');
                if (content && (1 === content.length)) {
                    const style = window.getComputedStyle(item);
                    let height = (parseFloat(style.getPropertyValue('border-top-width')) || 0)
                        + (parseFloat(style.getPropertyValue('border-bottom-width')) || 0)
                        + (parseFloat(style.getPropertyValue('margin-top')) || 0)
                        + (parseFloat(style.getPropertyValue('margin-bottom')) || 0)
                        + (parseFloat(style.getPropertyValue('padding-top')) || 0)
                        + (parseFloat(style.getPropertyValue('padding-bottom')) || 0)
                        + content[0].getBoundingClientRect().height;
                    item.style.gridRowEnd = 'span ' + Math.ceil((height + this._rowGap) / (this._rowHeight + this._rowGap));
                }
            }
        }
        ResizeItems() {
            if (this._container) {
                const style = window.getComputedStyle(this._container);
                this._rowHeight = (parseFloat(style.getPropertyValue('grid-auto-rows')) || 0);
                this._rowGap = (parseFloat(style.getPropertyValue('grid-row-gap')) || 0);
                const items = this._container.getElementsByClassName(this._itemClass);
                const cFL = items.length;
                for (let iFL = 0; iFL < cFL; iFL++) {
                    const item = items[iFL];
                    this.ResizeItem(item);
                }
            }
        }
        AppendItems(items) {
            if (this._container) {
                const cFL = items.length;
                for (let iFL = 0; iFL < cFL; iFL++) {
                    const item = this._container.appendChild(items[iFL]);
                    this.ResizeItem(item);
                }
            }
        }
        PrependItems(items) {
            if (this._container) {
                if (0 < this._container.childNodes.length) {
                    const cFL = items.length;
                    for (let iFL = 0; iFL < cFL; iFL++) {
                        const item = this._container.insertBefore(items[iFL], this._container.childNodes[0]);
                        this.ResizeItem(item);
                    }
                }
                else {
                    this.AppendItems(items);
                }
            }
        }
    }
    function Create(containerId, itemClass) {
        return new Layout(containerId, itemClass);
    }
    MosaicGrid.Create = Create;
})(MosaicGrid || (MosaicGrid = {}));
