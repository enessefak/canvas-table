$(document).ready(function () {
  const $canvasTable = $("#canvas").canvasTable({
    width: 400,
    height: 400,
    gap: 5,
    strokeDash: 5,
    strokeWidth: 2,
    showAlignmentLines: true,
    frameWidth: 25,
    frameImage: "https://i.ibb.co/fDzCXr7/cerceve.jpg",
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
      $("#scaleRange").attr("disabled", false);
      $("#rotateRange").attr("disabled", false);
      $("#scaleRange").val(selectedArea.image.scale);
      $("#rotateRange").val(selectedArea.image.rotate);
    }
  });

  $("#scaleRange").on("input", (event) => {
    $canvasTable.changeScale(event.target.value);
  });

  $("#rotateRange").on("input", (event) => {
    $canvasTable.changeRotate(event.target.value);
  });

  $("#createButton").click(() => {
    $canvasTable.setDefault();
    const canvasSource = $canvasTable.createPhoto();
    const canvasImage = new Image();
    canvasImage.src = canvasSource;
    canvasImage.onload = () => {
      const previewWindow = window.open(
        "",
        "_blank",
        `width=${canvasImage.width}px,height=${canvasImage.height}px`
      );
      previewWindow.document.title = "preview table";
      previewWindow.document.write(canvasImage.outerHTML);
    };
  });

  // Change frame
  // setTimeout(() => {
  //   $canvasTable.changeFrame('frame.jpg', 20)
  // }, 3000);
});
