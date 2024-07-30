////////////// 
function CanvasHelper(canvas, width, height) {
    var that = this;
    canvas.width = width;
    canvas.height = height;
    this.canvas = canvas;
    this.width = width;
    this.height = height;
    this.ctx = canvas.getContext("2d");
    this._events = Object.create(null);
    this._bound = canvas.getBoundingClientRect();
    
}

CanvasHelper.prototype = {
    on: function (type, f) {
        var types = type.split(" ");
        var evts;
        var i = types.length;
        while (i--) {
            evts = this._initEvent(types[i]);
            evts.push(f);
        }
        return this;
    },
    off: function (type, f) {
        var types = type.split(" ");
        var evts;
        var i = types.length;
        var index;
        while (i--) {
            evts = this._events[types[i]];
            if (evts) {
                index = evts.indexOf(f);
                if (index !== -1) {
                    evts.splice(index, 1);
                }
            }
        }

        return this;//初始画画布,页面的所有的鼠标事件全部列举出来
    },
    handleEvent: function (e) {//e 鼠标实时变化的参数
        var type = e.type;
        var evts = this._events[type];
        if (["keyup", "keydown", "keypress"].includes(type)) {
            for (i = 0, ii = evts.length; i < ii; i++) {
                evts[i].call(this, e);
            }
        } else {
            var bound = this._bound;//画布的边界

            var scale,
                i, ii,
                x, y;//鼠标实时坐标
            if (evts) {
                scale = this.width / bound.width;

                x = (e.clientX - bound.left) * scale;

                y = (e.clientY - bound.top) * scale;
                console.log("鼠标实时坐标",x,y)

                // try{
                //     document.querySelectorAll('.input-cell').forEach(function(dd) {
                //         dd.parentNode.removeChild(dd);
                //     });
                //   }catch (error) {
                //     console.log("发生了一个错误: " + error.message);
                // }


                for (i = 0, ii = evts.length; i < ii; i++) {
                    evts[i].call(this, x, y, e);

                }
            }
        }
    },
    _initEvent(type) {
        var evts = this._events[type];
        if (!evts) {
            if (["keyup", "keydown", "keypress"].includes(type)) {
                document.body.addEventListener(type, this, false)
            } else {
                this.canvas.addEventListener(type, this, false);
            }
            evts = this._events[type] = [];
        }
        return evts;
    }
};