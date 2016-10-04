class Vector {

  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  add(vector) {
    this.x += vector.x;
    this.y += vector.y;
  }

  sub(vector) {
    this.xx -= vector.x;
    this.xy -= vector.y;
  }

  mult(how) {
    this.x *= how;
    this.y *= how;
  }

  div(how) {
    this.x /= how;
    this.y /= how;
  }

  mag() {
    const Vsize = Math.sqrt(this.x * this.x + this.y * this.y);
    return Vsize;
  }

  nomalize() {
    if (this.mag() != 0) {
      this.div(this.mag());
    }
  }

  limit(limitNum) {
    if (this.mag() > limitNum) {
      this.nomalize();
      this.mult(limitNum);
    }
  }

  copy() {
    var copyVector = new Vector(this.x, this.y);
    return copyVector;
  }

  static addStatic(Vector1, Vector2) {
    let addedVector = new Vector(Vector1.x + Vector2.x, Vector1.y + Vector2.y);
    return addedVector;
  }

  static subStatic(Vector1, Vector2) {
    let subedVector = new Vector(Vector1.x - Vector2.x, Vector1.y - Vector2.y);
    return subedVector;
  }

  static divStatic(Vector1, Num) {
    let subedVector = new Vector(Vector1.x / Num, Vector1.y / Num);
    return subedVector;
  }
}

module.exports = Vector;
