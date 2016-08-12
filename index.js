'use strict';

// Magic character sequences
const SEQ = {
  BEGIN: {
    VAL: '@@@',
    OBJ: '###',
    ARR: '[[['
  },
  END: {
    VAL: '!!!',
    OBJ: '^^^',
    ARR: ']]]'
  }
};

// Get the inner OGSON content of a string
function getInnerOgson(s, begin, end) {
  return s.substring(s.indexOf(begin) + begin.length, s.lastIndexOf(end));
}

// Convert an OGSON string into a JavaScript object
function makeObject(objString) {
  let obj = null;

  // If we don't have a OGSON start string, assume we're dealing with an
  // actual object value - all these checks short circuit
  if (objString.indexOf(SEQ.BEGIN.VAL) === -1 &&
      objString.indexOf(SEQ.BEGIN.OBJ) === -1 &&
      objString.indexOf(SEQ.BEGIN.ARR) === -1) {

    // Boolean?
    if (objString.trim().toLowerCase() === 'true') obj = true;
    if (objString.trim().toLowerCase() === 'false') obj = false;
    if (obj !== null) return obj;

    // Number?
    let candidateNumber = Number(objString.trim());
    if (!Number.isNaN(candidateNumber)) return candidateNumber;

    // Else, we assume string
    return objString;
  }
  
  // If we do have a start sequence, find our first significant type
  let firstSequence = [
    SEQ.BEGIN.VAL, 
    SEQ.BEGIN.OBJ, 
    SEQ.BEGIN.ARR
  ].sort((a, b) => {
    let ap = objString.indexOf(a), bp = objString.indexOf(b);
    if (ap === -1 && bp === -1) return 0;
    if (ap === -1 && bp >=0) return 1;
    if (bp === -1 && ap >=0) return -1;
    return ap - bp;
  })[0];

  // Process types
  if (firstSequence === SEQ.BEGIN.VAL) {
    // We're dealing with a value of some kind
    let valueString = getInnerOgson(objString, SEQ.BEGIN.VAL, SEQ.END.VAL);
    obj = makeObject(valueString);
  }

  if (firstSequence === SEQ.BEGIN.ARR) {
    // We're dealing with an array
    obj = [];
    let valueString = getInnerOgson(objString, SEQ.BEGIN.ARR, SEQ.END.ARR);
    // An array expects a series of values - process them
    let chunks = valueString;
    while (chunks.length > 0) {
      let idxOfStart = chunks.indexOf(SEQ.BEGIN.VAL);
      let idxOfEnd = chunks.indexOf(SEQ.END.VAL);
      if (idxOfStart === -1 || idxOfEnd === -1) {
        chunks = '';
      } else {
        let cutoffIndex = idxOfEnd + SEQ.END.VAL.length;
        obj.push(makeObject(chunks.substring(idxOfStart, cutoffIndex)));
        chunks = chunks.substring(cutoffIndex);
      }
    }
  }

  if (firstSequence === SEQ.BEGIN.OBJ) {
    // We're dealing with an object
    obj = {};
    let valueString = getInnerOgson(objString, SEQ.BEGIN.OBJ, SEQ.END.OBJ);

    // An object expects alternating values, with the first being a key,
    // and the next being a value
    let chunks = valueString;
    while (chunks.length > 0) {
      let idxOfKeyStart = chunks.indexOf(SEQ.BEGIN.VAL);
      let idxOfKeyEnd = chunks.indexOf(SEQ.END.VAL);
      if (idxOfKeyStart === -1 || idxOfKeyEnd === -1) {
        // if there are no keys, we're done
        chunks = '';
      } else {
        let key = chunks.substring(idxOfKeyStart + 3, idxOfKeyEnd);
        obj[key] = null;

        // Dope, now we have a key. Let's see if there's a value
        chunks = chunks.substring(idxOfKeyEnd + SEQ.END.VAL.length);
        let idxOfValStart = chunks.indexOf(SEQ.BEGIN.VAL);
        let idxOfArrStart = chunks.indexOf(SEQ.BEGIN.ARR);
        let idxOfObjStart = chunks.indexOf(SEQ.BEGIN.OBJ);
        let idxOfFirstValEnd = chunks.indexOf(SEQ.END.VAL);
        let idxOfLastValEnd = chunks.lastIndexOf(SEQ.END.VAL);
        let idxOfFirstObjEnd = chunks.indexOf(SEQ.END.OBJ);
        let idxOfFirstArrEnd = chunks.indexOf(SEQ.END.ARR);

        if (idxOfValStart === -1 || idxOfFirstValEnd === -1) {
          // if there is no value, we're done
          chunks = '';
        } else {
          // If a value end comes before an array or object start, we have a
          // vaue to be processed
          if ((idxOfArrStart === -1 && idxOfObjStart == -1) ||
              (idxOfFirstValEnd < idxOfArrStart && 
              idxOfFirstValEnd < idxOfObjStart)) {
            obj[key] = makeObject(chunks.substring(
              idxOfValStart + SEQ.BEGIN.VAL.length,
              idxOfFirstValEnd
            ));
            chunks = chunks.substring(idxOfFirstValEnd + SEQ.END.VAL.length);
          } else if (idxOfObjStart > -1) {
            // Now we're in object land - support one level of nesting :)
            obj[key] = makeObject(chunks.substring(
              idxOfObjStart, idxOfFirstObjEnd + SEQ.END.OBJ.length
            ));
            chunks = chunks.substring(idxOfFirstObjEnd + SEQ.END.OBJ.length);
            chunks = chunks.substring(chunks.indexOf(SEQ.END.VAL) + 
                SEQ.END.VAL.length);
          } else if (idxOfArrStart > -1) {
            // Now we're in array land - extract the first one
            obj[key] = makeObject(chunks.substring(
              idxOfArrStart, idxOfFirstArrEnd + SEQ.END.ARR.length
            ));
            chunks = chunks.substring(idxOfFirstArrEnd + SEQ.END.ARR.length);
            chunks = chunks.substring(chunks.indexOf(SEQ.END.VAL) + 
                SEQ.END.VAL.length);
          }
        }
      }
    }
  }
  
  return obj;
}

