## Werken bij Statik als Frontend Developer

### Intro
Als frontend developer bij Statik moet je eerst en vooral vertrouwd zijn met enkele termen en methodologieën.

#### Sublime Text 3
[Sublime text 3](http://www.sublimetext.com/3) is bij de frontend developers de editor by choice. Vooral om het feit dat het snel werkt en zeer uitbreidbaar is.

Enkele van de meeste gebruikte packages bij Statik, deze zijn allemaal terug te vinden op [Package Control](https://packagecontrol.io/):

* AdvancedNewFile
* BracketHighlighter
* CSS3
* EditorConfig
* Emmet
* Gutter Color
* HTML5
* Nettuts+ Fetch ([Fetch.sublime-settings](https://gist.github.com/bartverbruggen/9052351028d72823c7c3))
* Pretty JSON
* SideBarEnhancements
* Smarty
* SublimeLinter
* SublimeLinter-contrib-jslint
* Syntax Highlighting for Sass

Voor vragen over sublime kan je uiteraard altijd bij elke frontend developer terecht.

### Grunt
[Grunt](http://gruntjs.com/) is op dit moment onze Javascript Task Runner, hiermee voegen we alle nodige javascript bestanden samen, compilen we onze sass, laten we een minifier los op de js en css, optimaliseren we afbeeldingen, ...

Om grunt te kunnen installeren heb [npm](https://www.npmjs.com/#getting-started) nodig. Meer info over het opzetten van je lokale omgeving kan je [deze korte handleiding]() vinden. (TODO)

Daarna kan je in de terminal grunt installeren met volgend commando: `npm install -g grunt-cli`.

#### Takeoff
[Takeoff](https://github.com/statikbe/takeoff) is waar alles mee begint. Dit is onze starter kit, onze bootstrap, onze heilige graal. Het bevat alles wat nodig is om te beginnen aan een project bij Statik. Met Nettuts+ Fetch kan je makkelijk onze takeoff binnen halen en opslaan in **[project]/takeoff**.

De takeoff werkt met **Grunt**, normaal zou dit al geinstalleerd moeten zijn. In je terminal ga je naar de takeoff map met `cd [project]/takeoff` en haal je al de nodige grunt packages binnen met `npm install`. Hierna kan je met `grunt` starten.

##### Structuur
* js
	* components (Deze map bevat enkele standaard javascript bestanden die je, op uitzondering van common.js, kan uitvoeren via data-components op de body tag.
	* libs (Enkele standaard javascript libraries)
	* polyfill (De naam zegt het zelf)
	* singles (files die wel minified moeten worden, maar niet samengevoegd met de andere javascript bestanden)
	* main.js (Dit zorgt er voor dat alle components uitgevoerd worden op de juiste moment)
* sass
	* components (Alle niet core)
	* core (Alle core components zoals button, form, lists, ...)
	* main-legacy.scss (css voor oudere browsers (niet responsive))
	* main.scss (alle imports!)

Onze javascript wordt momenteel geschreven met het [Revealing Module pattern](https://carldanley.com/js-revealing-module-pattern/). Genoeg lectuur over te vinden op het internet.

Om sneller en duidelijker css te schrijven doen we dat met sass (scss), en werken we volgens het BEM principe. Bij de [useful resources](#resources) vind je enkele interessante artikels, videos of slideshows.

### Ride
Ride is het zelf ontwikkelde open-source CMS van Statik. Voor meer info over Ride kan altijd bij elke developer terecht. Het CMS werkt met themes, en onze theme waar we steeds van vertrekken is [Carbon](https://bitbucket.org/statikbe/ride-statik-theme-carbon/src). Een theme bevat vooral template files, deze vind je terug in de **view/smarty/carbon/** folder. Carbon maakt gebruik van de (smarty template engine)[http://www.smarty.net/], voor meer info kan je zowel bij de backend als bij de frontend developers terecht.

Enkele nuttige templates om eens te bekijken:

* [view/smarty/carbon/base/index.tpl](https://bitbucket.org/statikbe/ride-statik-theme-carbon/src/d6e27bd65c78b374766b5c97b0621f51290c52f8/view/smarty/carbon/base/index.tpl?at=master&fileviewer=file-view-default) (De moeder template, zowel front- als backend)
* [view/smarty/carbon/cms/frontend/index.tpl](https://bitbucket.org/statikbe/ride-statik-theme-carbon/src/d6e27bd65c78b374766b5c97b0621f51290c52f8/view/smarty/carbon/cms/frontend/index.tpl?at=master&fileviewer=file-view-default) (**frontend/index.tpl** is een uitbereiding op **base/index.tpl**, deze geeft enkele noodzakelijke bestanden en functies mee naar de **base/index.tpl**)
* [view/smarty/carbon/cms/widget](https://bitbucket.org/statikbe/ride-statik-theme-carbon/src/d6e27bd65c78b374766b5c97b0621f51290c52f8/view/smarty/carbon/cms/widget/?at=master) (Dit is eigenlijk een folder met templates, maar bekijk hier gerust eens enkele bestanden. Een pagina in ride wordt opgebouwd met allemaal verschillende widgets, dus deze zijn eigenlijk de representatie van de content op je pagina.)


<a name="resources"></a>
### Useful resources

* [CSS for Software Engineers for CSS Developers](https://speakerdeck.com/csswizardry/css-for-software-engineers-for-css-developers)
* [@Zomigi - Enhancing Responsiveness with Flexbox](https://www.youtube.com/watch?v=Fe1YpKpwISs)
* [Getting your head round BEM syntax](http://csswizardry.com/2013/01/mindbemding-getting-your-head-round-bem-syntax/)
* [idiomatic.js](https://github.com/rwaldron/idiomatic.js)
* [Git-flow](http://nvie.com/posts/a-successful-git-branching-model/)
