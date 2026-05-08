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
  | 'language.label'
  | 'trust.badge'
  | 'trust.title'
  | 'trust.description'
  | 'trust.sourcesTitle'
  | 'trust.sourcesDescription'
  | 'trust.disclaimerTitle'
  | 'trust.disclaimerDescription'
  | 'faq.title'
  | 'faq.subtitle'
  | 'faq.q1'
  | 'faq.a1'
  | 'faq.q2'
  | 'faq.a2'
  | 'faq.q3'
  | 'faq.a3'
  | 'faq.q4'
  | 'faq.a4';

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
    'app.subtitle':
      'Official-source dashboard tracking confirmed and unconfirmed outbreak signals.',
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
    'map.subtitle':
      'Outbreak locations by confirmed, suspected, and total identified cases',
    'chart.title': 'Case Timeline',
    'chart.subtitle':
      'Confirmed, unconfirmed, deaths, and total identified cases over time',
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

    'trust.badge': 'Verified public-health information',
    'trust.title': 'Built for clarity, not panic',
    'trust.description':
      'This dashboard summarizes outbreak signals from official and high-confidence public-health sources. It is designed to help users follow updates without exaggeration or medical claims.',
    'trust.sourcesTitle': 'Data sources',
    'trust.sourcesDescription':
      'Data is collected from public-health and humanitarian sources such as WHO, CDC, ECDC, Africa CDC, and ReliefWeb when available.',
    'trust.disclaimerTitle': 'Medical disclaimer',
    'trust.disclaimerDescription':
      'This website is for informational purposes only. It does not provide medical advice, diagnosis, or treatment. Always follow guidance from your local health authority or a qualified medical professional.',
    'faq.title': 'Frequently asked questions',
    'faq.subtitle': 'Simple answers based on official public-health guidance.',
    'faq.q1': 'What is hantavirus?',
    'faq.a1':
      'Hantaviruses are a family of viruses mainly spread by rodents. Some types can cause severe disease in humans.',
    'faq.q2': 'How does hantavirus spread?',
    'faq.a2':
      'Most hantavirus infections happen through contact with infected rodents or their urine, droppings, or saliva. The Andes virus is unusual because it can rarely spread between people in close contact.',
    'faq.q3': 'Is this website medical advice?',
    'faq.a3':
      'No. This dashboard only summarizes public information and should not replace professional medical advice.',
    'faq.q4': 'Why do numbers change?',
    'faq.a4':
      'Outbreak numbers can change when official sources confirm, reclassify, or rule out cases.',
  },

  ar: {
    'app.title': 'منصة تتبع التفشي المباشر',
    'app.subtitle':
      'لوحة بيانات من مصادر رسمية لتتبع الحالات المؤكدة وغير المؤكدة وإشارات التفشي.',
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
    'map.subtitle':
      'مواقع التفشي حسب الحالات المؤكدة والمشتبه بها وإجمالي الحالات المرصودة',
    'chart.title': 'الخط الزمني للحالات',
    'chart.subtitle':
      'المؤكدة وغير المؤكدة والوفيات وإجمالي الحالات المرصودة عبر الوقت',
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

    'trust.badge': 'معلومات صحية من مصادر موثوقة',
    'trust.title': 'مصمم للوضوح وليس للتهويل',
    'trust.description':
      'تعرض هذه اللوحة إشارات التفشي من مصادر صحية رسمية وموثوقة، بهدف مساعدة الزوار على متابعة التحديثات بدون مبالغة أو ادعاءات طبية.',
    'trust.sourcesTitle': 'مصادر البيانات',
    'trust.sourcesDescription':
      'يتم جمع البيانات من مصادر صحية وإنسانية عامة مثل منظمة الصحة العالمية، CDC، ECDC، Africa CDC، و ReliefWeb عند توفرها.',
    'trust.disclaimerTitle': 'إخلاء مسؤولية طبي',
    'trust.disclaimerDescription':
      'هذا الموقع لغرض المعلومات فقط، ولا يقدم نصيحة طبية أو تشخيصًا أو علاجًا. اتبع دائمًا إرشادات الجهات الصحية المحلية أو الطبيب المختص.',
    'faq.title': 'الأسئلة الشائعة',
    'faq.subtitle': 'إجابات مختصرة مبنية على إرشادات صحية رسمية.',
    'faq.q1': 'ما هو فيروس هانتا؟',
    'faq.a1':
      'فيروسات هانتا هي عائلة من الفيروسات تنتقل غالبًا عبر القوارض، وبعض أنواعها قد تسبب مرضًا شديدًا لدى الإنسان.',
    'faq.q2': 'كيف ينتقل فيروس هانتا؟',
    'faq.a2':
      'غالبًا تحدث العدوى عبر ملامسة القوارض المصابة أو بولها أو فضلاتها أو لعابها. ويُعد فيروس Andes استثناءً لأنه قد ينتقل نادرًا بين الأشخاص عند المخالطة القريبة.',
    'faq.q3': 'هل هذا الموقع يقدم نصيحة طبية؟',
    'faq.a3':
      'لا. هذه اللوحة تعرض معلومات عامة فقط ولا تغني عن استشارة الطبيب أو الجهات الصحية الرسمية.',
    'faq.q4': 'لماذا تتغير الأرقام؟',
    'faq.a4':
      'قد تتغير أرقام التفشي عندما تؤكد المصادر الرسمية الحالات أو تعيد تصنيفها أو تستبعدها.',
  },

  fr: {
    'app.title': 'Tableau de suivi des épidémies',
    'app.subtitle':
      'Tableau basé sur des sources officielles suivant les cas confirmés et non confirmés.',
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
    'map.subtitle':
      'Lieux de l’épidémie par cas confirmés, suspects et total identifié',
    'chart.title': 'Chronologie des cas',
    'chart.subtitle':
      'Cas confirmés, non confirmés, décès et total identifié dans le temps',
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

    'trust.badge': 'Information de santé publique vérifiée',
    'trust.title': 'Conçu pour informer, pas pour alarmer',
    'trust.description':
      'Ce tableau résume les signaux d’épidémie provenant de sources officielles et fiables de santé publique, sans exagération ni affirmation médicale.',
    'trust.sourcesTitle': 'Sources de données',
    'trust.sourcesDescription':
      'Les données proviennent de sources de santé publique et humanitaires telles que l’OMS, le CDC, l’ECDC, Africa CDC et ReliefWeb lorsque disponibles.',
    'trust.disclaimerTitle': 'Avertissement médical',
    'trust.disclaimerDescription':
      'Ce site est fourni à titre informatif uniquement. Il ne constitue pas un avis médical, un diagnostic ou un traitement. Suivez toujours les recommandations des autorités sanitaires locales ou d’un professionnel qualifié.',
    'faq.title': 'Questions fréquentes',
    'faq.subtitle':
      'Réponses simples basées sur des recommandations de santé publique.',
    'faq.q1': 'Qu’est-ce que le hantavirus ?',
    'faq.a1':
      'Les hantavirus sont une famille de virus principalement transmis par les rongeurs. Certains types peuvent provoquer une maladie grave chez l’humain.',
    'faq.q2': 'Comment le hantavirus se transmet-il ?',
    'faq.a2':
      'La plupart des infections surviennent après un contact avec des rongeurs infectés, leur urine, leurs excréments ou leur salive. Le virus Andes est particulier car il peut rarement se transmettre entre personnes en contact étroit.',
    'faq.q3': 'Ce site donne-t-il des conseils médicaux ?',
    'faq.a3':
      'Non. Ce tableau résume uniquement des informations publiques et ne remplace pas un avis médical professionnel.',
    'faq.q4': 'Pourquoi les chiffres changent-ils ?',
    'faq.a4':
      'Les chiffres peuvent changer lorsque les sources officielles confirment, reclassent ou écartent des cas.',
  },

  es: {
    'app.title': 'Panel de seguimiento de brotes',
    'app.subtitle':
      'Panel con fuentes oficiales para casos confirmados y no confirmados.',
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
    'map.subtitle':
      'Ubicaciones del brote por casos confirmados, sospechosos y total identificado',
    'chart.title': 'Línea temporal de casos',
    'chart.subtitle':
      'Confirmados, no confirmados, muertes y total identificado en el tiempo',
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

    'trust.badge': 'Información verificada de salud pública',
    'trust.title': 'Diseñado para informar, no para alarmar',
    'trust.description':
      'Este panel resume señales de brotes desde fuentes oficiales y confiables de salud pública, sin exageración ni afirmaciones médicas.',
    'trust.sourcesTitle': 'Fuentes de datos',
    'trust.sourcesDescription':
      'Los datos se recopilan de fuentes de salud pública y humanitarias como OMS, CDC, ECDC, Africa CDC y ReliefWeb cuando están disponibles.',
    'trust.disclaimerTitle': 'Aviso médico',
    'trust.disclaimerDescription':
      'Este sitio es solo informativo. No ofrece consejo médico, diagnóstico ni tratamiento. Siga siempre las indicaciones de su autoridad sanitaria local o de un profesional médico cualificado.',
    'faq.title': 'Preguntas frecuentes',
    'faq.subtitle':
      'Respuestas simples basadas en orientación oficial de salud pública.',
    'faq.q1': '¿Qué es el hantavirus?',
    'faq.a1':
      'Los hantavirus son una familia de virus transmitidos principalmente por roedores. Algunos tipos pueden causar enfermedad grave en humanos.',
    'faq.q2': '¿Cómo se transmite el hantavirus?',
    'faq.a2':
      'La mayoría de infecciones ocurren por contacto con roedores infectados o con su orina, excrementos o saliva. El virus Andes es particular porque raramente puede transmitirse entre personas en contacto cercano.',
    'faq.q3': '¿Este sitio ofrece consejo médico?',
    'faq.a3':
      'No. Este panel solo resume información pública y no reemplaza el consejo médico profesional.',
    'faq.q4': '¿Por qué cambian los números?',
    'faq.a4':
      'Los números pueden cambiar cuando las fuentes oficiales confirman, reclasifican o descartan casos.',
  },
};

export function getLocaleDirection(locale: AppLocale): 'ltr' | 'rtl' {
  return LOCALES.find((item) => item.code === locale)?.dir ?? 'ltr';
}

export function translate(locale: AppLocale, key: TranslationKey): string {
  return messages[locale]?.[key] ?? messages[DEFAULT_LOCALE][key] ?? key;
}