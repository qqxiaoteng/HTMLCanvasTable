const Maths = {
    Point: class {
        constructor(x, y) {
            this.x = x
            this.y = y
        }
    },
    minMaxObj(min, max) {
        return { min, max, diff: max - min }
    },
    minMax(val, minMaxObj = { min: 0, max: 1 }) {
        return Math.max(minMaxObj.min, Math.min(val, minMaxObj.max))
    },
    proportional(val, valMinMaxObj, scaleMinMaxObj) {
        return scaleMinMaxObj.min + (scaleMinMaxObj.diff * (val - valMinMaxObj.min) / valMinMaxObj.diff)
    },
    isBetween(val, minMaxObj) {
        return val <= minMaxObj.max && val >= minMaxObj.min
    },
    angle(oPoint, rPoint) {
        const _x = rPoint.x - oPoint.x
        const _y = rPoint.y - oPoint.y
        const angle = Math.atan(_y / _x) * 180 / Math.PI
        if (_x >= 0 && _y <= 0) {
            return Math.abs(angle)
        }
        if (_x <= 0 && _y <= 0) {
            return 180 - angle
        }
        if (_x <= 0 && _y >= 0) {
            return 180 - angle
        }
        if (_x >= 0 && _y >= 0) {
            return 360 - angle
        }
    },
    positionRotate(oPoint, rPoint, rotateDegree) {
        const _x = rPoint.x - oPoint.x
        const _y = rPoint.y - oPoint.y
        const distance = Math.sqrt(Math.pow(_x, 2) + Math.pow(_y, 2))
        const angle = Math.atan(_y / _x) * 180 / Math.PI
        const positive = angle < 0 ? -1 : 1
        const newX = Math.cos((angle - rotateDegree) / 180 * Math.PI) * distance * positive
        const newY = Math.sin((angle - rotateDegree) / 180 * Math.PI) * distance * positive
        return new this.Point(newX + oPoint.x, newY + oPoint.y)
    },
    distance(point1, point2) {
        return Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2))
    },
    scaleTo(val, minMax) {
        return minMax.min + (minMax.max - minMax.min) * val
    }
}
// 基础类
class Spite {
    constructor(options) {
        this.dimension = updatedCallback({
            x: options.x || 0,
            y: options.y || 0,
            width: options.width || 40,
            height: options.height || 40
        }, this.#updateBound.bind(this))

        this.offset = updatedCallback(Object.assign({
            x: 0, y: 0
        }, options.offset), this.#updateBound.bind(this))

        this.bound = {
            minX: 0,
            minY: 0,
            maxX: 0,
            maxY: 0
        }

        this.padding = Object.assign({
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
        }, options.padding)

        this.#updateBound()
    }

    #updateBound() {
        const minX = this.x + this.offset.x,
            minY = this.y + this.offset.y
        this.bound.minX = minX
        this.bound.minY = minY
        this.bound.maxX = minX + this.width
        this.bound.maxY = minY + this.height
    }

    get x() {
        return this.dimension.x
    }

    get y() {
        return this.dimension.y
    }

    get width() {
        return this.dimension.width
    }

    get height() {
        return this.dimension.height
    }

    get centerX() {
        return (this.bound.minX + this.bound.maxX) / 2
    }

    get centerY() {
        return (this.bound.minY + this.bound.maxY) / 2
    }

    set x(val) {
        this.dimension.x = val
    }

    set y(val) {
        this.dimension.y = val
    }

    set width(val) {
        this.dimension.width = val
    }

    set height(val) {
        this.dimension.height = val
    }
}
// 绘制对象
class Drawable extends Spite {
    constructor(parentDrawable, options) {

        super(options)
        this.parentDrawable = parentDrawable
        this.style = Object.assign({}, options.style)
        this.animation = createAnimationOptions(options.animation || {})
        this.visible = options.visible || true;
        this.children = (options.children || (() => []))(this)
        this._remove = false;
        this.isHover = false;
        this.event = Object.assign({
            click: false,
            mousedown: false,
            mouseup: false,
            mousemove: false,
            mouseover: false,
            mousewheel: false
        }, options.event)
        this.keepDrawing = options.keepDrawing || false;
        this.keepDrawingTime = options.keepDrawingTime || 0;
    }

