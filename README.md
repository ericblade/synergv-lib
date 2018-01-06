# synergv-lib

[![Greenkeeper badge](https://badges.greenkeeper.io/ericblade/synergv-lib.svg)](https://greenkeeper.io/)
Universal Javascript Google Voice API

This library implements a lot of the functionality of Google Voice, using the known
API endpoints that were available prior to January 24, 2017.

On January 24, 2017, Google introduced a new Google Voice website, which uses a completely
different communications API, which appears to be similar to their other public APIs.  However,
Google is not currently offering a key that will allow regular end developers/users the ability
to use the Google API with the Google Voice service.  Hopefully that will change in the future.

I do not know if or when Google may turn off the old version of the service -- they usually
keep things around for at least 18 months, but this is a somewhat different situation than when
they end of life other products.

Better documentation will be forthcoming.

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

samples/testsuite.js contains a nearly complete test of all of the functions.

NOTE: It does appear that once your account has converted to the new Google Voice api,
that this library is no longer able to use the old API to communicate.  I am looking into
finding a way around that.

Usage:
node samples/testsuite.js userid@email.com password

Running the test suite in an account that you don't mind losing messages in is suggested -- while
it should work, without doing any damage (other than leaving some test data around if the tests
do not complete for some reason), I do not make any guarantees as such.

To completely pass all tests, you must have:
1- A Google Voice account, that has SMS support (if you do not have SMS support in your account,
then most of the functions of this software will be not available to you)
2- To test Voicemail functions, there must be a Voicemail available in your Voicemail inbox
3- To test Call functions, there must be a phone configured in your account with the name 'My Cell'.
 You can change the name of the test phone that is used, by editing the "TestPhoneName" variable
 in testsuite.js

Most all of the functions available in the "src" directory work.  These will be documented
in future updates, as this API is finalizing.

APIs that are known to not work at this time:
contactQuickAdd, donate, editDefaultForwarding, forward,
generalSettings, searchMessages, settings, vmDownload

APIs that work in browser but not in node:
checkContacts, checkMessages, getContacts
