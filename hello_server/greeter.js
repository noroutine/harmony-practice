exports.Greeter = function () {
	this.greet = function (name, known) {
		return (known ? 'Welcome back, ' : 'Hello, ') + name + '!';
	}
}