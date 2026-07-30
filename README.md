# MosaicGrid

Lightweight masonry layout library built on CSS Grid. Zero dependencies, ~2KB minified.

Calculates `grid-row-end` spans based on content height, achieving a Pinterest-style layout with pure CSS Grid.

## Installation

Install from npm:

```bash
npm install @stefanobalocco/mosaicgrid
```

```js
import MosaicGrid from '@stefanobalocco/mosaicgrid';
```

Or include directly via CDN:

```html
<script type="module">
  import MosaicGrid from 'https://cdn.jsdelivr.net/npm/@stefanobalocco/mosaicgrid@latest/dist/MosaicGrid.min.js';
</script>
```

## Usage

### HTML

The container must be a CSS Grid. Each item needs exactly one `<div>` child wrapping its content:

```html
<div id="mosaic" class="grid">
  <div class="item">
    <div>
      <p>Text content</p>
    </div>
  </div>
  <div class="item">
    <div>
      <img src="photo.jpg">
    </div>
  </div>
</div>
```

### CSS

```css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  grid-auto-rows: 1px;
}

.grid > .item {
  overflow-y: hidden;
}
```

`grid-auto-rows` controls the row granularity: `1px` gives one-pixel grid-row increments. When MosaicGrid resolves row height to `1` and row gap to `0`, fractional content heights are floored; for other positive combined row-height/gap values the span rounds up; when the resolved sum is nonpositive, `gridRowEnd` is left unchanged.

### JavaScript

```js
import MosaicGrid from 'https://cdn.jsdelivr.net/npm/@stefanobalocco/mosaicgrid@latest/dist/MosaicGrid.min.js';

const layout = MosaicGrid('mosaic', 'item');
```

`MosaicGrid(containerId, itemClass)` returns a layout instance, or `undefined` if the container is not found.

### API

| Method | Description |
|---|---|
| `ResizeItems()` | Recalculates all item spans. Called automatically on window resize (coalesced via `requestAnimationFrame`). |
| `AppendItems(items)` | Appends elements to the grid and sizes them. |
| `PrependItems(items)` | Prepends elements to the grid and sizes them. |
| `Destroy()` | Removes the resize listener and stops any pending recalculation. |

`AppendItems` and `PrependItems` accept a `NodeListOf<HTMLElement>`.

### Images

Images are handled automatically. If an item contains images that haven't loaded yet, the library attaches `onload`/`onerror` handlers and recalculates the span when loading completes.

## Build

```bash
npm install
npm run build
```

Builds the library and tests with `@stefanobalocco/tsbuild`, which compiles TypeScript and minifies the library bundle.

## Testing

```bash
npm run tests
```

Tests run in jsdom through [AVA](https://avajs.dev/) against both the original and minified builds. [c8](https://github.com/bcoe/c8) prints coverage to the terminal and writes LCOV data to `coverage/lcov.info`.

## License

[BSD-3-Clause](LICENSE)
