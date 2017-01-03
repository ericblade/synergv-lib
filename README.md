# synergv-lib
Universal Javascript Google Voice API

To use:

npm install --save ericblade/synergv-lib

In browser code, you can import it as an ES6 module, using:

import * as Synergv from 'synergv-lib';

or use some sort of node-compatible module require() system.

See src/index.js for a list of exports.  See the individual files in src/ directory to see how
to use each call (one day, hopefully, there will be documentation, but right now everything is
in flux)

In Node, you can directly require('synergv-lib').

See samples/ directory for demonstration and some useful utilities.

Warning: I sprinkle my code with tons and tons and tons of // TODO notes.
These are things that I think of while I'm writing code.  I might not ever get to them, or I
might decide they are a super priority. :-)


Note that this uses the "xmldom" npm library when running in node.js, and that library is very
vocal about producing warning messages when used for standard HTML.
I haven't yet discovered a way to silence it, so I might end up making a fork of that with a silent
running option :-S  Or finding a different library to use.

Something like "jsdom" could also be used, but I don't see any particularly compelling reason to
move off of xmldom currently, other than the extremely loud output from it while parsing.
