"use strict";
class spriteSheet{
    constructor(img, numOfX, numOfY, w,h){
        this.img = img;
        this.numOfX = numOfX;
        this.numOfY = numOfY;
        this.width = w;
        this.height = h;
    }

    getSheet(index){
        let canvas = document.createElement('canvas');
        let ctx = canvas.getContext('2d');
        canvas.width = this.width;
        canvas.height = this.height;

        ctx.drawImage(this.img, this.width * (index % this.numOfX), this.height * Math.floor(index / this.numOfX), this.width, this.height, 0, 0, canvas.width, canvas.height);
        return canvas;
    }
}
