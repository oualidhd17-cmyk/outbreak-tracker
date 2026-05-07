export type AppLocale = 'en' | 'ar' | 'fr' | 'es';

export type TranslationKey =
  | 'app.title'
  | 'app.subtitle'
  | 'stats.totalConfirmed'
  | 'stats.deaths'
  | 'stats.countries'
  | 'stats.lastUpdate'
  | 'stats.confirmedByCountry'
  | 'map.title'
  | 'map.subtitle'
  | 'chart.title'
  | 'chart.subtitle'
  | 'chart.confirmed'
  | 'chart.deaths'
  | 'sources.verified'
  | 'actions.refresh'
  | 'status.title'
  | 'status.officialUpdate'
  | 'status.browserRefresh'
  | 'status.mode'
  | 'status.staticJson'
  | 'ads.topBanner'
  | 'ads.sidebar'
  | 'ads.chartSide'
  | 'ads.mobile'
  | 'loading.dashboard'
  | 'error.title'
  | 'error.message'
  | 'error.retry'
  | 'language.label';

export const LOCALES: Array<{
  code: AppLocale;
  label: string;
  nativeName: string;
  dir: 'ltr' | 'rtl';
}> = [
  {
    code: 'en',
    label: 'English',
    nativeName: 'English',
    dir: 'ltr',
  },
  {
    code: 'ar',
    label: 'Arabic',
    nativeName: 'العربية',
    dir: 'rtl',
  },
  {
    code: 'fr',
    label: 'French',
    nativeName: 'Français',
    dir: 'ltr',
  },
  {
    code: 'es',
    label: 'Spanish',
    nativeName: 'Español',
    dir: 'ltr',
  },
];

export const DEFAULT_LOCALE: AppLocale = 'en';

