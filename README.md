
# Canvas table

Canvas table is a jquery plugin

## Usage

```javascript
  const $canvasTable = $("#canvas").canvasTable({
    width: 400,
    height: 400,
    gap: 5,
    strokeDash: 5,
    strokeWidth: 2,
    showAlignmentLines: true,
    // css grid template areas
    templateAreas: ["photo1 photo1 photo1", "photo2 photo3 photo3"],
    images: [
      {
        area: "photo1",
        source:
          "https://images.unsplash.com/photo-1589347528952-62cf2bd93f18?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max&ixid=eyJhcHBfaWQiOjE0NTg5fQ"
      },
      {
        area: "photo2",
        source:
          "https://images.unsplash.com/photo-1587928901212-e90704d83380?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max&ixid=eyJhcHBfaWQiOjE0NTg5fQ"
      },
      {
        area: "photo3",
        source:
          "https://images.unsplash.com/photo-1588691551142-3da6178a482e?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max&ixid=eyJhcHBfaWQiOjE0NTg5fQ"
      }
    ],
    onSelected(selectedArea) {
      // selectedArea.width, selectedArea.height, selectedArea.image.scale, selectedArea.image.rotate ...other
    }
  });
```
## Methods
```typescript
$canvasTable.changeScale(value: string | number ) => $canvasTable
$canvasTable.changeRotate(value: string | number ) => $canvasTable
$canvasTable.createPhoto(type: 'image/png' ) => base64ImageSource
```
## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](https://choosealicense.com/licenses/mit/)
