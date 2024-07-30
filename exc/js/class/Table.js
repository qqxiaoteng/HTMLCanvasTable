class Table {

  scroll = { x: 0, y: 0 };
  viewportWidth = 900
  viewportHeight = 600
  crmData = [
    [
      "ID",
      "First Name",
      "Last Name",
      "Email",
      "Phone",
      "Company",
      "Address",
      "City",
      "State",
      "Zip",
      "Country",
      "Industry",
      "Revenue",
      "Employees",
      "Stage",
      "Source",
      "Created",
      "Modified",
      "Assigned To",
      "Lead Score",
      "Lead Grade",
      "Lead Status",
      "Opportunity Value",
      "Opportunity Stage",
      "Opportunity Source",
      "Opportunity Created",
      "Opportunity Modified",
      "Opportunity Assigned To",
      "Account Owner",
      "Account Manager",
      "Account Created",
      "Account Modified",
      "Account Assigned To",
    ]
  ];
  //我的值不是独立的，所以修改的时候函数明明只修改，却把把所有值相同的代码全改了，改是只改一个，但显示的确实把多个显示成一个
  tableData = []
  //addxn
  tableDataWithCor = [];

  canvas = document.getElementById("canvas2");
  ctx = this.canvas.getContext("2d");
  canvas1 = document.getElementById("canvas");
  ctx1 = this.canvas1.getContext("2d");
  padding = 15;
  cellHeight = 40;
  currentInput;
  constructor(config = {
    codeContainerId: "codeContainer",
    canvasId: "canvas2",
  }) {
    this.selectedHeaderIndex = null;
    this.ctx.font = "22px sans-serif";
    this.viewport = { x: 0, y: 0, width: this.viewportWidth, height: this.viewportHeight };
    this.tableData = this.data()
    this.cellWidths = [];
    this.columns = [
      {
        label: "收件人",
        key: "name",
      },
      {
        label: "订单编号",
        key: "age",
      },
      {
        label: "省市区详细地址",
        key: "school",
      },
      {
        label: "联系方式",
        key: "source",
      },
      {
        label: "商品名称",
        slot: "options",
      },
    ];
    this.headers = this.columns.map(col => col.label);

    //addxn 代码
    // 为 canvas 添加右键点击事件监听器
    this.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.handleContextMenu(e);
    });

    // 为 canvas 添加鼠标点击事件监听器，用于响应单元格的点击
    this.canvas.addEventListener('click', (e) => {
      try {
        e.preventDefault();

        let { clientX, clientY } = e;
        let rect = this.canvas.getBoundingClientRect();
        let canvasX = clientX - rect.left;
        let canvasY = clientY - rect.top;
        let scrollX = this.canvas.scrollLeft;
        let scrollY = this.canvas.scrollTop;

        // 查找被点击的单元格
        // let clickedCell = this.tableDataWithCor.find(cell => 
        //   canvasX >= cell.x + scrollX && canvasX <= cell.x + cell.width + scrollX &&
        //   canvasY >= cell.y + scrollY && canvasY <= cell.y + cell.height + scrollY
        // );
        let clickedCell = this.tableDataWithCor.find(cell => {
          let borderWidth = cell.borderWidth || 1;
          let borderHeight = cell.borderHeight || 1;

          let toleranceX = borderWidth / 2;
          let toleranceY = borderHeight / 2;

          return (
            canvasX >= cell.x + scrollX - toleranceX && canvasX <= cell.x + cell.width + scrollX + toleranceX &&
            canvasY >= cell.y + scrollY - toleranceY && canvasY <= cell.y + cell.height + scrollY + toleranceY
          );
        });

        if (clickedCell) {
          console.log(`Clicked cell at row ${clickedCell.row}, column ${clickedCell.col}`);

          // 编辑单元格逻辑
          let originalValue = clickedCell.data;
          let input = document.createElement('input');
          input.type = 'text';
          input.value = originalValue;

          // 设置输入框的样式
          input.style.position = 'absolute';
          input.style.left = `${clickedCell.x + scrollX + rect.left}px`;
          input.style.top = `${clickedCell.y + scrollY + rect.top}px`;
          input.style.width = `${clickedCell.width}px`;
          input.style.height = `${clickedCell.height}px`;
          input.style.border = 'none';
          input.style.backgroundColor = 'transparent';
          input.style.outline = 'none';
          input.style.padding = '0';
          input.style.textAlign = 'center';
          input.style.zIndex = 9999;
          input.style.fontFamily = 'sans-serif';
          input.style.fontSize = '6px';
          input.style.fontWeight = 'normal';
          input.style.fontStyle = 'normal';
          input.style.lineHeight = 'normal';
          input.style.color = '#000';
          input.className = "input-cell"

          // 失去焦点时的处理
          input.addEventListener('blur', () => { //focusout
            if (input.value !== originalValue) {

              this.tableData[clickedCell.row][clickedCell.col] = input.value;
              this.updateClickedCellCoordinates(clickedCell);
              this.updateCellLocally(clickedCell); // 调用新的局部更新方法
            }
            document.body.removeChild(input);
          });
          input.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
              input.blur();
            }
          });



          document.body.appendChild(input);
          input.focus();
        } else {
          console.log('No cell was clicked.');
        }
      } catch (error) {
        console.log("发生了一个错误: " + error.message);
      }
    });

    // 添加事件监听器来处理表头的选择
    this.canvas1.addEventListener('mousedown', (e) => {
      const rect = this.canvas1.getBoundingClientRect();
      const canvasX = e.clientX - rect.left;
      const colWidth = Math.ceil(this.canvas1.width / this.columns.length);
      const clickedColumnIndex = Math.floor(canvasX / colWidth);

      // 检查点击是否在表头区域
      if (clickedColumnIndex >= 0 && clickedColumnIndex < this.columns.length) {
        this.selectedHeaderIndex = clickedColumnIndex;
        this.header(); // 重新绘制表头以显示高亮
      }
    });
  }

  updateCellLocally(cell) {
    if (!cell) return; // 如果没有传入单元格对象，则不执行任何操作

    const { ctx, scroll, cellHeight, viewportHeight, viewport, cellWidths } = this;
    const { row, col, x, y, width, height } = cell;

    const cellX = x - scroll.x;
    const cellY = y - scroll.y;

    // 只渲染指定的单元格
    if (
      cellX + width > 0 &&
      cellX < viewport.width &&
      cellY + height > 0 &&
      cellY < viewport.height
    ) {
      // 绘制单元格背景
      ctx.fillStyle = "#fff";
      ctx.fillRect(cellX + viewport.x, cellY + viewport.y, width, height);

      // 绘制单元格边框
      ctx.strokeStyle = "#000";
      ctx.strokeRect(cellX + viewport.x, cellY + viewport.y, width, height);

      // 绘制单元格文本
      ctx.fillStyle = "#000";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        String(this.tableData[row][col]),
        cellX + width / 2 + viewport.x,
        cellY + height / 2 + viewport.y
      );
    }
  };



  data() {
    const { crmData, tableData } = this;
    for (var i = 0; i < 10; i++) {
      var randomIndex = Math.floor(Math.random() * crmData.length);//

      tableData.push(crmData[randomIndex]);//[randomIndex]
    }

    return tableData;
  }
  
  /**
 * 绘制表头
 *
 * @returns 无返回值
 */
  header() {
    const { canvas1, ctx1, rowHeight, columns, viewportWidth, viewportHeight } = this;
    canvas1.width = viewportWidth;
    canvas1.height = viewportHeight;
    ctx1.font = "13px monospace";
    ctx1.textBaseline = "top";

    ctx1.beginPath();
    ctx1.moveTo(0, 0);
    ctx1.lineTo(canvas1.width, 0);
    ctx1.lineWidth = 0.5;
    ctx1.closePath();
    ctx1.stroke();

    ctx1.beginPath();
    ctx1.moveTo(0, rowHeight);
    ctx1.lineTo(canvas1.width, rowHeight);
    ctx1.lineWidth = 0.5;
    ctx1.stroke();
    ctx1.closePath();

    const colWidth = Math.ceil(canvas1.width / columns.length);

    for (let index = 0; index < columns.length; index++) {
      if (columns[index]) {
        ctx1.fillText(columns[index].label, index * colWidth, 18);
        if (index === this.selectedHeaderIndex) {
          ctx1.fillStyle = "#FFFF00";
          ctx1.fillRect(index * colWidth, 0, colWidth, rowHeight);
        }
      }
    }
  }

  //addxn
  //为Header(表头)里的每个字段生成一个菜单，菜单里有着写死文字（收件人，订单编号，省市区详细地址，联系方式，商品名称）的从上到下五个按钮。点了后一列单元格按列更换后更新tableData,tableData后重绘表格
  showHeaderContextMenu(event, value) {
    const menu = document.createElement('div');
    menu.className = 'context-menu';
    menu.style.position = 'fixed';
    menu.style.left = `${event.clientX}px`;
    menu.style.top = `${event.clientY}px`;
    menu.innerHTML = `
        <button onclick="T.clickHeadElement(${value})">${value}</button>
    `;
    document.body.appendChild(menu);

    // 点击菜单外区域时关闭菜单
    const closeMenu = (e) => {
      if (!menu.contains(e.target)) {
        document.body.removeChild(menu);
        document.removeEventListener('click', closeMenu);
      }
    };
    document.addEventListener('click', closeMenu);
  }

  clickHeadElement(value) {
    
  }

  content() {
    // debugger;
    const { ctx, canvas, tableData, viewportWidth, viewportHeight, cellWidths, padding } = this;
    canvas.width = viewportWidth;
    canvas.height = viewportHeight;

    for (var j = 0; j < 10; j++) {
      var maxWidth = 0;
      for (var i = 0; i < tableData.length; i++) {
        var text = String(tableData[i][j]);
        var metrics = ctx.measureText(text);
        var width = metrics.width + padding * 2;
        maxWidth = Math.max(maxWidth, width);
      }
      cellWidths[j] = maxWidth;
    }
    this.draws()

  }
  sroll(e) {
    const { scroll } = this;
    scroll.x += e.deltaX;
    scroll.y += e.deltaY;

    if (scroll.y <= 0) {
      scroll.y = 0;
    }
    if (scroll.x <= 0) {
      scroll.x = 0;
    }
    this.draws()
  }
  draws() {

    const { ctx, tableData, scroll, cellHeight, viewportHeight, viewport, cellWidths, } = this;
    var startY = Math.floor(scroll.y / cellHeight);
    var endY = Math.min(
      Math.ceil((scroll.y + viewportHeight) / cellHeight), tableData.length);
    var startX = 0;
    var endX = 10;
    var y = startY * cellHeight - scroll.y;
    for (var i = startY; i < endY; i++) {
      var x = 0;
      for (var j = startX; j < endX; j++) {
        var text = String(tableData[i][j]);
        var cellWidth = cellWidths[j];
        var cellX = x - scroll.x;
        var cellY = y;

        // Only render the cell if it is within the viewport
        if (
          cellX + cellWidth > 0 &&
          cellX < viewport.width &&
          cellY + cellHeight > 0 &&
          cellY < viewport.height
        ) {
          // Draw the cell background
          this.ctx.fillStyle = "#fff";
          this.ctx.fillRect(
            cellX + viewport.x,
            cellY + viewport.y,
            cellWidth,
            cellHeight
          );

          // Draw the cell border
          this.ctx.strokeStyle = "#000";
          this.ctx.strokeRect(
            cellX + viewport.x,
            cellY + viewport.y,
            cellWidth,
            cellHeight
          );
          // Draw the cell text
          this.ctx.fillStyle = "#000";
          this.ctx.textAlign = "center";
          this.ctx.textBaseline = "middle";
          this.ctx.fillText(
            text,
            cellX + cellWidth / 2 + viewport.x,
            cellY + cellHeight / 2 + viewport.y
          );
        }

        //addxn
        // 在绘制每个单元格时，将单元格的数据和坐标添加到tableDataWithCor中
        this.tableDataWithCor.push({
          data: text,
          x: cellX + viewport.x,
          y: cellY + viewport.y,
          width: cellWidth,
          height: cellHeight,
          row: i, // 新增行信息
          col: j  // 新增列信息
        });

        x += cellWidth;
      }

      y += cellHeight;
    }

    this.tabledatawithcor = [];  // 清空tabledatawithcor
    // colWidth = cellWidth;
    // rowHeight = cellHeight;
    const columnsKeys = this.columns.map((v) => v.key || v.solt);
    for (let i = 0; i < this.tableData.length; i++) {
      columnsKeys.forEach((keyName, j) => {
        const x = 10 + cellWidth * j;
        const y = 18 + cellHeight * (i + 1);
        if (this.tableData[i][keyName]) {
          this.ctx.fillText(this.tableData[i][keyName], x, y);
          this.tabledatawithcor.push({ key: keyName, value: this.tableData[i][keyName], x, y, row: i, col: j }); // 存储坐标
        }
      });
    }

  }


  // addxn 处理单元格点击事件

  handleContextMenu(event) {
    console.log("handleContextMenu")
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left + this.canvas.scrollLeft;
    const y = event.clientY - rect.top + this.canvas.scrollTop;

    const clickedCell = this.tableDataWithCor.find(cell =>
      x >= cell.x && x <= cell.x + cell.width &&
      y >= cell.y && y <= cell.y + cell.height
    );

    if (clickedCell) {
      this.showContextMenu(event, clickedCell);
    }
  }

  // 显示右键菜单
  showContextMenu(event, cell) {
    const menu = document.createElement('div');
    menu.className = 'context-menu';
    menu.style.position = 'fixed';
    menu.style.left = `${event.clientX}px`;
    menu.style.top = `${event.clientY}px`;
    menu.innerHTML = `
        <button onclick="T.addRowAfter(${cell.row})">加入行</button>
        <button onclick="T.deleteRow(${cell.row})">删除行</button>
    `;
    document.body.appendChild(menu);

    // 点击菜单外区域时关闭菜单
    const closeMenu = (e) => {
      if (!menu.contains(e.target)) {
        document.body.removeChild(menu);
        document.removeEventListener('click', closeMenu);
      }
    };
    document.addEventListener('click', closeMenu);
  }


  addRowAfter(rowIndex) {
    this.tableData.splice(rowIndex + 1, 0, Array(this.tableData[0].length).fill(''));
    this.updateTableDataWithCor();
    this.draws();
  }

  deleteRow(rowIndex) {
    this.tableData.splice(rowIndex, 1);
    this.updateTableDataWithCor();
    this.draws();
  }

  updateTableDataWithCor() {
    this.tableDataWithCor = []; // 清空旧数据
    let y = 0;
    this.tableData.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        this.tableDataWithCor.push({
          data: cell,
          x: colIndex * this.cellWidths[colIndex], // 假设cellWidths是一个已定义的数组
          y: y,
          width: this.cellWidths[colIndex],
          height: this.cellHeight,
          row: rowIndex,
          col: colIndex
        });
      });
      y += this.cellHeight;
    });
  }

  updateClickedCellCoordinates(clickedCell) {
    // 找到当前行中被点击单元格的索引
    const row = this.tableData[clickedCell.row];
    const startIndex = clickedCell.col;

    // 清除当前行中从被点击单元格开始的所有单元格的坐标信息
    this.tableDataWithCor = this.tableDataWithCor.filter(cell => !(cell.row === clickedCell.row && cell.col >= startIndex));

    // 重新计算并添加被点击单元格及其右侧所有单元格的坐标信息
    let x = startIndex * this.cellWidths[startIndex];
    for (let colIndex = startIndex; colIndex < row.length; colIndex++) {
      this.tableDataWithCor.push({
        data: row[colIndex],
        x: x,
        y: clickedCell.y,
        width: this.cellWidths[colIndex],
        height: this.cellHeight,
        row: clickedCell.row,
        col: colIndex
      });
      x += this.cellWidths[colIndex];
    }
  }

}