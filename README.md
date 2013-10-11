Theory CSS Metalanguage
=======================
An expressive, functional CSS metalanguage for maintainable (`and even testable` (#testing)) styling. 

## Objective
Theory intends to bring structure and order where CSS has little or none. Existing CSS preprocessors, such
as LESS and SASS, are little more than supersets of CSS; they add variables, and some relational logic
between CSS properties, but do little in the way of organizing CSS, or enhancing its expressive power.

The emergence of CSS superset languages, like LESS and SASS, demonstrate the underlying need for enhanced
expressive power in styling the web. Theory answers this need with three important concepts:

* Tree Fragments - akin to nested rules in LESS, these describe rough, in-tree relationships between elements.
* Frag Functions - these are declarative, inherently recursive functions for dealing with TreeFrags more concisely.
* Theories - collections of TreeFrags, Frag Functions, and ordinary properties and methods which, together, describe the high-level architecture of your site.  

## Usage
For a full users' guide, please see the main Theory website, here: http://www.theorycss.com.

#organizing
Theory is organized first into namespaces, then theories and libraries, and finally, treefrags, frag functions, and traditional functions and properties.
 
#testing
Given the more expressive, relational nature of Theory, we thought it best to create hooks for unit testing.
Beyond traditional logic testing, you can even begin to test design requirements, such as asserting that two
colors provide sufficient contrast on a particular display, or when viewed with certain types of colorblindness. 

## Developing


Created with [Nodeclipse v0.4](https://github.com/Nodeclipse/nodeclipse-1)
 ([Eclipse Marketplace](http://marketplace.eclipse.org/content/nodeclipse), [site](http://www.nodeclipse.org))   
