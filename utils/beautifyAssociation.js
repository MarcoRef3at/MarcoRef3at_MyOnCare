/*
Formating arrays of objects by Removing object keys and object brackets inside an array
 
[{key:value1},{key:value2}] ====> [value1,value2]

*/

const beautify = (arrayOfObjects, key) => {
  let beautified = [];
  arrayOfObjects.map((obj) => beautified.push(obj[key]));
  return beautified;
};

module.exports = beautify;
