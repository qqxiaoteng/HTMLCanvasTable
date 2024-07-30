
function Code(x, y, width, height, line,lineIndex) {//画代码需要的5个参数
    
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.line = line;
    this.lineIndex = lineIndex
    this.splits = [];
    this.color = defaultStrokeColor;
    this.visible = true;
    this.isSelected = false;
    this._area = width * height;
   
}
Code.prototype = {
    draw: function (ctx) {  
        if (!this.visible) {
            return this;
        }

        ctx.strokeStyle = this.color;
        ctx.fillText(this.line, this.x, this.y);
  
    },
    intersect: function (rect) {
        return rect.x < this.x + this.width &&
            rect.y < this.y + this.height &&
            rect.x + rect.width > this.x &&
            rect.y + rect.height > this.y;
    },
    contains: function (x, y) {
        return y > this.y && y < this.y + 20;
    },
    containss: function (x, y) {
        return x > this.x && y > this.y && x < this.x + this.width && y < this.y + 20;
        
    }
};





