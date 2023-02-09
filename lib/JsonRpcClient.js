const assert = require('assert');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

let clientIncrement = 0;

const JsonRpcClient = function(port, options) {
	assert.ok(port, 'Missing required argument: "port"');
	assert.ok(port instanceof SerialPort, 'Invalid argument ("port"): Instance of SerialPort expected');
	options = Object.assign({
		jsonrpc: '2.0',
		delimiter: '\n',
	}, options || {});
	assert.strictEqual(typeof options, 'object', 'Invalid argument ("options"): Object expected');
	assert.strictEqual(typeof options.jsonrpc, 'string', 'Invalid option ("jsonrpc"): String expected');
	assert.strictEqual(options.jsonrpc, '2.0', 'Invalid option ("jsonrpc"): Only JSON-RPC 2.0 is supported')
	assert.strictEqual(typeof options.delimiter, 'string', 'Invalid option ("delimiter"): String expected');
	this.options = options;
	this.port = port;
	const { delimiter } = this.options;
	this.parser = port.pipe(new ReadlineParser({ delimiter }));
	this.clientId = ['client', ++clientIncrement].join('-');
	this.cmdIncrement = 0;
};

// https://www.jsonrpc.org/specification
JsonRpcClient.prototype.cmd = function(method, params, options) {
	return Promise.resolve().then(() => {
		assert.ok(method, 'Missing required argument: "method"');
		assert.strictEqual(typeof method, 'string', 'Invalid argument ("method"): String expected');
		params = params || [];
		assert.ok(params instanceof Array || typeof params === 'object', 'Invalid argument ("params"): Array or Object expected');
		options = Object.assign({
			timeout: 500,
		}, options || {});
		const { clientId, parser, port } = this;
		const { delimiter, jsonrpc } = this.options;
		return new Promise((resolve, reject) => {
			const id = [clientId, 'cmd', ++this.cmdIncrement].join('-');
			const done = (error, result) => {
				clearTimeout(timeout);
				parser.removeListener('data', onData);
				if (error) return reject(error);
				resolve(result);
			};
			const timeout = setTimeout(() => {
				done(new Error('Timed-out while waiting for JSON-RPC response'));
			}, options.timeout);
			const onData = data => {
				let json;
				try { json = JSON.parse(data); } catch (error) {
					// Ignore JSON parsing errors.
				}
				if (json && json.id && json.id === id) {
					if (json.error) {
						return done(new Error(JSON.stringify(json.error)));
					}
					return done(null, json.result);
				}
			};
			parser.on('data', onData);
			port.write(JSON.stringify({ id, method, params, jsonrpc }) + delimiter);
		});
	});
};

module.exports = JsonRpcClient;
