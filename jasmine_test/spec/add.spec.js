var add = require('../app.js').add;

describe("add spec", function () {
    it("should add two numbers", function () {
        expect(add(1, 2)).toEqual(3);
        expect(add(1, 2)).toEqual(add(2, 1));
    });
});