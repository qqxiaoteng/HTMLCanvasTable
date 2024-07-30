class DTable {

  constructor(config = {
    codeContainerId: "codeContainer",
    canvasId: "canvas2",
}) {
  
    this.canvas = document.getElementById(config.canvasId);
    this.ctx = this.canvas.getContext("2d");
    this.rowHeight=30;
  
    //this.slideWrap = document.getElementById("slide-wrap");
   // this.slide = slideWrap.querySelector(".slide"); 
    this.mockData = [
        {
          name: "李家好",
          id: 0,
          age: 0,
          school: "知识飞行小学",
          source: 800,
        },
      ];
    this.tableData = new Array(30).fill(this.mockData[0]).map((v, index) => {
        return {
          ...v,
          id: index,
          name: `${v.name}-${index + 1}`,
          age: v.age + index + 1,
          source: v.source + index + 1,
        };
      });

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
      
}

  
    // 第一条横线
    drawHeader() {
      
      const {ctx, canvas, rowHeight,columns } = this;
      canvas.width = 610;
      canvas.height = 600;
      ctx.font = "13px monospace";
      ctx.textBaseline = "top";
      // 第一条横线
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(canvas.width, 0);
      ctx.lineWidth = 0.5;
      ctx.closePath();
      ctx.stroke();
      // 第二条横线
      ctx.beginPath();
      ctx.moveTo(0, rowHeight);
      ctx.lineTo(canvas.width, rowHeight);
      ctx.lineWidth = 0.5;
      ctx.stroke();
      ctx.closePath();
      const colWidth = Math.ceil(canvas.width /columns.length);
      // 绘制表头文字内容
      for (let index = 0; index < columns.length + 1; index++) {
          if (columns[index]) {
              ctx.fillText(columns[index].label, index * colWidth + 10, 18);
          }
      }
  }
  drawBody() {
    const { ctx, canvas, rowHeight, tableData, columns } = this;
    const row = Math.ceil(canvas.height / rowHeight);
    const tableDataLen = tableData.length;
    const colWidth = Math.ceil(canvas.width / columns.length);
    // 画横线
    for (let i = 2; i < row + 2; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * rowHeight);
        ctx.lineTo(canvas.width, i * rowHeight);
        ctx.stroke();
        ctx.closePath();
    }
    console.log(this.tableData, 'tableDataLen')
    // 绘制竖线
    for (let index = 0; index < columns.length + 1; index++) {
        ctx.beginPath();
        ctx.moveTo(index * colWidth, 0);
        ctx.lineTo(index * colWidth, (tableDataLen + 1) * rowHeight);
        ctx.stroke();
        ctx.closePath();
    }
    // 填充内容
    const columnsKeys = columns.map((v) => v.key || v.solt);
    //   ctx.fillText(tableData[0].name, 10, 48);
    for (let i = 0; i < tableData.length; i++) {
        columnsKeys.forEach((keyName, j) => {
            const x = 10 + colWidth * j;
            const y = 18 + rowHeight * (i + 1);
            if (tableData[i][keyName]) {
                ctx.fillText(tableData[i][keyName], x, y);
            }
        });
    }
}

}











