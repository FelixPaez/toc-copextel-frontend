/**
 * Iconos centralizados para funcionalidades generales
 * 
 * Este archivo centraliza todos los iconos de Material Icons usados en la aplicación.
 * Facilita el mantenimiento y permite cambios globales desde un solo lugar.
 * 
 * Uso:
 *   En templates: <mat-icon>{{ Icons.ACTIONS.EDIT }}</mat-icon>
 *   En TypeScript: icon: Icons.ACTIONS.EDIT
 */

export const Icons = {
  // ============================================
  // ACCIONES GENERALES
  // ============================================
  ACTIONS: {
    ADD: 'add',
    EDIT: 'edit',
    DELETE: 'delete',
    SAVE: 'save',
    CANCEL: 'cancel',
    CLOSE: 'close',
    BACK: 'arrow_back',
    FORWARD: 'arrow_forward',
    NEXT: 'chevron_right',
    PREVIOUS: 'chevron_left',
    UP: 'arrow_upward',
    DOWN: 'arrow_downward',
    REFRESH: 'refresh',
    SEARCH: 'search',
    FILTER: 'filter_list',
    CLEAR: 'clear',
    RESET: 'restart_alt',
    EXPORT: 'file_download',
    IMPORT: 'file_upload',
    PRINT: 'print',
    DOWNLOAD: 'download',
    UPLOAD: 'upload',
    SHARE: 'share',
    COPY: 'content_copy',
    CUT: 'content_cut',
    PASTE: 'content_paste',
    UNDO: 'undo',
    REDO: 'redo',
    ZOOM_IN: 'zoom_in',
    ZOOM_OUT: 'zoom_out',
    FULLSCREEN: 'fullscreen',
    EXIT_FULLSCREEN: 'fullscreen_exit',
    SETTINGS: 'settings',
    MORE_VERT: 'more_vert',
    MORE_HORIZ: 'more_horiz',
    MENU: 'menu',
    MENU_OPEN: 'menu_open',
    DONE: 'done',
    CHECK: 'check',
    CHECK_CIRCLE: 'check_circle',
    REMOVE: 'remove',
    REMOVE_CIRCLE: 'remove_circle',
    ADD_CIRCLE: 'add_circle',
    CREATE: 'create',
    UPDATE: 'update',
    VIEW: 'visibility',
    VIEW_OFF: 'visibility_off',
    HIDE: 'hide_source',
    SHOW: 'show_chart',
    EXPAND: 'expand_more',
    COLLAPSE: 'expand_less',
    OPEN: 'open_in_new',
    CLOSE_FULLSCREEN: 'close_fullscreen'
  },

  // ============================================
  // NAVEGACIÓN
  // ============================================
  NAVIGATION: {
    HOME: 'home',
    DASHBOARD: 'dashboard',
    MENU: 'menu',
    ARROW_BACK: 'arrow_back',
    ARROW_FORWARD: 'arrow_forward',
    ARROW_UP: 'arrow_upward',
    ARROW_DOWN: 'arrow_downward',
    CHEVRON_LEFT: 'chevron_left',
    CHEVRON_RIGHT: 'chevron_right',
    CHEVRON_UP: 'expand_less',
    CHEVRON_DOWN: 'expand_more',
    BREADCRUMB_SEP: 'chevron_right',
    FIRST_PAGE: 'first_page',
    LAST_PAGE: 'last_page',
    NAVIGATE_BEFORE: 'navigate_before',
    NAVIGATE_NEXT: 'navigate_next',
    SUBDIRECTORY_ARROW: 'subdirectory_arrow_right'
  },

  // ============================================
  // ESTADOS Y NOTIFICACIONES
  // ============================================
  STATUS: {
    SUCCESS: 'check_circle',
    ERROR: 'error',
    WARNING: 'warning',
    WARNING_AMBER: 'warning_amber',
    INFO: 'info',
    HELP: 'help_outline',
    QUESTION: 'help',
    ALERT: 'notifications_active',
    NOTIFICATION: 'notifications',
    NOTIFICATION_NONE: 'notifications_none',
    NOTIFICATION_OFF: 'notifications_off',
    REPORT: 'report',
    REPORT_PROBLEM: 'report_problem',
    TASK_ALT: 'task_alt',
    PENDING: 'pending',
    PENDING_ACTIONS: 'pending_actions',
    SCHEDULE: 'schedule',
    TIMER: 'timer',
    TIMER_OFF: 'timer_off',
    SYNC: 'sync',
    SYNC_PROBLEM: 'sync_problem',
    OFFLINE: 'offline_bolt',
    ONLINE: 'online_prediction',
    ACTIVE: 'radio_button_checked',
    INACTIVE: 'radio_button_unchecked',
    ENABLED: 'toggle_on',
    DISABLED: 'toggle_off',
    LOCK: 'lock',
    LOCK_OPEN: 'lock_open',
    LOCK_CLOCK: 'lock_clock',
    SECURITY: 'security',
    VERIFIED: 'verified',
    VERIFIED_USER: 'verified_user',
    BLOCK: 'block',
    UNBLOCK: 'block'
  },

  // ============================================
  // ARCHIVOS Y DOCUMENTOS
  // ============================================
  FILES: {
    FILE: 'insert_drive_file',
    FOLDER: 'folder',
    FOLDER_OPEN: 'folder_open',
    ATTACHMENT: 'attachment',
    ATTACH_FILE: 'attach_file',
    DESCRIPTION: 'description',
    ARTICLE: 'article',
    PICTURE_AS_PDF: 'picture_as_pdf',
    IMAGE: 'image',
    VIDEO: 'video_library',
    AUDIO: 'audiotrack',
    ARCHIVE: 'archive',
    DOWNLOAD: 'download',
    UPLOAD: 'upload',
    CLOUD_UPLOAD: 'cloud_upload',
    CLOUD_DOWNLOAD: 'cloud_download',
    FILE_DOWNLOAD: 'file_download',
    FILE_UPLOAD: 'file_upload',
    SAVE_ALT: 'save_alt',
    PICTURE_IN_PICTURE: 'picture_in_picture',
    INSERT_PHOTO: 'insert_photo',
    ADD_PHOTO: 'add_a_photo',
    DELETE_PHOTO: 'delete_forever'
  },

  // ============================================
  // MEDIOS Y PUBLICIDAD
  // ============================================
  MEDIA: {
    IMAGE: 'image',
    IMAGES: 'images',
    PHOTO: 'photo',
    PHOTO_LIBRARY: 'photo_library',
    CAMERA: 'camera_alt',
    VIDEO: 'videocam',
    VIDEO_LIBRARY: 'video_library',
    SLIDESHOW: 'slideshow',
    CAMPAIGN: 'campaign',
    ADVERTISEMENT: 'campaign',
    BANNER: 'campaign',
    PROMOTION: 'local_offer'
  },

  // ============================================
  // COMUNICACIÓN Y MENSAJERÍA
  // ============================================
  COMMUNICATION: {
    EMAIL: 'email',
    MAIL: 'mail',
    MAIL_OUTLINE: 'mail_outline',
    MARK_EMAIL_READ: 'mark_email_read',
    MARK_EMAIL_UNREAD: 'mark_email_unread',
    SEND: 'send',
    REPLY: 'reply',
    REPLY_ALL: 'reply_all',
    FORWARD_EMAIL: 'forward',
    INBOX: 'inbox',
    OUTBOX: 'outbox',
    DRAFT: 'drafts',
    ARCHIVE_MAIL: 'archive',
    DELETE_MAIL: 'delete',
    STAR: 'star',
    STAR_BORDER: 'star_border',
    STAR_HALF: 'star_half',
    LABEL: 'label',
    LABEL_IMPORTANT: 'label_important',
    LABEL_OUTLINE: 'label_outline',
    MESSAGE: 'message',
    CHAT: 'chat',
    CHAT_BUBBLE: 'chat_bubble',
    CHAT_BUBBLE_OUTLINE: 'chat_bubble_outline',
    COMMENT: 'comment',
    FORUM: 'forum',
    PHONE: 'phone',
    PHONE_ENABLED: 'phone_enabled',
    CALL: 'call',
    CALL_END: 'call_end',
    VIDEO_CALL: 'video_call',
    NOTIFICATIONS: 'notifications',
    NOTIFICATIONS_ACTIVE: 'notifications_active',
    NOTIFICATIONS_NONE: 'notifications_none',
    NOTIFICATIONS_OFF: 'notifications_off'
  },

  // ============================================
  // USUARIOS Y PERFILES
  // ============================================
  USERS: {
    PERSON: 'person',
    PERSON_OUTLINE: 'person_outline',
    PERSON_ADD: 'person_add',
    PERSON_REMOVE: 'person_remove',
    PEOPLE: 'people',
    PEOPLE_OUTLINE: 'people_outline',
    GROUP: 'group',
    GROUP_ADD: 'group_add',
    ACCOUNT_CIRCLE: 'account_circle',
    ACCOUNT_BOX: 'account_box',
    FACE: 'face',
    SUPERVISED_USER: 'supervised_user_circle',
    ADMIN_PANEL: 'admin_panel_settings',
    MANAGE_ACCOUNTS: 'manage_accounts',
    BADGE: 'badge',
    CONTACTS: 'contacts',
    CONTACT_PAGE: 'contact_page',
    PERMISSION: 'how_to_reg',
    LOGIN: 'login',
    LOGOUT: 'logout',
    LOCK_PERSON: 'lock_person',
    SHIELD: 'shield',
    SHIELD_PERSON: 'shield_person'
  },

  // ============================================
  // PRODUCTOS Y TIENDA
  // ============================================
  PRODUCTS: {
    SHOPPING_CART: 'shopping_cart',
    SHOPPING_BAG: 'shopping_bag',
    STORE: 'store',
    STORE_MALL_DIRECTORY: 'store_mall_directory',
    INVENTORY: 'inventory',
    INVENTORY_2: 'inventory_2',
    PACKAGE: 'package',
    PACKAGE_OUTLINE: 'package_outline',
    LOCAL_SHIPPING: 'local_shipping',
    SHOPPING_BASKET: 'shopping_basket',
    ADD_SHOPPING_CART: 'add_shopping_cart',
    REMOVE_SHOPPING_CART: 'remove_shopping_cart',
    CART_PLUS: 'add_shopping_cart',
    CART_MINUS: 'remove_shopping_cart',
    PAYMENT: 'payment',
    CREDIT_CARD: 'credit_card',
    RECEIPT: 'receipt',
    RECEIPT_LONG: 'receipt_long',
    ATTACH_MONEY: 'attach_money',
    MONEY: 'money',
    MONEY_OFF: 'money_off',
    PRICE_TAG: 'price_tag',
    PRICE_CHECK: 'price_check',
    DISCOUNT: 'discount',
    PERCENT: 'percent',
    TRENDING_UP: 'trending_up',
    TRENDING_DOWN: 'trending_down',
    BAR_CHART: 'bar_chart',
    SHOW_CHART: 'show_chart',
    PIE_CHART: 'pie_chart',
    SALES: 'point_of_sale',
    POINT_OF_SALE: 'point_of_sale',
    STORE_FRONT: 'storefront',
    CATEGORY: 'category',
    CATEGORIES: 'category',
    LABEL_PRODUCT: 'label',
    TAG: 'local_offer',
    OFFER: 'local_offer'
  },

  // ============================================
  // PEDIDOS Y ORDENES
  // ============================================
  ORDERS: {
    RECEIPT: 'receipt',
    RECEIPT_LONG: 'receipt_long',
    ASSIGNMENT: 'assignment',
    ASSIGNMENT_IND: 'assignment_ind',
    LIST_ALT: 'list_alt',
    FORMAT_LIST_NUMBERED: 'format_list_numbered',
    CHECKLIST: 'checklist',
    CHECKLIST_RTL: 'checklist_rtl',
    TASK: 'task',
    TASK_ALT: 'task_alt',
    PENDING: 'pending',
    PENDING_ACTIONS: 'pending_actions',
    DONE: 'done',
    DONE_ALL: 'done_all',
    DONE_OUTLINE: 'done_outline',
    CANCEL: 'cancel',
    CANCEL_PRESENTATION: 'cancel_presentation',
    CLOSE_FULLSCREEN: 'close_fullscreen',
    SHIPPING: 'local_shipping',
    DELIVERY: 'delivery_dining',
    TRUCK: 'local_shipping',
    TRACKING: 'track_changes',
    LOCATION_ON: 'location_on',
    LOCATION_OFF: 'location_off',
    MAP: 'map',
    ROUTE: 'route',
    SCHEDULE: 'schedule',
    CALENDAR_TODAY: 'calendar_today',
    EVENT: 'event',
    EVENT_AVAILABLE: 'event_available',
    EVENT_BUSY: 'event_busy',
    EVENT_NOTE: 'event_note'
  },

  // ============================================
  // CONFIGURACIÓN Y HERRAMIENTAS
  // ============================================
  SETTINGS: {
    SETTINGS: 'settings',
    SETTINGS_APPLICATIONS: 'settings_applications',
    TUNE: 'tune',
    BUILD: 'build',
    CONSTRUCTION: 'construction',
    TOOLS: 'handyman',
    WRENCH: 'build',
    ADMIN_PANEL: 'admin_panel_settings',
    SECURITY: 'security',
    PRIVACY: 'privacy_tip',
    LOCK: 'lock',
    LOCK_OPEN: 'lock_open',
    KEY: 'vpn_key',
    PASSWORD: 'password',
    FINGERPRINT: 'fingerprint',
    BIOMETRIC: 'biometric',
    SHIELD: 'shield',
    VERIFIED_USER: 'verified_user',
    POLICY: 'policy',
    RULE: 'rule',
    GAVEL: 'gavel',
    PERMISSIONS: 'admin_panel_settings',
    ACCESSIBILITY: 'accessibility',
    ACCESSIBILITY_NEW: 'accessibility_new'
  },

  // ============================================
  // BÚSQUEDA Y FILTROS
  // ============================================
  SEARCH: {
    SEARCH: 'search',
    SEARCH_OFF: 'search_off',
    FILTER: 'filter_list',
    FILTER_ALT: 'filter_alt',
    FILTER_ALT_OFF: 'filter_alt_off',
    SORT: 'sort',
    SORT_BY_ALPHA: 'sort_by_alpha',
    ARROW_UPWARD: 'arrow_upward',
    ARROW_DOWNWARD: 'arrow_downward',
    TUNE: 'tune',
    ADJUST: 'tune',
    FIND_IN_PAGE: 'find_in_page',
    FIND_REPLACE: 'find_replace',
    YOUTUBE_SEARCHED_FOR: 'youtube_searched_for'
  },

  // ============================================
  // VISUALIZACIÓN Y DISPLAY
  // ============================================
  VIEW: {
    VIEW: 'visibility',
    VIEW_OFF: 'visibility_off',
    VIEW_MODULE: 'view_module',
    VIEW_LIST: 'view_list',
    VIEW_AGENDA: 'view_agenda',
    VIEW_COMFY: 'view_comfy',
    VIEW_COMPACT: 'view_compact',
    VIEW_QUILT: 'view_quilt',
    VIEW_STREAM: 'view_stream',
    VIEW_WEEK: 'view_week',
    VIEW_DAY: 'view_day',
    VIEW_CAROUSEL: 'view_carousel',
    GRID_VIEW: 'grid_view',
    TABLE_VIEW: 'table_view',
    DASHBOARD_VIEW: 'dashboard',
    FULLSCREEN: 'fullscreen',
    FULLSCREEN_EXIT: 'fullscreen_exit',
    ZOOM_IN: 'zoom_in',
    ZOOM_OUT: 'zoom_out',
    FIT_SCREEN: 'fit_screen',
    ASPECT_RATIO: 'aspect_ratio'
  },

  // ============================================
  // FECHA Y TIEMPO
  // ============================================
  TIME: {
    ACCESS_TIME: 'access_time',
    SCHEDULE: 'schedule',
    CALENDAR_TODAY: 'calendar_today',
    CALENDAR_MONTH: 'calendar_month',
    EVENT: 'event',
    EVENT_AVAILABLE: 'event_available',
    EVENT_BUSY: 'event_busy',
    EVENT_NOTE: 'event_note',
    TODAY: 'today',
    DATE_RANGE: 'date_range',
    UPDATE: 'update',
    HISTORY: 'history',
    TIMELINE: 'timeline',
    WATCH_LATER: 'watch_later',
    ALARM: 'alarm',
    ALARM_ON: 'alarm_on',
    ALARM_OFF: 'alarm_off',
    TIMER: 'timer',
    TIMER_OFF: 'timer_off',
    HOURGLASS_EMPTY: 'hourglass_empty',
    HOURGLASS_FULL: 'hourglass_full',
    CLOCK: 'schedule'
  },

  // ============================================
  // SEGURIDAD Y AUTENTICACIÓN
  // ============================================
  SECURITY: {
    LOCK: 'lock',
    LOCK_OPEN: 'lock_open',
    LOCK_CLOCK: 'lock_clock',
    LOCK_PERSON: 'lock_person',
    LOCK_RESET: 'lock_reset',
    SECURITY: 'security',
    SHIELD: 'shield',
    SHIELD_PERSON: 'shield_person',
    VERIFIED: 'verified',
    VERIFIED_USER: 'verified_user',
    FINGERPRINT: 'fingerprint',
    BIOMETRIC: 'biometric',
    PASSWORD: 'password',
    KEY: 'vpn_key',
    KEY_OFF: 'key_off',
    ADMIN_PANEL: 'admin_panel_settings',
    POLICY: 'policy',
    PRIVACY: 'privacy_tip',
    ENCRYPTION: 'enhanced_encryption',
    DECRYPTION: 'no_encryption'
  },

  // ============================================
  // INFORMACIÓN Y AYUDA
  // ============================================
  INFO: {
    INFO: 'info',
    INFO_OUTLINE: 'info_outline',
    HELP: 'help',
    HELP_OUTLINE: 'help_outline',
    QUESTION_ANSWER: 'question_answer',
    FAQ: 'quiz',
    SUPPORT: 'support_agent',
    FEEDBACK: 'feedback',
    RATE_REVIEW: 'rate_review',
    REVIEW: 'reviews',
    STAR: 'star',
    STAR_BORDER: 'star_border',
    STAR_HALF: 'star_half',
    BOOK: 'book',
    BOOKMARK: 'bookmark',
    BOOKMARK_BORDER: 'bookmark_border',
    MENU_BOOK: 'menu_book',
    LIBRARY_BOOKS: 'library_books',
    ARTICLE: 'article',
    DESCRIPTION: 'description',
    DOCUMENT: 'description',
    NOTE: 'note',
    NOTE_ADD: 'note_add',
    STICKY_NOTE: 'sticky_note_2'
  },

  // ============================================
  // CATEGORÍAS Y ETIQUETAS
  // ============================================
  CATEGORIES: {
    CATEGORY: 'category',
    LABEL: 'label',
    LABEL_OUTLINE: 'label_outline',
    LABEL_IMPORTANT: 'label_important',
    LOCAL_OFFER: 'local_offer',
    SELL: 'sell',
    TAG: 'local_offer',
    BOOKMARK: 'bookmark',
    BOOKMARK_BORDER: 'bookmark_border',
    FOLDER: 'folder',
    FOLDER_OPEN: 'folder_open',
    FOLDER_SPECIAL: 'folder_special',
    COLLECTIONS: 'collections',
    COLLECTIONS_BOOKMARK: 'collections_bookmark'
  },

  // ============================================
  // ESTADÍSTICAS Y GRÁFICOS
  // ============================================
  CHARTS: {
    BAR_CHART: 'bar_chart',
    LINE_CHART: 'show_chart',
    PIE_CHART: 'pie_chart',
    AREA_CHART: 'area_chart',
    TRENDING_UP: 'trending_up',
    TRENDING_DOWN: 'trending_down',
    TRENDING_FLAT: 'trending_flat',
    INSIGHTS: 'insights',
    ANALYTICS: 'analytics',
    ASSESSMENT: 'assessment',
    MULTILINE_CHART: 'multiline_chart',
    SCATTER_PLOT: 'scatter_plot',
    BUBBLE_CHART: 'bubble_chart',
    SHOW_CHART: 'show_chart',
    HIDE_CHART: 'hide_chart',
    DATA_USAGE: 'data_usage',
    DATA_EXPLORATION: 'data_exploration'
  },

  // ============================================
  // TRANSPORTE Y ENTREGA
  // ============================================
  TRANSPORT: {
    LOCAL_SHIPPING: 'local_shipping',
    DELIVERY_DINING: 'delivery_dining',
    AIRPORT_SHUTTLE: 'airport_shuttle',
    TRUCK: 'local_shipping',
    TRUCK_DELIVERY: 'delivery_dining',
    DIRECTION: 'directions',
    ROUTE: 'route',
    MAP: 'map',
    LOCATION_ON: 'location_on',
    LOCATION_OFF: 'location_off',
    PLACE: 'place',
    MY_LOCATION: 'my_location',
    NAVIGATION: 'navigation',
    COMPASS: 'explore',
    TRACKING: 'track_changes',
    GPS_FIXED: 'gps_fixed',
    GPS_NOT_FIXED: 'gps_not_fixed',
    GPS_OFF: 'gps_off',
    TRAFFIC: 'traffic',
    TRAIN: 'train',
    FLIGHT: 'flight',
    DIRECTIONS_CAR: 'directions_car',
    DIRECTIONS_BIKE: 'directions_bike',
    WALK: 'directions_walk'
  }
} as const;

/**
 * Tipo para acceder a los iconos de forma type-safe
 */
export type IconCategory = keyof typeof Icons;
export type IconName = typeof Icons[IconCategory][keyof typeof Icons[IconCategory]];

/**
 * Helper function para obtener un icono de forma segura
 * @param category - Categoría del icono
 * @param name - Nombre del icono dentro de la categoría
 * @returns El nombre del icono o un icono por defecto si no se encuentra
 */
export function getIcon(category: IconCategory, name: keyof typeof Icons[typeof category]): string {
  return Icons[category]?.[name] || Icons.STATUS.INFO;
}

/**
 * Helper function para obtener un icono directamente por ruta completa
 * Ejemplo: getIconByPath('ACTIONS', 'EDIT')
 */
export function getIconByPath(category: IconCategory, iconKey: string): string {
  const categoryIcons = Icons[category];
  if (categoryIcons && iconKey in categoryIcons) {
    return categoryIcons[iconKey as keyof typeof categoryIcons];
  }
  return Icons.STATUS.INFO; // Icono por defecto
}

