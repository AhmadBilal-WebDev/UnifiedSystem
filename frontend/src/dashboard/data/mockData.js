// ─── ROLES ───────────────────────────────────────────────────────────────────
export const ROLES = {
  SUPER_ADMIN:    'super_admin',
  CLIENT_ADMIN:   'client_admin',
  BRANCH_MANAGER: 'branch_manager',
  COUNTER:        'counter',
  EDITOR:         'editor',
  VIEWER:         'viewer',
  KITCHEN:        'kitchen',
};

export const INVITE_ROLES = [
  ROLES.BRANCH_MANAGER,
  ROLES.COUNTER,
  ROLES.EDITOR,
  ROLES.VIEWER,
  ROLES.KITCHEN,
];

/** Map nav page id → permission prefixes that grant access */
export const PAGE_PERMISSION_HINTS = {
  dashboard:  ["analytics.view", "orders.view", "counter.view"],
  counter:    ["counter."],
  orders:     ["orders."],
  kitchen:    ["kitchen."],
  products:   ["products."],
  categories: ["categories."],
  branches:   ["branches."],
  inventory:  ["inventory."],
  staff:      ["staff."],
  analytics:  ["analytics."],
  reports:    ["reports."],
  settings:   ["settings."],
  pos:        ["pos."],
};

export const getDefaultPermissionsForRole = (role) => {
  const p = PERMISSIONS[role];
  if (!p?.actions) return [];
  if (p.actions.includes("*")) return Object.keys(ACTION_LABELS);
  return p.actions;
};

export const getDefaultNavForRole = (role) => {
  if (role === ROLES.COUNTER || role === "counter") return "counter";
  if (role === ROLES.KITCHEN || role === "kitchen") return "kitchen";
  const pages = PERMISSIONS[role]?.pages;
  if (pages?.includes("*")) return "dashboard";
  if (pages?.length) return pages[0];
  return "dashboard";
};

export const ROLE_LABELS = {
  super_admin:    'Super Admin',
  client_admin:   'Client Admin',
  branch_manager: 'Branch Manager',
  counter:        'Counter Manager',
  editor:         'Menu Editor',
  viewer:         'Viewer',
  kitchen:        'Kitchen Staff',
};

export const ROLE_COLORS = {
  super_admin:    'purple',
  client_admin:   'orange',
  branch_manager: 'blue',
  counter:        'green',
  editor:         'cyan',
  viewer:         'gray',
  kitchen:        'yellow',
};

// ─── GRANULAR PERMISSIONS ─────────────────────────────────────────────────────
// Each permission key maps to a feature/action in the system.
// Pages = which nav pages the role can visit
// Actions = what they can do within those pages
export const PERMISSIONS = {
  super_admin: {
    pages:   ['*'],
    actions: ['*'],
  },
  client_admin: {
    pages:   ['dashboard','branches','products','orders','staff','analytics','settings','reports','inventory','categories','counter','kitchen','pos'],
    actions: [
      'orders.view','orders.create','orders.accept','orders.reject','orders.advance','orders.delete',
      'products.view','products.create','products.edit','products.delete','products.toggle',
      'categories.view','categories.create','categories.edit','categories.delete',
      'branches.view','branches.edit',
      'staff.view','staff.create','staff.edit','staff.delete',
      'inventory.view','inventory.create','inventory.edit','inventory.restock',
      'analytics.view','reports.view','reports.export',
      'settings.profile','settings.notifications','settings.pos','settings.payment','settings.tax','settings.branding','settings.security','settings.api','settings.delivery',
      'counter.view','counter.accept','counter.reject','counter.call_log',
      'kitchen.view','kitchen.advance',
      'pos.view','pos.sync','pos.config',
    ],
  },
  branch_manager: {
    pages:   ['dashboard','products','orders','staff','analytics','inventory','categories','counter','kitchen','pos'],
    actions: [
      'orders.view','orders.create','orders.accept','orders.reject','orders.advance',
      'products.view','products.create','products.edit','products.toggle',
      'categories.view',
      'branches.view',
      'staff.view','staff.create','staff.edit',
      'inventory.view','inventory.create','inventory.edit','inventory.restock',
      'analytics.view','reports.view',
      'settings.profile','settings.notifications',
      'counter.view','counter.accept','counter.reject','counter.call_log',
      'kitchen.view','kitchen.advance',
      'pos.view','pos.sync',
    ],
  },
  counter: {
    pages:   ['counter','orders','dashboard','pos'],
    actions: [
      'orders.view','orders.create','orders.accept','orders.reject',
      'counter.view','counter.accept','counter.reject','counter.call_log',
      'pos.view',
      'settings.profile',
    ],
  },
  editor: {
    pages:   ['products','inventory','categories'],
    actions: [
      'products.view','products.create','products.edit','products.toggle',
      'categories.view','categories.create','categories.edit',
      'inventory.view','inventory.edit',
      'settings.profile',
    ],
  },
  viewer: {
    pages:   ['dashboard','analytics'],
    actions: [
      'orders.view','analytics.view','reports.view',
      'settings.profile',
    ],
  },
  kitchen: {
    pages:   ['kitchen','orders'],
    actions: [
      'orders.view',
      'kitchen.view','kitchen.advance',
      'settings.profile',
    ],
  },
};

