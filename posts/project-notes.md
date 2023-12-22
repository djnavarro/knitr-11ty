---
pageTitle: Notes for the project
---

This is also a plain markdown post. Also kind of serves as my changelog for this project!

- First step was installing eleventy via npm and following this minimal [tutorial](https://www.filamentgroup.com/lab/build-a-blog/). At this point I created a minimal `layout.liquid` file, some `.md` files in a `posts` folder, and `index.html` file in the root folder to create the index page, and a `posts.json` file in the posts folder to ensure that everything in the `posts` folder is automatically given a "posts" tag 
- Second step was installing the eleventy [syntax highlighting](https://www.11ty.dev/docs/plugins/syntaxhighlight/) plugin and adding it to the `.eleventy.js` configuration file in the project root folder. To get it working you also need to modify the template in the `layout.liquid` file so that it loads the PrismJS syntax highlighting JS from your favourite CDN. Once that was complete, code blocks show syntax highlighting but of course they do not execute:

```r
add_one <- function(x) {
    x + 1
}
add_one(10)
```

- Third step was to test the basic idea for knitr integration. I created a post with the `.kmd` file extension, in which the R code chunks are written using knitr syntax. Eleventy ignores this file, but I can call `knitr::knit()` to create a knitted markdown file with the `.md` file extension. Eleventy picks up this `.md` file and creates the corresponding `.html` for the blog 
- Fourth step was remembering that I should probably have this in a git repo... so yeah. Added the `_site` folder to `.gitignore` for now. I also wanted a `README.md` file for github that isn't part of the blog, so now I need to add an `.eleventyignore` file (see [here](https://www.11ty.dev/docs/ignores/)) too so that eleventy doesn't try to include the readme in the static site
- Fifth step is to add some nice css styling. I could write my own but why? Instead I chose to use [skeleton](https://getskeleton.com) for lightweight css templating. There's a few ways for eleventy to handle [static assets](https://www.11ty.dev/docs/assets/): I took the easiest path and added a passthrough to my `.eleventy.js` file
- Sixth step is to set it up to deploy to github pages. The [output directory](https://www.11ty.dev/docs/config/#output-directory) needs to go to `docs` rather than `_site`, and we need to ensure that eleventy ignores the `docs` folder. Also need `.nojekyll` and `CNAME` files with a passthrough so it ends up in the `docs` folder, and setup the CNAME resource record for the subdomain [knitr-11ty.djnavarro.net](https://knitr-11ty.djnavarro.net) so that it deploys correctly