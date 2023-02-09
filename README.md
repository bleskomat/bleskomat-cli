# bleskomat-cli

Command-line tool to communicate with Bleskomat hardware device via JSON-RPC over serial API.

* [Installation](#installation)
* [Usage](#usage)


## Installation

Clone this repository:
```sh
git clone git@github.com:bleskomat/bleskomat-cli.git
```
Create symlink:
```sh
ln -s /full/path/to/bleskomat-cli/cli.js ~/.local/bin/bleskomat
```


## Usage

To print the help menu:
```sh
bleskomat --help
```

Connect to USB device:
```sh
bleskomat connect
```
Connect options:
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
