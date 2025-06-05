export type Language = 'en' | 'es' | 'fr' | 'de' | 'nl' | 'zh' | 'ja';

export const languages: Record<Language, { name: string; flag: string }> = {
  en: { name: 'English', flag: '🇺🇸' },
  es: { name: 'Español', flag: '🇪🇸' },
  fr: { name: 'Français', flag: '🇫🇷' },
  de: { name: 'Deutsch', flag: '🇩🇪' },
  nl: { name: 'Nederlands', flag: '🇳🇱' },
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
    'product.nutrition': 'Nutrition Facts',
    'product.nutrition.nutrient': 'Nutrient',
    'product.nutrition.per100g': 'Per 100g',
    'product.nutrition.energy': 'Energy',
    'product.nutrition.fat': 'Fat',
    'product.nutrition.saturatedFat': 'Saturated fat',
    'product.nutrition.carbs': 'Carbohydrates',
    'product.nutrition.sugars': 'Sugars',
    'product.nutrition.protein': 'Protein',
    'product.nutrition.salt': 'Salt',
    
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
  },
  
  es: {
    // Navigation
    'nav.home': 'Inicio',
    'nav.products': 'Productos',
    
    // Home page
    'home.title': 'ProcessedOrNot Scanner',
    'home.subtitle': 'Para análisis de productos rápido, simple y avanzado y detección de procesamiento',
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
  },
  
  fr: {
    // Navigation
    'nav.home': 'Accueil',
    'nav.products': 'Produits',
    
    // Home page
    'home.title': 'ProcessedOrNot Scanner',
    'home.subtitle': 'Pour une analyse de produits rapide, simple et avancée et une détection de traitement',
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
  },
  
  de: {
    // Navigation
    'nav.home': 'Startseite',
    'nav.products': 'Produkte',
    
    // Home page
    'home.title': 'ProcessedOrNot Scanner',
    'home.subtitle': 'Für schnelle, einfache und erweiterte Produktanalyse und Verarbeitungserkennung',
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
    'home.title': 'ProcessedOrNot Scanner',
    'home.subtitle': '快速、简单和高级产品分析与加工检测',
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
  
  nl: {
    // Navigation
    'nav.home': 'Home',
    'nav.products': 'Producten',
    
    // Home page
    'home.title': 'ProcessedOrNot Scanner',
    'home.subtitle': 'Voor snelle, eenvoudige en geavanceerde productanalyse en verwerkingsdetectie',
    'home.scan.button': 'Start Scannen',
    'home.manual.placeholder': 'Barcode handmatig invoeren',
    'home.manual.submit': 'Product Opzoeken',
    
    // Scanner
    'scanner.title': 'Barcode Scanner',
    'scanner.instructions': 'Richt je camera op een barcode',
    'scanner.loading': 'Scannen...',
    'scanner.error': 'Camera toegang geweigerd of niet beschikbaar',
    'scanner.stop': 'Scanner Stoppen',
    
    // Product Results
    'product.loading': 'Product opzoeken...',
    'product.notFound': 'Product niet gevonden',
    'product.error': 'Fout bij laden product',
    'product.analysis': 'Verwerkingsanalyse',
    'product.score': 'Verwerkingsscore',
    'product.explanation': 'Uitleg',
    'product.categories.title': 'Ingrediënt Categorieën',
    'product.categories.ultraProcessed': 'Ultra-verwerkt',
    'product.categories.processed': 'Verwerkt',
    'product.categories.minimal': 'Minimaal verwerkt',
    'product.ingredients': 'Ingrediënten',
    'product.brand': 'Merk',
    'product.source': 'Databron',
    
    // Manual Product Form
    'form.title': 'Productinformatie Toevoegen',
    'form.subtitle': 'Geen product gevonden voor deze barcode. Voeg de informatie handmatig toe.',
    'form.name.label': 'Productnaam',
    'form.name.placeholder': 'Voer productnaam in',
    'form.brand.label': 'Merk',
    'form.brand.placeholder': 'Voer merknaam in',
    'form.ingredients.label': 'Ingrediënten',
    'form.ingredients.placeholder': 'Voer ingrediëntenlijst in',
    'form.submit': 'Product Opslaan',
    'form.cancel': 'Annuleren',
    'form.saving': 'Opslaan...',
    'form.success': 'Product succesvol opgeslagen!',
    'form.error': 'Fout bij opslaan product',
    
    // Common
    'common.loading': 'Laden...',
    'common.error': 'Er is een fout opgetreden',
    'common.retry': 'Opnieuw Proberen',
    'common.back': 'Terug',
    'common.close': 'Sluiten',
    'common.save': 'Opslaan',
    'common.cancel': 'Annuleren',
    
    // Language
    'language.select': 'Taal Selecteren',
    'language.current': 'Huidige taal',
  },
  
  ja: {
    // Navigation
    'nav.home': 'ホーム',
    'nav.products': '製品',
    
    // Home page
    'home.title': 'ProcessedOrNot Scanner',
    'home.subtitle': '迅速、シンプル、高度な製品分析と処理検出のために',
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