"use strict";
class spriteSheet{
    constructor(img, numOfX, numOfY, w,h){
        this.img = img;
        this.numOfX = numOfX;
        this.numOfY = numOfY;
        this.width = w;
        this.height = h;
        this.spriteSheetcanvas = document.createElement('canvas');
        this.ctx = this.spriteSheetcanvas.getContext('2d');
        this.spriteSheetcanvas.width = this.width;
        this.spriteSheetcanvas.height = this.height;
    }

    getSheet(index){
        this.ctx.clearRect(0,0,this.spriteSheetcanvas.width, this.spriteSheetcanvas.height);

        this.ctx.drawImage(this.img, this.spriteSheetcanvas.width * (index % this.numOfX), this.spriteSheetcanvas.height * Math.floor(index / this.numOfX),this.spriteSheetcanvas.width, this.spriteSheetcanvas.height, 0, 0, this.spriteSheetcanvas.width, this.spriteSheetcanvas.height);
        return this.spriteSheetcanvas;
    }
}
