module.exports = (block) => {
  const result = block.reduce((res, chunk) => {
    if (/^HTTP\/\d/.test(chunk)) {
      return { ...res, ...statusObject(chunk) };
    }
    if (chunk === '') {
      return { ...res, rawbody: [] };
    }
    if (res.rawbody) {
      return { ...res, rawbody: [...res.rawbody, chunk] };
    }

    return { ...res, headers: { ...res.headers, ...header(chunk) } };
  }, {});

  result['body'] =
    result.rawbody && result.rawbody.join
      ? jsonOrNull(result.rawbody.join(''))
      : null;

  delete result.rawbody;

  return result;
};

const jsonOrNull = (text) => {
  try {
    return JSON.parse(text);
  } catch (e) {
    return text;
  }
};

const statusObject = (rawstatus) => {
  const [protocol, statuscode, ...statustexts] = rawstatus.split(' ');
  return {
    protocol,
    status: parseInt(statuscode),
    statusText: statustexts.join(' '),
  };
};

const header = (rawheader) => {
  const [key = '', ...values] = rawheader.split(':');
  if (key === '') return {};
  const value = values.join(':');
  return { [key.toLowerCase()]: value.trim() };
};