// Role-level action descriptions for the UI
export const ACTION_LABELS = {
  'orders.view':           'View Orders',
  'orders.create':         'Create New Orders',
  'orders.accept':         'Accept Orders',
  'orders.reject':         'Reject Orders',
  'orders.advance':        'Advance Order Status',
  'orders.delete':         'Delete Orders',
  'products.view':         'View Menu Products',
  'products.create':       'Add New Products',
  'products.edit':         'Edit Products',
  'products.delete':       'Delete Products',
  'products.toggle':       'Enable/Disable Products',
  'categories.view':       'View Categories',
  'categories.create':     'Add New Categories',
  'categories.edit':       'Edit Categories',
  'categories.delete':     'Delete Categories',
  'branches.view':         'View Branches',
  'branches.edit':         'Edit Branch Settings',
  'staff.view':            'View Staff List',
  'staff.create':          'Invite Staff',
  'staff.edit':            'Edit Staff Details',
  'staff.delete':          'Remove Staff',
  'inventory.view':        'View Inventory',
  'inventory.create':      'Add Inventory Items',
  'inventory.edit':        'Edit Inventory',
  'inventory.restock':     'Restock Items',
  'analytics.view':        'View Analytics',
  'reports.view':          'View Reports',
  'reports.export':        'Export Reports',
  'settings.profile':      'Edit Own Profile',
  'settings.notifications':'Notification Settings',
  'settings.pos':          'POS & Printing Settings',
  'settings.payment':      'Payment Method Settings',
  'settings.tax':          'Tax & Billing Settings',
  'settings.branding':     'Branding Settings',
  'settings.security':     'Security Settings',
  'settings.api':          'API & Integrations',
  'settings.delivery':     'Delivery Zone Settings',
  'counter.view':          'Access Counter Panel',
  'counter.accept':        'Accept COD Orders',
  'counter.reject':        'Reject COD Orders',
  'counter.call_log':      'Log Call Attempts',
  'kitchen.view':          'Access Kitchen Display',
  'kitchen.advance':       'Advance Kitchen Status',
  'pos.view':              'View POS Integration',
  'pos.sync':              'Sync POS Orders',
  'pos.config':            'Configure POS Settings',
};

export const ACTION_GROUPS = {
  'Orders':     ['orders.view','orders.create','orders.accept','orders.reject','orders.advance','orders.delete'],
  'Products':   ['products.view','products.create','products.edit','products.delete','products.toggle'],
  'Categories': ['categories.view','categories.create','categories.edit','categories.delete'],
  'Branches':   ['branches.view','branches.edit'],
  'Staff':      ['staff.view','staff.create','staff.edit','staff.delete'],
  'Inventory':  ['inventory.view','inventory.create','inventory.edit','inventory.restock'],
  'Analytics':  ['analytics.view','reports.view','reports.export'],
  'Settings':   ['settings.profile','settings.notifications','settings.pos','settings.payment','settings.tax','settings.branding','settings.security','settings.api','settings.delivery'],
  'Counter':    ['counter.view','counter.accept','counter.reject','counter.call_log'],
  'Kitchen':    ['kitchen.view','kitchen.advance'],
  'POS':        ['pos.view','pos.sync','pos.config'],
};

export const CONFIRM_STATUS = {
  PENDING_CALL: 'pending_call',
  CALL_DONE:    'call_done',
  CONFIRMED:    'confirmed',
  REJECTED:     'rejected',
  NO_ANSWER:    'no_answer',
};

export const ORDER_SOURCES = {
  COUNTER:   'counter',
  WEBSITE:   'website',
  APP:       'app',
  PHONE:     'phone',
  FOODPANDA: 'foodpanda',
  CAREEM:    'careem',
  POS:       'pos',
};

export const SOURCE_LABELS = {
  counter: 'Counter', website: 'Website', app: 'Mobile App',
  phone: 'Phone', foodpanda: 'Foodpanda', careem: 'Careem Food', pos: 'POS Terminal',
};

export const SOURCE_ICONS = {
  counter: '🏪', website: '🌐', app: '📱', phone: '📞', foodpanda: '🐼', careem: '🚗', pos: '🖥',
};

