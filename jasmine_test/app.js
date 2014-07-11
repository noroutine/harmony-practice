/**
 * Run istanbul as
 *
 * istanbul cover -x 'spec/**' node_modules/.bin/jasmine-node spec
 */

module.exports.add = function add(a,b) {
	if (a > b) {
		return a +b;
	} else {
		return b + a;
	}
}

