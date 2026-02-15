type Undefinedable<T> = T | undefined;
declare class MosaicGridLayout {
    private readonly _container;
    private readonly _style;
    private readonly _itemClass;
    private readonly _resizeHandler;
    private _resizeRequested;
    constructor(container: HTMLElement, itemClass: string);
    Destroy(): void;
    private get _rowHeight();
    private get _rowGap();
    private ResizeItem;
    private _AppendOrPrepend;
    ResizeItems(): void;
    AppendItems(items: NodeListOf<HTMLElement>): void;
    PrependItems(items: NodeListOf<HTMLElement>): void;
}
export default function MosaicGrid(containerId: string, itemClass: string): Undefinedable<MosaicGridLayout>;
export {};
