module.exports = lines => {
  const blocks = lines
    .reduce((acc, line) => {
      if (/^HTTP\/\d/.test(line)) {
        return [...acc, [line]];
      }
      if (acc.length === 0) {
        return [[line]];
      }
      acc[acc.length - 1].push(line);
      return acc;
    }, [])
    .map(block => {
      const lastindex = block.length - 1;
      return block.filter((chunk, index) => {
        return index === lastindex && chunk === '' ? false : true;
      });
    });

  return blocks;
};