export const SOURCE_COLORS = {
  counter: '#22c55e', website: '#3b82f6', app: '#a855f7',
  phone: '#eab308', foodpanda: '#ef4444', careem: '#06b6d4', pos: '#10d97e',
};

export const PAYMENT_METHODS = {
  COD: 'cod', CARD: 'card', JAZZCASH: 'jazzcash', EASYPAISA: 'easypaisa', ONLINE: 'online', POS_CASH: 'pos_cash',
};

export const PAYMENT_LABELS = {
  cod: 'Cash on Delivery', card: 'Card / POS',
  jazzcash: 'JazzCash', easypaisa: 'Easypaisa', online: 'Online Banking', pos_cash: 'POS Cash',
};

export const ORDER_TYPES = {
  DINE_IN:   'dine-in',
  TAKEAWAY:  'takeaway',
  DELIVERY:  'delivery',
};

export const ORDER_TYPE_LABELS = { 'dine-in': 'Dine-in', takeaway: 'Takeaway', delivery: 'Delivery' };

export const CITIES = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta', 'Hyderabad', 'Sialkot'];

export const CUISINES = ['Fast Food', 'Pakistani', 'Chinese', 'BBQ', 'Pizza', 'Seafood', 'Continental', 'Desi', 'Desserts', 'Beverages'];

export const ALLERGENS_LIST = ['gluten', 'dairy', 'egg', 'nuts', 'soy', 'shellfish', 'sesame'];

export const STOCK_OPTIONS = ['unlimited', 'limited', 'out_of_stock'];

export const POS_SYSTEMS = ['None', 'FoodPOS Pro', 'RestoPOS', 'Odoo', 'Oracle MICROS', 'Lightspeed', 'Square', 'Custom API'];

export const PRINTER_MODELS = ['Epson TM-T88VI', 'Star TSP650II', 'Bixolon SRP-350', 'Citizen CT-S651', 'Custom TK302'];

export const CURRENCIES = ['PKR', 'USD', 'EUR', 'GBP', 'AED', 'SAR'];

export const TAX_TYPES = ['Inclusive', 'Exclusive'];

// ─── CLIENTS ─────────────────────────────────────────────────────────────────
export const clients = [
  { id:'c1', name:'BurgerBlast Co.', logo:'BB', plan:'Enterprise', branches:5, color:'#f97316', status:'active', joinedDate:'2024-01-15', cuisine:'Fast Food', posSystem:'FoodPOS Pro' },
  { id:'c2', name:'Pizza Palace',    logo:'PP', plan:'Pro',        branches:3, color:'#ef4444', status:'active', joinedDate:'2024-03-20', cuisine:'Pizza',    posSystem:'RestoPOS'    },
  { id:'c3', name:'Wok & Roll',      logo:'WR', plan:'Pro',        branches:2, color:'#a855f7', status:'active', joinedDate:'2024-06-01', cuisine:'Chinese',  posSystem:'None'        },
];

// ─── BRANCHES ────────────────────────────────────────────────────────────────
export const branches = [
  { id:'b1', clientId:'c1', name:'Downtown Hub',    address:'12 Main St, City Center', city:'Karachi', phone:'+92-21-3456789', status:'open',        manager:'u3', revenue:184200, orders:1240, rating:4.7, tables:28, staff:12, avgPrep:8.2,  openTime:'08:00', closeTime:'23:00', posEnabled:true,  posSystem:'FoodPOS Pro', posLastSync: new Date(Date.now()-120000) },
  { id:'b2', clientId:'c1', name:'North Clifton',   address:'45 Sea View Blvd',        city:'Karachi', phone:'+92-21-9876543', status:'open',        manager:'u4', revenue:142600, orders:980,  rating:4.5, tables:20, staff:9,  avgPrep:9.1,  openTime:'09:00', closeTime:'22:00', posEnabled:true,  posSystem:'FoodPOS Pro', posLastSync: new Date(Date.now()-300000) },
  { id:'b3', clientId:'c1', name:'DHA Branch',      address:'7 Khayaban-e-Ittehad',    city:'Karachi', phone:'+92-21-5554321', status:'open',        manager:'u5', revenue:196800, orders:1380, rating:4.8, tables:32, staff:14, avgPrep:7.8,  openTime:'10:00', closeTime:'24:00', posEnabled:true,  posSystem:'FoodPOS Pro', posLastSync: new Date(Date.now()-60000)  },
  { id:'b4', clientId:'c1', name:'Gulshan Outlet',  address:'33 Block 9, Gulshan',     city:'Karachi', phone:'+92-21-3214567', status:'maintenance', manager:'u6', revenue:98400,  orders:640,  rating:4.2, tables:18, staff:8,  avgPrep:11.4, openTime:'09:00', closeTime:'22:00', posEnabled:false, posSystem:'None',        posLastSync: null },
  { id:'b5', clientId:'c1', name:'Airport Express', address:'Terminal 2, JIAP',        city:'Karachi', phone:'+92-21-9991234', status:'open',        manager:'u7', revenue:221500, orders:1720, rating:4.6, tables:40, staff:18, avgPrep:6.9,  openTime:'05:00', closeTime:'02:00', posEnabled:true,  posSystem:'FoodPOS Pro', posLastSync: new Date(Date.now()-900000) },
];

