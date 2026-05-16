import { LanguageCode } from '@core/types/language-code';
import { AVAILABLE_LANGUAGES } from '@core/constants/constants';

export function isLanguageCode(lang: LanguageCode): lang is LanguageCode {
  return typeof lang === 'string' && AVAILABLE_LANGUAGES.includes(lang);
}
