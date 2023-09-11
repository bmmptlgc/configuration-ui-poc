import { useContext } from 'react';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector'
import fetch from 'i18next-fetch-backend';

import { getValidationMessages } from 'core/helpers/schemaForm';

import { AppConfig } from '../types/appConfig';
import Constants from '../constants';
import { useAppStore } from '../stores/appStore';
import { AppConfiguration } from '../components/app/App';

import { useCancelableEffect } from './utils';

const currencyCodeMap: { [locale: string]: string } = {
  'en-CA': 'CAD',
  'en-US': 'USD'
};

export const supportedLngs = [
  Constants.Localization.Languages.EN_US,
  Constants.Localization.Languages.EN_CA,
];
export const fallbackLng = Constants.Localization.Languages.EN_CA;

const useI18n = (): void => {
  const {config: {localization: {debug}}} = useContext<AppConfig>(AppConfiguration);

  const appStore = useAppStore();

  useCancelableEffect(
    (cleanup: { didCancel: boolean }): void => {
      !cleanup.didCancel && !i18n.isInitialized && i18n
        // load translations using fetch. learn more: https://github.com/dotcore64/i18next-fetch-backend
        .use(fetch)
        // Detect user language. learn more: https://github.com/i18next/i18next-browser-languageDetector
        .use(LanguageDetector)
        // // Pass the i18n instance to react-i18next. Enables use of the useTranslation hook.
        .use(initReactI18next)
        // Init i18next
        // For all options read: https://www.i18next.com/overview/configuration-options
        .init({
          load: 'currentOnly', // so i18next doesn't try to fetch 'en'
          supportedLngs,
          fallbackLng,

          ns: [Constants.Localization.Namespaces.CORE],
          defaultNS: Constants.Localization.Namespaces.COMMON,
          fallbackNS: Constants.Localization.Namespaces.CORE,

          debug: debug,

          backend: {
            loadPath: `${location.protocol}//${location.host}/public/locales/{{lng}}/{{ns}}.{{lng}}.json`
          },

          detection: {
            order: ['navigator', 'querystring', 'cookie', 'localStorage', 'htmlTag'],
          },

          interpolation: {
            escapeValue: false, // not needed for react as it escapes by default
            format: (value, format, lng): string => {
              switch (format) {
                case 'date':
                  // eslint-disable-next-line no-case-declarations
                  const date = new Date(value);
                  return Intl.DateTimeFormat(lng)
                    .format(new Date(date.getTime() + date.getTimezoneOffset() * 60000));
                case 'dateTime':
                  return Intl.DateTimeFormat(lng).format(new Date(value));
                case 'fullDate':
                  return Intl.DateTimeFormat(lng, {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'numeric',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                    hour12: true,
                    timeZone: 'UTC'
                  }).format(new Date(value));
                case 'currency':
                  return Intl.NumberFormat(lng, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  }).format(value).replace(/,/g, '');
                case 'currencyWithSymbol':
                  return Intl.NumberFormat(lng, {
                    style: 'currency',
                    currency: currencyCodeMap[lng as string]
                  }).format(value);
              }

              return value;
            }
          }
        }).then((t) => {
          appStore.setLocale(i18n.language);

          appStore.setSchemaFormValidationMessages(getValidationMessages(t));

          return t;
        })
        // TODO: Create some default error (can't be localized with i18n)
        .catch(() => {
          appStore.showModal({
            title: 'An error occurred',
            body: 'Some default error'
          })
        });
    },
    []
  );
};

export default useI18n;