// ─── USERS ───────────────────────────────────────────────────────────────────
export const users = [
  { id:'u1', name:'Agency Admin',   email:'admin@foodflow.agency',    password:'admin123',   role:ROLES.SUPER_ADMIN,    clientId:null, branchIds:[], avatar:'AA', color:'#a855f7', status:'online',  lastSeen:new Date(), createdAt:'2024-01-01' },
  { id:'u2', name:'Sara Khan',      email:'sara@burgerblast.com',     password:'sara123',    role:ROLES.CLIENT_ADMIN,   clientId:'c1', branchIds:['b1','b2','b3','b4','b5'], avatar:'SK', color:'#f97316', status:'online',  lastSeen:new Date(), createdAt:'2024-01-15' },
  { id:'u3', name:'Omar Sheikh',    email:'omar@burgerblast.com',     password:'omar123',    role:ROLES.BRANCH_MANAGER, clientId:'c1', branchIds:['b1'], avatar:'OS', color:'#3b82f6', status:'online',  lastSeen:new Date(), createdAt:'2024-02-01' },
  { id:'u4', name:'Aisha Malik',    email:'aisha@burgerblast.com',    password:'aisha123',   role:ROLES.BRANCH_MANAGER, clientId:'c1', branchIds:['b2'], avatar:'AM', color:'#22c55e', status:'away',    lastSeen:new Date(Date.now()-1800000), createdAt:'2024-02-10' },
  { id:'u5', name:'Zain Ahmed',     email:'zain@burgerblast.com',     password:'zain123',    role:ROLES.BRANCH_MANAGER, clientId:'c1', branchIds:['b3'], avatar:'ZA', color:'#eab308', status:'online',  lastSeen:new Date(), createdAt:'2024-03-01' },
  { id:'u6', name:'Fatima Raza',    email:'fatima@burgerblast.com',   password:'fatima123',  role:ROLES.EDITOR,         clientId:'c1', branchIds:['b1','b2'], avatar:'FR', color:'#ef4444', status:'offline', lastSeen:new Date(Date.now()-86400000), createdAt:'2024-04-01' },
  { id:'u7', name:'Hassan Iqbal',   email:'hassan@burgerblast.com',   password:'hassan123',  role:ROLES.BRANCH_MANAGER, clientId:'c1', branchIds:['b5'], avatar:'HI', color:'#06b6d4', status:'online',  lastSeen:new Date(), createdAt:'2024-05-01' },
  { id:'u8', name:'Bilal Counter',  email:'counter@burgerblast.com',  password:'counter123', role:ROLES.COUNTER,        clientId:'c1', branchIds:['b1'], avatar:'BC', color:'#22c55e', status:'online',  lastSeen:new Date(), createdAt:'2024-06-01' },
  { id:'u9', name:'Chef Khalid',    email:'kitchen@burgerblast.com',  password:'kitchen123', role:ROLES.KITCHEN,        clientId:'c1', branchIds:['b1'], avatar:'CK', color:'#f97316', status:'online',  lastSeen:new Date(), createdAt:'2024-06-01' },
];

// ─── CATEGORIES ───────────────────────────────────────────────────────────────
export const categories = [
  { id:'cat1', clientId:'c1', name:'Burgers',   icon:'B', color:'#f97316', sortOrder:1, active:true  },
  { id:'cat2', clientId:'c1', name:'Sides',     icon:'S', color:'#eab308', sortOrder:2, active:true  },
  { id:'cat3', clientId:'c1', name:'Drinks',    icon:'D', color:'#3b82f6', sortOrder:3, active:true  },
  { id:'cat4', clientId:'c1', name:'Desserts',  icon:'Ds', color:'#ec4899', sortOrder:4, active:true  },
  { id:'cat5', clientId:'c1', name:'Combos',    icon:'C', color:'#22c55e', sortOrder:5, active:true  },
  { id:'cat6', clientId:'c1', name:'Breakfast', icon:'Br', color:'#a855f7', sortOrder:6, active:false },
];

