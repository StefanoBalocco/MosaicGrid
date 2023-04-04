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
        private _resizeHandler;
        constructor(containerId: string, itemClass: string, contentClass: string);
        Destroy(): void;
        private ResizeItem;
        ResizeItems(): void;
        AppendItems(items: HTMLCollectionOf<HTMLElement>): void;
        PrependItems(items: HTMLCollectionOf<HTMLElement>): void;
    }
    export function Create(options: LayoutOptions): Layout;
    export {};
}
