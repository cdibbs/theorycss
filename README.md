Theory CSS Metalanguage
=======================
An expressive, functional CSS metalanguage for maintainable ([and even testable](#testing)) styling. 

# Objective
The emergence of CSS superset languages such as LESS and SASS prove need for a more
expressive language for styling the web. Theory answers the need by providing high-level,
relational structure between styled elements in a maintainable way.

##Installation
Theory relies on Fabric for image manipulation, so you will need to install:

- Cairo (libcairo2-dev), for canvas tag emulation, as well as
- libjpeg (libjpeg-dev),
- libgif (libgif-dev), and
- libpng (libpng-dev), to support canvas tag features.

Use your normal package manager of choice, with command such as `apt-get install libcairo2-dev libjpeg-dev libgif-dev libpng-dev`.

### Windows Installation
To build Theory for use outside of the browser requires canvas tag support, which requires native libraries. On windows,
this can be somewhat tricky. In addition to a build environment including Visual Studio 2010, you will need GTK+ 2.22 properly installed.
 - Download the 2.22 bundle, here: http://www.gtk.org/download/win64.php
 - Unpack it somewhere convenient, say c:\GTK
 - In Control Panel, go to Advanced system settings, click "Environment Variables," find the Path variable, and edit it to append "c:\GTK\bin" (or whatever path you used).
 - Restart any related cmd/powershells
 - Verify that `gtk-demo` runs
 - In a fresh shell, trigger the Theory build using `npm install`

##Tree Fragments
Akin to nested rules in LESS, these describe rough, in-tree relationships between elements, as well
as high-level, declarative styling rules.
```
	html
		NavigationBar is fixedBar('top', 32px);
		#content is article(100%);
```
##Theories 
Theories express the high-level architecture of your site. They contain one Tree Fragment, and collections of related Frag Functions,
and ordinary properties and methods.
```
	namespace Website
		theory Main
			html
				NavigationBar
					@mobile is gone;
				#banner :: Banner
					...		
	
		theory NavigationBar
			#navbar
				.small-logo
				    Image(src='img/our-logo.png')
				#login-form
				...
				
		theory Banner
			div
			...
```
##Frag Functions
These are declarative, inherently recursive functions for operating over TreeFrags. For this purpose, 
they are more concise than traditional functions.


# Usage
For a full users' guide, please see the main Theory website, here: http://www.theorycss.com.

##organizing
Hierarchically, Theory files consist first of namespaces, then theories and libraries, and finally, tree frags,
frag functions, and traditional functions, properties, and tests.
 
##testing
Theory can test your design logic. Beyond traditional code logic testing, you can test visual and
design requirements, such as asserting that two colors provide sufficient contrast on a particular display, or
when viewed with certain types of colorblindness. 

# Developing
Contributions are welcome. Fork the project, hack away; when ready to make a pull request, be sure you've pulled in our
latest code, so we can   


Created with [Nodeclipse v0.4](https://github.com/Nodeclipse/nodeclipse-1)
 ([Eclipse Marketplace](http://marketplace.eclipse.org/content/nodeclipse), [site](http://www.nodeclipse.org))   
