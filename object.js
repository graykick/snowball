class Object {
  constructor() {

  }

  applyForth(addingVector) {
    let transedAddingVector = addingVector.copy();
    transedAddingVector.div(this.mass);
    this.acceleration.add(transedAddingVector);
  }

  checkEdge() {

  }

  getFriction(mew, vector) { // mew = 마찰계수
    mew = mew * (vector.mag() * vector.mag());
    let friction = vector.copy();
    friction.mult(-1);
    friction.nomalize();
    friction.mult(mew);
    return friction;
  }
}

module.exports = Object;
