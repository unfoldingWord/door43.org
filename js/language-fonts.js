import $ from 'jquery';
import lang_font_families from '/assets/lang_font_families.json';
import lang_font_links from '/assets/lang_font_links.json';

export function initLanguageFonts() {
	lang = $('html').attr('lang');
	if (!lang || !lang_font_families.includes(lang)) {
		return;
	}
  setFontsHTML(lang_font_families[lang], `:root html`);
}

function setFontsHTML(fonts, selector) {
  const $head = $('head');
  if (!fonts.includes('Noto Sans')) {
    fonts.push('Noto Sans');
  }
  for (const font of fonts) {
    if (lang_font_links[font]) {
      $head.append(`<link href="${lang_font_links[font]}" rel="stylesheet">`);
    }
  }
  $head.append(`
<style type="text/css">
    ${selector} {
    font-family: "${fonts.join(', ')}, sans-serif" !important;
  }; 
</style>`);
}