// ─── PRODUCTS ────────────────────────────────────────────────────────────────
export const products = [
  { id:'p1',  clientId:'c1', categoryId:'cat1', name:'Classic Smash Burger',  description:'Two smashed beef patties, cheddar, special sauce, brioche bun', price:850,  cost:310,  image:'B',  sku:'BRG-001', tags:['bestseller'], calories:680, prepTime:8,  active:true,  featured:true,  stock:'unlimited', allergens:['gluten','dairy'],       createdAt:'2024-01-20', sold:342, trend:+12, rating:4.8 },
  { id:'p2',  clientId:'c1', categoryId:'cat1', name:'Crispy Chicken Burger', description:'Buttermilk fried chicken, coleslaw, pickles, chipotle mayo',    price:780,  cost:280,  image:'CB', sku:'BRG-002', tags:['popular'],    calories:620, prepTime:10, active:true,  featured:false, stock:'unlimited', allergens:['gluten','dairy','egg'],  createdAt:'2024-01-20', sold:289, trend:+5,  rating:4.6 },
  { id:'p3',  clientId:'c1', categoryId:'cat1', name:'BBQ Bacon Stack',       description:'Triple patty, crispy bacon, onion rings, BBQ sauce',             price:1150, cost:420,  image:'BB', sku:'BRG-003', tags:['premium'],    calories:980, prepTime:12, active:true,  featured:true,  stock:'unlimited', allergens:['gluten','dairy'],       createdAt:'2024-02-05', sold:187, trend:+22, rating:4.9 },
  { id:'p4',  clientId:'c1', categoryId:'cat1', name:'Veggie Delight',        description:'Plant-based patty, avocado, sprouts, vegan mayo',               price:720,  cost:240,  image:'VB', sku:'BRG-004', tags:['vegan'],      calories:480, prepTime:7,  active:false, featured:false, stock:'unlimited', allergens:['gluten'],               createdAt:'2024-03-01', sold:134, trend:-8,  rating:4.3 },
  { id:'p5',  clientId:'c1', categoryId:'cat2', name:'Loaded Fries',          description:'Seasoned fries, cheese sauce, jalapeños, sour cream',           price:450,  cost:130,  image:'LF', sku:'SID-001', tags:['popular'],    calories:520, prepTime:5,  active:true,  featured:false, stock:'unlimited', allergens:['gluten','dairy'],       createdAt:'2024-01-20', sold:512, trend:-3,  rating:4.4 },
  { id:'p6',  clientId:'c1', categoryId:'cat2', name:'Onion Rings',           description:'Beer-battered jumbo onion rings, ranch dip',                    price:350,  cost:100,  image:'OR', sku:'SID-002', tags:[],             calories:410, prepTime:5,  active:true,  featured:false, stock:'unlimited', allergens:['gluten','dairy'],       createdAt:'2024-01-20', sold:198, trend:+2,  rating:4.2 },
  { id:'p7',  clientId:'c1', categoryId:'cat3', name:'Classic Cola',          description:'350ml fountain drink',                                          price:150,  cost:40,   image:'CC', sku:'DRK-001', tags:[],             calories:140, prepTime:1,  active:true,  featured:false, stock:'unlimited', allergens:[],                       createdAt:'2024-01-20', sold:620, trend:+1,  rating:4.1 },
  { id:'p8',  clientId:'c1', categoryId:'cat3', name:'Thick Milkshake',       description:'Chocolate, Vanilla or Strawberry',                              price:420,  cost:140,  image:'MS', sku:'DRK-002', tags:['popular'],    calories:580, prepTime:3,  active:true,  featured:true,  stock:'unlimited', allergens:['dairy'],                createdAt:'2024-01-20', sold:398, trend:+9,  rating:4.7 },
  { id:'p9',  clientId:'c1', categoryId:'cat5', name:'Family Combo',          description:'6 burgers, 3 large fries, 6 drinks',                            price:4500, cost:1600, image:'FC', sku:'CMB-001', tags:['value','bestseller'], calories:3200, prepTime:20, active:true, featured:true, stock:'unlimited', allergens:['gluten','dairy'], createdAt:'2024-04-01', sold:143, trend:+18, rating:4.8 },
  { id:'p10', clientId:'c1', categoryId:'cat4', name:'Molten Lava Cake',      description:'Warm chocolate cake, vanilla ice cream',                        price:380,  cost:110,  image:'ML', sku:'DST-001', tags:['new'],        calories:520, prepTime:8,  active:true,  featured:false, stock:'limited',   allergens:['gluten','dairy','egg'], createdAt:'2025-01-15', sold:201, trend:+7,  rating:4.6 },
];

