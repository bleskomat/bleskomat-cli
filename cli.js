#!/usr/bin/env node

const assert = require('assert');
const commander = require('commander');
const readline = require('readline');
const { SerialPort } = require('serialport');
const { JsonRpcClient } = require('./lib');

const pkg = require('./package.json');
const program = new commander.Command();

const jsonRpcMethods = [
	'restart',
	'echo',
	'getinfo',
	'getconfig',
	'setconfig',
	'getlogs',
	'deletelogs',
	'spiffs_reformat',
];

program
	.version(pkg.version)
	.description(pkg.description)
	.command('connect')
	.option(
		'--devicePath <value>',
		'File path of USB device',
		value => value,
		'/dev/ttyUSB0',
	)
	.option(
		'--baudRate <value>',
		'The baud rate used for serial communication with USB device',
		value => value,
		115200,
	)
	.action(function(options) {

		const port = new SerialPort({
			path: options.devicePath,
			baudRate: options.baudRate,
			autoOpen: false,
		});

		port.on('open', () => {
			console.log('Serial port open!');
			initializeJsonRpc().then(() => {
				const promptPrefix = '> ';
				const rl = readline.createInterface({
					input: process.stdin,
					output: process.stdout,
					prompt: promptPrefix,
					completer: line => {
						if (line.split(' ').length > 1) {
							return [[], line];
						}
						const hits = jsonRpcMethods.filter(method => method.substr(0, line.length) === line);
						return [ hits.length ? hits : jsonRpcMethods, line ];
					},
					terminal: true,
				});
				rl.on('line', line => {
					let [ method, params ] = line.split(' ');
					if (!method) {
						process.stdout.write(promptPrefix);
						// Ignore.
						return;
					}
					try { params = JSON.parse(params || '[]'); } catch {
						console.error('ERROR: Invalid params: JSON expected');
					}
					client.cmd(method, params)
						.then(console.log)
						.catch(console.error)
						.finally(() => {
							setTimeout(() => process.stdout.write(promptPrefix), 20);
						});
				});
				process.stdout.write(promptPrefix);
			}).catch(error => console.error);
		});

		port.on('error', error => {
			if (/no such file or directory/i.test(error.message)) {
				console.error('ERROR: USB device not found');
			} else if (/permission denied/i.test(error.message)) {
				console.error(`ERROR: User lacks necessary permissions to access USB device. Try \`sudo chown $USER ${options.devicePath}\` to set owner.`);
			} else {
				console.error(error);
			}
		});

		let client = new JsonRpcClient(port);

		client.parser.on('data', data => {
			console.log('BLESKOMAT: $', data.toString());
		});

		const initializeJsonRpc = () => {
			return Promise.resolve().then(() => {
				return new Promise((resolve, reject) => {
					console.log('Initializing JSON-RPC...');
					const done = error => {
						if (error) return reject(error);
						resolve();
					};
					let attempt = 0;
					const tryEcho = () => {
						attempt++;
						client.cmd('echo', ['Ahoj!']).then(() => {
							console.log('JSON-RPC interface is ready!');
							done();
						}).catch(error => {
							if (/timed-out/i.test(error.message)) {
								// Ignore timed-out error. Wait and then try again.
								if (attempt === 2) {
									console.log('Press RST/EN button on device to reboot it.');
								}
								setTimeout(tryEcho, 500);
							} else {
								return done(error);
							}
						});
					}
					tryEcho();
				});
			});
		};

		console.log(`Connecting to device at ${options.devicePath}...`);
		port.open();
	});

program.parse(process.argv);
