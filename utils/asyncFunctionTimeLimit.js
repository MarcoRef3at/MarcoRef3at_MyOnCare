const asyncFuncTimeLimit = (func, limit) => {
  return new Promise(async (resolve, reject) => {
    setTimeout(function () {
      reject("timeout");
    }, limit);
    try {
      resolve(await func());
    } catch (error) {}
  });
};

module.exports = asyncFuncTimeLimit;
