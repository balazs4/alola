const readline = require('readline');

module.exports = () => {
  return new Promise(resolve => {
    const lines = [];
    readline
      .createInterface(process.stdin)
      .on('line', line => lines.push(line))
      .on('close', () => resolve(lines));
  });
};
