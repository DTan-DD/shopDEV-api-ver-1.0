"use strict";

const _ = require("lodash");
const { Types } = require("mongoose");

const convertToObjectIdMongodb = (id) => new Types.ObjectId(id);

const getInfoData = ({ fields = [], object = {} }) => {
  return _.pick(object, fields);
};

// ['a','b'] = {a : 1, b : 1}
const getSelectData = (select = []) => {
  return Object.fromEntries(select.map((el) => [el, 1]));
};

const unGetSelectData = (select = []) => {
  return Object.fromEntries(select.map((el) => [el, 0]));
};

// remove undefined or null
// const removeUndefinedObject = (obj) => {
//   Object.keys(obj).forEach((key) => {
//     if (obj[key] == null) delete obj[key];
//   });

//   return obj;
// };
const removeUndefinedObject = (obj) => {
  if (typeof obj !== "object" || obj === null) return undefined; // If the whole object is null, return undefined to remove it

  const result = {};
  let hasValidProperties = false;

  Object.keys(obj).forEach((key) => {
    const value = obj[key];

    if (value === undefined || value === null || value === "") {
      return; // Filter out undefined, null, and empty strings
    }

    if (typeof value === "object" && !Array.isArray(value)) {
      const filtered = removeUndefinedObject(value); // Recursively filter
      if (filtered !== undefined) {
        // If the nested object is not entirely filtered out
        result[key] = filtered;
        hasValidProperties = true;
      }
    } else {
      result[key] = value;
      hasValidProperties = true;
    }
  });

  return hasValidProperties ? result : undefined; // If no valid properties, return undefined for the object
};

const updateNestedObjectParser = (obj) => {
  console.log("3", obj);
  const final = {};
  Object.keys(obj || {}).forEach((key) => {
    if (typeof obj[key] === "object" && !Array.isArray(obj[key])) {
      const response = updateNestedObjectParser(obj[key]);
      Object.keys(response || {}).forEach((ele) => {
        final[`${key}.${ele}`] = response[ele];
      });
    } else {
      final[key] = obj[key];
    }
  });

  console.log("fi", final);
  return final;
};

module.exports = {
  getInfoData,
  getSelectData,
  unGetSelectData,
  removeUndefinedObject,
  updateNestedObjectParser,
  convertToObjectIdMongodb,
};
