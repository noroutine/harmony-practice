describe("observable reference in event", function () {
    it("should refer to observable", function () {
        var model = {};

        Object.observe(model, function (changes) {
            changes.forEach(function (change) {
                expect({a: 1} == { a: 1}).toBeTruthy();
            });
        });

        model.a = 1;

    });
});
