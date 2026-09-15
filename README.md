# MintStreet

Story-first financial literacy — plain-English lessons on share markets, money markets, investing, and trading, from Dalal Street to Wall Street.

**Live site:** https://prasad-rently.github.io/MintStreet/

## What this is

A four-module core curriculum (how money works, what the stock market is, its fundamentals and terminology, and how a trade actually happens) plus supplementary story-driven dispatches on market history, and a set of interactive practice sheets — a jargon quiz, calculators, and an interactive diagram of the 2008 financial crisis spreading market to market.

Built and maintained with Claude Code. No build step: every page is hand-authored static HTML/CSS/vanilla JS, in the same spirit as [KaizenCode](https://prasad-rently.github.io/KaizenCode/index.html).

## Structure

```
index.html                 home
dispatches/
  index.html                dispatch listing (core curriculum + supplementary)
  how-money-works.html       Module 1
  what-is-the-stock-market.html   Module 2
  stock-market-fundamentals.html  Module 3
  types-of-trade.html        Module 4
  <5 supplementary dispatches>.html
practice/
  index.html                 jargon quiz, calculators, contagion explorer
assets/
  css/tokens.css              design tokens (colors, type) — light + dark
  css/site.css                shared component styles
  js/site.js                  shared interactive behavior
  img/favicon.svg
sitemap.xml
robots.txt
```

## Local preview

No build step — open `index.html` directly in a browser, or serve the folder:

```bash
python3 -m http.server 8000
```

## Disclaimer

Everything on this site is educational. Nothing here is investment, trading, or financial advice.
