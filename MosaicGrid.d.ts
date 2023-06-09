declare namespace MosaicGrid {
    class Layout {
        private _container?;
        private _itemClass;
        private _resizeHandler;
        constructor(container: HTMLElement, itemClass: string);
        Destroy(): void;
        private ResizeItem;
        ResizeItems(): void;
        AppendItems(items: HTMLCollectionOf<HTMLElement>): void;
        PrependItems(items: HTMLCollectionOf<HTMLElement>): void;
    }
    export function Create(containerId: string, itemClass: string): (Layout | null);
    export {};
}
