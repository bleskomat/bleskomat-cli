# bleskomat-cli

Command-line tool to communicate with a Bleskomat hardware device via JSON-RPC over serial API.

* [Requirements](#requirements)
* [Installation](#installation)
* [Usage](#usage)


## Requirements

* [nodejs](https://nodejs.org/) - For Linux and Mac install node via [nvm](https://github.com/creationix/nvm)


## Installation

Clone this repository:
```sh
npm install -g @bleskomat/cli
```


## Usage

Connect the Bleskomat hardware device to your computer via USB. Then to connect to it:
```sh
bleskomat connect
```
Options:
```
--devicePath <value>  File path of USB device (default: "/dev/ttyUSB0")
--baudRate <value>    The baud rate used for serial communication with USB device (default: 115200)
```

The current user must have permission to read/write to the file. So it may be necessary to change ownership of the device:
```sh
sudo chown $USER /dev/ttyUSB0
```

Once connected to the device, send JSON-RPC commands as follows:
```
> getinfo
```
Press <kbd>Tab</kbd> key twice to auto-complete or print available JSON-RPC methods.

To disconnect press <kbd>Ctrl</kbd> + <kbd>C</kbd> twice.

Echo command:
```
> echo ["Ahoj!"]
```

Reboot the device:
```
> restart
```

Get current device configurations:
```
> getconfig
```

Set configurations:
```
> setconfig {"locale":"en"}
```
Note that all values should be strings.

Get logs:
```
> getlogs
```
This may take up to 10 or more seconds depending how much data needs to be transmitted. The logs will be written to a file named "bleskomat.log" in your current working directory.


## Changelog

See [CHANGELOG.md](https://github.com/bleskomat/bleskomat-cli/blob/master/CHANGELOG.md)


## Support

Need some help? Join us in the official [Telegram group](https://t.me/bleskomat) or send us an email at [support@bleskomat.com](mailto:support@bleskomat.com) and we will try our best to respond in a reasonable time. If you have a feature request or bug to report, please [open an issue](https://github.com/bleskomat/bleskomat-cli/issues) in this project repository.


## License

The project is licensed under the [GNU General Public License v3 (GPL-3)](https://tldrlegal.com/license/gnu-general-public-license-v3-(gpl-3)):
> You may copy, distribute and modify the software as long as you track changes/dates in source files. Any modifications to or software including (via compiler) GPL-licensed code must also be made available under the GPL along with build & install instructions.


## Trademark

"Bleskomat" is a registered trademark. You are welcome to hack, fork, build, and use the source code and instructions found in this repository. However, the right to use the name "Bleskomat" with any commercial products or services is withheld and reserved for the trademark owner.
