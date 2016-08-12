'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const og = require('./index');

function loadFixture(fp) {
  let p = fp.split('/');
  let fixturePath = path.join(__dirname, 'fixtures', p[0], `${p[1]}.ogson`);
  return fs.readFileSync(fixturePath, 'utf8');
}



console.log('Testing boolean values...');
// Arrange
let booleanValueTrueString = '@@@true!!!';
let paddedValueTrueString = '@@@    true !!!';
let booleanValueFalseString = '@@@false!!!';

// Act
let booleanValueTrueObject = og.makeObject(booleanValueTrueString);
let booleanValueFalseObject = og.makeObject(booleanValueFalseString);
let paddedValueTrueObject = og.makeObject(paddedValueTrueString);
let booleanValueTrueStringResult = og.serialize(true);
let booleanValueFalseStringResult = og.serialize(false);

// Assert
assert.strictEqual(true, booleanValueTrueObject);
assert.strictEqual(true, paddedValueTrueObject);
assert.strictEqual(false, booleanValueFalseObject);
assert.strictEqual(booleanValueTrueStringResult, booleanValueTrueString);
assert.strictEqual(booleanValueFalseStringResult, booleanValueFalseString);



console.log('Testing number values...');
// Arrange
let numString1 = '@@@42!!!';
let numString2 = '@@@ 100 !!!';

// Act
let numberObject1 = og.makeObject(numString1);
let numberObject2 = og.makeObject(numString2);
let numberString = og.serialize(42);

// Assert
assert.strictEqual(numberObject1, 42);
assert.strictEqual(numberObject2, 100);
assert.strictEqual(numberString, numString1);



console.log('Testing string values...');
// Arrange
let string1 = '@@@hey there homey!!!';
let string2 = '@@@ 43 booboo !!!';
let string3 = 'a comment \n@@@ yoyoyo !!!';

// Act
let object1 = og.makeObject(string1);
let object2 = og.makeObject(string2);
let object3 = og.makeObject(string3);
let resultString1 = og.serialize('hey there homey');

// Assert
assert.strictEqual(object1, 'hey there homey');
assert.strictEqual(object2, ' 43 booboo ');
assert.strictEqual(object3, ' yoyoyo ');
assert.strictEqual(resultString1, string1);



console.log('Testing array values...');
// Arrange
string1 = loadFixture('makeObject/array');
let arrayString1 = loadFixture('serialize/array');
let array1 = ['foo', 'bar', 'baz'];

// Act
object1 = og.makeObject(string1);
resultString1 = og.serialize(array1);

// Assert
assert(Array.isArray(object1));
assert.equal(object1.length, 3);
assert.equal(object1[0], 'foo');
assert.equal(object1[1], 'bar');
assert.equal(object1[2], 'baz');
assert.strictEqual(resultString1, arrayString1);



console.log('Testing object values...');
// Arrange
string1 = loadFixture('makeObject/object');
string2 = loadFixture('makeObject/complex');
string3 = loadFixture('makeObject/comments');
let objectString1 = loadFixture('serialize/object');
let objectString2 = loadFixture('serialize/complex');
let testObject = {
  foo: 'bar'
};
let testObject2 = {
  name: 'ogson',
  version: '1.0.0',
  awesome: false,
  scripts: {
    test: 'node test.js',
    run: 'node index.js'
  },
  keywords: ['object', 'notation', 'wheel', 'reinventing']
};

// Act
object1 = og.makeObject(string1);
object2 = og.makeObject(string2);
object3 = og.makeObject(string3);
resultString1 = og.serialize(testObject);
let resultString2 = og.serialize(testObject2);

// Assert
assert(object1);
assert(object1.foo);
assert.equal(object1.foo, 'bar');
assert(object2);
assert.equal(object2.name, 'ogson');
assert(object2.scripts);
assert.equal(object2.scripts.run, 'node index.js');
assert(object2.keywords);
assert(Array.isArray(object2.keywords));
assert.equal(object2.keywords[3], 'reinventing');
assert(object3);
assert.equal(object3.version, '1.0.0');
assert.equal(object3.keywords[2], 'wheel');
assert.equal(object3.scripts.test, 'node test.js');
assert.equal(resultString1, objectString1);
assert.equal(resultString2, objectString2);


console.log('\n＼(＾O＾)／ Tests passed!\n');
