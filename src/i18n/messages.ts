export type AppLocale = 'en' | 'ar' | 'fr' | 'es';

export type TranslationKey =
  | 'app.title'
  | 'app.subtitle'
  | 'stats.totalConfirmed'
  | 'stats.totalIdentified'
  | 'stats.totalSuspected'
  | 'stats.totalProbable'
  | 'stats.totalPossible'
  | 'stats.totalUnderInvestigation'
  | 'stats.totalPending'
  | 'stats.totalUnconfirmed'
  | 'stats.totalRuledOut'
  | 'stats.totalNegative'
  | 'stats.totalHospitalized'
  | 'stats.deaths'
  | 'stats.recovered'
  | 'stats.countries'
  | 'stats.lastUpdate'
  | 'stats.confirmedByCountry'
  | 'stats.unconfirmedByCountry'
  | 'map.title'
  | 'map.subtitle'
  | 'chart.title'
  | 'chart.subtitle'
  | 'chart.confirmed'
  | 'chart.suspected'
  | 'chart.probable'
  | 'chart.possible'
  | 'chart.underInvestigation'
  | 'chart.pending'
  | 'chart.unconfirmed'
  | 'chart.totalIdentified'
  | 'chart.deaths'
  | 'sources.verified'
  | 'sources.officialEvents'
  | 'actions.refresh'
  | 'status.title'
  | 'status.officialUpdate'
  | 'status.browserRefresh'
  | 'status.mode'
  | 'status.staticJson'
  | 'status.primaryEvent'
  | 'status.riskLevel'
  | 'status.source'
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
    'app.subtitle': 'Official-source dashboard tracking confirmed and unconfirmed outbreak signals.',
    'stats.totalConfirmed': 'Confirmed',
    'stats.totalIdentified': 'Total Identified',
    'stats.totalSuspected': 'Suspected',
    'stats.totalProbable': 'Probable',
    'stats.totalPossible': 'Possible',
    'stats.totalUnderInvestigation': 'Under Investigation',
    'stats.totalPending': 'Pending',
    'stats.totalUnconfirmed': 'Unconfirmed',
    'stats.totalRuledOut': 'Ruled Out',
    'stats.totalNegative': 'Negative',
    'stats.totalHospitalized': 'Hospitalized',
    'stats.deaths': 'Deaths',
    'stats.recovered': 'Recovered',
    'stats.countries': 'Countries',
    'stats.lastUpdate': 'Last update',
    'stats.confirmedByCountry': 'Confirmed Cases by Country/Region',
    'stats.unconfirmedByCountry': 'Unconfirmed Cases by Country/Region',
    'map.title': 'Interactive Map',
    'map.subtitle': 'Outbreak locations by confirmed, suspected, and total identified cases',
    'chart.title': 'Case Timeline',
    'chart.subtitle': 'Confirmed, unconfirmed, deaths, and total identified cases over time',
    'chart.confirmed': 'Confirmed',
    'chart.suspected': 'Suspected',
    'chart.probable': 'Probable',
    'chart.possible': 'Possible',
    'chart.underInvestigation': 'Under investigation',
    'chart.pending': 'Pending',
    'chart.unconfirmed': 'Unconfirmed',
    'chart.totalIdentified': 'Total identified',
    'chart.deaths': 'Deaths',
    'sources.verified': 'Verified Sources',
    'sources.officialEvents': 'Official Events',
    'actions.refresh': 'Refresh',
    'status.title': 'Data Status',
    'status.officialUpdate': 'Official update',
    'status.browserRefresh': 'Browser refresh',
    'status.mode': 'Mode',
    'status.staticJson': 'Static JSON',
    'status.primaryEvent': 'Primary event',
    'status.riskLevel': 'Risk level',
    'status.source': 'Source',
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
    'app.subtitle': 'لوحة بيانات من مصادر رسمية لتتبع الحالات المؤكدة وغير المؤكدة وإشارات التفشي.',
    'stats.totalConfirmed': 'المؤكدة',
    'stats.totalIdentified': 'إجمالي الحالات المرصودة',
    'stats.totalSuspected': 'المشتبه بها',
    'stats.totalProbable': 'المحتملة',
    'stats.totalPossible': 'الممكنة',
    'stats.totalUnderInvestigation': 'قيد التحقيق',
    'stats.totalPending': 'بانتظار النتائج',
    'stats.totalUnconfirmed': 'غير المؤكدة',
    'stats.totalRuledOut': 'المستبعدة',
    'stats.totalNegative': 'السلبية',
    'stats.totalHospitalized': 'المنومة',
    'stats.deaths': 'الوفيات',
    'stats.recovered': 'المتعافون',
    'stats.countries': 'الدول',
    'stats.lastUpdate': 'آخر تحديث',
    'stats.confirmedByCountry': 'الحالات المؤكدة حسب الدولة/المنطقة',
    'stats.unconfirmedByCountry': 'الحالات غير المؤكدة حسب الدولة/المنطقة',
    'map.title': 'الخريطة التفاعلية',
    'map.subtitle': 'مواقع التفشي حسب الحالات المؤكدة والمشتبه بها وإجمالي الحالات المرصودة',
    'chart.title': 'الخط الزمني للحالات',
    'chart.subtitle': 'المؤكدة وغير المؤكدة والوفيات وإجمالي الحالات المرصودة عبر الوقت',
    'chart.confirmed': 'المؤكدة',
    'chart.suspected': 'المشتبه بها',
    'chart.probable': 'المحتملة',
    'chart.possible': 'الممكنة',
    'chart.underInvestigation': 'قيد التحقيق',
    'chart.pending': 'بانتظار النتائج',
    'chart.unconfirmed': 'غير المؤكدة',
    'chart.totalIdentified': 'إجمالي المرصودة',
    'chart.deaths': 'الوفيات',
    'sources.verified': 'مصادر موثوقة',
    'sources.officialEvents': 'الأحداث الرسمية',
    'actions.refresh': 'تحديث',
    'status.title': 'حالة البيانات',
    'status.officialUpdate': 'التحديث الرسمي',
    'status.browserRefresh': 'تحديث المتصفح',
    'status.mode': 'الوضع',
    'status.staticJson': 'JSON ثابت',
    'status.primaryEvent': 'الحدث الرئيسي',
    'status.riskLevel': 'مستوى الخطورة',
    'status.source': 'المصدر',
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
    'app.subtitle': 'Tableau basé sur des sources officielles suivant les cas confirmés et non confirmés.',
    'stats.totalConfirmed': 'Confirmés',
    'stats.totalIdentified': 'Total identifié',
    'stats.totalSuspected': 'Suspects',
    'stats.totalProbable': 'Probables',
    'stats.totalPossible': 'Possibles',
    'stats.totalUnderInvestigation': 'En investigation',
    'stats.totalPending': 'En attente',
    'stats.totalUnconfirmed': 'Non confirmés',
    'stats.totalRuledOut': 'Écartés',
    'stats.totalNegative': 'Négatifs',
    'stats.totalHospitalized': 'Hospitalisés',
    'stats.deaths': 'Décès',
    'stats.recovered': 'Rétablis',
    'stats.countries': 'Pays',
    'stats.lastUpdate': 'Dernière mise à jour',
    'stats.confirmedByCountry': 'Cas confirmés par pays/région',
    'stats.unconfirmedByCountry': 'Cas non confirmés par pays/région',
    'map.title': 'Carte interactive',
    'map.subtitle': 'Lieux de l’épidémie par cas confirmés, suspects et total identifié',
    'chart.title': 'Chronologie des cas',
    'chart.subtitle': 'Cas confirmés, non confirmés, décès et total identifié dans le temps',
    'chart.confirmed': 'Confirmés',
    'chart.suspected': 'Suspects',
    'chart.probable': 'Probables',
    'chart.possible': 'Possibles',
    'chart.underInvestigation': 'En investigation',
    'chart.pending': 'En attente',
    'chart.unconfirmed': 'Non confirmés',
    'chart.totalIdentified': 'Total identifié',
    'chart.deaths': 'Décès',
    'sources.verified': 'Sources vérifiées',
    'sources.officialEvents': 'Événements officiels',
    'actions.refresh': 'Actualiser',
    'status.title': 'État des données',
    'status.officialUpdate': 'Mise à jour officielle',
    'status.browserRefresh': 'Actualisation navigateur',
    'status.mode': 'Mode',
    'status.staticJson': 'JSON statique',
    'status.primaryEvent': 'Événement principal',
    'status.riskLevel': 'Niveau de risque',
    'status.source': 'Source',
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
    'app.subtitle': 'Panel con fuentes oficiales para casos confirmados y no confirmados.',
    'stats.totalConfirmed': 'Confirmados',
    'stats.totalIdentified': 'Total identificado',
    'stats.totalSuspected': 'Sospechosos',
    'stats.totalProbable': 'Probables',
    'stats.totalPossible': 'Posibles',
    'stats.totalUnderInvestigation': 'En investigación',
    'stats.totalPending': 'Pendientes',
    'stats.totalUnconfirmed': 'No confirmados',
    'stats.totalRuledOut': 'Descartados',
    'stats.totalNegative': 'Negativos',
    'stats.totalHospitalized': 'Hospitalizados',
    'stats.deaths': 'Muertes',
    'stats.recovered': 'Recuperados',
    'stats.countries': 'Países',
    'stats.lastUpdate': 'Última actualización',
    'stats.confirmedByCountry': 'Casos confirmados por país/región',
    'stats.unconfirmedByCountry': 'Casos no confirmados por país/región',
    'map.title': 'Mapa interactivo',
    'map.subtitle': 'Ubicaciones del brote por casos confirmados, sospechosos y total identificado',
    'chart.title': 'Línea temporal de casos',
    'chart.subtitle': 'Confirmados, no confirmados, muertes y total identificado en el tiempo',
    'chart.confirmed': 'Confirmados',
    'chart.suspected': 'Sospechosos',
    'chart.probable': 'Probables',
    'chart.possible': 'Posibles',
    'chart.underInvestigation': 'En investigación',
    'chart.pending': 'Pendientes',
    'chart.unconfirmed': 'No confirmados',
    'chart.totalIdentified': 'Total identificado',
    'chart.deaths': 'Muertes',
    'sources.verified': 'Fuentes verificadas',
    'sources.officialEvents': 'Eventos oficiales',
    'actions.refresh': 'Actualizar',
    'status.title': 'Estado de datos',
    'status.officialUpdate': 'Actualización oficial',
    'status.browserRefresh': 'Actualización del navegador',
    'status.mode': 'Modo',
    'status.staticJson': 'JSON estático',
    'status.primaryEvent': 'Evento principal',
    'status.riskLevel': 'Nivel de riesgo',
    'status.source': 'Fuente',
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