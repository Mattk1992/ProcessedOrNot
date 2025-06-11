export type Language = 'en' | 'es' | 'fr' | 'de' | 'zh' | 'ja' | 'nl';

export const languages: Record<Language, { name: string; flag: string }> = {
  en: { name: 'English', flag: '🇺🇸' },
  es: { name: 'Español', flag: '🇪🇸' },
  fr: { name: 'Français', flag: '🇫🇷' },
  de: { name: 'Deutsch', flag: '🇩🇪' },
  zh: { name: '中文', flag: '🇨🇳' },
  ja: { name: '日本語', flag: '🇯🇵' },
  nl: { name: 'Nederlands', flag: '🇳🇱' },
};

export const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.products': 'Products',
    
    // Home page
    'home.title': 'ProcessedOrNot Scanner',
    'home.subtitle': 'For fast, simple, and advanced product analysis and processing detection',
    'home.scan.button': 'Start Scanning',
    'home.manual.placeholder': 'Enter barcode manually',
    'home.manual.submit': 'Look Up Product',
    
    // Scanner
    'scanner.title': 'Barcode Scanner',
    'scanner.instructions': 'Point your camera at a barcode',
    'scanner.loading': 'Scanning...',
    'scanner.error': 'Camera access denied or not available',
    'scanner.stop': 'Stop Scanner',
    
    // Product Results
    'product.loading': 'Looking up product...',
    'product.notFound': 'Product not found',
    'product.error': 'Error loading product',
    'product.analysis': 'Processing Analysis',
    'product.score': 'Processing Score',
    'product.explanation': 'Explanation',
    'product.categories.title': 'Ingredient Categories',
    'product.categories.ultraProcessed': 'Ultra-processed',
    'product.categories.processed': 'Processed',
    'product.categories.minimal': 'Minimally processed',
    'product.ingredients': 'Ingredients',
    'product.brand': 'Brand',
    'product.source': 'Data source',
    
    // Manual Product Form
    'form.title': 'Add Product Information',
    'form.subtitle': 'No product found for this barcode. Please add the information manually.',
    'form.name.label': 'Product Name',
    'form.name.placeholder': 'Enter product name',
    'form.brand.label': 'Brand',
    'form.brand.placeholder': 'Enter brand name',
    'form.ingredients.label': 'Ingredients',
    'form.ingredients.placeholder': 'Enter ingredients list',
    'form.submit': 'Save Product',
    'form.cancel': 'Cancel',
    'form.saving': 'Saving...',
    'form.success': 'Product saved successfully!',
    'form.error': 'Error saving product',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.retry': 'Try Again',
    'common.back': 'Back',
    'common.close': 'Close',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    
    // Language
    'language.select': 'Select Language',
    'language.current': 'Current language',
    
    // Header and Branding
    'brand.title': 'ProcessedOrNot Scanner',
    'brand.subtitle': 'For fast, simple, and advanced product analysis and processing detection',
    
    // Hero Section
    'hero.title.part1': 'Discover How Processed',
    'hero.title.part2': 'Your Food Really Is',
    'hero.description': 'Scan any barcode to get instant AI analysis of processing levels, ingredients, and nutritional insights',
    'hero.databases': 'Powered by 14 Global Databases',
    
    // Scanner Section
    'scanner.header.title': 'Find Your Product',
    'scanner.header.description': 'Scan barcode, enter numbers, or type product name',
    'scanner.camera.start': 'Start Camera Scanner',
    'scanner.camera.stop': 'Stop Camera',
    'scanner.camera.switch': 'Switch Camera',
    'scanner.camera.error': 'Camera Error',
    'scanner.camera.permission': 'Camera permission required to scan barcodes',
    'scanner.input.placeholder': 'Enter barcode or product name',
    'scanner.input.button': 'Analyze Product',
    'scanner.input.analyzing': 'Analyzing Product...',
    'scanner.samples.title': 'Try Sample Searches',
    'scanner.samples.description': 'Test barcode scanning or text-based product search',
    'scanner.samples.click': 'Click to scan',
    'scanner.samples.barcode': 'Barcode scan',
    'scanner.samples.text': 'Text search',
    
    // Nutrition Spotlight
    'nutrition.title': 'Nutrition Spotlight',
    'nutrition.subtitle': 'Key nutritional insights',
    'nutrition.dailyValue': 'Daily Value',
    'nutrition.basedOn': 'Based on a 2000 calorie diet',
    'nutrition.energy': 'Energy',
    'nutrition.fat': 'Fat',
    'nutrition.saturatedFat': 'Saturated Fat',
    'nutrition.sugars': 'Sugars',
    'nutrition.protein': 'Protein',
    'nutrition.salt': 'Salt',
    'nutrition.fiber': 'Fiber',
    'nutrition.carbohydrates': 'Carbohydrates',
    'nutrition.category.low': 'Low',
    'nutrition.category.medium': 'Medium',
    'nutrition.category.high': 'High',
    'nutrition.description.energy': 'Energy content per 100g',
    'nutrition.description.fat': 'Total fat content',
    'nutrition.description.saturatedFat': 'Saturated fat content',
    'nutrition.description.sugars': 'Sugar content',
    'nutrition.description.protein': 'Protein content',
    'nutrition.description.salt': 'Salt content',
    
    // Fun Facts
    'funfacts.title': 'Fun Facts',
    'funfacts.subtitle': 'Interesting insights about this product',
    'funfacts.category.nutrition': 'nutrition',
    'funfacts.category.history': 'history',
    'funfacts.category.processing': 'processing',
    'funfacts.category.environment': 'environment',
    
    // NutriBot Chat
    'nutribot.title': 'Ask NutriBot',
    'nutribot.subtitle': 'Your AI nutrition assistant',
    'nutribot.placeholder': 'Ask about nutrition, ingredients, or health...',
    'nutribot.send': 'Send',
    'nutribot.thinking': 'NutriBot is thinking...',
    'nutribot.welcome': 'Hi! I\'m NutriBot, your nutrition assistant. Ask me anything about food, ingredients, or healthy eating!',
    'nutribot.error': 'Sorry, I encountered an error. Please try again.',
    
    // Processing Analysis
    'processing.title': 'Processing Analysis',
    'processing.score': 'Processing Score',
    'processing.outof': 'out of 10',
    'processing.level.minimal': 'Minimally Processed',
    'processing.level.processed': 'Processed',
    'processing.level.ultra': 'Ultra-Processed',
    'processing.categories.title': 'Ingredient Categories',
    'processing.categories.ultra': 'Ultra-processed ingredients',
    'processing.categories.processed': 'Processed ingredients',
    'processing.categories.minimal': 'Minimally processed ingredients',
    'processing.insight.title': 'NutriBot Insight',
    'processing.insight.loading': 'Getting nutrition insights...',
    
    // Product Information
    'product.image.alt': 'Product image',
    'product.barcode': 'Barcode',
    'product.notfound.title': 'Product Not Found',
    'product.notfound.description': 'We couldn\'t find this product in our databases.',
    'product.notfound.add': 'Add Product Information',
    'product.addmanual.title': 'Add Product Manually',
    'product.addmanual.description': 'Help improve our database by adding this product',
    
    // Theme Toggle
    'theme.light': 'Light mode',
    'theme.dark': 'Dark mode',
    'theme.toggle': 'Toggle theme',
    
    // Footer
    'footer.createdBy': 'Created by',
    'footer.linkedin': 'LinkedIn Profile',
    
    // Status Messages
    'status.scanning': 'Scanning Barcode',
    'status.scanning.description': 'Searching product databases...',
    'status.searching': 'Searching Product',
    'status.searching.description': 'Finding product information and analyzing ingredients...',
    'status.loading': 'Loading',
    
    // Dietary Filters
    'dietary.filter_title': 'Dietary Filters',
    'dietary.clear_all': 'Clear',
    'dietary.show_more': 'Show More',
    'dietary.show_less': 'Show Less',
    'dietary.active_filters': 'Active filters',
    'dietary.vegetarian': 'Vegetarian',
    'dietary.vegetarian_desc': 'No meat or fish',
    'dietary.vegan': 'Vegan',
    'dietary.vegan_desc': 'No animal products',
    'dietary.gluten_free': 'Gluten-Free',
    'dietary.gluten_free_desc': 'No wheat or gluten',
    'dietary.dairy_free': 'Dairy-Free',
    'dietary.dairy_free_desc': 'No milk products',
    'dietary.egg_free': 'Egg-Free',
    'dietary.egg_free_desc': 'No eggs',
    'dietary.fish_free': 'Fish-Free',
    'dietary.fish_free_desc': 'No fish or seafood',
    'dietary.nut_free': 'Nut-Free',
    'dietary.nut_free_desc': 'No nuts or tree nuts',
    'dietary.halal': 'Halal',
    'dietary.halal_desc': 'Islamic dietary laws',
    'dietary.kosher': 'Kosher',
    'dietary.kosher_desc': 'Jewish dietary laws',
    'status.success': 'Success',
    'status.error': 'Error',
    
    // Nutrition Spotlight
    'nutrition.spotlight.title': 'Nutrition Spotlight',
    'nutrition.spotlight.subtitle': 'AI-Powered Nutritional Analysis',
    'nutrition.spotlight.loading': 'Analyzing nutrition data...',
    'nutrition.spotlight.level': 'Level',
    'nutrition.spotlight.description': 'Description',
    'nutrition.spotlight.health_impact': 'Health Impact',
    'nutrition.spotlight.recommendation': 'Recommendation',
    'nutrition.spotlight.overall_assessment': 'Overall Assessment',
    'nutrition.category.good': 'Good',
    'nutrition.category.moderate': 'Moderate',
    'nutrition.category.high': 'High',
  },
  
  es: {
    // Navigation
    'nav.home': 'Inicio',
    'nav.products': 'Productos',
    
    // Home page
    'home.title': 'Escáner de Códigos de Barras',
    'home.subtitle': 'Escanea o ingresa un código de barras para obtener información detallada del producto y análisis de procesamiento con IA',
    'home.scan.button': 'Comenzar Escaneo',
    'home.manual.placeholder': 'Ingresar código manualmente',
    'home.manual.submit': 'Buscar Producto',
    
    // Scanner
    'scanner.title': 'Escáner de Códigos',
    'scanner.instructions': 'Apunta tu cámara hacia un código de barras',
    'scanner.loading': 'Escaneando...',
    'scanner.error': 'Acceso a cámara denegado o no disponible',
    'scanner.stop': 'Detener Escáner',
    
    // Product Results
    'product.loading': 'Buscando producto...',
    'product.notFound': 'Producto no encontrado',
    'product.error': 'Error al cargar producto',
    'product.analysis': 'Análisis de Procesamiento',
    'product.score': 'Puntuación de Procesamiento',
    'product.explanation': 'Explicación',
    'product.categories.title': 'Categorías de Ingredientes',
    'product.categories.ultraProcessed': 'Ultra-procesados',
    'product.categories.processed': 'Procesados',
    'product.categories.minimal': 'Mínimamente procesados',
    'product.ingredients': 'Ingredientes',
    'product.brand': 'Marca',
    'product.source': 'Fuente de datos',
    
    // Manual Product Form
    'form.title': 'Agregar Información del Producto',
    'form.subtitle': 'No se encontró producto para este código. Por favor agrega la información manualmente.',
    'form.name.label': 'Nombre del Producto',
    'form.name.placeholder': 'Ingresa el nombre del producto',
    'form.brand.label': 'Marca',
    'form.brand.placeholder': 'Ingresa el nombre de la marca',
    'form.ingredients.label': 'Ingredientes',
    'form.ingredients.placeholder': 'Ingresa la lista de ingredientes',
    'form.submit': 'Guardar Producto',
    'form.cancel': 'Cancelar',
    'form.saving': 'Guardando...',
    'form.success': '¡Producto guardado exitosamente!',
    'form.error': 'Error al guardar producto',
    
    // Common
    'common.loading': 'Cargando...',
    'common.error': 'Ocurrió un error',
    'common.retry': 'Intentar de Nuevo',
    'common.back': 'Atrás',
    'common.close': 'Cerrar',
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    
    // Language
    'language.select': 'Seleccionar Idioma',
    'language.current': 'Idioma actual',
    
    // Header and Branding
    'brand.title': 'Escáner ProcessedOrNot',
    'brand.subtitle': 'Para análisis rápido, simple y avanzado de productos y detección de procesamiento',
    
    // Hero Section
    'hero.title.part1': 'Descubre Qué Tan Procesada',
    'hero.title.part2': 'Está Realmente Tu Comida',
    'hero.description': 'Escanea cualquier código de barras para obtener análisis instantáneo de IA sobre niveles de procesamiento, ingredientes e información nutricional',
    'hero.databases': 'Impulsado por 14 Bases de Datos Globales',
    
    // Scanner Section
    'scanner.header.title': 'Encuentra Tu Producto',
    'scanner.header.description': 'Escanea código de barras, ingresa números o escribe el nombre del producto',
    'scanner.camera.start': 'Iniciar Escáner de Cámara',
    'scanner.camera.stop': 'Detener Cámara',
    'scanner.camera.switch': 'Cambiar Cámara',
    'scanner.camera.error': 'Error de Cámara',
    'scanner.camera.permission': 'Se requiere permiso de cámara para escanear códigos de barras',
    'scanner.input.placeholder': 'Ingresa código de barras o nombre del producto',
    'scanner.input.button': 'Analizar Producto',
    'scanner.input.analyzing': 'Analizando Producto...',
    'scanner.samples.title': 'Prueba Búsquedas de Muestra',
    'scanner.samples.description': 'Prueba escaneo de códigos de barras o búsqueda de productos basada en texto',
    'scanner.samples.click': 'Haz clic para escanear',
    'scanner.samples.barcode': 'Escaneo de código de barras',
    'scanner.samples.text': 'Búsqueda de texto',
    
    // Nutrition Spotlight
    'nutrition.title': 'Enfoque Nutricional',
    'nutrition.subtitle': 'Información nutricional clave',
    'nutrition.dailyValue': 'Valor Diario',
    'nutrition.basedOn': 'Basado en una dieta de 2000 calorías',
    'nutrition.energy': 'Energía',
    'nutrition.fat': 'Grasa',
    'nutrition.saturatedFat': 'Grasa Saturada',
    'nutrition.sugars': 'Azúcares',
    'nutrition.protein': 'Proteína',
    'nutrition.salt': 'Sal',
    'nutrition.fiber': 'Fibra',
    'nutrition.carbohydrates': 'Carbohidratos',
    'nutrition.category.low': 'Bajo',
    'nutrition.category.medium': 'Medio',
    'nutrition.category.high': 'Alto',
    'nutrition.description.energy': 'Contenido energético por 100g',
    'nutrition.description.fat': 'Contenido total de grasa',
    'nutrition.description.saturatedFat': 'Contenido de grasa saturada',
    'nutrition.description.sugars': 'Contenido de azúcar',
    'nutrition.description.protein': 'Contenido de proteína',
    'nutrition.description.salt': 'Contenido de sal',
    
    // Fun Facts
    'funfacts.title': 'Datos Curiosos',
    'funfacts.subtitle': 'Información interesante sobre este producto',
    'funfacts.category.nutrition': 'nutrición',
    'funfacts.category.history': 'historia',
    'funfacts.category.processing': 'procesamiento',
    'funfacts.category.environment': 'medio ambiente',
    
    // NutriBot Chat
    'nutribot.title': 'Pregunta a NutriBot',
    'nutribot.subtitle': 'Tu asistente de nutrición con IA',
    'nutribot.placeholder': 'Pregunta sobre nutrición, ingredientes o salud...',
    'nutribot.send': 'Enviar',
    'nutribot.thinking': 'NutriBot está pensando...',
    'nutribot.welcome': '¡Hola! Soy NutriBot, tu asistente de nutrición. ¡Pregúntame cualquier cosa sobre comida, ingredientes o alimentación saludable!',
    'nutribot.error': 'Lo siento, encontré un error. Por favor inténtalo de nuevo.',
    
    // Processing Analysis
    'processing.title': 'Análisis de Procesamiento',
    'processing.score': 'Puntuación de Procesamiento',
    'processing.outof': 'de 10',
    'processing.level.minimal': 'Mínimamente Procesado',
    'processing.level.processed': 'Procesado',
    'processing.level.ultra': 'Ultra-Procesado',
    'processing.categories.title': 'Categorías de Ingredientes',
    'processing.categories.ultra': 'Ingredientes ultra-procesados',
    'processing.categories.processed': 'Ingredientes procesados',
    'processing.categories.minimal': 'Ingredientes mínimamente procesados',
    'processing.insight.title': 'Análisis de NutriBot',
    'processing.insight.loading': 'Obteniendo información nutricional...',
    
    // Product Information
    'product.image.alt': 'Imagen del producto',
    'product.barcode': 'Código de barras',
    'product.notfound.title': 'Producto No Encontrado',
    'product.notfound.description': 'No pudimos encontrar este producto en nuestras bases de datos.',
    'product.notfound.add': 'Agregar Información del Producto',
    'product.addmanual.title': 'Agregar Producto Manualmente',
    'product.addmanual.description': 'Ayuda a mejorar nuestra base de datos agregando este producto',
    
    // Theme Toggle
    'theme.light': 'Modo claro',
    'theme.dark': 'Modo oscuro',
    'theme.toggle': 'Cambiar tema',
    
    // Footer
    'footer.createdBy': 'Creado por',
    'footer.linkedin': 'Perfil de LinkedIn',
    
    // Status Messages
    'status.scanning': 'Escaneando Código de Barras',
    'status.scanning.description': 'Buscando en bases de datos de productos...',
    'status.searching': 'Buscando Producto',
    'status.searching.description': 'Encontrando información del producto y analizando ingredientes...',
    'status.loading': 'Cargando',
    
    // Dietary Filters
    'dietary.filter_title': 'Filtros Dietarios',
    'dietary.clear_all': 'Limpiar',
    'dietary.show_more': 'Ver Más',
    'dietary.show_less': 'Ver Menos',
    'dietary.active_filters': 'Filtros activos',
    'dietary.vegetarian': 'Vegetariano',
    'dietary.vegetarian_desc': 'Sin carne ni pescado',
    'dietary.vegan': 'Vegano',
    'dietary.vegan_desc': 'Sin productos animales',
    'dietary.gluten_free': 'Sin Gluten',
    'dietary.gluten_free_desc': 'Sin trigo ni gluten',
    'dietary.dairy_free': 'Sin Lácteos',
    'dietary.dairy_free_desc': 'Sin productos lácteos',
    'dietary.egg_free': 'Sin Huevos',
    'dietary.egg_free_desc': 'Sin huevos',
    'dietary.fish_free': 'Sin Pescado',
    'dietary.fish_free_desc': 'Sin pescado ni mariscos',
    'dietary.nut_free': 'Sin Nueces',
    'dietary.nut_free_desc': 'Sin nueces ni frutos secos',
    'dietary.halal': 'Halal',
    'dietary.halal_desc': 'Leyes dietarias islámicas',
    'dietary.kosher': 'Kosher',
    'dietary.kosher_desc': 'Leyes dietarias judías',
    'status.success': 'Éxito',
    'status.error': 'Error',
  },
  
  fr: {
    // Navigation
    'nav.home': 'Accueil',
    'nav.products': 'Produits',
    
    // Home page
    'home.title': 'Scanner de Codes-Barres',
    'home.subtitle': 'Scannez ou saisissez un code-barres pour obtenir des informations détaillées sur le produit et une analyse de traitement par IA',
    'home.scan.button': 'Commencer le Scan',
    'home.manual.placeholder': 'Saisir le code manuellement',
    'home.manual.submit': 'Rechercher le Produit',
    
    // Scanner
    'scanner.title': 'Scanner de Codes',
    'scanner.instructions': 'Pointez votre caméra vers un code-barres',
    'scanner.loading': 'Scan en cours...',
    'scanner.error': 'Accès à la caméra refusé ou non disponible',
    'scanner.stop': 'Arrêter le Scanner',
    
    // Product Results
    'product.loading': 'Recherche du produit...',
    'product.notFound': 'Produit non trouvé',
    'product.error': 'Erreur lors du chargement du produit',
    'product.analysis': 'Analyse de Traitement',
    'product.score': 'Score de Traitement',
    'product.explanation': 'Explication',
    'product.categories.title': 'Catégories d\'Ingrédients',
    'product.categories.ultraProcessed': 'Ultra-transformés',
    'product.categories.processed': 'Transformés',
    'product.categories.minimal': 'Minimalement transformés',
    'product.ingredients': 'Ingrédients',
    'product.brand': 'Marque',
    'product.source': 'Source des données',
    
    // Manual Product Form
    'form.title': 'Ajouter les Informations du Produit',
    'form.subtitle': 'Aucun produit trouvé pour ce code. Veuillez ajouter les informations manuellement.',
    'form.name.label': 'Nom du Produit',
    'form.name.placeholder': 'Saisir le nom du produit',
    'form.brand.label': 'Marque',
    'form.brand.placeholder': 'Saisir le nom de la marque',
    'form.ingredients.label': 'Ingrédients',
    'form.ingredients.placeholder': 'Saisir la liste des ingrédients',
    'form.submit': 'Sauvegarder le Produit',
    'form.cancel': 'Annuler',
    'form.saving': 'Sauvegarde...',
    'form.success': 'Produit sauvegardé avec succès !',
    'form.error': 'Erreur lors de la sauvegarde du produit',
    
    // Common
    'common.loading': 'Chargement...',
    'common.error': 'Une erreur s\'est produite',
    'common.retry': 'Réessayer',
    'common.back': 'Retour',
    'common.close': 'Fermer',
    'common.save': 'Sauvegarder',
    'common.cancel': 'Annuler',
    
    // Language
    'language.select': 'Sélectionner la Langue',
    'language.current': 'Langue actuelle',
    
    // Header and Branding
    'brand.title': 'Scanner ProcessedOrNot',
    'brand.subtitle': 'Pour une analyse de produits rapide, simple et avancée et la détection de traitement',
    
    // Hero Section
    'hero.title.part1': 'Découvrez À Quel Point',
    'hero.title.part2': 'Votre Nourriture Est Vraiment Transformée',
    'hero.description': 'Scannez n\'importe quel code-barres pour obtenir une analyse IA instantanée des niveaux de transformation, des ingrédients et des informations nutritionnelles',
    'hero.databases': 'Alimenté par 14 Bases de Données Mondiales',
    
    // Scanner Section
    'scanner.header.title': 'Trouvez Votre Produit',
    'scanner.header.description': 'Scannez le code-barres, saisissez des numéros ou tapez le nom du produit',
    'scanner.camera.start': 'Démarrer le Scanner Caméra',
    'scanner.camera.stop': 'Arrêter la Caméra',
    'scanner.camera.switch': 'Changer de Caméra',
    'scanner.camera.error': 'Erreur de Caméra',
    'scanner.camera.permission': 'Autorisation de caméra requise pour scanner les codes-barres',
    'scanner.input.placeholder': 'Saisissez le code-barres ou le nom du produit',
    'scanner.input.button': 'Analyser le Produit',
    'scanner.input.analyzing': 'Analyse du Produit...',
    'scanner.samples.title': 'Essayez des Recherches d\'Échantillon',
    'scanner.samples.description': 'Testez le scan de codes-barres ou la recherche de produits basée sur le texte',
    'scanner.samples.click': 'Cliquez pour scanner',
    'scanner.samples.barcode': 'Scan de code-barres',
    'scanner.samples.text': 'Recherche de texte',
    
    // Nutrition Spotlight
    'nutrition.title': 'Focus Nutrition',
    'nutrition.subtitle': 'Informations nutritionnelles clés',
    'nutrition.dailyValue': 'Valeur Quotidienne',
    'nutrition.basedOn': 'Basé sur un régime de 2000 calories',
    'nutrition.energy': 'Énergie',
    'nutrition.fat': 'Graisse',
    'nutrition.saturatedFat': 'Graisse Saturée',
    'nutrition.sugars': 'Sucres',
    'nutrition.protein': 'Protéine',
    'nutrition.salt': 'Sel',
    'nutrition.fiber': 'Fibre',
    'nutrition.carbohydrates': 'Glucides',
    'nutrition.category.low': 'Faible',
    'nutrition.category.medium': 'Moyen',
    'nutrition.category.high': 'Élevé',
    'nutrition.description.energy': 'Contenu énergétique pour 100g',
    'nutrition.description.fat': 'Contenu total en graisse',
    'nutrition.description.saturatedFat': 'Contenu en graisse saturée',
    'nutrition.description.sugars': 'Contenu en sucre',
    'nutrition.description.protein': 'Contenu en protéine',
    'nutrition.description.salt': 'Contenu en sel',
    
    // Fun Facts
    'funfacts.title': 'Faits Amusants',
    'funfacts.subtitle': 'Informations intéressantes sur ce produit',
    'funfacts.category.nutrition': 'nutrition',
    'funfacts.category.history': 'histoire',
    'funfacts.category.processing': 'transformation',
    'funfacts.category.environment': 'environnement',
    
    // NutriBot Chat
    'nutribot.title': 'Demandez à NutriBot',
    'nutribot.subtitle': 'Votre assistant nutrition IA',
    'nutribot.placeholder': 'Posez des questions sur la nutrition, les ingrédients ou la santé...',
    'nutribot.send': 'Envoyer',
    'nutribot.thinking': 'NutriBot réfléchit...',
    'nutribot.welcome': 'Salut ! Je suis NutriBot, votre assistant nutrition. Demandez-moi tout sur l\'alimentation, les ingrédients ou l\'alimentation saine !',
    'nutribot.error': 'Désolé, j\'ai rencontré une erreur. Veuillez réessayer.',
    
    // Processing Analysis
    'processing.title': 'Analyse de Transformation',
    'processing.score': 'Score de Transformation',
    'processing.outof': 'sur 10',
    'processing.level.minimal': 'Minimalement Transformé',
    'processing.level.processed': 'Transformé',
    'processing.level.ultra': 'Ultra-Transformé',
    'processing.categories.title': 'Catégories d\'Ingrédients',
    'processing.categories.ultra': 'Ingrédients ultra-transformés',
    'processing.categories.processed': 'Ingrédients transformés',
    'processing.categories.minimal': 'Ingrédients minimalement transformés',
    'processing.insight.title': 'Analyse NutriBot',
    'processing.insight.loading': 'Obtention d\'informations nutritionnelles...',
    
    // Product Information
    'product.image.alt': 'Image du produit',
    'product.barcode': 'Code-barres',
    'product.notfound.title': 'Produit Non Trouvé',
    'product.notfound.description': 'Nous n\'avons pas pu trouver ce produit dans nos bases de données.',
    'product.notfound.add': 'Ajouter les Informations du Produit',
    'product.addmanual.title': 'Ajouter le Produit Manuellement',
    'product.addmanual.description': 'Aidez à améliorer notre base de données en ajoutant ce produit',
    
    // Theme Toggle
    'theme.light': 'Mode clair',
    'theme.dark': 'Mode sombre',
    'theme.toggle': 'Basculer le thème',
    
    // Footer
    'footer.createdBy': 'Créé par',
    'footer.linkedin': 'Profil LinkedIn',
    
    // Status Messages
    'status.scanning': 'Scan du Code-Barres',
    'status.scanning.description': 'Recherche dans les bases de données de produits...',
    'status.searching': 'Recherche de Produit',
    'status.searching.description': 'Recherche d\'informations sur le produit et analyse des ingrédients...',
    'status.loading': 'Chargement',
    
    // Dietary Filters
    'dietary.filter_title': 'Filtres Alimentaires',
    'dietary.clear_all': 'Effacer',
    'dietary.show_more': 'Voir Plus',
    'dietary.show_less': 'Voir Moins',
    'dietary.active_filters': 'Filtres actifs',
    'dietary.vegetarian': 'Végétarien',
    'dietary.vegetarian_desc': 'Sans viande ni poisson',
    'dietary.vegan': 'Végétalien',
    'dietary.vegan_desc': 'Sans produits animaux',
    'dietary.gluten_free': 'Sans Gluten',
    'dietary.gluten_free_desc': 'Sans blé ni gluten',
    'dietary.dairy_free': 'Sans Lactose',
    'dietary.dairy_free_desc': 'Sans produits laitiers',
    'dietary.egg_free': 'Sans Œufs',
    'dietary.egg_free_desc': 'Sans œufs',
    'dietary.fish_free': 'Sans Poisson',
    'dietary.fish_free_desc': 'Sans poisson ni fruits de mer',
    'dietary.nut_free': 'Sans Noix',
    'dietary.nut_free_desc': 'Sans noix ni fruits à coque',
    'dietary.halal': 'Halal',
    'dietary.halal_desc': 'Lois alimentaires islamiques',
    'dietary.kosher': 'Kasher',
    'dietary.kosher_desc': 'Lois alimentaires juives',
    'status.success': 'Succès',
    'status.error': 'Erreur',
  },
  
  de: {
    // Navigation
    'nav.home': 'Startseite',
    'nav.products': 'Produkte',
    
    // Home page
    'home.title': 'Barcode-Scanner',
    'home.subtitle': 'Scannen oder geben Sie einen Barcode ein, um detaillierte Produktinformationen und KI-gestützte Verarbeitungsanalyse zu erhalten',
    'home.scan.button': 'Scannen Starten',
    'home.manual.placeholder': 'Barcode manuell eingeben',
    'home.manual.submit': 'Produkt Suchen',
    
    // Scanner
    'scanner.title': 'Barcode-Scanner',
    'scanner.instructions': 'Richten Sie Ihre Kamera auf einen Barcode',
    'scanner.loading': 'Scanne...',
    'scanner.error': 'Kamerazugriff verweigert oder nicht verfügbar',
    'scanner.stop': 'Scanner Stoppen',
    
    // Product Results
    'product.loading': 'Produkt wird gesucht...',
    'product.notFound': 'Produkt nicht gefunden',
    'product.error': 'Fehler beim Laden des Produkts',
    'product.analysis': 'Verarbeitungsanalyse',
    'product.score': 'Verarbeitungswertung',
    'product.explanation': 'Erklärung',
    'product.categories.title': 'Zutatenkategorien',
    'product.categories.ultraProcessed': 'Hochverarbeitet',
    'product.categories.processed': 'Verarbeitet',
    'product.categories.minimal': 'Minimal verarbeitet',
    'product.ingredients': 'Zutaten',
    'product.brand': 'Marke',
    'product.source': 'Datenquelle',
    
    // Manual Product Form
    'form.title': 'Produktinformationen Hinzufügen',
    'form.subtitle': 'Kein Produkt für diesen Barcode gefunden. Bitte fügen Sie die Informationen manuell hinzu.',
    'form.name.label': 'Produktname',
    'form.name.placeholder': 'Produktname eingeben',
    'form.brand.label': 'Marke',
    'form.brand.placeholder': 'Markenname eingeben',
    'form.ingredients.label': 'Zutaten',
    'form.ingredients.placeholder': 'Zutatenliste eingeben',
    'form.submit': 'Produkt Speichern',
    'form.cancel': 'Abbrechen',
    'form.saving': 'Speichere...',
    'form.success': 'Produkt erfolgreich gespeichert!',
    'form.error': 'Fehler beim Speichern des Produkts',
    
    // Common
    'common.loading': 'Lädt...',
    'common.error': 'Ein Fehler ist aufgetreten',
    'common.retry': 'Erneut Versuchen',
    'common.back': 'Zurück',
    'common.close': 'Schließen',
    'common.save': 'Speichern',
    'common.cancel': 'Abbrechen',
    
    // Language
    'language.select': 'Sprache Auswählen',
    'language.current': 'Aktuelle Sprache',
    
    // Header and Branding
    'brand.title': 'ProcessedOrNot Scanner',
    'brand.subtitle': 'Für schnelle, einfache und fortschrittliche Produktanalyse und Verarbeitungserkennung',
    
    // Hero Section
    'hero.title.part1': 'Entdecken Sie Wie Verarbeitet',
    'hero.title.part2': 'Ihr Essen Wirklich Ist',
    'hero.description': 'Scannen Sie jeden Barcode für sofortige KI-Analyse von Verarbeitungsgraden, Zutaten und Nährwertinformationen',
    'hero.databases': 'Unterstützt von 14 Globalen Datenbanken',
    
    // Scanner Section
    'scanner.header.title': 'Finden Sie Ihr Produkt',
    'scanner.header.description': 'Barcode scannen, Zahlen eingeben oder Produktname tippen',
    'scanner.camera.start': 'Kamera-Scanner Starten',
    'scanner.camera.stop': 'Kamera Stoppen',
    'scanner.camera.switch': 'Kamera Wechseln',
    'scanner.camera.error': 'Kamera-Fehler',
    'scanner.camera.permission': 'Kamera-Berechtigung erforderlich zum Scannen von Barcodes',
    'scanner.input.placeholder': 'Barcode oder Produktname eingeben',
    'scanner.input.button': 'Produkt Analysieren',
    'scanner.input.analyzing': 'Produkt Wird Analysiert...',
    'scanner.samples.title': 'Beispielsuchen Ausprobieren',
    'scanner.samples.description': 'Barcode-Scannen oder textbasierte Produktsuche testen',
    'scanner.samples.click': 'Zum Scannen klicken',
    'scanner.samples.barcode': 'Barcode-Scan',
    'scanner.samples.text': 'Textsuche',
    
    // Nutrition Spotlight
    'nutrition.title': 'Ernährungs-Spotlight',
    'nutrition.subtitle': 'Wichtige Nährwertinformationen',
    'nutrition.dailyValue': 'Tageswert',
    'nutrition.basedOn': 'Basierend auf einer 2000-Kalorien-Diät',
    'nutrition.energy': 'Energie',
    'nutrition.fat': 'Fett',
    'nutrition.saturatedFat': 'Gesättigte Fettsäuren',
    'nutrition.sugars': 'Zucker',
    'nutrition.protein': 'Protein',
    'nutrition.salt': 'Salz',
    'nutrition.fiber': 'Ballaststoffe',
    'nutrition.carbohydrates': 'Kohlenhydrate',
    'nutrition.category.low': 'Niedrig',
    'nutrition.category.medium': 'Mittel',
    'nutrition.category.high': 'Hoch',
    'nutrition.description.energy': 'Energiegehalt pro 100g',
    'nutrition.description.fat': 'Gesamtfettgehalt',
    'nutrition.description.saturatedFat': 'Gesättigte Fettsäuren Gehalt',
    'nutrition.description.sugars': 'Zuckergehalt',
    'nutrition.description.protein': 'Proteingehalt',
    'nutrition.description.salt': 'Salzgehalt',
    
    // Fun Facts
    'funfacts.title': 'Lustige Fakten',
    'funfacts.subtitle': 'Interessante Einblicke zu diesem Produkt',
    'funfacts.category.nutrition': 'ernährung',
    'funfacts.category.history': 'geschichte',
    'funfacts.category.processing': 'verarbeitung',
    'funfacts.category.environment': 'umwelt',
    
    // NutriBot Chat
    'nutribot.title': 'Fragen Sie NutriBot',
    'nutribot.subtitle': 'Ihr KI-Ernährungsassistent',
    'nutribot.placeholder': 'Fragen Sie nach Ernährung, Zutaten oder Gesundheit...',
    'nutribot.send': 'Senden',
    'nutribot.thinking': 'NutriBot denkt nach...',
    'nutribot.welcome': 'Hallo! Ich bin NutriBot, Ihr Ernährungsassistent. Fragen Sie mich alles über Essen, Zutaten oder gesunde Ernährung!',
    'nutribot.error': 'Entschuldigung, ich bin auf einen Fehler gestoßen. Bitte versuchen Sie es erneut.',
    
    // Processing Analysis
    'processing.title': 'Verarbeitungsanalyse',
    'processing.score': 'Verarbeitungspunktzahl',
    'processing.outof': 'von 10',
    'processing.level.minimal': 'Minimal Verarbeitet',
    'processing.level.processed': 'Verarbeitet',
    'processing.level.ultra': 'Ultra-Verarbeitet',
    'processing.categories.title': 'Zutatenkategorien',
    'processing.categories.ultra': 'Ultra-verarbeitete Zutaten',
    'processing.categories.processed': 'Verarbeitete Zutaten',
    'processing.categories.minimal': 'Minimal verarbeitete Zutaten',
    'processing.insight.title': 'NutriBot Analyse',
    'processing.insight.loading': 'Ernährungsinformationen werden abgerufen...',
    
    // Product Information
    'product.image.alt': 'Produktbild',
    'product.barcode': 'Barcode',
    'product.notfound.title': 'Produkt Nicht Gefunden',
    'product.notfound.description': 'Wir konnten dieses Produkt nicht in unseren Datenbanken finden.',
    'product.notfound.add': 'Produktinformationen Hinzufügen',
    'product.addmanual.title': 'Produkt Manuell Hinzufügen',
    'product.addmanual.description': 'Helfen Sie dabei, unsere Datenbank zu verbessern, indem Sie dieses Produkt hinzufügen',
    
    // Theme Toggle
    'theme.light': 'Heller Modus',
    'theme.dark': 'Dunkler Modus',
    'theme.toggle': 'Design umschalten',
    
    // Footer
    'footer.createdBy': 'Erstellt von',
    'footer.linkedin': 'LinkedIn-Profil',
    
    // Status Messages
    'status.scanning': 'Barcode Wird Gescannt',
    'status.scanning.description': 'Durchsuche Produktdatenbanken...',
    'status.searching': 'Produkt Wird Gesucht',
    'status.searching.description': 'Produktinformationen werden gefunden und Zutaten analysiert...',
    'status.loading': 'Lädt',
    
    // Dietary Filters
    'dietary.filter_title': 'Ernährungsfilter',
    'dietary.clear_all': 'Löschen',
    'dietary.show_more': 'Mehr Anzeigen',
    'dietary.show_less': 'Weniger Anzeigen',
    'dietary.active_filters': 'Aktive Filter',
    'dietary.vegetarian': 'Vegetarisch',
    'dietary.vegetarian_desc': 'Kein Fleisch oder Fisch',
    'dietary.vegan': 'Vegan',
    'dietary.vegan_desc': 'Keine Tierprodukte',
    'dietary.gluten_free': 'Glutenfrei',
    'dietary.gluten_free_desc': 'Kein Weizen oder Gluten',
    'dietary.dairy_free': 'Laktosefrei',
    'dietary.dairy_free_desc': 'Keine Milchprodukte',
    'dietary.egg_free': 'Eifrei',
    'dietary.egg_free_desc': 'Keine Eier',
    'dietary.fish_free': 'Fischfrei',
    'dietary.fish_free_desc': 'Kein Fisch oder Meeresfrüchte',
    'dietary.nut_free': 'Nussfrei',
    'dietary.nut_free_desc': 'Keine Nüsse oder Baumnüsse',
    'dietary.halal': 'Halal',
    'dietary.halal_desc': 'Islamische Speisegesetze',
    'dietary.kosher': 'Koscher',
    'dietary.kosher_desc': 'Jüdische Speisegesetze',
    'status.success': 'Erfolgreich',
    'status.error': 'Fehler',
  },
  
  zh: {
    // Navigation
    'nav.home': '首页',
    'nav.products': '产品',
    
    // Home page
    'home.title': '条形码产品扫描器',
    'home.subtitle': '扫描或输入条形码以获取详细的产品信息和AI驱动的加工分析',
    'home.scan.button': '开始扫描',
    'home.manual.placeholder': '手动输入条形码',
    'home.manual.submit': '查找产品',
    
    // Scanner
    'scanner.title': '条形码扫描器',
    'scanner.instructions': '将相机对准条形码',
    'scanner.loading': '正在扫描...',
    'scanner.error': '相机访问被拒绝或不可用',
    'scanner.stop': '停止扫描',
    
    // Product Results
    'product.loading': '正在查找产品...',
    'product.notFound': '未找到产品',
    'product.error': '加载产品时出错',
    'product.analysis': '加工分析',
    'product.score': '加工评分',
    'product.explanation': '解释',
    'product.categories.title': '成分类别',
    'product.categories.ultraProcessed': '超加工',
    'product.categories.processed': '加工',
    'product.categories.minimal': '最低限度加工',
    'product.ingredients': '成分',
    'product.brand': '品牌',
    'product.source': '数据来源',
    
    // Manual Product Form
    'form.title': '添加产品信息',
    'form.subtitle': '未找到此条形码的产品。请手动添加信息。',
    'form.name.label': '产品名称',
    'form.name.placeholder': '输入产品名称',
    'form.brand.label': '品牌',
    'form.brand.placeholder': '输入品牌名称',
    'form.ingredients.label': '成分',
    'form.ingredients.placeholder': '输入成分列表',
    'form.submit': '保存产品',
    'form.cancel': '取消',
    'form.saving': '正在保存...',
    'form.success': '产品保存成功！',
    'form.error': '保存产品时出错',
    
    // Common
    'common.loading': '加载中...',
    'common.error': '发生错误',
    'common.retry': '重试',
    'common.back': '返回',
    'common.close': '关闭',
    'common.save': '保存',
    'common.cancel': '取消',
    
    // Language
    'language.select': '选择语言',
    'language.current': '当前语言',
    
    // Header and Branding
    'brand.title': 'ProcessedOrNot 扫描器',
    'brand.subtitle': '快速、简单、先进的产品分析和加工检测',
    
    // Hero Section
    'hero.title.part1': '发现您的食物',
    'hero.title.part2': '到底加工了多少',
    'hero.description': '扫描任何条形码，获得即时AI分析加工水平、成分和营养信息',
    'hero.databases': '由14个全球数据库提供支持',
    
    // Scanner Section
    'scanner.header.title': '查找您的产品',
    'scanner.header.description': '扫描条形码、输入数字或输入产品名称',
    'scanner.camera.start': '启动相机扫描器',
    'scanner.camera.stop': '停止相机',
    'scanner.camera.switch': '切换相机',
    'scanner.camera.error': '相机错误',
    'scanner.camera.permission': '需要相机权限来扫描条形码',
    'scanner.input.placeholder': '输入条形码或产品名称',
    'scanner.input.button': '分析产品',
    'scanner.input.analyzing': '正在分析产品...',
    'scanner.samples.title': '试用示例搜索',
    'scanner.samples.description': '测试条形码扫描或基于文本的产品搜索',
    'scanner.samples.click': '点击扫描',
    'scanner.samples.barcode': '条形码扫描',
    'scanner.samples.text': '文本搜索',
    
    // Nutrition Spotlight
    'nutrition.title': '营养聚焦',
    'nutrition.subtitle': '关键营养信息',
    'nutrition.dailyValue': '每日价值',
    'nutrition.basedOn': '基于2000卡路里饮食',
    'nutrition.energy': '能量',
    'nutrition.fat': '脂肪',
    'nutrition.saturatedFat': '饱和脂肪',
    'nutrition.sugars': '糖',
    'nutrition.protein': '蛋白质',
    'nutrition.salt': '盐',
    'nutrition.fiber': '纤维',
    'nutrition.carbohydrates': '碳水化合物',
    'nutrition.category.low': '低',
    'nutrition.category.medium': '中等',
    'nutrition.category.high': '高',
    'nutrition.description.energy': '每100克能量含量',
    'nutrition.description.fat': '总脂肪含量',
    'nutrition.description.saturatedFat': '饱和脂肪含量',
    'nutrition.description.sugars': '糖含量',
    'nutrition.description.protein': '蛋白质含量',
    'nutrition.description.salt': '盐含量',
    
    // Fun Facts
    'funfacts.title': '有趣事实',
    'funfacts.subtitle': '关于此产品的有趣见解',
    'funfacts.category.nutrition': '营养',
    'funfacts.category.history': '历史',
    'funfacts.category.processing': '加工',
    'funfacts.category.environment': '环境',
    
    // NutriBot Chat
    'nutribot.title': '询问NutriBot',
    'nutribot.subtitle': '您的AI营养助手',
    'nutribot.placeholder': '询问营养、成分或健康问题...',
    'nutribot.send': '发送',
    'nutribot.thinking': 'NutriBot正在思考...',
    'nutribot.welcome': '您好！我是NutriBot，您的营养助手。请向我询问任何关于食物、成分或健康饮食的问题！',
    'nutribot.error': '抱歉，我遇到了错误。请重试。',
    
    // Processing Analysis
    'processing.title': '加工分析',
    'processing.score': '加工评分',
    'processing.outof': '满分10分',
    'processing.level.minimal': '最低限度加工',
    'processing.level.processed': '加工',
    'processing.level.ultra': '超加工',
    'processing.categories.title': '成分类别',
    'processing.categories.ultra': '超加工成分',
    'processing.categories.processed': '加工成分',
    'processing.categories.minimal': '最低限度加工成分',
    'processing.insight.title': 'NutriBot分析',
    'processing.insight.loading': '获取营养信息...',
    
    // Product Information
    'product.image.alt': '产品图片',
    'product.barcode': '条形码',
    'product.notfound.title': '未找到产品',
    'product.notfound.description': '我们在数据库中找不到此产品。',
    'product.notfound.add': '添加产品信息',
    'product.addmanual.title': '手动添加产品',
    'product.addmanual.description': '通过添加此产品来帮助改善我们的数据库',
    
    // Theme Toggle
    'theme.light': '浅色模式',
    'theme.dark': '深色模式',
    'theme.toggle': '切换主题',
    
    // Footer
    'footer.createdBy': '创建者',
    'footer.linkedin': 'LinkedIn档案',
    
    // Status Messages
    'status.scanning': '扫描条形码',
    'status.scanning.description': '正在搜索产品数据库...',
    'status.searching': '搜索产品',
    'status.searching.description': '正在查找产品信息并分析成分...',
    'status.loading': '加载中',
    
    // Dietary Filters
    'dietary.filter_title': '饮食筛选',
    'dietary.clear_all': '清除',
    'dietary.show_more': '显示更多',
    'dietary.show_less': '显示较少',
    'dietary.active_filters': '活跃筛选',
    'dietary.vegetarian': '素食',
    'dietary.vegetarian_desc': '无肉无鱼',
    'dietary.vegan': '纯素',
    'dietary.vegan_desc': '无动物产品',
    'dietary.gluten_free': '无麸质',
    'dietary.gluten_free_desc': '无小麦无麸质',
    'dietary.dairy_free': '无乳制品',
    'dietary.dairy_free_desc': '无牛奶制品',
    'dietary.egg_free': '无鸡蛋',
    'dietary.egg_free_desc': '无鸡蛋',
    'dietary.fish_free': '无鱼',
    'dietary.fish_free_desc': '无鱼无海鲜',
    'dietary.nut_free': '无坚果',
    'dietary.nut_free_desc': '无坚果无树坚果',
    'dietary.halal': '清真',
    'dietary.halal_desc': '伊斯兰饮食法',
    'dietary.kosher': '犹太洁食',
    'dietary.kosher_desc': '犹太饮食法',
    'status.success': '成功',
    'status.error': '错误',
  },
  
  ja: {
    // Navigation
    'nav.home': 'ホーム',
    'nav.products': '製品',
    
    // Home page
    'home.title': 'バーコード製品スキャナー',
    'home.subtitle': 'バーコードをスキャンまたは入力して、詳細な製品情報とAI駆動の処理分析を取得',
    'home.scan.button': 'スキャン開始',
    'home.manual.placeholder': 'バーコードを手動入力',
    'home.manual.submit': '製品を検索',
    
    // Scanner
    'scanner.title': 'バーコードスキャナー',
    'scanner.instructions': 'カメラをバーコードに向けてください',
    'scanner.loading': 'スキャン中...',
    'scanner.error': 'カメラアクセスが拒否されたか利用できません',
    'scanner.stop': 'スキャナーを停止',
    
    // Product Results
    'product.loading': '製品を検索中...',
    'product.notFound': '製品が見つかりません',
    'product.error': '製品の読み込みエラー',
    'product.analysis': '処理分析',
    'product.score': '処理スコア',
    'product.explanation': '説明',
    'product.categories.title': '成分カテゴリー',
    'product.categories.ultraProcessed': '超加工',
    'product.categories.processed': '加工',
    'product.categories.minimal': '最小限の加工',
    'product.ingredients': '成分',
    'product.brand': 'ブランド',
    'product.source': 'データソース',
    
    // Manual Product Form
    'form.title': '製品情報を追加',
    'form.subtitle': 'このバーコードの製品が見つかりませんでした。手動で情報を追加してください。',
    'form.name.label': '製品名',
    'form.name.placeholder': '製品名を入力',
    'form.brand.label': 'ブランド',
    'form.brand.placeholder': 'ブランド名を入力',
    'form.ingredients.label': '成分',
    'form.ingredients.placeholder': '成分リストを入力',
    'form.submit': '製品を保存',
    'form.cancel': 'キャンセル',
    'form.saving': '保存中...',
    'form.success': '製品の保存に成功しました！',
    'form.error': '製品の保存エラー',
    
    // Common
    'common.loading': '読み込み中...',
    'common.error': 'エラーが発生しました',
    'common.retry': '再試行',
    'common.back': '戻る',
    'common.close': '閉じる',
    'common.save': '保存',
    'common.cancel': 'キャンセル',
    
    // Language
    'language.select': '言語を選択',
    'language.current': '現在の言語',
    
    // Header and Branding
    'brand.title': 'ProcessedOrNot スキャナー',
    'brand.subtitle': '迅速で簡単で高度な製品分析と加工検出',
    
    // Hero Section
    'hero.title.part1': 'あなたの食べ物が',
    'hero.title.part2': 'どれほど加工されているかを発見',
    'hero.description': 'バーコードをスキャンして、加工レベル、成分、栄養情報のAI分析を即座に取得',
    'hero.databases': '14のグローバルデータベースによる強化',
    
    // Scanner Section
    'scanner.header.title': '製品を見つける',
    'scanner.header.description': 'バーコードをスキャン、数字を入力、または製品名を入力',
    'scanner.camera.start': 'カメラスキャナーを開始',
    'scanner.camera.stop': 'カメラを停止',
    'scanner.camera.switch': 'カメラを切り替え',
    'scanner.camera.error': 'カメラエラー',
    'scanner.camera.permission': 'バーコードをスキャンするためにカメラの権限が必要です',
    'scanner.input.placeholder': 'バーコードまたは製品名を入力',
    'scanner.input.button': '製品を分析',
    'scanner.input.analyzing': '製品を分析中...',
    'scanner.samples.title': 'サンプル検索を試す',
    'scanner.samples.description': 'バーコードスキャンまたはテキストベースの製品検索をテスト',
    'scanner.samples.click': 'クリックしてスキャン',
    'scanner.samples.barcode': 'バーコードスキャン',
    'scanner.samples.text': 'テキスト検索',
    
    // Nutrition Spotlight
    'nutrition.title': '栄養スポットライト',
    'nutrition.subtitle': '主要な栄養情報',
    'nutrition.dailyValue': '1日の値',
    'nutrition.basedOn': '2000カロリーの食事に基づく',
    'nutrition.energy': 'エネルギー',
    'nutrition.fat': '脂肪',
    'nutrition.saturatedFat': '飽和脂肪',
    'nutrition.sugars': '糖類',
    'nutrition.protein': 'タンパク質',
    'nutrition.salt': '塩',
    'nutrition.fiber': '繊維',
    'nutrition.carbohydrates': '炭水化物',
    'nutrition.category.low': '低',
    'nutrition.category.medium': '中',
    'nutrition.category.high': '高',
    'nutrition.description.energy': '100gあたりのエネルギー含有量',
    'nutrition.description.fat': '総脂肪含有量',
    'nutrition.description.saturatedFat': '飽和脂肪含有量',
    'nutrition.description.sugars': '糖含有量',
    'nutrition.description.protein': 'タンパク質含有量',
    'nutrition.description.salt': '塩含有量',
    
    // Fun Facts
    'funfacts.title': '楽しい事実',
    'funfacts.subtitle': 'この製品に関する興味深い洞察',
    'funfacts.category.nutrition': '栄養',
    'funfacts.category.history': '歴史',
    'funfacts.category.processing': '加工',
    'funfacts.category.environment': '環境',
    
    // NutriBot Chat
    'nutribot.title': 'NutriBotに質問',
    'nutribot.subtitle': 'あなたのAI栄養アシスタント',
    'nutribot.placeholder': '栄養、成分、健康について質問...',
    'nutribot.send': '送信',
    'nutribot.thinking': 'NutriBotが考えています...',
    'nutribot.welcome': 'こんにちは！私はNutriBot、あなたの栄養アシスタントです。食べ物、成分、健康的な食事について何でも聞いてください！',
    'nutribot.error': '申し訳ございませんが、エラーが発生いたしました。もう一度お試しください。',
    
    // Processing Analysis
    'processing.title': '加工分析',
    'processing.score': '加工スコア',
    'processing.outof': '10点満点',
    'processing.level.minimal': '最小限の加工',
    'processing.level.processed': '加工済み',
    'processing.level.ultra': '超加工',
    'processing.categories.title': '成分カテゴリー',
    'processing.categories.ultra': '超加工成分',
    'processing.categories.processed': '加工成分',
    'processing.categories.minimal': '最小限の加工成分',
    'processing.insight.title': 'NutriBot分析',
    'processing.insight.loading': '栄養情報を取得中...',
    
    // Product Information
    'product.image.alt': '製品画像',
    'product.barcode': 'バーコード',
    'product.notfound.title': '製品が見つかりません',
    'product.notfound.description': 'データベースでこの製品を見つけることができませんでした。',
    'product.notfound.add': '製品情報を追加',
    'product.addmanual.title': '製品を手動で追加',
    'product.addmanual.description': 'この製品を追加してデータベースの改善にご協力ください',
    
    // Theme Toggle
    'theme.light': 'ライトモード',
    'theme.dark': 'ダークモード',
    'theme.toggle': 'テーマを切り替え',
    
    // Footer
    'footer.createdBy': '作成者',
    'footer.linkedin': 'LinkedInプロフィール',
    
    // Status Messages
    'status.scanning': 'バーコードスキャン中',
    'status.scanning.description': '製品データベースを検索中...',
    'status.searching': '製品検索中',
    'status.searching.description': '製品情報を見つけて成分を分析中...',
    'status.loading': '読み込み中',
    
    // Dietary Filters
    'dietary.filter_title': '食事制限フィルター',
    'dietary.clear_all': 'クリア',
    'dietary.show_more': 'もっと見る',
    'dietary.show_less': '少なく表示',
    'dietary.active_filters': 'アクティブフィルター',
    'dietary.vegetarian': 'ベジタリアン',
    'dietary.vegetarian_desc': '肉・魚なし',
    'dietary.vegan': 'ビーガン',
    'dietary.vegan_desc': '動物性食品なし',
    'dietary.gluten_free': 'グルテンフリー',
    'dietary.gluten_free_desc': '小麦・グルテンなし',
    'dietary.dairy_free': '乳製品フリー',
    'dietary.dairy_free_desc': '乳製品なし',
    'dietary.egg_free': '卵フリー',
    'dietary.egg_free_desc': '卵なし',
    'dietary.fish_free': '魚フリー',
    'dietary.fish_free_desc': '魚・海鮮なし',
    'dietary.nut_free': 'ナッツフリー',
    'dietary.nut_free_desc': 'ナッツ・木の実なし',
    'dietary.halal': 'ハラール',
    'dietary.halal_desc': 'イスラム食事法',
    'dietary.kosher': 'コーシャー',
    'dietary.kosher_desc': 'ユダヤ食事法',
    'status.success': '成功',
    'status.error': 'エラー',
  },

  nl: {
    // Navigation
    'nav.home': 'Home',
    'nav.products': 'Producten',

    // Home Page
    'home.title': 'ProcessedOrNot Scanner',
    'home.subtitle': 'Voor snelle, eenvoudige en geavanceerde productanalyse en verwerkingsdetectie',
    'home.scan.button': 'Product Scannen',
    'home.manual.placeholder': 'Voer barcode of productnaam in',
    'home.manual.submit': 'Zoeken',

    // Scanner
    'scanner.title': 'Productscanner',
    'scanner.subtitle': 'Scan barcodes of zoek producten op naam',
    'scanner.start': 'Scanner Starten',
    'scanner.stop': 'Scanner Stoppen',
    'scanner.error': 'Scanner fout',
    'scanner.permission': 'Camera toestemming vereist',

    // Common
    'common.loading': 'Laden...',
    'common.error': 'Fout',
    'common.retry': 'Opnieuw proberen',
    'common.close': 'Sluiten',
    'common.save': 'Opslaan',
    'common.cancel': 'Annuleren',
    
    // Language
    'language.select': 'Taal Selecteren',
    'language.current': 'Huidige taal',
    
    // Header and Branding
    'brand.title': 'ProcessedOrNot Scanner',
    'brand.subtitle': 'Voor snelle, eenvoudige en geavanceerde productanalyse en verwerkingsdetectie',
    
    // Hero Section
    'hero.title.part1': 'Ontdek Hoe Bewerkt',
    'hero.title.part2': 'Uw Voedsel Werkelijk Is',
    'hero.description': 'Scan elke barcode voor directe AI-analyse van verwerkingsniveaus, ingrediënten en voedingsinformatie',
    'hero.databases': 'Aangedreven door 14 Wereldwijde Databases',
    
    // Scanner Section
    'scanner.header.title': 'Vind Uw Product',
    'scanner.header.description': 'Barcode scannen, nummers invoeren of productnaam typen',
    'scanner.camera.start': 'Camera Scanner Starten',
    'scanner.camera.stop': 'Camera Stoppen',
    'scanner.camera.switch': 'Camera Wisselen',
    'scanner.camera.error': 'Camera Fout',
    'scanner.camera.permission': 'Camera toestemming vereist voor het scannen van barcodes',
    'scanner.input.placeholder': 'Barcode of productnaam invoeren',
    'scanner.input.button': 'Product Analyseren',
    'scanner.input.analyzing': 'Product Analyseren...',
    'scanner.samples.title': 'Probeer Voorbeeldzoekopdrachten',
    'scanner.samples.description': 'Test barcode scannen of tekstgebaseerd producten zoeken',
    'scanner.samples.click': 'Klik om te scannen',
    'scanner.samples.barcode': 'Barcode scan',
    'scanner.samples.text': 'Tekst zoeken',
    
    // Nutrition Spotlight
    'nutrition.title': 'Voeding Spotlight',
    'nutrition.subtitle': 'Belangrijke voedingsinformatie',
    'nutrition.dailyValue': 'Dagelijkse Waarde',
    'nutrition.basedOn': 'Gebaseerd op een 2000 calorie dieet',
    'nutrition.energy': 'Energie',
    'nutrition.fat': 'Vet',
    'nutrition.saturatedFat': 'Verzadigd Vet',
    'nutrition.sugars': 'Suikers',
    'nutrition.protein': 'Eiwit',
    'nutrition.salt': 'Zout',
    'nutrition.fiber': 'Vezel',
    'nutrition.carbohydrates': 'Koolhydraten',
    'nutrition.category.low': 'Laag',
    'nutrition.category.medium': 'Gemiddeld',
    'nutrition.category.high': 'Hoog',
    'nutrition.description.energy': 'Energie-inhoud per 100g',
    'nutrition.description.fat': 'Totaal vetgehalte',
    'nutrition.description.saturatedFat': 'Verzadigd vetgehalte',
    'nutrition.description.sugars': 'Suikergehalte',
    'nutrition.description.protein': 'Eiwitgehalte',
    'nutrition.description.salt': 'Zoutgehalte',
    
    // Fun Facts
    'funfacts.title': 'Leuke Weetjes',
    'funfacts.subtitle': 'Interessante inzichten over dit product',
    'funfacts.category.nutrition': 'voeding',
    'funfacts.category.history': 'geschiedenis',
    'funfacts.category.processing': 'verwerking',
    'funfacts.category.environment': 'milieu',
    
    // NutriBot Chat
    'nutribot.title': 'Vraag NutriBot',
    'nutribot.subtitle': 'Uw AI voeding assistent',
    'nutribot.placeholder': 'Stel vragen over voeding, ingrediënten of gezondheid...',
    'nutribot.send': 'Verzenden',
    'nutribot.thinking': 'NutriBot denkt na...',
    'nutribot.welcome': 'Hallo! Ik ben NutriBot, uw voeding assistent. Vraag me alles over eten, ingrediënten of gezonde voeding!',
    'nutribot.error': 'Sorry, ik kreeg een fout. Probeer het opnieuw.',
    
    // Processing Analysis
    'processing.title': 'Verwerkingsanalyse',
    'processing.score': 'Verwerkingsscore',
    'processing.outof': 'van 10',
    'processing.level.minimal': 'Minimaal Bewerkt',
    'processing.level.processed': 'Bewerkt',
    'processing.level.ultra': 'Ultra-Bewerkt',
    'processing.categories.title': 'Ingrediënt Categorieën',
    'processing.categories.ultra': 'Ultra-bewerkte ingrediënten',
    'processing.categories.processed': 'Bewerkte ingrediënten',
    'processing.categories.minimal': 'Minimaal bewerkte ingrediënten',
    'processing.insight.title': 'NutriBot Analyse',
    'processing.insight.loading': 'Voedingsinformatie ophalen...',
    
    // Product Information
    'product.image.alt': 'Product afbeelding',
    'product.barcode': 'Barcode',
    'product.notfound.title': 'Product Niet Gevonden',
    'product.notfound.description': 'We konden dit product niet vinden in onze databases.',
    'product.notfound.add': 'Productinformatie Toevoegen',
    'product.addmanual.title': 'Product Handmatig Toevoegen',
    'product.addmanual.description': 'Help onze database te verbeteren door dit product toe te voegen',
    
    // Theme Toggle
    'theme.light': 'Lichte modus',
    'theme.dark': 'Donkere modus',
    'theme.toggle': 'Thema omschakelen',
    
    // Footer
    'footer.createdBy': 'Gemaakt door',
    'footer.linkedin': 'LinkedIn Profiel',
    
    // Status Messages
    'status.scanning': 'Barcode Scannen',
    'status.scanning.description': 'Productdatabases doorzoeken...',
    'status.searching': 'Product Zoeken',
    'status.searching.description': 'Productinformatie vinden en ingrediënten analyseren...',
    'status.loading': 'Laden',
    
    // Dietary Filters
    'dietary.filter_title': 'Dieetfilters',
    'dietary.clear_all': 'Wissen',
    'dietary.show_more': 'Meer Tonen',
    'dietary.show_less': 'Minder Tonen',
    'dietary.active_filters': 'Actieve filters',
    'dietary.vegetarian': 'Vegetarisch',
    'dietary.vegetarian_desc': 'Geen vlees of vis',
    'dietary.vegan': 'Veganistisch',
    'dietary.vegan_desc': 'Geen dierlijke producten',
    'dietary.gluten_free': 'Glutenvrij',
    'dietary.gluten_free_desc': 'Geen tarwe of gluten',
    'dietary.dairy_free': 'Zuivelvrij',
    'dietary.dairy_free_desc': 'Geen zuivelproducten',
    'dietary.egg_free': 'Eivrij',
    'dietary.egg_free_desc': 'Geen eieren',
    'dietary.fish_free': 'Visvrij',
    'dietary.fish_free_desc': 'Geen vis of zeevruchten',
    'dietary.nut_free': 'Notenvrij',
    'dietary.nut_free_desc': 'Geen noten of boomvruchten',
    'dietary.halal': 'Halal',
    'dietary.halal_desc': 'Islamitische spijswetten',
    'dietary.kosher': 'Koosjer',
    'dietary.kosher_desc': 'Joodse spijswetten',
    'status.success': 'Succesvol',
    'status.error': 'Fout',
  },
};