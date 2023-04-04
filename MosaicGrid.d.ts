declare namespace MosaicGrid {
    type LayoutOptions = {
        containerId: string;
        itemClass: string;
        contentClass: string;
    };
    class Layout {
        private _container;
        private _contentClass;
        private _itemClass;
        private _rowHeight;
        private _rowGap;
        constructor(options: LayoutOptions);
        private ResizeItem;
        private ResizeItems;
    }
    export function Create(options: LayoutOptions): Layout;
    export {};
}
