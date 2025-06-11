export type Language = 'en' | 'es' | 'fr' | 'de' | 'zh' | 'ja';

export const languages: Record<Language, { name: string; flag: string }> = {
  en: { name: 'English', flag: '🇺🇸' },
  es: { name: 'Español', flag: '🇪🇸' },
  fr: { name: 'Français', flag: '🇫🇷' },
  de: { name: 'Deutsch', flag: '🇩🇪' },
  zh: { name: '中文', flag: '🇨🇳' },
  ja: { name: '日本語', flag: '🇯🇵' },
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
    'status.success': 'Success',
    'status.error': 'Error',
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
  },
};