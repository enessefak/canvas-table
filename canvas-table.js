"use strict";

(function ($) {
  $.fn.canvasTable = function (_options) {
    const options = $.extend(
      {
        width: 500,
        height: 500,
        templateAreas: [],
        images: [],
        gap: 1,
        fillStyle: "#fff",
        strokeStyle: "red",
        strokeDash: 0,
        strokeWidth: 3,
        frameImage: "",
        frameWidth: 0,
        showAlignmentLines: true,
        onSelected: () => null
      },
      _options
    );

    const areas = [];

    const $canvas = this;
    const ctx = $canvas[0].getContext("2d");

    const MODE = {
      TRANSLATE: "translate",
      CHANGE: "change",
      CHANGE_PREVIEW: "change_preview",
      SELECTION: "selection"
    };

    let startX;
    let startY;
    let activeMode;
    let editingIndex = -1;
    let lastClickDate;
    let frameSource;

    const canvasWidth = parseInt(options.width, 10);
    const canvasHeight = parseInt(options.height, 10);

    ctx.canvas.width = canvasWidth;
    ctx.canvas.height = canvasHeight;

    const clear = () => {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx.fillStyle = options.fillStyle;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    };

    const initArea = async (_image) => {
      const matchedRows = [];
      const matchedColumns = [];
      let area = {
        name: _image.area
      };

      const rowsLength = options.templateAreas.length;
      const heightUnit = canvasHeight / rowsLength;

      const columnsLength = options.templateAreas[0].split(" ").length;
      const widthUnit = canvasWidth / columnsLength;

      for (let rowIndex = 0; rowIndex < rowsLength; rowIndex++) {
        const columns = options.templateAreas[rowIndex].split(" ");
        const matchedArea = columns.find((column) => column === _image.area);
        if (!matchedArea) continue;

        if (!matchedRows.includes(rowIndex)) matchedRows.push(rowIndex);

        for (let columnIndex = 0; columnIndex < columnsLength; columnIndex++) {
          if (
            columns[columnIndex] === _image.area &&
            !matchedColumns.includes(columnIndex)
          ) {
            matchedColumns.push(columnIndex);
          }
        }
      }

      area.xPos = matchedColumns[0] * widthUnit + options.gap / 2;
      area.yPos = matchedRows[0] * heightUnit + options.gap / 2;

      area.width = matchedColumns.length * widthUnit - options.gap;
      area.height = matchedRows.length * heightUnit - options.gap;

      const image = new Image();
      image.crossOrigin = "anonymous";
      image.src = _image.source;

      return new Promise((resolve, reject) => {
        image.onerror = reject;

        image.onload = () => {
          image.width = area.width > image.width ? area.width : image.width;
          image.height =
            area.height > image.height ? area.height : image.height;

          const xDistance = image.width - area.width;
          const yDistance = image.height - area.height;
          image.xTranslate = 0;
          image.yTranslate = 0;

          image.scale = _image.scale || 1;
          image.rotate = _image.rotate || 0;

          image.xPos = area.xPos - xDistance / 2;
          image.yPos = area.yPos - yDistance / 2;

          resolve({
            image,
            ...area
          });
        };
      });
    };

    const drawArea = () => {
      clear();
      for (let i = 0; i < areas.length; i++) {
        const area = areas[i];
        const cx = area.width / 2 + area.xPos;
        const cy = area.height / 2 + area.yPos;
        ctx.save();
        ctx.beginPath();
        ctx.rect(area.xPos, area.yPos, area.width, area.height);
        ctx.translate(cx, cy);
        ctx.scale(area.image.scale, area.image.scale);
        ctx.rotate((Math.PI / 180) * area.image.rotate);
        ctx.translate(-cx, -cy);
        ctx.clip();
        ctx.drawImage(
          area.image,
          area.image.xPos + area.image.xTranslate / area.image.scale,
          area.image.yPos + area.image.yTranslate / area.image.scale,
          area.image.width,
          area.image.height
        );
        ctx.restore();

        if (i === editingIndex) {
          ctx.strokeStyle = options.strokeStyle;
          ctx.lineWidth = options.strokeWidth;
          ctx.setLineDash([options.strokeDash, options.strokeDash]);
          if (options.showAlignmentLines) {
            ctx.moveTo(area.xPos + area.width, area.yPos + area.height / 2);
            ctx.lineTo(area.xPos, area.yPos + area.height / 2);

            ctx.moveTo(area.xPos + area.width / 2, area.yPos);
            ctx.lineTo(area.xPos + area.width / 2, area.height + area.yPos);
          }
          ctx.stroke();
        }
      }

      if (frameSource) {
        const frameTexture = ctx.createPattern(frameSource, "repeat");
        ctx.strokeStyle = frameTexture;
        ctx.setLineDash([0]);
        ctx.lineWidth = options.frameWidth;
        ctx.strokeRect(0, 0, canvasWidth, canvasHeight);
      }
    };

    const getAreaIndexByPosition = (e) =>
      areas.findIndex(
        (area) =>
          e.offsetX >= area.xPos &&
          e.offsetX <= area.xPos + area.width &&
          e.offsetY >= area.yPos &&
          e.offsetY <= area.yPos + area.height
      );

    const changeImage = (fromAreaId, toAreaId) => {
      activeMode = MODE.SELECTION;
      editingIndex = toAreaId;

      const fromArea = { ...areas[fromAreaId] };
      const toArea = { ...areas[toAreaId] };

      fromArea.image.xTranslate = 0;
      fromArea.image.yTranslate = 0;

      toArea.image.xTranslate = 0;
      toArea.image.yTranslate = 0;

      fromArea.image.xPos =
        toArea.xPos - (fromArea.image.width - toArea.width) / 2;
      fromArea.image.yPos =
        toArea.yPos - (fromArea.image.height - toArea.height) / 2;

      toArea.image.xPos =
        fromArea.xPos - (toArea.image.width - fromArea.width) / 2;
      toArea.image.yPos =
        fromArea.yPos - (toArea.image.height - fromArea.height) / 2;

      areas[fromAreaId] = {
        ...fromArea,
        image: toArea.image
      };

      areas[toAreaId] = {
        ...toArea,
        image: fromArea.image
      };

      drawArea();
    };

    const moveImage = (e) => {
      const editingArea = areas[editingIndex];
      const overOtherImageIndex = getAreaIndexByPosition(e);

      if (overOtherImageIndex > -1 && overOtherImageIndex !== editingIndex) {
        startX = -e.offsetX;
        startY = -e.offsetY;
        changeImage(editingIndex, overOtherImageIndex);
      } else {
        $canvas.css("cursor", "move");
        editingArea.image.xTranslate = startX + e.offsetX;
        editingArea.image.yTranslate = startY + e.offsetY;

        drawArea();
      }
    };

    const selectMode = () => {
      activeMode = MODE.SELECTION;
      $canvas.css("cursor", "auto");
      drawArea();
      options.onSelected?.(areas[editingIndex]);
    };

    const handleMouseDown = (e) => {
      e.preventDefault();
      const clickedAreaIndex = getAreaIndexByPosition(e);

      if (activeMode === MODE.TRANSLATE || activeMode === MODE.CHANGE) {
        selectMode();
      } else if (clickedAreaIndex > -1) {
        options.onSelected?.(areas[clickedAreaIndex]);
        editingIndex = clickedAreaIndex;
        const editingArea = areas[editingIndex];
        startX = editingArea.image.xTranslate - e.offsetX;
        startY = editingArea.image.yTranslate - e.offsetY;
        lastClickDate = new Date();
        activeMode = MODE.TRANSLATE;
      }
    };

    const handleMouseUp = (e) => {
      e.preventDefault();
      selectMode();
    };

    const handleMouseMove = (e) => {
      if (editingIndex < 0 || !activeMode) return;
      e.preventDefault();
      if (activeMode === MODE.TRANSLATE || activeMode === MODE.CHANGE)
        moveImage(e);
    };

    $canvas.mousedown(handleMouseDown);
    $canvas.mousemove(handleMouseMove);
    $canvas.mouseup(handleMouseUp);

    const touchEvent = (e) => {
      const r = $canvas[0].getBoundingClientRect();
      const touch =
        e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
      e.offsetX = touch.clientX - r.left;
      e.offsetY = touch.clientY - r.top;

      return e;
    };

    $canvas.on("touchstart", (e) => handleMouseDown(touchEvent(e)));
    $canvas.on("touchmove", (e) => handleMouseMove(touchEvent(e)));
    $canvas.on("touchend", (e) => handleMouseUp(touchEvent(e)));

    const changeScale = (val) => {
      const editingArea = areas[editingIndex];
      if (editingArea) {
        editingArea.image.scale = Number(val);
        drawArea();
      }
      return $canvas;
    };

    const changeRotate = (val) => {
      const editingArea = areas[editingIndex];
      if (editingArea) {
        editingArea.image.rotate = Number(val);
        drawArea();
      }
      return $canvas;
    };

    const createPhoto = (type) => $canvas[0].toDataURL(type || "image/png");

    const setDefault = () => {
      editingIndex = -1;
      activeMode = null;
      $canvas.css("cursor", "auto");
      startX = 0;
      startY = 0;
      lastClickDate = null;
      drawArea();
    };

    const init = async () => {
      const areasMapping = await Promise.all(options.images.map(initArea));
      areas.push(...areasMapping);
      if (options.frameImage) {
        const frameImage = new Image();
        frameImage.crossOrigin = "anonymous";
        frameImage.src = options.frameImage;

        frameImage.onload = () => {
          frameSource = frameImage;
          drawArea();
        };
      } else {
        drawArea();
      }
    };

    init();

    return {
      changeScale,
      changeRotate,
      createPhoto,
      setDefault
    };
  };
})(jQuery);
