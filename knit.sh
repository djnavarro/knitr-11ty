#! /bin/bash
Rscript -e "setwd('$1'); knitr::knit('index.kmd', 'index.md')"