// ─── INVENTORY ───────────────────────────────────────────────────────────────
export const inventory = [
  { id:'inv1', branchId:'b1', name:'Beef Patty (100g)',  unit:'kg',  quantity:45,  reorderPoint:20,  reorderQty:50,  cost:1200, supplier:'FreshMeat Co.',  lastRestocked:'2025-06-01', category:'Meat'      },
  { id:'inv2', branchId:'b1', name:'Brioche Buns',       unit:'pcs', quantity:6,   reorderPoint:200, reorderQty:500, cost:35,   supplier:'Bakers Plus',    lastRestocked:'2025-06-03', category:'Bread'     },
  { id:'inv3', branchId:'b1', name:'Cheddar Slices',     unit:'pcs', quantity:12,  reorderPoint:100, reorderQty:300, cost:25,   supplier:'DairyFarm Co.',  lastRestocked:'2025-05-28', category:'Dairy'     },
  { id:'inv4', branchId:'b1', name:'Frying Oil',         unit:'L',   quantity:28,  reorderPoint:15,  reorderQty:40,  cost:280,  supplier:'OilsRUs',        lastRestocked:'2025-05-30', category:'Oil'       },
  { id:'inv5', branchId:'b1', name:'Potatoes (Fries)',   unit:'kg',  quantity:90,  reorderPoint:30,  reorderQty:100, cost:80,   supplier:'FarmFresh',      lastRestocked:'2025-06-02', category:'Produce'   },
  { id:'inv6', branchId:'b1', name:'Cola Syrup',         unit:'L',   quantity:18,  reorderPoint:10,  reorderQty:30,  cost:850,  supplier:'BevCo',          lastRestocked:'2025-05-25', category:'Beverages' },
  { id:'inv7', branchId:'b1', name:'Chicken Breast',     unit:'kg',  quantity:32,  reorderPoint:25,  reorderQty:50,  cost:980,  supplier:'FreshMeat Co.',  lastRestocked:'2025-06-01', category:'Meat'      },
  { id:'inv8', branchId:'b1', name:'Frozen Fries',       unit:'kg',  quantity:67,  reorderPoint:30,  reorderQty:80,  cost:280,  supplier:'FrozenPro',      lastRestocked:'2025-06-01', category:'Frozen'    },
];

// ─── NOTIFICATIONS — with navTarget for deep linking ──────────────────────────
export const notifications = [
  { id:'n1', type:'order',  title:'New Web Order Pending',     message:'COD — Ali Hassan · PKR 2,150 — Needs confirmation call', time:new Date(Date.now()-120000),   read:false, branchId:'b1', priority:'high',   navTarget:'counter', navParam:null },
  { id:'n2', type:'order',  title:'New App Order Pending',     message:'COD — Sana Javed · PKR 1,890 — Needs confirmation call', time:new Date(Date.now()-240000),   read:false, branchId:'b1', priority:'high',   navTarget:'counter', navParam:null },
  { id:'n3', type:'alert',  title:'Low Stock Alert',           message:'Brioche Buns critically low (6 pcs) at Downtown Hub',    time:new Date(Date.now()-600000),   read:false, branchId:'b1', priority:'high',   navTarget:'inventory', navParam:null },
  { id:'n4', type:'pos',    title:'POS Order Received',        message:'Table 7 · PKR 1,250 — Downtown Hub POS',                 time:new Date(Date.now()-800000),   read:false, branchId:'b1', priority:'normal', navTarget:'pos', navParam:null },
  { id:'n5', type:'order',  title:'Order Ready — ORD-0042',    message:'Table 7 — Order is ready to serve',                      time:new Date(Date.now()-900000),   read:true,  branchId:'b1', priority:'normal', navTarget:'orders', navParam:'ORD-0042' },
  { id:'n6', type:'review', title:'New 5-Star Review',         message:'"Amazing burgers!" — Bilal Raza at DHA Branch',          time:new Date(Date.now()-7200000),  read:true,  branchId:'b3', priority:'normal', navTarget:'analytics', navParam:null },
  { id:'n7', type:'alert',  title:'Branch Under Maintenance',  message:'Gulshan Outlet has reported technical issues',           time:new Date(Date.now()-14400000), read:false, branchId:'b4', priority:'high',   navTarget:'branches', navParam:'b4' },
  { id:'n8', type:'pos',    title:'POS Sync Alert',            message:'Airport Express POS sync delay — last sync 15min ago',   time:new Date(Date.now()-18000000), read:false, branchId:'b5', priority:'high',   navTarget:'pos', navParam:null },
  { id:'n9', type:'system', title:'Weekly Report Ready',       message:'Your June 1-7 performance report is ready to download',  time:new Date(Date.now()-86400000), read:true,  branchId:null, priority:'normal', navTarget:'reports', navParam:null },
];

