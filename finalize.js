module.exports = (array) => {
  const { length, [length - 1]: last, ...rest } = array;
  return {
    redirects: Object.values(rest),
    ...last,
  };
};
