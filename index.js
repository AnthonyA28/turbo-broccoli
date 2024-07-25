const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

const portName = 'COM10'; // Replace with your port name

const port = new SerialPort({
  path: portName,
  baudRate: 9600,
});

const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

parser.on('data', (data) => {
  console.log(`Received data: ${data}`);
});

port.on('open', () => {
  console.log('Serial port opened');
});

port.on('error', (err) => {
  console.error('Error: ', err.message);
});