// ─── POS TRANSACTIONS ─────────────────────────────────────────────────────────
export function generatePOSTransactions() {
  const txns = [];
  const today = new Date();
  for (let d = 6; d >= 0; d--) {
    const date = new Date(today); date.setDate(today.getDate() - d);
    const count = Math.floor(Math.random()*30)+15;
    for (let i=0; i<count; i++) {
      const branch = branches.filter(b=>b.posEnabled)[Math.floor(Math.random()*branches.filter(b=>b.posEnabled).length)];
      const items = products.slice(0,Math.floor(Math.random()*3)+1).map(p=>({name:p.name,qty:Math.floor(Math.random()*2)+1,price:p.price}));
      const total = items.reduce((s,x)=>s+(x.price*x.qty),0);
      const hour = Math.floor(Math.random()*14)+8;
      txns.push({
        id: `POS-${branch.id}-${Date.now()}-${i}`,
        branchId: branch.id,
        branchName: branch.name,
        posSystem: branch.posSystem,
        items,
        total: Math.round(total*1.16),
        subtotal: total,
        tax: Math.round(total*0.16),
        paymentMethod: ['cash','card','jazzcash'][Math.floor(Math.random()*3)],
        cashier: `Cashier ${Math.floor(Math.random()*3)+1}`,
        tableNo: Math.floor(Math.random()*20)+1,
        createdAt: new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, Math.floor(Math.random()*60)),
        synced: Math.random()>0.1,
        status: 'completed',
      });
    }
  }
  return txns.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
}
export const posTransactions = generatePOSTransactions();

// ─── GENERATE ORDERS ─────────────────────────────────────────────────────────
const CUST_NAMES = ['Ali Hassan','Sana Javed','Bilal Raza','Hina Mir','Usman Ali','Zara Khan','Tariq Butt','Mehwish Shah','Kamran Akmal','Ayesha Siddiqui','Faisal Qureshi','Nida Yasir','Danish Taimoor','Minal Khan','Ahsan Iqbal'];
const STATUSES   = ['pending','confirmed','preparing','ready','delivered','cancelled'];
const SOURCES    = [['counter',30],['app',22],['website',18],['pos',15],['foodpanda',10],['phone',3],['careem',2]];
const PAYMENTS   = [['cod',45],['card',30],['jazzcash',15],['easypaisa',10]];

function wRandom(arr) {
  const total = arr.reduce((s,[,w])=>s+w,0);
  let r = Math.random()*total;
  for (const [v,w] of arr) { r-=w; if(r<=0) return v; }
  return arr[arr.length-1][0];
}

function generateOrders() {
  const out=[];
  let id=1;
  const today=new Date();
  for (let d=29;d>=0;d--) {
    const date=new Date(today); date.setDate(today.getDate()-d);
    const count=Math.floor(Math.random()*40)+20;
    for (let i=0;i<count;i++) {
      const branch=branches[Math.floor(Math.random()*branches.length)];
      const source=wRandom(SOURCES);
      const payment=wRandom(PAYMENTS);
      const isOnline=['website','app','foodpanda','careem'].includes(source);
      const isCOD=payment==='cod';
      const needsConfirm=isOnline&&isCOD;
      const itemCount=Math.floor(Math.random()*3)+1;
      const items=[]; let total=0;
      for (let j=0;j<itemCount;j++) {
        const p=products[Math.floor(Math.random()*products.length)];
        const qty=Math.floor(Math.random()*3)+1;
        items.push({productId:p.id,name:p.name,qty,price:p.price,total:p.price*qty,image:p.image});
        total+=p.price*qty;
      }
      const status=d===0?STATUSES[Math.floor(Math.random()*5)]:'delivered';
      const confirmStatus=needsConfirm&&d<=1
        ?[CONFIRM_STATUS.PENDING_CALL,CONFIRM_STATUS.CALL_DONE,CONFIRM_STATUS.CONFIRMED,CONFIRM_STATUS.NO_ANSWER][Math.floor(Math.random()*4)]
        :needsConfirm?CONFIRM_STATUS.CONFIRMED:null;
      const hour=Math.floor(Math.random()*14)+8;
      out.push({
        id:`ORD-${String(id).padStart(4,'0')}`,
        branchId:branch.id, clientId:branch.clientId,
        status, confirmStatus, source, paymentMethod:payment,
        type:source==='counter'||source==='pos'?'dine-in':['dine-in','takeaway','delivery'][Math.floor(Math.random()*3)],
        items, subtotal:total, tax:Math.round(total*0.16), discount:Math.random()>0.8?Math.round(total*0.1):0,
        total:Math.round(total*1.16),
        customerName:CUST_NAMES[Math.floor(Math.random()*CUST_NAMES.length)],
        customerPhone:`03${Math.floor(Math.random()*4)}${Math.floor(1000000+Math.random()*9000000)}`,
        customerAddress:isOnline?`House ${Math.floor(Math.random()*200)+1}, Block ${Math.floor(Math.random()*10)+1}, Karachi`:null,
        tableNo:source==='counter'||source==='pos'?Math.floor(Math.random()*30)+1:null,
        createdAt:new Date(date.getFullYear(),date.getMonth(),date.getDate(),hour,Math.floor(Math.random()*60)),
        completedAt:d>0?new Date(date.getFullYear(),date.getMonth(),date.getDate(),hour+1):null,
        note:Math.random()>0.8?'No onions please':'',
        rating:d>0&&Math.random()>0.5?(Math.floor(Math.random()*2)+4):null,
        callAttempts:confirmStatus===CONFIRM_STATUS.NO_ANSWER?Math.floor(Math.random()*3)+1:0,
        rejectionReason:confirmStatus===CONFIRM_STATUS.REJECTED?'Customer unreachable after 3 attempts':null,
        posSync: source==='pos',
      });
      id++;
    }
  }
  return out.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
}
export const orders = generateOrders();

