---
title: The blogdown of theseus
subtitle: Because you know what? I *am* here to fuck spiders
date: 2023-12-23
---

It is the first day of my summer vacation. The out-of-office autoreply is on. I have a full tank of gas, half a pack of cigarettes, the sun is shining, and I'm wearing a sequined dress. Blues Brothers it is most certainly not, but a certain attitude is in force. And so it is that I've decided to get the band back together. Where "the band" in this case happens to be "a tool chain that looks like a shit version of [blogdown](https://pkgs.rstudio.com/blogdown/)".

Is it a good use of my time? No. Will I do a good job of it? No. But will it it make a good blog post? Also no.

Okay. So here's the backstory. Literate programming in R has been around for a very long time. So much so that we've all become accustomed to thinking about tools like [R markdown](https://rmarkdown.rstudio.com/), [blogdown](https://pkgs.rstudio.com/blogdown/), and [quarto](https://quarto.org/), as baked-in aspects to the language. That's not actually a bad thing. They're good tools. I have no intention of abandoning any of them. But they aren't primitives. Each of them is an opinionated tool that takes a code execution engine like [knitr](https://yihui.org/knitr/) as a starting point, and builds from it in different ways. R markdown and quarto both use knitr to execute the R code within an appropriately annotated markdown document and then feed the results to [pandoc](https://pandoc.org/) to create outputs in different formats. Blogdown takes the same idea, but passes the output to the [hugo](https://gohugo.io/) static site generator to create full featured blogs and static websites. Et cetera. 

What would happen if those "upstream" tools were taken away? What if you needed to create an R blog from scratch and the only part of this tool chain you had available to you was knitr. What choices would you make? Could you cobble together something vaguely similar to a blogdown site or a quarto blog, using entirely different constituent parts? 

Why would you do this? You wouldn't.

Why did I do it? Because it's summer and **I'm bored**.

Okay, actually that's not quite fair. I did have a substantive reason for wanting to do this. At this point in time there is a fairly mature ecosystem built around R markdown and its variants. The tools are polished and professional (which is a very good thing), and as a consequence of this I've found that I've started to lose track of the abstractions that these tools rely upon. Often times I've seen people write R markdown code (and have done so myself) that tinkers with the knitr settings in ways that break R markdown. The most common one is redirecting the knitr figure out directory to a location where pandoc can't find it, with the result that the "self-contained" html document that gets built at the end doesn't actually embed images properly. This happens because R markdown -- as good as it is -- involves [leaky abstractions](https://en.wikipedia.org/wiki/Leaky_abstraction). At the user end you stop thinking about the nature of the knitr-to-pandoc pipeline. You stop thinking about the bootstrap dependency in the final html document. And so it inevitably comes to pass that you inadvertently do something silly that breaks things.

The decision to build my own "rubbish version of blogdown" from a different collection of constituent parts (keeping only knitr, and building from it in different ways) is an attempt to "refresh my memory", to make myself go through the decision-making process involved in designing a tool like this. In other words, the purpose of this is not to build an alternative to R markdown, blogdown, quarto, etc. Rather, the purpose is to use this as an exercise that helps me understand those tools better.  

## The task

With that as my stated goal, here's the task I decided to set for myself. My goal is to create a static website blog (this blog, in fact!) where:

- You write posts using a slightly fancy version of [markdown](https://www.markdownguide.org/)
- The code chunks within a post are executed using [knitr](https://yihui.org/knitr/)
- The static site is build using [eleventy](https://www.11ty.dev/)
- The styling of the pages is handled with [skeleton](http://getskeleton.com/)

At its heart this is a similar design to blogdown, except that for this blog I'll using eleventy instead of quarto, and skeleton instead of bootstrap. Most importantly, I committed myself to following the [Bob Katter principle](https://www.youtube.com/watch?v=1i739SyCu9I):

> *I ain't spending any time on it, because in the meantime, every three months a person's torn to pieces by a crocodile in North Queensland* 

Wise words Bob. Let's get this done in an afternoon, yeah?

## Installing and using eleventy

You can install eleventy from [npm](https://www.npmjs.com/) like this:

```bash
npm install -g @11ty/eleventy
```

When you want to build a static site, navigate to the project root folder in the terminal and simply type this:

```bash
eleventy
```

If you want a live preview, do this:

```bash
eleventy --serve
```

That part is easy. The trickier part is desiging the site in the first place and configuring everything os that knitr and eleventy play nice with one another. So let's take a look at how we handle this. 

## Code execution with knitr

Here's the idea. This post is written in what I'm calling "knitr-flavoured markdown". The basic idea is so similar to R markdown that it'd be plagiarism for me to pretend I was doing anything novel, but I can't actually call it R markdown because it lacks a lot of R markdown features, so I've used a `.kmd` file extension for my knitr-flavoured markdown documents.  

Nevertheless, the core idea is essentially the same as R markdown. There's a [yaml](https://yaml.org/) header at the top of the document that is used by eleventy when building the site, and there are code chunks that have special annotations that knitr uses when handling the code execution. But other than that it's just a markdown document. Nothing special there. Like a normal markdown document, I use triple backticks to denote a code block. Moreover, since syntax highlighting is supported by eleventy (discussed later when I dive into the details), I can write something like this in the source document:


````default
```r
add_one <- function(x) x + 1
add_one(10)
```
````

When rendered to the final html documment the output looks like this:

```r
add_one <- function(x) x + 1
add_one(10)
```

We can take it one step further, because thanks to knitr my blog supports code execution. If I convert the plain markdown code chunk above to a knitr-executable code chunk, the R code gets run at the knitr step and the output appears in the final html. That is, if I write this in my source document:


````default
```{r}
add_one <- function(x) x + 1
add_one(10)
```
````

I get this as my output: 


```r
add_one <- function(x) x + 1
add_one(10)
```

```
## [1] 11
```

Better yet, the blog supports plot output. As it turns out, this part of the process involves a careful effort to make sure that knitr and eleventy play nicely together (reminiscent of the same issue that occurs in R markdown with making sure knitr and pandoc play nice), and I'll talk about that later too. But for now, let's have a look at an R chunk that creates a plot:


```r
library(ggplot2)
set.seed(1)
shades <- c("#ecc8af", "#e7ad99", "#ce796b", "#c18c5d", "#495867")
df <- data.frame(
  x = sample(1:10, size = 100, replace = TRUE),
  y = sample(1:10, size = 100, replace = TRUE),
  size = sample(1:10, size = 100, replace = TRUE),
  shade = sample(shades, size = 100, replace = TRUE)
)
ggplot(df, aes(x, y, size = size, colour = shade)) +
  geom_point(show.legend = FALSE, pch = 1 , stroke = 2) + 
  scale_colour_identity() +
  scale_size(range = c(0, 10)) + 
  theme_void()
```

<div class="figure" style="text-align: center">
<img src="figure/make-a-plot-1.png" alt="plot of chunk make-a-plot" width="60%" />
<p class="caption">plot of chunk make-a-plot</p>
</div>

Yep, it works. Neat. 

## From source code to the built HTML

### The knitr step

Now that we have a sense of the functionality in the knitr/eleventy blog I cobbled together on a Saturday afternoon, we can take a bit of a deeper dive and look at how the parts interact. Let's start by looking at the role off knitr. From the perspective of knitr, everything takes place within the folder that contains the knitr-flavoured markdown document. It does not look at anything outside that folder. So. Here's everything that exists within the source folder containing this post, *after* knitr has done its job: 


```r
 fs::dir_tree()
```

```
## .
## ├── figure
## │   └── make-a-plot-1.png
## ├── index.kmd
## └── index.md
```

Originally this folder contained only the `.kmd` file. That's the only thing I write or edit as the author of the post. From my perspective as the coder/blogger/whatever that's my source code. Indeed, this is fundamentally no different to the way that R markdown treats the `.Rmd` file as the source, or how quarto treats the `.qmd` file as the source. 

Anyway, let's look at what happens when I use `knitr::knit()` to render this file. The primary output file is the `.md` file, which retains all the original markdown from the `.kmd` file, but executes the R code chunks within the file and creates additional markup within the `.md` file so that -- when later converted to HTML -- the resulting web page will display the output exactly as if the commands were typed at the R console. However, because this post also contains R code that generates a plot, knitr creates a `.png` file within the `figure` folder, and includes markup that links to that `.png` file. Again, this is analogous to what happens in R markdown, which always creates a `.knit.md` file as the intermediate output and writes the figures to image files within a local subfolder, though (depending on the configuration) it may delete these intermediate files leaving only the final self-contained html. 

For the sake of operationalising the role of knitr in my static site, I wrote a very tiny shell script `knit.sh` that lives in the root directory. It takes the path to a post folder containing an `index.kmd` file as its only argument, and calls `knitr::knit()` to take care of the knitting process:

```sh
#! /bin/bash
Rscript -e "setwd('$1'); knitr::knit('index.kmd', 'index.md')"
```

From the terminal, I can knit this post from `.kmd` to `.md` (plus `.png`) with the following command:

```sh
./knit.sh posts/the-blogdown-of-theseus/
```

I did briefly consider doing something fancier with proper build automation (e.g., I could write a [Makefile](https://blog.djnavarro.net/posts/2023-06-30_makefiles/) with build targets for all posts), but eventually decided that (a) I'm too lazy to do that here, but also (b) in practice, using build automation tools for long running computational blogs is very dangerous, and often leads to the build tool trying to re-execute code that no longer works (or produces different environments) because the computational environment has changed. Some tools are better than others for avoiding this (e.g., quarto has the "freeze" option that helps a lot), but short of using docker and renv for every single blog post I think there's never going to be a perfect solution. Given all that I decided that I'll be "unsophisticated" and force myself to go through the motions of running the `knit.sh` script manually whenever I want to execute the code again. 

In any case, once the script has been called, knitr has no further role to play. For any given post, knitr only acts within the corresponding post folder. It has created the `.md` file and the `.png` file, and it's done. The baton is passed over to eleventy, and as far as eleventy is concerned, the `.kmd` file is irrelevant. There is a complete division of responsibilities here: knitr looks at the `.kmd` file to create the `.md` and `.png`, and eleventy uses the generated `.md` and `.png` files to create the web site.  

### The eleventy step

So what happens when eleventy builds the static site? To get a "global" overview, let's take a look at the structure of the blog project, showing only the folders:


```r
 fs::dir_tree("../..", type = "directory")
```

```
## ../..
## ├── _includes
## ├── docs
## │   └── posts
## │       ├── hello-changelog
## │       ├── knitted-markdown
## │       └── the-blogdown-of-theseus
## │           └── figure
## └── posts
##     ├── hello-changelog
##     ├── knitted-markdown
##     └── the-blogdown-of-theseus
##         └── figure
```

The core structure is very simple. There's a `posts` folder that contains one subfolder for each post in the blog. That's where all the markdown files live, and it's also where knitr renders its output. From the perspective of the eleventy static site generator, that's our source folder. In addition to the `posts` folder there's a `docs` folder which also contains one subfolder for each post. The `docs` folder contains the static site itself. It's is where all the html files, css files, etc go, and that's the folder that later on gets deployed to GitHub Pages. 

To illustrate the difference between the two, let's compare the contents of the source folder for this post (which we saw in the last section) to the corresponding folder in the built site:


```r
 fs::dir_tree("../../docs/posts/the-blogdown-of-theseus")
```

```
## ../../docs/posts/the-blogdown-of-theseus
## ├── figure
## │   └── make-a-plot-1.png
## └── index.html
```

Just like the original source folder the built version contains a `.png` file within a `figure` folder and, as you might have guessed, this is the exact same image file: I've configured eleventy so that at build time, any image files in the source folder get copied across to the output folder. However, it does not contain either the `index.md` file or the `index.kmd` file. In their place we have `index.html`. At build time, eleventy completely ignores the `index.kmd` file (as far as its concerned, the `.kmd` file is irrelevant), and instead inspects the `index.md` file. Then, with the assistance of various template and other configuration files I'll mention later, it converts the `index.md` file to the `index.html` file that contains the final version of the post.

There's a tiny bit of fanciness required to configure eleventy to accomplish this, but only a tiny bit. To my surprise and horror it was way easier than I thought it was going to be. So now let's take a deeper look at the static site itself, and the way it's designed.  

## What files are needed for the eleventy site?

Let's have a look at every single file that exists in the project that is *not* a source file or a generated output file (whether by knitr or by eleventy). There's several of these, and to be honest when I started building this blog I didn't create all of them at once. What I actually did was start by following [this tutorial](https://www.filamentgroup.com/lab/build-a-blog/) to build a simplified version and then expanded as I went along. Nevertheless, here's all the files. There are some configuration files that are specifically relevant to the eleventy static site generator:

- `.eleventy.js` lives in the root folder and is the primary configuration file
- `.eleventyignore` lives in the root folder and is how you tell eleventy to ignore files
- `layout.liquid` lives in the `_includes` folder and used to tell eleventy how to convert markdown to html
- `posts.json` lives in the `posts` folder and specifies rules that applied to to that folder only

None of these files end up in the output directory (in my case `docs`) when the site gets built. They're used to control *how* the site is built but they are not included in the output. In contrast, there are several static files in the root folder that aren't part of the configuration, but must be copied into the `docs` folder at build time to ensure that the html documents render correctly and that the site deploys correctly on GitHub pages:

- `normalize.css`, `skeleton.css`, and `tweaks.css` css files loaded by every html page
- `preview.jpg` is used as the social media preview image and also appears on the home page
- `CNAME` is used so that GitHub Pages can deploy the site to the specific subdomain of my website
- `.nojekyll` is there to prevent GitHub Pages from interpreting my site as a Jekyll static site

None of these are used to control the build process (i.e., eleventy doesn't use them), they are simply part of the website and need to be copied across into the output folder at build time. The last few files, all of which live in the root folder, have absolutely nothing to do with eleventy and do not end up in the site either:

- `knit.sh` is the knitr script I mentioned earlier
- `.gitignore` is the git ignore file, as usual
- `README.md` is the readme file

Finally, I should mention that there is one actual "content source" file in the root folder: `index.html` is the source file for the front page of the website (similar to the various `index.md` files). Oh and I suppose as usual yes there's a hidden `.git` folder containing the git repo but that hardly counts, does it?

So now that we have a list of all the files, let's talk about what they're doing. I'll start with the template file, because a lot of the work is done by this file. 
 
## Template files

In my `_includes` folder there is a single template file called `layout.liquid`, which provides instructions to eleventy as to how the markdown document should be transformed into an html document. For the moment I'm going to simplify things a bit and strip out most of what's in the html header, but apart from that change this is the actual template file:

{% raw %}
```html
<!doctype html>
<html lang="en">
    <!-- a simplified version of what's actually in the header -->
    <head>
        <meta charset="utf-8">
        <title>An eleventy blog with knitr</title>
    </head>
    
    <!-- post body -->
    <body>

        <!-- navigation buttons -->
        <div class = "container u-pad-2">
            <div class = "row">
                <a class="button" href="/">Home</a>
                <a class="button" href="https://github.com/djnavarro/knitr-11ty">GitHub Page</a>
                <a class="button" href="https://djnavarro.net">Danielle's Home Page</a>
            </div>
        </div>

        <!-- post front matter -->
        <div class = "container u-pad-2">
            <h1>{{ title }}</h1>
            <p>
            {{ subtitle }}<br>
            {{ date | date: "%Y-%m-%d" }}
            </p>
            <hr>
        </div>

        <!-- post content -->
        <div class="container">
            {{ content }}
        </div>

        <!-- empty space at bottom -->
        <div class="container u-pad-2"></div>
    </body>
</html>
```
{% endraw %}

You can see the basic structure of the html file here, and if you've had any experience editing the [hugo](https://gohugo.io/) layout files that are used to control how a blogdown site looks, this should seem very familiar. Fields specified within the curly braces, such as {% raw %}`{{ title }}`{% endraw %} are interpreted as placeholders, and when eleventy builds the site it replaces them with the relevant fields extracted from the markdown document. Technically though it's a different format. Eleventy supports several different templaying languages, but for this blog I'm using [liquid](https://shopify.github.io/liquid/).

Okay, so where do these values come from? Some of these fields are supplied explicitly in the yaml header. For instance, this is the yaml header used in the current document:

```yaml
---
title: The blogdown of theseus
subtitle: Because you know what? I *am* here to fuck spiders
date: 2023-12-23
---
```

At build time, eleventy reads these values and inserts them into the appropriate locations within the template to create the final document. But not everything is specified in the yaml. For example, the {% raw %}`{{ content }}`{% endraw %}) field isn't in the yaml header: that refers to the body of the markdown document (which is of course rendered as html by following the usual conventions for markdown). 

A nice thing about the templating language is that you can use these fields in the markdown itself. For instance, if my markdown file uses the title field like this:

{% raw %}
`{{ title }}`
{% endraw %}

what actually appears in the final document is this:

`{{ title }}`

(Parenthetically, I had to learn a little bit about the ["raw" tag in liquid](https://shopify.github.io/liquid/tags/template/) to make the first version show up *without* substituting the value.)


### Supporting equations

The blog has various other features that are all secretly controlled by the template file. To see where those come from, I need to start showing all the things in the html header that I chopped out from the version above. Let's start with equations. This blog supports LaTeX equations via [mathjax](https://www.mathjax.org/). As an example, in a [pharmacokinetics post](https://blog.djnavarro.net/posts/2023-12-19_solving-two-compartment-pk-models/) I wrote a few days ago on my actual blog, I was talking about properties of matrix exponentials in the context of solving linear homogeneous systems of ordinary differential equations, and noted that if you can use the eigendecomposition 
$\mathbf{K} = \mathbf{U} \mathbf{\Lambda} \mathbf{U}^{-1}$ 
to compute the matrix exponential:

$$
e^{t \mathbf{K}} = \mathbf{U} e^{t \mathbf{\Lambda}} \mathbf{U}^{-1}
$$

This particular fact is of very little relevance to the current post, of course, except insofar as it's a nice way to show that equations are supported. There's a little bit of tinkering required to support inline equations as well as standalone equations, but it's not much. Here's the relevant lines from the html header in my liquid template:

```html
<!-- support equations with mathjax -->
<script async src="https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML"></script>
<script type="text/x-mathjax-config">MathJax.Hub.Config({tex2jax: { inlineMath: [['$', '$']] }});</script>
```

That's all that you have to do in order to get equations supported. 


### Supporting social media tags

Next, let's look at social media tags. For the purposes of this blog I kept it pretty simple. Every page on the site uses the same preview image, but it does have a custom title and description, which gets extracted from the `title` and `subtitle` fields in the yaml header. In the template it looks like this:

{% raw %}
```html
<!-- social media tags -->
<meta property="og:title" content="{{ title }}">
<meta property="og:description" content="{{ subtitle }}">
<meta property="og:image" content="https://knitr-11ty.djnavarro.net/preview.jpg">
<meta property="og:site-name" content="An eleventy blog with knitr">
<meta name="twitter:title" content="{{ title }}">
<meta name="twitter:description" content="{{ subtitle }}">
<meta name="twitter:image" content="https://knitr-11ty.djnavarro.net/preview.jpg">
<meta name="twitter:creator" content="@djnavarro">
<meta name="twitter:card" content="summary_large_image">
```
{% endraw %}

But in the generated html it looks like this:

```html
<!-- social media tags -->
<meta property="og:title" content="{{ title }}">
<meta property="og:description" content="{{ subtitle }}">
<meta property="og:image" content="https://knitr-11ty.djnavarro.net/preview.jpg">
<meta property="og:site-name" content="An eleventy blog with knitr">
<meta name="twitter:title" content="{{ title }}">
<meta name="twitter:description" content="{{ subtitle }}">
<meta name="twitter:image" content="https://knitr-11ty.djnavarro.net/preview.jpg">
<meta name="twitter:creator" content="@djnavarro">
<meta name="twitter:card" content="summary_large_image">
```

In any case, you could of course go further than this and have a system like quarto which automatically finds an image to use as the preview if the user doesn't specify one, or a stripped down version that requires the user to specify an `image` field in the yaml, but I decided that spending any time on this would be breaking my "Bob Katter rule", and I am terribly concerned about the possibility I might be neglecting the threats posed by crocodiles in North Queensland. So let's move on. 

## The .eleventy.js configuration file

```js
// syntax highlighing is a separate npm package
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");

module.exports = function(eleventyConfig) {

  // use syntax highlighting
  eleventyConfig.addPlugin(syntaxHighlight);

  // pass through for individual site files
  eleventyConfig.addPassthroughCopy("normalize.css");
  eleventyConfig.addPassthroughCopy("skeleton.css");
  eleventyConfig.addPassthroughCopy("tweaks.css");
  eleventyConfig.addPassthroughCopy(".nojekyll");
  eleventyConfig.addPassthroughCopy("CNAME");
  eleventyConfig.addPassthroughCopy("preview.jpg");

  // pass through for png files in posts, preserving directory structure
  eleventyConfig.addPassthroughCopy("posts/**/*.png");

  // configure the output directory
  return {
    dir: {
      output: "docs"
    }
  }
};
```

This file is doing three different things. 

### Syntax highlighting

For instance, there are two lines that are used to configure the [syntax highlighting](https://www.11ty.dev/docs/plugins/syntaxhighlight/). The top line calling `require()` is used to import the syntax highlighting plugin, which is a separate package from eleventy itself. That does mean you need to have installed the plugin from npm previously, which you can do with 

```bash
npm install @11ty/eleventy-plugin-syntaxhighlight --save-dev
```

The line that tells eleventy to actually use this plugin is the one contained within the `module.exports()` function (i.e., `eleventyConfig.addPlugin(syntaxHighlight)`). By including this in the eleventy configuration file, you're ensuring that when eleventy builds the html file it will wrap code in the relevant tags that [prism](https://prismjs.com/) needs. However, you still need to make sure that the html file loads the relevant css so that the style are applied. To do that, you need a line like this one in the html header in the template:

```html
<!-- syntax highlighting --> 
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism.min.css">
```

### Output directory

By default, eleventy will write the generated static site to a folder named `_site`. That's a very sensible default, and it absolutely pains me that GitHub Pages refuses to support it. If you want to deploy a static site to GitHub Pages (ignoring fancypants stuff like deploying from a separate branch), the static site either has to be contained in the project root folder (no, I'm not going to do that) or in the `docs` folder. Siiiigh. Okay, whatever. In the eleventy configuration file I've specified the output folder through the return value for `module.exports()` like this:

```js
return {
  dir: {
    output: "docs"
  }
}
```

Problem solved. I don't love this and frankly would prefer to bypass all this by deploying to Netlify instead of GitHub Pages, but that's even more effort and the Bob Katter principle applies. 

### Pass through

There are several lines in my eleventy configuration file that are used to specify [pass through copy](https://www.11ty.dev/docs/copy/) rules. On its own, eleventy is smart enough to create a static site in the output folder (`docs`) which contains all the html files in the appropriate places, but you need to give it explicit instructions about which other files should be copied and where they go. So here are mine:

```js
// pass through for individual site files
eleventyConfig.addPassthroughCopy("normalize.css");
eleventyConfig.addPassthroughCopy("skeleton.css");
eleventyConfig.addPassthroughCopy("tweaks.css");
eleventyConfig.addPassthroughCopy(".nojekyll");
eleventyConfig.addPassthroughCopy("CNAME");
eleventyConfig.addPassthroughCopy("preview.jpg");

// pass through for png files in posts, preserving directory structure
eleventyConfig.addPassthroughCopy("posts/**/*.png");
```

Most of these are just taking a file that exists in the project root folder (e.g., `skeleton.css`), and then copying it to the `docs` folder. The last one is slightly more complex, since it uses globbing rules, but it's critical for this whole "knitr-flavoured markdown" trick to work. This one looks for every `.png` file within the `posts` folder and copies them across to the `docs/posts` folder, keeping the folder structure intact. This part is important because when knitr generates the `.md` file, it contains a relative path link to any `.png` file that it creates. Eleventy doesn't know about this, so we have to make sure that when it creates the `.html` file (in `docs`) from the `.md` file (in `posts`), it also copies any knitr-generated `.png` files into the `docs` folder, such that the relative path from the eleventy-generated `.html` file to the eleventy-copied `.png` remains the same as the relative path from the the knitr-generated `.md` file to the knitr-generated `.png` file. If we don't do that, all the image links in our knitr-flavoured markdown blog posts will break.

## The .eleventyignore file

As you might expect given the name, the `.eleventyignore` file is analogous to the `.gitignore` file and has similar syntax (I suppose it's also similar to `.Rbuildignore`, but that has different syntax). In any case it's really just a list of files and folders that eleventy will ignore when trying to build the static site. By default, eleventy will ignore any folder that begins with `_` and anything included in the `.gitignore` file (you can disable the latter if you want). This has the nice property that the `_site` output file will never be mistaken for a source folder, and the last thing you really want is an annoying recursion where the static site generator treats its own output as input. However, thanks to the infuriating inflexibility of GitHub Pages, I have renamed my output folder to `docs`, and eleventy does not ignore this folder by default. Okay, better fix that. So here's my entire `.eleventyignore` file:

```
README.md
docs
```

I've told it to ignore the `docs` folder, and also my GitHub `README.md` file, since I don't actually want that to end up in the static site.

## Styling the pages with skeleton

At this point we've covered almost everything that needs to be discussed about eleventy (at least for the purposes of this blog post). There's a few other things I need to mention but I'll come back to that later, because the last "big" topic to cover here is the css that controls the visual style of the blog. In R markdown and quarto, this is handled using [bootstrap](https://getbootstrap.com/). Bootstrap is a powerful, full-featured css framework, I've used it in some of my own projects, and it's a perfectly sensible thing to use. However, I'm not going to use it here because bootstrap is finicky and takes effort. Using boostrap here would violate the Bob Katter principle. Instead, I'm going to use [skeleton](http://getskeleton.com/), an extremely minimal css-only framework. It's simple, clean, and requires very little effort. One downside is that it's not being maintained anymore (the last commit to the repo was in 2014) but at the same time it's simple enough that I'm pretty okay with using it as-is. I probably wouldn't use it for a blog I intended to run for a long time because actually I quite like a lot of the fancy bootstrap features, but this is a small side project and in this context skeleton is perfect. 

In any case, here's what that entails. In total there are three css files to include: one is the `skeleton.css` file itself (only 400 lines of css), the second is is `normalize.css` (see [here](https://csstools.github.io/normalize.css/)), and the third is the `tweaks.css` file that I wrote to add a few minor customisations that I wanted. All of these files are stored in the root directory of my project, and (as mentioned earlier) there's a pass-through rule in my `.eleventy.js` file that ensures they are all copied to the `docs` folder when the site gets built. So then all I have to do is include this in the html header of my liquid template and I'm done:

```html
<!-- css -->
<link rel="stylesheet" href="/normalize.css">
<link rel="stylesheet" href="/skeleton.css">
<link rel="stylesheet" href="/tweaks.css">
```

## A listing page for the blog

The last thing that we need for the blog (actually one of the first things I did because it was covered in the simple tutorial to get started) is set up the home page, and configure it so that eleventy creates a reverse-chronological list of all the posts on the blog. In this case it was easier to write it as an `index.html` file in the root folder for the blog (rather than an `index.md` file). However, the file I wrote is not a complete html document, and is still interpreted by eleventy with the help of the template file. Anyway, here it is. It begins with a yaml header:

```yaml
---
layout: layout.liquid
title: An eleventy blog with knitr
subtitle: A side project by Danielle Navarro
---
```

It then supplies content, in html format rather than markdown:

{% raw %}
```html
<img src="preview.jpg" width=200 style="border-radius:50%">

<br><br>

<ul>
{% for post in collections.posts reversed %}
    <li>
        <a href="{{ post.url }}">{{ post.data.title }}</a>
        <small>({{ post.date | date: "%Y-%m-%d" }})</small>
    </li>
{% endfor %}
</ul>
```
{% endraw %}

This time you can see a little more of the liquid templating language coming into play. The html in this document defines a list with one element per blog post. It contains a link to the relevant post, using the title field for that post as the text of the link, along with the post date.

The key thing to note here is that this only works because all of the posts that I've written in this blog have a "posts" tag in the metadata. That's what enables eleventy to index the set of all posts with `collections.posts`. However, this might seem like a puzzle, because the yaml header for this post doesn't actually include any tags. There's something missing here, and the answer to this lies in the fact that my `posts` folder also includes a file called `posts.json`. Here it is:

```json
{
    "layout": "layout.liquid",
    "tags": ["posts"]
}
```

This json file contains additional fields (in json format not yaml) that are applied to all posts in the `posts` folder. I could have done the same thing by including this in the yaml header for all my posts:

```yaml
layout: layout.liquid
tags: ["posts"]
```

That would have the same effect.

## Wrapping up

Okay look. Let's be brutally honest here. This thing I cobbled together in an afternoon is absolutely not a meaningful replacement for the professional tooling provided by R markdown, quarto, blogdown etc. It's missing a tonne of important features that those tools provide and -- clearly -- it's a Rube Goldberg device that is stitched together with bits of string I found under the carpet. The constituent parts are perfectly sensible things: knitr is the primary tool that we all use in the R ecosystem for literate programming, and eleventy is a very, very good static site generator. The reason this is a "bad" blog is not that there's a problem with those tools, it's because I followed the Bob Katter principle and didn't spend any time on it. I chucked a few things together in an afternoon, spent another afternoon writing a blog post, and called it a day. If you want a properly-functioning system you have to put more effort into it than I did here.

That being said, it was never my intention to build a properly-functioning system here. I wanted to learn a little bit about how you could go about building tools like R markdown, blogdown, and quarto. I also wanted to learn a little bit about eleventy, because I've been curious about it for a while. With respect to those goals, I think I did okay. 

Mission. Fucking. Accomplished.