// Helpers to wrap a value in start/end strings
function wrapValue(v) { return SEQ.BEGIN.VAL + v + SEQ.END.VAL; }
function wrapObject(v) { return SEQ.BEGIN.OBJ + v + SEQ.END.OBJ; }
function wrapArray(v) { return SEQ.BEGIN.ARR + v + SEQ.END.ARR; }

// Convert a JavaScript object into an OGSON string
function serialize(obj) {
  // string buffer - there's probably a nicer hot-damn-JS way to do this,
  // but this works for our purposes.
  let b = [];
  let typeOfObj = typeof obj;

  // Begin with simple value types
  if (typeOfObj === 'boolean' || typeOfObj === 'string' || 
      typeOfObj === 'number') {
    b.push(wrapValue(obj));
  } else if (Array.isArray(obj)) {
    let arrayBuffer = [];
    obj.forEach((elem) => {
      arrayBuffer.push(serialize(elem));
    });
    b.push(wrapArray(arrayBuffer.join('')));
  } else {
    // Otherwise, treat as object
    let objectBuffer = [];
    Object.keys(obj).forEach((key) => {
      objectBuffer.push(wrapValue(key));
      let typeOfVal = typeof obj[key];
      if (typeOfVal === 'boolean' || typeOfVal === 'string' || 
          typeOfVal === 'number') {
        objectBuffer.push(serialize(obj[key]));
      } else {
        objectBuffer.push(wrapValue(serialize(obj[key])));
      }
    });
    b.push(wrapObject(objectBuffer.join('')));
  }

  return b.join('');
}

// Public interface
module.exports = {
  makeObject: makeObject,
  serialize: serialize
};
