require 'json'

module Jekyll
  module LocaleFilter

    def js_locale(lang_code)

      site_data = @context.registers[:site].data

      unless site_data.has_key? lang_code
        return ''
      end

      lang_data = site_data[lang_code]

      unless lang_data.has_key? 'locale'
        return ''
      end

      lang_data['locale'].to_json
    end
  end
end

Liquid::Template.register_filter(Jekyll::LocaleFilter)
