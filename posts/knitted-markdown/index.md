---
pageTitle: A knitr-markdown post
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

Let's have a look at plots generated with R


```r
set.seed(1)
df <- data.frame(
  x = sample(1:10, size = 100, replace = TRUE),
  y = sample(1:10, size = 100, replace = TRUE),
  size = sample(1:5, size = 100, replace = TRUE),
  shade = sample(colours(), size = 100, replace = TRUE)
)
op <- par(
  mar = c(0, 0, 0, 0),
  bg = "black"
)
with(
  df, 
  plot(
    x = x, 
    y = y, 
    col = shade, 
    axes = FALSE, 
    cex = size,
    xlab = "", 
    ylab = "",
    pch = 19
  )
)
```

<div class="figure">
<img src="figure/make-a-plot-1.png" alt="plot of chunk make-a-plot" width="100%" />
<p class="caption">plot of chunk make-a-plot</p>
</div>