// ─── ANALYTICS HELPERS ───────────────────────────────────────────────────────
export function getRevenueByDay(branchId, days=30) {
  const result=[];
  const today=new Date();
  for (let i=days-1;i>=0;i--) {
    const date=new Date(today); date.setDate(today.getDate()-i);
    const dayOrders=orders.filter(o=>{
      if(branchId&&o.branchId!==branchId) return false;
      const od=o.createdAt;
      return od.getDate()===date.getDate()&&od.getMonth()===date.getMonth()&&od.getFullYear()===date.getFullYear();
    });
    const posRevenue=dayOrders.filter(o=>o.source==='pos').reduce((s,o)=>s+o.total,0);
    result.push({
      date:date.toLocaleDateString('en-US',{month:'short',day:'numeric'}),
      revenue:dayOrders.reduce((s,o)=>s+o.total,0),
      orders:dayOrders.length,
      posRevenue,
      onlineRevenue:dayOrders.filter(o=>['website','app','foodpanda','careem'].includes(o.source)).reduce((s,o)=>s+o.total,0),
      target:140000,
    });
  }
  return result;
}

export function getAllStats(clientId='c1', branchId=null) {
  const clientBranches = branchId
    ? branches.filter(b=>b.id===branchId)
    : branches.filter(b=>b.clientId===clientId);
  const branchIds = clientBranches.map(b=>b.id);
  const clientOrders = orders.filter(o => branchIds.includes(o.branchId));
  const today=new Date();
  const todayOrders=clientOrders.filter(o=>o.createdAt.toDateString()===today.toDateString());
  const weekAgo=new Date(Date.now()-7*86400000);
  const thisWeek=clientOrders.filter(o=>o.createdAt>=weekAgo);
  const prevWeek=clientOrders.filter(o=>{const d=o.createdAt;return d>=new Date(Date.now()-14*86400000)&&d<weekAgo;});
  const posOrders=clientOrders.filter(o=>o.source==='pos');
  const todayPOS=todayOrders.filter(o=>o.source==='pos');
  return {
    activeBranches:    clientBranches.filter(b=>b.status==='open').length,
    totalBranches:     clientBranches.length,
    posBranches:       clientBranches.filter(b=>b.posEnabled).length,
    todayOrders:       todayOrders.length,
    todayRevenue:      todayOrders.reduce((s,o)=>s+o.total,0),
    todayPOSRevenue:   todayPOS.reduce((s,o)=>s+o.total,0),
    todayPOSOrders:    todayPOS.length,
    weekRevenue:       thisWeek.reduce((s,o)=>s+o.total,0),
    weekGrowth:        prevWeek.length?((thisWeek.reduce((s,o)=>s+o.total,0)-prevWeek.reduce((s,o)=>s+o.total,0))/prevWeek.reduce((s,o)=>s+o.total,1)*100).toFixed(1):'0',
    pendingOrders:     clientOrders.filter(o=>['pending','confirmed','preparing','ready'].includes(o.status)).length,
    codPending:        clientOrders.filter(o=>o.confirmStatus==='pending_call').length,
    avgRating:         clientBranches.length?(clientBranches.reduce((s,b)=>s+b.rating,0)/clientBranches.length).toFixed(1):'0',
    topBranch:         clientBranches.reduce((a,b)=>a.revenue>b.revenue?a:b, clientBranches[0]||{}),
    posRevenue:        posOrders.reduce((s,o)=>s+o.total,0),
    posOrderCount:     posOrders.length,
    totalRevenue:      clientOrders.reduce((s,o)=>s+o.total,0),
  };
}
