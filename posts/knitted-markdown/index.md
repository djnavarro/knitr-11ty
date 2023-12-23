---
title: A knitr-flavoured markdown post
subtitle: It's kind of like R markdown but so much worse
date: 2023-12-23
---

This is a "knitr-markdown" blog post. For no particular reason I've decided to use `.kmd` as the file extension ("knitr markdown"). Much like R markdown it uses knitr to render the code chunks to a knitted markdown file, but it's not actually R markdown so I don't want to use `.Rmd` or whatever. 


```r
add_one <- function(x) {
    x + 1
}
add_one(10)
```

```
## [1] 11
```

Eleventy doesn't process the `.kmd` file, but it will process the `.md` file that gets created when I call knitr on this. Handling plot outputs is slightly more complicated, because it requires a lot more care in managing the knitr/eleventy interaction. I'll discuss that in the main post.
