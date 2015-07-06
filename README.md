# DaggerJS
<h3>Light, fast, gets the job done.</h3>
<p>Still a work in progress, DaggerJS is a lightweight, futuristic javaScript framework.  It's aim is to replace giant libraries such as jQuery, requireJS and most MVC frameworks, and helper libraries such as underscoreJS and momentJS with one single lightweight library.</p>
<p>The idea of DaggerJS came from my experience as a web developer.  There were quite a few functions that I noticed myself using in every single project ever--namely a few date formatting/conversion functions, lightboxes, throbbers, alerts/errors--and some libraries I couldn't live without--such as jQuery and requireJS.  Instead of wasting hours setting these up at the beginning of every project, why not have a framework that does it all for me?</p>
<h2>Coolness Factors</h2>
<ul>
	<li>Tiny source code.  Fast and powerful.</li>
	<li>Simplifies many javaScript concepts that are difficult for beginners to understand--such as the jQuery Deferred and Promise objects, working with dates, communicating with an API, and handling large amounts of data.</li>
	<li>Eliminates HTML and (optionally) CSS files with all HTML elements being represented in javaScript and contained in Controller objects.  The Controller is bound to an HTML element.  It's job is to keep track of children elements and their styles, interactivity, and other behavior.</li>
	<li>This library includes functionality from many libraries that is <strong>commonly</strong> used.  It gets rid of the barely-used, almost-never-even-noticed-because-who-cares stuff.  If you happen to have need of some of those things, there are many add-on modules that extend the functionality of DaggerJS.  These can even be copied and pasted to the end of the dagger.js file to prevent loading multiple files.</li>
	<li>Dependency loading!  Who couldn't use some good requireJS-style module loading without the 2000 lines of requireJS code?</li>
	<li>Makes your job easier.  Now you can design the front end of a web app with half the amount of code required by most other frameworks.</li>
	<li>Built-in alerts, throbbers and lightboxes, all completely customizable.</li>
	<li>Find yourself using certain functions in every project?  Feel free to extend DaggerJS to suit your needs.</li>
	<li>All your customizations can (but don't have to) be kept in one file, so you can easily move them to other projects.</li>
</ul>
<h2>So what's the catch?</h2>
<p>Well, I mean, if you ask, there are two drawbacks that I can see:</p>
<ol>
	<li>As has been [almost] mentioned, DaggerJS is missing a lot of the advanced functionality of the bigger libraries.</li>
	<li>Daggerjs is 'futuristic'.  Basically this means that it throws IE < 8 users under the bus (but Microsoft already did that to them, so it's okay, right?  They're used to it).  This literally halves the length of the source code.</li>
</ol>