    get realPosition() {
        if (this.parentDrawable instanceof Rect) {
            return { x: this.bound.minX, y: this.bound.minY }
        } else {
            const pos = this.parentDrawable.realPosition
            pos.x = pos.x + this.bound.minX
            pos.y = pos.y + this.bound.minY
            return pos
        }
    }

    relatedPosition(x, y) {
        const pos = this.realPosition
        return { x: x - pos.x, y: y - pos.y }
    }

    _draw(ctx) {
        // should overwrite
    }

    _animation(ctx) {
        // can overwrite
    }

    // should not be overwrite
    draw(ctx) {
        if (!this.visible) {
            return this
        }
        ctx.save()
        ctx.translate(this.x, this.y)
        for (const s in this.style) {
            if (Object.hasOwnProperty.call(this.style, s)) {
                const data = this.style[s];
                ctx[s] = data
            }
        }
        this._animation(ctx)
        if (this.animation.scale != null) {
            ctx.scale(this.animation.scale.value, this.animation.scale.value)
        }
        if (this.animation.rotate != null) {
            if (this.animation.rotate.value != 1) {
                ctx.rotate(this.animation.rotate.value * 2 * Math.PI)
            }
        }
        // start here
        this._draw(ctx)
        // end here
        if (this.offset) {
            ctx.save()
            ctx.translate(this.offset.x, this.offset.y)
            this.children.forEach(x => x.draw(ctx))
            ctx.restore()
        } else {
            this.children.forEach(x => x.draw(ctx))
        }
        ctx.restore()
    }

    add(drawable) {
        this.children.push(drawable)
    }

    beforeRemove() { }
    afterRemove() { }

    remove() {
        this.beforeRemove()
        this._remove = true
        this.afterRemove()
        return {
            keepDrawing: this.keepDrawing,
            time: this.keepDrawingTime,
            drawable: this
        }
    }

    intersect(rect) {
        
        const rectBound = rect.bound
        return this.contain(rectBound.minX, rectBound.minY)
            || this.contain(rectBound.maxX, rectBound.minY)
            || this.contain(rectBound.minX, rectBound.maxY)
            || this.contain(rectBound.maxX, rectBound.maxY)
    }

    contain(x, y, withPadding = false) {
        const bound = this.bound
        if (this.animation.rotate && this.animation.rotate.value % 1 != 0) {
            const _x = x - this.x

            const _y = y - this.y
            const distance = Math.sqrt(Math.pow(_x, 2) + Math.pow(_y, 2))
            const angle = Math.atan(_y / _x) * 180 / Math.PI
            const rotatedAngle = this.animation.rotate.value * 360
            const positive = angle < 0 ? -1 : 1
            const newX = Math.cos((angle - rotatedAngle) / 180 * Math.PI) * distance * positive
            const newY = Math.sin((angle - rotatedAngle) / 180 * Math.PI) * distance * positive
            // console.log({self: this, newX, newY, distance, angle, rotatedAngle})
            x = newX + this.x
            y = newY + this.y
        }
        if (withPadding) {
            const minX = bound.minX - this.padding.left
            const minY = bound.minY - this.padding.top
            const maxX = bound.maxX + this.padding.right
            const maxY = bound.maxY + this.padding.bottom
            return x > minX && y > minY && x < maxX && y < maxY;
        } else {
            return x > bound.minX && y > bound.minY && x < bound.maxX && y < bound.maxY;
        }
    }

    containDrawable(drawable) {
        const drawableBound = drawable.bound
        const bound = this.bound
        return drawableBound.minX < bound.maxX
            && drawableBound.maxX > bound.minX
            && drawableBound.minY < bound.maxY
            && drawableBound.maxY > bound.minY
    }

    containList(x, y, eventName) {
        // console.log(eventName)
        if (this.contain(x, y, true)) {
            const list = []
            if (this.event[eventName]) {
                list.unshift(this)
            }
            const bound = this.bound
            const offsetX = x - bound.minX
            const offsetY = y - bound.minY
            const cList = this.children.map(x => x.containList(offsetX, offsetY, eventName)).flat()
            if (cList.length > 0) {
                list.unshift(...cList)
            }
            return list
        } else {
            return []
        }
    }
}