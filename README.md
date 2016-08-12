# OGSON - Original Gangster Object Notation

In 2008, I invented a shittier version of [JSON](http://www.json.org/). This module
is a functional version of the original implementation I created. I've tried
to faithfully recreate the synatx, bugs and oddities of the format I invented 
back then before, apparently, I knew how to Google things.

## Usage

```
npm install --save ogson
```

Convert a JavaScript object to OGSON:

```js
'use strict';

const og = require('ogson');

let ogString = og.serialize({
  foo: 'bar'
});

console.log(ogString);
```

Turn a OGSON string into an object:

```js
'use strict';

const og = require('ogson');

let ogString = '###@@@foo!!!@@@bar!!!^^^';
let ogObject = og.makeObject(ogString);

console.log(ogObject);
```

## OGSON Features

Much like the better, more feature-rich JSON, I invented the OGSON format (which
didn't have a name then) to provide a data transport format that more closely
modeled the objects I was working with than XML. Here's what it could do.

### Values

At the core of OGSON were values, begun by `@@@` character sequences and ended 
by `!!!` sequences. Values were used as members of arrays and keys/values for 
hashes (see below).

```
@@@some value!!!
```

OGSON would try to guess the type of value inside the `@@@` and `!!!` characters:

* First, we check if it's an `Array` or `Object` (see below)
* Next, we convert it into a `Boolean` if it's the text "true" or "false" (case insensitive)
* Next, we'll try and parse it into a `Number`
* Finally, we'll assume it's a `String` if all else fails

### Arrays

Oh, you better believe we got those. Opened and closed by a `[[[` and `]]]`
sequence respectively, values could be added in between them.

```
[[[
  @@@foo!!!
  @@@bar!!!
  @@@baz!!!
]]]
```

### Objects

Yup, we got 'em! Denoted by a start character set of `###` and an end set of `^^^`, 
you could create a key/value object. Properties and values were denoted with 
`@@@` / `!!!` patterns as you might expect.

```
###
  @@@foo!!! @@@bar!!!
^^^
```

### Complex Objects

All these different types could be combined (usually) to model complex objects.

```
###
  @@@name!!! @@@ogson!!!
  @@@version!!! @@@1.0.0!!!
  @@@scripts!!! @@@###
    @@@test!!! @@@node test.js!!!
  ^^^!!!
  @@@keywords!!! @@@[[[
    @@@object!!!
    @@@notation!!!
    @@@wheel!!!
    @@@reinventing!!!
  ]]]!!!
^^^
```

### Comments!

Put that in your pipe and smoke it, Crockford! Thanks to the half-assed parsing
logic of OGSON, Comments are supported as free text just about anywhere... so
long as they don't use the magic character sequences incorrectly.

In fact, so long as you don't run afoul of the magic character sequences, you
can get pretty creative with your formatting.

```
This is a package.json converted to OGSON
###
  Here's the name of the package
  @@@name!!! => @@@ogson!!!

  We specify the version here
  @@@version!!! -> @@@1.0.0!!!

  These are npm run scripts - you can run the tests with "npm test"
  @@@scripts!!! ¯\_(ツ)_/¯ @@@###
    @@@test!!! @@@node test.js!!!
  ^^^!!!

  Keywords, yo!
  @@@keywords!!! @@@[[[
    * @@@object!!!          Objects!
    * @@@notation!!!        Notation!
    * @@@wheel!!!           Wheels!
    * @@@reinventing!!!     Reinventing!
  ]]]!!!
^^^
```

### Creative Constraints

You don't want to represent EVERY kind of data, do you? Here are some things
the original (and this iteration of) OGSON can't do:

* Escape magic character sequences
* Nest objects beyond one level
* Probably lots of other stuff

## License

MIT - as if you would want this code for any reason.