export const messages: Record<AppLocale, Record<TranslationKey, string>> = {
  en: {
    'app.title': 'Live Outbreak Tracker',
    'app.subtitle': 'Official-source dashboard with delayed static updates.',
    'stats.totalConfirmed': 'Total Confirmed',
    'stats.deaths': 'Deaths',
    'stats.countries': 'Countries',
    'stats.lastUpdate': 'Last update',
    'stats.confirmedByCountry': 'Confirmed Cases by Country/Region',
    'map.title': 'Interactive Map',
    'map.subtitle': 'Outbreak locations by confirmed cases',
    'chart.title': 'Case Timeline',
    'chart.subtitle': 'Total confirmed cases over time',
    'chart.confirmed': 'Confirmed',
    'chart.deaths': 'Deaths',
    'sources.verified': 'Verified Sources',
    'actions.refresh': 'Refresh',
    'status.title': 'Data Status',
    'status.officialUpdate': 'Official update',
    'status.browserRefresh': 'Browser refresh',
    'status.mode': 'Mode',
    'status.staticJson': 'Static JSON',
    'ads.topBanner': 'Top Banner Ad',
    'ads.sidebar': 'Sidebar Ad',
    'ads.chartSide': 'Chart Side Ad',
    'ads.mobile': 'Mobile Ad',
    'loading.dashboard': 'Loading outbreak dashboard',
    'error.title': 'Unable to load data',
    'error.message': 'The dashboard data is currently unavailable.',
    'error.retry': 'Retry',
    'language.label': 'Language',
  },
  ar: {
    'app.title': 'منصة تتبع التفشي المباشر',
    'app.subtitle': 'لوحة بيانات من مصادر رسمية مع تحديثات دورية مؤجلة.',
    'stats.totalConfirmed': 'إجمالي الحالات المؤكدة',
    'stats.deaths': 'الوفيات',
    'stats.countries': 'الدول',
    'stats.lastUpdate': 'آخر تحديث',
    'stats.confirmedByCountry': 'الحالات المؤكدة حسب الدولة/المنطقة',
    'map.title': 'الخريطة التفاعلية',
    'map.subtitle': 'مواقع التفشي حسب الحالات المؤكدة',
    'chart.title': 'الخط الزمني للحالات',
    'chart.subtitle': 'إجمالي الحالات المؤكدة عبر الوقت',
    'chart.confirmed': 'المؤكدة',
    'chart.deaths': 'الوفيات',
    'sources.verified': 'مصادر موثوقة',
    'actions.refresh': 'تحديث',
    'status.title': 'حالة البيانات',
    'status.officialUpdate': 'التحديث الرسمي',
    'status.browserRefresh': 'تحديث المتصفح',
    'status.mode': 'الوضع',
    'status.staticJson': 'JSON ثابت',
    'ads.topBanner': 'إعلان علوي',
    'ads.sidebar': 'إعلان جانبي',
    'ads.chartSide': 'إعلان جانب الرسم',
    'ads.mobile': 'إعلان الجوال',
    'loading.dashboard': 'جاري تحميل لوحة التتبع',
    'error.title': 'تعذر تحميل البيانات',
    'error.message': 'بيانات اللوحة غير متوفرة حاليًا.',
    'error.retry': 'إعادة المحاولة',
    'language.label': 'اللغة',
  },
  fr: {
    'app.title': 'Tableau de suivi des épidémies',
    'app.subtitle': 'Tableau basé sur des sources officielles avec mises à jour différées.',
    'stats.totalConfirmed': 'Total confirmé',
    'stats.deaths': 'Décès',
    'stats.countries': 'Pays',
    'stats.lastUpdate': 'Dernière mise à jour',
    'stats.confirmedByCountry': 'Cas confirmés par pays/région',
    'map.title': 'Carte interactive',
    'map.subtitle': 'Lieux de l’épidémie par cas confirmés',
    'chart.title': 'Chronologie des cas',
    'chart.subtitle': 'Total des cas confirmés dans le temps',
    'chart.confirmed': 'Confirmés',
    'chart.deaths': 'Décès',
    'sources.verified': 'Sources vérifiées',
    'actions.refresh': 'Actualiser',
    'status.title': 'État des données',
    'status.officialUpdate': 'Mise à jour officielle',
    'status.browserRefresh': 'Actualisation navigateur',
    'status.mode': 'Mode',
    'status.staticJson': 'JSON statique',
    'ads.topBanner': 'Annonce supérieure',
    'ads.sidebar': 'Annonce latérale',
    'ads.chartSide': 'Annonce graphique',
    'ads.mobile': 'Annonce mobile',
    'loading.dashboard': 'Chargement du tableau',
    'error.title': 'Impossible de charger les données',
    'error.message': 'Les données du tableau sont actuellement indisponibles.',
    'error.retry': 'Réessayer',
    'language.label': 'Langue',
  },
  es: {
    'app.title': 'Panel de seguimiento de brotes',
    'app.subtitle': 'Panel con fuentes oficiales y actualizaciones estáticas diferidas.',
    'stats.totalConfirmed': 'Total confirmado',
    'stats.deaths': 'Muertes',
    'stats.countries': 'Países',
    'stats.lastUpdate': 'Última actualización',
    'stats.confirmedByCountry': 'Casos confirmados por país/región',
    'map.title': 'Mapa interactivo',
    'map.subtitle': 'Ubicaciones del brote por casos confirmados',
    'chart.title': 'Línea temporal de casos',
    'chart.subtitle': 'Total de casos confirmados en el tiempo',
    'chart.confirmed': 'Confirmados',
    'chart.deaths': 'Muertes',
    'sources.verified': 'Fuentes verificadas',
    'actions.refresh': 'Actualizar',
    'status.title': 'Estado de datos',
    'status.officialUpdate': 'Actualización oficial',
    'status.browserRefresh': 'Actualización del navegador',
    'status.mode': 'Modo',
    'status.staticJson': 'JSON estático',
    'ads.topBanner': 'Anuncio superior',
    'ads.sidebar': 'Anuncio lateral',
    'ads.chartSide': 'Anuncio del gráfico',
    'ads.mobile': 'Anuncio móvil',
    'loading.dashboard': 'Cargando panel de brotes',
    'error.title': 'No se pueden cargar los datos',
    'error.message': 'Los datos del panel no están disponibles actualmente.',
    'error.retry': 'Reintentar',
    'language.label': 'Idioma',
  },
};

export function getLocaleDirection(locale: AppLocale): 'ltr' | 'rtl' {
  return LOCALES.find((item) => item.code === locale)?.dir ?? 'ltr';
}

export function translate(locale: AppLocale, key: TranslationKey): string {
  return messages[locale]?.[key] ?? messages[DEFAULT_LOCALE][key] ?? key;
}