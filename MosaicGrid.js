"use strict";
var MosaicGrid;
(function (MosaicGrid) {
    class Layout {
        constructor(container, itemClass) {
            this._container = container;
            this._itemClass = itemClass;
            this._resizeHandler = () => { this.ResizeItems(); };
            window.addEventListener('resize', this._resizeHandler);
            this.ResizeItems();
        }
        Destroy() {
            window.removeEventListener('resize', this._resizeHandler);
            delete this._container;
        }
        ResizeItem(rowHeight, rowGap, item) {
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
                        promise.then((item) => { this.ResizeItem(rowHeight, rowGap, item); }).catch(() => { });
                    }
                }
            }
            if (0 < (rowHeight + rowGap)) {
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
                    if ((1 === rowHeight) && (0 === rowGap)) {
                        item.style.gridRowEnd = 'span ' + Math.floor(height + rowGap);
                    }
                    else {
                        item.style.gridRowEnd = 'span ' + Math.ceil((height + rowGap) / (rowHeight + rowGap));
                    }
                }
            }
        }
        ResizeItems() {
            if (this._container) {
                const items = this._container.getElementsByClassName(this._itemClass);
                const style = window.getComputedStyle(this._container);
                const rowHeight = (parseFloat(style.getPropertyValue('grid-auto-rows')) || 0);
                const rowGap = (parseFloat(style.getPropertyValue('grid-row-gap')) || 0);
                const cFL = items.length;
                for (let iFL = 0; iFL < cFL; iFL++) {
                    const item = items[iFL];
                    this.ResizeItem(rowHeight, rowGap, item);
                }
            }
        }
        AppendItems(items) {
            if (this._container) {
                const style = window.getComputedStyle(this._container);
                const rowHeight = (parseFloat(style.getPropertyValue('grid-auto-rows')) || 0);
                const rowGap = (parseFloat(style.getPropertyValue('grid-row-gap')) || 0);
                const cFL = items.length;
                for (let iFL = 0; iFL < cFL; iFL++) {
                    const item = this._container.appendChild(items[iFL]);
                    this.ResizeItem(rowHeight, rowGap, item);
                }
            }
        }
        PrependItems(items) {
            if (this._container) {
                if (0 < this._container.childNodes.length) {
                    const style = window.getComputedStyle(this._container);
                    const rowHeight = (parseFloat(style.getPropertyValue('grid-auto-rows')) || 0);
                    const rowGap = (parseFloat(style.getPropertyValue('grid-row-gap')) || 0);
                    const cFL = items.length;
                    for (let iFL = 0; iFL < cFL; iFL++) {
                        const item = this._container.insertBefore(items[iFL], this._container.childNodes[0]);
                        this.ResizeItem(rowHeight, rowGap, item);
                    }
                }
                else {
                    this.AppendItems(items);
                }
            }
        }
    }
    function Create(containerId, itemClass) {
        let returnValue = null;
        const container = document.getElementById(containerId);
        if (container) {
            returnValue = new Layout(container, itemClass);
        }
        return returnValue;
    }
    MosaicGrid.Create = Create;
})(MosaicGrid || (MosaicGrid = {}));
