require 'json'

module Jekyll
  module I18NFilter

    def js_l10n(lang_code)

      site_data = @context.registers[:site].data

      unless site_data.has_key? lang_code
        return ''
      end

      lang_data = site_data[lang_code]

      unless lang_data.has_key? 'l10n-js'
        return ''
      end

      lang_data['l10n-js'].to_json
    end

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

Liquid::Template.register_filter(Jekyll::I18NFilter)
