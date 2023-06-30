# colors-theme-plugin.ts

## How it works. Briefly.

Here it shows a few examples of how it works:

Before examples, we take such colors from API data:
```json
{
  "text/txt900":"#2a3fff",
  "light/text/txt900":"#ffffff",
  "dark/text/txt900":"#000000",
  "dark/text/txt700":"#00ff00",
  "monochrome/text/txt900":"#ff00ff",
  "colorful/text/txt900":"#00ffff",
  "text/txt800":"#3fc3fc3fc"
}
```
Plugin creates themes' files for only defined themes from a config, other styles will be ignored.

---

1. There are some themes and the default theme. 

Config:
```json
{
  "styles": {
    "colors": {
      "useTheme": true,
      "allowedThemes": ["dark","light","monochrome"],
      "defaultTheme": "monochrome"
    }
  }
}
```
It will generate such files:

* `themes-list.ts`:
```ts
export type DefaultTheme = 'monochrome';

export type Theme = 'light' | 'dark' | 'monochrome'; 
```
* `colors/dark/index.js`:
```js
module.exports = {
    "text-txt900":"#000000",
    "text-txt700":"#00ff00"
};
```
* `colors/light/index.js`:
```js
module.exports = {
    "text-txt900":"#ffffff",
};
```
* `colors/monochrome/index.js`:
```js
module.exports = {
    "text-txt900":"#ff00ff",
};
```
* `colors/index.js`:
```js
module.exports = {
    "text-txt900":"#ff00ff",
    "text-txt700":""
};
```
* `colors/with-vars.js`:
```js
module.exports = {
    "text-txt900":"var(--sh-text-txt900,'#ff00ff')",
    "text-txt700":"var(--sh-text-txt700,'')"
};
```
* `colors/dark/vars.css`:
```css
[data-theme='dark'] {
    --sh-text-txt900: '#000000';
    --sh-text-txt700: '#00ff00';
}
```
* `colors/light/vars.css`:
```css
[data-theme='light'] {
    --sh-text-txt900: '#ffffff';
    --sh-text-txt700: '';
}
```
* `colors/monochrome/vars.css`:
```css
[data-theme='monochrome'] {
    --sh-text-txt900: '#ff00ff';
    --sh-text-txt700: '';
}
```
* `colors/vars.css` (from *monochrome* theme):
```css
:root {
    --sh-text-txt900: '#ff00ff';
    --sh-text-txt700: '';
}
```
---
3. If there are some themes and one of them does not exist in API

Config:
```json
{
  "styles": {
    "colors": {
      "useTheme": true,
      "allowedThemes": ["dark-blue","light","monochrome"],
      "defaultTheme": "monochrome"
    }
  }
}
```
It will generate such files:

* `themes-list.ts`:
```ts
export type DefaultTheme = 'monochrome';

export type Theme = 'light' | 'dark-blue' | 'monochrome'; 
```
* `colors/dark-blue/index.js`:
```js
module.exports = {};
```
* `colors/light/index.js`:
```js
module.exports = {
    "text-txt900":"#ffffff",
};
```
* `colors/monochrome/index.js`:
```js
module.exports = {
    "text-txt900":"#ff00ff",
};
```
* `colors/index.js`:
```js
module.exports = {
    "text-txt900":"#ff00ff",
};
```
* `colors/with-vars.js`:
```js
module.exports = {
    "text-txt900":"var(--sh-text-txt900,'#ff00ff')",
};
```
* `colors/dark-blue/vars.css`:
```css
[data-theme='dark-blue'] {
    --sh-text-txt900: '';
}
```
* `colors/light/vars.css`:
```css
[data-theme='light'] {
    --sh-text-txt900: '#ffffff';
}
```
* `colors/monochrome/vars.css`:
```css
[data-theme='monochrome'] {
    --sh-text-txt900: '#ff00ff';
}
```
* `colors/vars.css` (from *monochrome* theme):
```css
:root {
    --sh-text-txt900: '#ff00ff';
}
```
