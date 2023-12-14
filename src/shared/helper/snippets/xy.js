class XY {
  constructor(x, y) {}
  get xy() {
    return { x: this.x, y: this.y }
  }
  set = ({ x, y }) => {
    this.x = x ? x : this.x
    this.y = y ? y : this.y
    return this
  }
  plus = (another) => {
    return new XY(this.x + another.x, this.y + another.y)
  }
  minus = (another) => {
    return new XY(this.x - another.x, this.y - another.y)
  }
  multiply = (...numbers) => {
    const n = multiply(...numbers)
    return new XY(this.x * n, this.y * n)
  }
  divide = (...numbers) => {
    const n = multiply(...numbers)
    return new XY(this.x / n, this.y / n)
  }
  dot = (another) => {
    return this.x * another.x + this.y * another.y
  }
  distance = (another) => {
    return sqrt(pow2(this.x - another.x) + pow2(this.y - another.y))
  }
  rotate = (origin, degree) => {
    const [x, y] = rotatePoint(this.x, this.y, origin.x, origin.y, degree)
    return new XY(x, y)
  }
  shift = (distance, rotation) => {
    return new XY(this.x + distance * rcos(rotation), this.y + distance * rsin(rotation))
  }
  mutate = (obj, prefix) => {
    if (prefix) {
      obj[prefix + 'X'] = this.x
      obj[prefix + 'Y'] = this.y
      return obj
    }
    obj.x = this.x
    obj.y = this.y
    return obj
  }
  toArray = () => {
    return [this.x, this.y]
  }
  toObject = () => {
    return { x: this.x, y: this.y }
  }
  static From(xy, prefix) {
    if (prefix) return new XY(xy[prefix + 'X'], xy[prefix + 'Y'])
    return new XY(xy.x, xy.y)
  }
  static Of(x, y) {
    return new XY(x, y)
  }
  static Plus(...xys) {
    return xys.reduce((i, all) => all.plus(i), new XY(0, 0))
  }
}

function radianfy(degrees) {
  return degrees * (Math.PI / 180)
}

function rotatePoint(ax, ay, ox, oy, degree) {
  const radian = radianfy(degree)
  return [
    (ax - ox) * Math.cos(radian) - (ay - oy) * Math.sin(radian) + ox,
    (ax - ox) * Math.sin(radian) + (ay - oy) * Math.cos(radian) + oy,
  ]
}

const s = performance.now()
for (let i = 0; i < 4 * 10000; i++) {
  // new XY(100 + i, 0 + i).rotate(XY.Of(0 + i, 0 + i), 90) // 7s - 8s
  // rotatePoint(100 + i, 0 + i, 0 + i, 0 + i, 90) // 2s
}
console.log('t ', performance.now() - s)
