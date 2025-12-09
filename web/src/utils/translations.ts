const translations = {
  es: {
    // Main page
    title: 'GlossarIA — Glosario abierto de IA',
    description: 'Un glosario bilingüe y curado de conceptos de IA para equipos y empresas.',

    // Header/Layout
    brandSubtitle: 'Glosario abierto de IA para empresas',
    navGlossary: 'Glosario',
    navAbout: 'Acerca de',
    navContribute: 'Contribuir',
    footerLicense: 'Contenido bajo <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener" style="color:var(--accent);">CC BY 4.0</a>, código bajo <a href="https://opensource.org/licenses/MIT" target="_blank" rel="noopener" style="color:var(--accent);">MIT</a>.',

    // Search
    searchPlaceholder: 'Buscar un término…',
    searchButton: 'Buscar',
    levelAny: 'Cualquier nivel',
    levelBasic: 'Básico',
    levelIntermediate: 'Intermedio',
    levelAdvanced: 'Avanzado',

    // Terms
    noTermsFound: 'No se encontraron términos.',
    statusToReview: 'Por revisar',
    statusDeprecated: 'Obsoleto',

    // Theme
    themeLight: 'Modo claro',
    themeDark: 'Modo oscuro',
    themeToggle: 'Cambiar tema',

    // Term detail
    backToGlossary: 'Volver al glosario',
    fullDefinition: 'Definición completa',
    exampleInContext: 'Ejemplo en contexto empresarial',
  },
  en: {
    // Main page
    title: 'GlossarIA — Open AI glossary',
    description: 'A curated, bilingual glossary of AI concepts for teams and companies.',

    // Header/Layout
    brandSubtitle: 'Open AI glossary for companies',
    navGlossary: 'Glossary',
    navAbout: 'About',
    navContribute: 'Contribute',
    footerLicense: 'Content under <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener" style="color:var(--accent);">CC BY 4.0</a>, code under <a href="https://opensource.org/licenses/MIT" target="_blank" rel="noopener" style="color:var(--accent);">MIT</a>.',

    // Search
    searchPlaceholder: 'Search a term…',
    searchButton: 'Search',
    levelAny: 'Any level',
    levelBasic: 'Basic',
    levelIntermediate: 'Intermediate',
    levelAdvanced: 'Advanced',

    // Terms
    noTermsFound: 'No terms found.',
    statusToReview: 'To review',
    statusDeprecated: 'Deprecated',

    // Theme
    themeLight: 'Light mode',
    themeDark: 'Dark mode',
    themeToggle: 'Toggle theme',

    // Term detail
    backToGlossary: 'Back to glossary',
    fullDefinition: 'Full definition',
    exampleInContext: 'Example in a business context',
  }
} as const;

export function t(key: keyof typeof translations.es, lang: 'es' | 'en' = 'es'): string {
  return translations[lang][key] || translations.es[key];
}

export default translations;
