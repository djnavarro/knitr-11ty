---
pageTitle: A post you have to knit first
---

For no particular reason I've decided to use `.kmd` as the file extension ("knitr markdown"). Much like R markdown it uses knitr to render the code chunks to a knitted markdown file, but it's not actually R markdown so I don't want to use `.Rmd` or whatever. 


```r
add_one <- function(x) {
    x + 1
}
add_one(10)
```

```
## [1] 11
```

Eleventy doesn't process the `.kmd` file, but it will process the `.md` file that gets created when I call knitr on this.
