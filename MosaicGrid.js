class MosaicGridLayout {
    _container;
    _style;
    _itemClass;
    _resizeHandler;
    _resizeRequested = false;
    constructor(container, itemClass) {
        this._style = window.getComputedStyle(container);
        this._container = container;
        this._itemClass = itemClass;
        this._resizeHandler = () => {
            if (!this._resizeRequested) {
                this._resizeRequested = true;
                requestAnimationFrame(() => {
                    if (this._resizeRequested) {
                        this.ResizeItems();
                        this._resizeRequested = false;
                    }
                });
            }
        };
        window.addEventListener('resize', this._resizeHandler);
        this.ResizeItems();
    }
    Destroy() {
        window.removeEventListener('resize', this._resizeHandler);
        this._resizeRequested = false;
    }
    get _rowHeight() {
        return (parseFloat(this._style.getPropertyValue('grid-auto-rows')) || 0);
    }
    get _rowGap() {
        return (parseFloat(this._style.getPropertyValue('grid-row-gap')) || 0);
    }
    ResizeItem(rowHeight, rowGap, item) {
        const images = item.querySelectorAll('img');
        if (0 < images.length) {
            const cSL = images.length;
            for (let iSL = 0; iSL < cSL; iSL++) {
                if (!images[iSL].complete) {
                    images[iSL].onload = images[iSL].onerror = () => {
                        this.ResizeItem(this._rowHeight, this._rowGap, item);
                    };
                }
            }
        }
        if (0 < (rowHeight + rowGap)) {
            const content = item.querySelectorAll(':scope > div');
            if (1 === content.length) {
                const style = window.getComputedStyle(item);
                const height = (parseFloat(style.getPropertyValue('border-top-width')) || 0)
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
    _AppendOrPrepend(items, append = true) {
        append = append || !(0 < this._container.childNodes.length);
        const rowHeight = this._rowHeight;
        const rowGap = this._rowGap;
        const cFL = items.length;
        for (let iFL = cFL; iFL > 0; iFL--) {
            const item = items[iFL - 1];
            if (append) {
                const position = cFL - iFL;
                if (position) {
                    this._container.childNodes[this._container.childNodes.length - position].before(item);
                }
                else {
                    this._container.append(item);
                }
            }
            else {
                this._container.firstChild.before(item);
            }
            this.ResizeItem(rowHeight, rowGap, item);
        }
    }
    ResizeItems() {
        const items = this._container.querySelectorAll('.' + this._itemClass);
        const rowHeight = this._rowHeight;
        const rowGap = this._rowGap;
        const cFL = items.length;
        for (let iFL = 0; iFL < cFL; iFL++) {
            this.ResizeItem(rowHeight, rowGap, items[iFL]);
        }
    }
    AppendItems(items) {
        this._AppendOrPrepend(items);
    }
    PrependItems(items) {
        this._AppendOrPrepend(items, false);
    }
}
export function MosaicGrid(containerId, itemClass) {
    let returnValue;
    const container = document.getElementById(containerId);
    if (container) {
        returnValue = new MosaicGridLayout(container, itemClass);
    }
    return returnValue;
}
