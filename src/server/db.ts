import fs from 'node:fs';
import path from 'node:path';
import bcrypt from 'bcryptjs';
import type {
  User,
  Category,
  Brand,
  Vehicle,
  VehicleModel,
  VehicleCompatibility,
  Product,
  CartItem,
  Order,
  OrderItem,
  Payment,
  DiscountCoupon,
  StoreSettings,
  Role,
  OrderStatus,
  PaymentStatus,
} from '../types/index.ts';

// Relational database interface with all required tables
export interface DatabaseSchema {
  users: (User & { passwordHash: string })[];
  roles: { id: string; name: Role; permissions: string[] }[];
  categories: Category[];
  brands: Brand[];
  vehicles: Vehicle[];
  vehicleModels: VehicleModel[];
  vehicleCompatibility: VehicleCompatibility[];
  products: Product[];
  carts: { [userIdOrSession: string]: CartItem[] };
  orders: Order[];
  payments: Payment[];
  discounts: DiscountCoupon[];
  adminLogs: {
    id: string;
    userId: string;
    userName: string;
    action: string;
    targetType: string;
    targetId: string;
    details: string;
    createdAt: string;
  }[];
  notifications: {
    id: string;
    userId?: string;
    title: string;
    message: string;
    type: 'order' | 'system' | 'inventory' | 'payment';
    isRead: boolean;
    createdAt: string;
  }[];
  settings: StoreSettings;
}

const DB_FILE_PATH = path.resolve(process.cwd(), 'data', 'yadak_database.json');

// Ensure data directory exists
function ensureDataDir() {
  const dir = path.dirname(DB_FILE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Generate unique ID helper
export function generateId(prefix = 'id'): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
}

// Initial Seed Data Generator
function generateInitialDatabase(): DatabaseSchema {
  const now = new Date().toISOString();

  // Salt and hash for standard demo passwords
  const salt = bcrypt.genSaltSync(10);
  const adminPasswordHash = bcrypt.hashSync('admin123456', salt);
  const customerPasswordHash = bcrypt.hashSync('user123456', salt);

  const roles = [
    { id: 'r_1', name: 'super_admin' as Role, permissions: ['all'] },
    { id: 'r_2', name: 'admin' as Role, permissions: ['products', 'orders', 'customers', 'reports'] },
    { id: 'r_3', name: 'customer' as Role, permissions: ['profile', 'orders_own'] },
  ];

  const users: (User & { passwordHash: string })[] = [
    {
      id: 'usr_admin',
      name: 'مهندس حسینی (مدیر سیستم)',
      phone: '09121112233',
      email: 'admin@yadakpart.ir',
      passwordHash: adminPasswordHash,
      role: 'super_admin',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'usr_customer_1',
      name: 'علیرضا شفق',
      phone: '09351234567',
      email: 'customer@gmail.com',
      passwordHash: customerPasswordHash,
      role: 'customer',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'usr_customer_2',
      name: 'محمدرضا کاظمی',
      phone: '09197778899',
      email: 'm.kazemi@yahoo.com',
      passwordHash: customerPasswordHash,
      role: 'customer',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
  ];

  const categories: Category[] = [
    { id: 'cat_brakes', name: 'ترمز و متعلقات', slug: 'brakes', icon: 'Disc', description: 'انواع لنت ترمز جلو و عقب، دیسک ترمز، بوستر و روغن ترمز' },
    { id: 'cat_engine', name: 'موتور و قطعات فنی', slug: 'engine', icon: 'Cog', description: 'شمع، وایر، سوپاپ، سرسیلندر، تسمه تایم و بلبرینگ' },
    { id: 'cat_filters', name: 'فیلترها و صافی‌ها', slug: 'filters', icon: 'Filter', description: 'فیلتر روغن، فیلتر هوا، فیلتر کابین و فیلتر بنزین' },
    { id: 'cat_suspension', name: 'جلوبندی و سیستم تعلیق', slug: 'suspension', icon: 'Layers', description: 'کمک فنر، طبق، سیبک، میل تعادل و بوش‌ها' },
    { id: 'cat_cooling', name: 'سیستم خنک‌کننده', slug: 'cooling', icon: 'Thermometer', description: 'رادیاتور آب، ترموستات، واترپمپ، درب رادیاتور و فن' },
    { id: 'cat_electrical', name: 'برق و روشنایی', slug: 'electrical', icon: 'Zap', description: 'باتری، چراغ جلو، چراغ عقب، دینام و استارت' },
    { id: 'cat_oils', name: 'روغن و سیالات', slug: 'oils', icon: 'Droplet', description: 'روغن موتور استاندارد، روغن گیربکس و ضدیخ' },
    { id: 'cat_consumables', name: 'لوازم مصرفی', slug: 'consumables', icon: 'Sparkles', description: 'تیغه برف‌پاک‌کن، لامپ، مکمل سوخت و شیشه‌شور' },
    { id: 'cat_transmission', name: 'انتقال قدرت و گیربکس', slug: 'transmission', icon: 'Cpu', description: 'دیسک و صفحه کلاچ، بلبرینگ کلاچ و سرپلوس' },
    { id: 'cat_body', name: 'بدنه و تزیینات', slug: 'body', icon: 'Shield', description: 'آینه‌های بغل، دستگیره‌ها، زه‌های بدنه و سپر' },
  ];

  const brands: Brand[] = [
    { id: 'br_isaco', name: 'ایساکو (ISACO)', slug: 'isaco', logo: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=120&q=80', country: 'ایران' },
    { id: 'br_saipayadak', name: 'سایپا یدک', slug: 'saipa-yadak', logo: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=120&q=80', country: 'ایران' },
    { id: 'br_bosch', name: 'بوش (Bosch)', slug: 'bosch', logo: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=120&q=80', country: 'آلمان' },
    { id: 'br_textar', name: 'تکستار (Textar)', slug: 'textar', logo: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=120&q=80', country: 'آلمان' },
    { id: 'br_valeo', name: 'والئو (Valeo)', slug: 'valeo', logo: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=120&q=80', country: 'فرانسه' },
    { id: 'br_behran', name: 'روغن موتور بهران', slug: 'behran', logo: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=120&q=80', country: 'ایران' },
    { id: 'br_mann', name: 'مان فیلتر (Mann-Filter)', slug: 'mann', logo: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=120&q=80', country: 'آلمان' },
    { id: 'br_amirnia', name: 'امیرنیا (Amirnia)', slug: 'amirnia', logo: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=120&q=80', country: 'ایران' },
    { id: 'br_ezam', name: 'عظام (Ezam)', slug: 'ezam', logo: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=120&q=80', country: 'ایران' },
    { id: 'br_castrol', name: 'کاسترول (Castrol)', slug: 'castrol', logo: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=120&q=80', country: 'انگلستان' },
    { id: 'br_mobis', name: 'موبیس (Mobis)', slug: 'mobis', logo: 'https://images.unsplash.com/photo-1541348263662-e0c8de4259ba?auto=format&fit=crop&w=120&q=80', country: 'کره جنوبی' },
    { id: 'br_ngk', name: 'ان‌جی‌کی (NGK)', slug: 'ngk', logo: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=120&q=80', country: 'ژاپن' },
  ];

  const vehicles: Vehicle[] = [
    { id: 'veh_peugeot', make: 'پژو (Peugeot)', country: 'فرانسه/ایران' },
    { id: 'veh_saipa', make: 'سایپا (Saipa)', country: 'ایران' },
    { id: 'veh_ikco', make: 'ایران‌خودرو (IKCO)', country: 'ایران' },
    { id: 'veh_hyundai', make: 'هیوندای (Hyundai)', country: 'کره جنوبی' },
    { id: 'veh_kia', make: 'کیا (Kia)', country: 'کره جنوبی' },
    { id: 'veh_renault', make: 'رنو (Renault)', country: 'فرانسه' },
  ];

  const vehicleModels: VehicleModel[] = [
    { id: 'vm_peugeot_206_t5', vehicleId: 'veh_peugeot', vehicleMake: 'پژو (Peugeot)', modelName: 'پژو 206 تیپ 5 (موتور TU5)', yearStart: 1385, yearEnd: 1402 },
    { id: 'vm_peugeot_206_t2', vehicleId: 'veh_peugeot', vehicleMake: 'پژو (Peugeot)', modelName: 'پژو 206 تیپ 2 (موتور TU3)', yearStart: 1382, yearEnd: 1401 },
    { id: 'vm_peugeot_405', vehicleId: 'veh_peugeot', vehicleMake: 'پژو (Peugeot)', modelName: 'پژو 405 (موتور XU7)', yearStart: 1380, yearEnd: 1399 },
    { id: 'vm_peugeot_pars', vehicleId: 'veh_peugeot', vehicleMake: 'پژو (Peugeot)', modelName: 'پژو پارس (ساده و ELX / موتور TU5 و XU7)', yearStart: 1383, yearEnd: 1403 },
    { id: 'vm_peugeot_207', vehicleId: 'veh_peugeot', vehicleMake: 'پژو (Peugeot)', modelName: 'پژو 207i دنده‌ای و اتوماتیک', yearStart: 1389, yearEnd: 1403 },

    { id: 'vm_pride_all', vehicleId: 'veh_saipa', vehicleMake: 'سایپا (Saipa)', modelName: 'پراید (صبا، 131، 111، 132، 141)', yearStart: 1378, yearEnd: 1399 },
    { id: 'vm_tiba', vehicleId: 'veh_saipa', vehicleMake: 'سایپا (Saipa)', modelName: 'تیبا 1 و تیبا 2 (موتور M15)', yearStart: 1389, yearEnd: 1401 },
    { id: 'vm_saina_quick', vehicleId: 'veh_saipa', vehicleMake: 'سایپا (Saipa)', modelName: 'ساینا و کوییک (دنده‌ای و اتومات)', yearStart: 1395, yearEnd: 1403 },
    { id: 'vm_shahin', vehicleId: 'veh_saipa', vehicleMake: 'سایپا (Saipa)', modelName: 'شاهین G و GL توربو', yearStart: 1400, yearEnd: 1403 },

    { id: 'vm_samand_ef7', vehicleId: 'veh_ikco', vehicleMake: 'ایران‌خودرو (IKCO)', modelName: 'سمند LX و EF7 پایه گازسوز/بنزینی', yearStart: 1387, yearEnd: 1401 },
    { id: 'vm_dena_plus', vehicleId: 'veh_ikco', vehicleMake: 'ایران‌خودرو (IKCO)', modelName: 'دنا و دنا پلاس (توربو و ساده)', yearStart: 1394, yearEnd: 1403 },
    { id: 'vm_tara', vehicleId: 'veh_ikco', vehicleMake: 'ایران‌خودرو (IKCO)', modelName: 'تارا V1 و V2 دستی و اتوماتیک', yearStart: 1400, yearEnd: 1403 },

    { id: 'vm_tondar90', vehicleId: 'veh_renault', vehicleMake: 'رنو (Renault)', modelName: 'تندر 90 (ال 90) و ساندرو', yearStart: 1386, yearEnd: 1398 },
    { id: 'vm_santafe', vehicleId: 'veh_hyundai', vehicleMake: 'هیوندای (Hyundai)', modelName: 'هیوندای سانتافه (مدل 2014 تا 2018)', yearStart: 1393, yearEnd: 1398 },
    { id: 'vm_cerato', vehicleId: 'veh_kia', vehicleMake: 'کیا (Kia)', modelName: 'کیا سراتو سایپایی و وارداتی (1600 و 2000)', yearStart: 1393, yearEnd: 1398 },
  ];

  // 24 realistic automotive products with real images, SKUs, pricing and wholesale margins
  const rawProducts: {
    id: string;
    name: string;
    slug: string;
    sku: string;
    brandId: string;
    categoryId: string;
    shortDescription: string;
    fullDescription: string;
    purchasePrice: number; // strictly backend
    sellingPrice: number;
    discountPrice?: number;
    stock: number;
    minStock: number;
    status: 'active' | 'inactive';
    isFeatured: boolean;
    isBestSeller: boolean;
    images: string[];
    specs: { key: string; value: string }[];
    compatModelIds: string[];
  }[] = [
    {
      id: 'prod_1',
      name: 'لنت ترمز جلو تکستار مدل 405 و پارس',
      slug: 'textar-front-brake-pads-peugeot-405-pars',
      sku: 'BP-TXT-405F',
      brandId: 'br_textar',
      categoryId: 'cat_brakes',
      shortDescription: 'لنت ترمز سرامیکی اصل تکستار، با ترمزگیری نرم و بدون ایجاد صدای سوت و براده‌دهی.',
      fullDescription: 'لنت ترمز جلو تکستار (Textar) ساخت آلمان یکی از باکیفیت‌ترین گزینه‌های موجود برای سیستم ترمز چرخ‌های جلو پژو 405، پژو پارس و سمند است. این محصول با فرمولاسیون اختصاصی بدون آزبست، طول عمر دیسک چرخ را افزایش داده و در شرایط رانندگی سخت و ترمزهای پیاپی بهترین بازده حرارتی را دارد.',
      purchasePrice: 920000,
      sellingPrice: 1250000,
      discountPrice: 1180000,
      stock: 35,
      minStock: 8,
      status: 'active',
      isFeatured: true,
      isBestSeller: true,
      images: [
        'https://images.unsplash.com/photo-1600790142055-619df03207e6?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80',
      ],
      specs: [
        { key: 'موقعیت نصب', value: 'چرخ‌های جلو' },
        { key: 'نوع لنت', value: 'نیمه سرامیک با الیاف مس' },
        { key: 'کشور سازنده', value: 'آلمان' },
        { key: 'ویژگی', value: 'بدون صدا، گرده کم، مقاومت حرارتی تا ۶۰۰ درجه' },
      ],
      compatModelIds: ['vm_peugeot_405', 'vm_peugeot_pars', 'vm_samand_ef7'],
    },
    {
      id: 'prod_2',
      name: 'لنت ترمز عقب کاسه‌ای ایساکو مخصوص پژو 206 و رانا',
      slug: 'isaco-rear-brake-pads-peugeot-206-runna',
      sku: 'BP-ISC-206R',
      brandId: 'br_isaco',
      categoryId: 'cat_brakes',
      shortDescription: 'لنت ترمز کاسه‌ای چرخ عقب با هولوگرام اصالت ایساکو، ایمنی و کنترل پایدار خودرو.',
      fullDescription: 'لنت ترمز عقب کاسه‌ای شرکتی ایساکو با استاندارد خط تولید ایران‌خودرو تولید شده و به طور اختصاصی با ابعاد کاسه چرخ 206 تیپ 2 و 5 و خودروهای هم‌خانواده تطابق دارد.',
      purchasePrice: 650000,
      sellingPrice: 890000,
      stock: 22,
      minStock: 5,
      status: 'active',
      isFeatured: false,
      isBestSeller: true,
      images: [
        'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80',
      ],
      specs: [
        { key: 'موقعیت نصب', value: 'چرخ‌های عقب (کاسه‌ای)' },
        { key: 'شرکت سازنده', value: 'ایساکو خط تولید' },
        { key: 'سازگاری', value: 'پژو ۲۰۶ تیپ ۲ و ۵ دنده‌ای' },
      ],
      compatModelIds: ['vm_peugeot_206_t2', 'vm_peugeot_206_t5', 'vm_peugeot_207'],
    },
    {
      id: 'prod_3',
      name: 'شمع موتور ان‌جی‌کی (NGK) ایریدیوم پایه کوتاه ژاپن - پک ۴ عددی',
      slug: 'ngk-iridium-spark-plugs-japan-pack-4',
      sku: 'SP-NGK-BKR6EIX',
      brandId: 'br_ngk',
      categoryId: 'cat_engine',
      shortDescription: 'شمع ایریدیوم ژاپنی با جرقه دقیق، کاهش مصرف سوخت، شتاب نرم و کارکرد ۱۰۰ هزار کیلومتر.',
      fullDescription: 'شمع NGK ژاپن مدل BKR6EIX با الکترود مرکزی ایریدیوم لیزری به قطر ۰.۶ میلی‌متر، جرقه‌ای قدرتمند و متمرکز در محفظه احتراق ایجاد می‌کند که منجر به استارت سریع در هوای سرد و روان‌سازی موتور XU7، TU3 و پراید می‌شود.',
      purchasePrice: 1400000,
      sellingPrice: 1850000,
      discountPrice: 1720000,
      stock: 18,
      minStock: 4,
      status: 'active',
      isFeatured: true,
      isBestSeller: true,
      images: [
        'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80',
      ],
      specs: [
        { key: 'نوع شمع', value: 'ایریدیوم IX پایه کوتاه' },
        { key: 'کشور سازنده', value: 'ژاپن' },
        { key: 'طول عمر مفید', value: '۸۰,۰۰۰ تا ۱۰۰,۰۰۰ کیلومتر' },
        { key: 'آچار شمع مورد نیاز', value: '۱۶ میلی‌متر' },
      ],
      compatModelIds: ['vm_peugeot_405', 'vm_peugeot_pars', 'vm_pride_all', 'vm_tiba', 'vm_saina_quick'],
    },
    {
      id: 'prod_4',
      name: 'شمع موتور بوش (Bosch) دو پلاتین پایه بلند مناسب TU5 و EF7',
      slug: 'bosch-spark-plugs-double-platinum-tu5-ef7',
      sku: 'SP-BSH-FR7DC',
      brandId: 'br_bosch',
      categoryId: 'cat_engine',
      shortDescription: 'شمع پایه بلند اصلی آلمان دو پلاتینه، بهینه‌سازی شده برای موتورهای ۱۶ سوپاپ TU5 و EF7.',
      fullDescription: 'شمع دو پلاتین پایه بلند بوش آلمان جریان جرقه پایدار و احتراق کامل در موتورهای دمابالای EF7 و TU5 را تضمین کرده و از خطای کویل و لرزش در دور موتور درجا جلوگیری می‌کند.',
      purchasePrice: 1100000,
      sellingPrice: 1480000,
      stock: 28,
      minStock: 6,
      status: 'active',
      isFeatured: false,
      isBestSeller: true,
      images: [
        'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=800&q=80',
      ],
      specs: [
        { key: 'طول رزوه', value: 'پایه بلند (۱۹ میلی‌متر)' },
        { key: 'تعداد الکترود منفی', value: 'دو پلاتین' },
        { key: 'سازنده', value: 'بوش آلمان' },
      ],
      compatModelIds: ['vm_peugeot_206_t5', 'vm_peugeot_207', 'vm_samand_ef7', 'vm_dena_plus', 'vm_tara'],
    },
    {
      id: 'prod_5',
      name: 'کیت کامل دیسک و صفحه کلاچ والئو (Valeo) جعبه سبز فرانسه - پژو 206 تیپ 5',
      slug: 'valeo-clutch-kit-green-box-peugeot-206-tu5',
      sku: 'CL-VAL-206T5',
      brandId: 'br_valeo',
      categoryId: 'cat_transmission',
      shortDescription: 'کیت کلاچ اورجینال والئو ترک/فرانسه شامل دیسک، صفحه و بلبرینگ کلاچ بسیار نرم و پرشتاب.',
      fullDescription: 'کیت کلاچ والئو فرانسه جعبه سبز معروف با کد فنی اصالت و لیبل شرکتی، پدال کلاچ را به صورت محسوسی نرم کرده و شتاب اولیه خودرو را در سربالایی‌ها بدون کوچک‌ترین بکسوات یا لرزش منتقل می‌کند.',
      purchasePrice: 4200000,
      sellingPrice: 5350000,
      discountPrice: 4990000,
      stock: 14,
      minStock: 3,
      status: 'active',
      isFeatured: true,
      isBestSeller: true,
      images: [
        'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=800&q=80',
      ],
      specs: [
        { key: 'محتویات کیت', value: 'دیسک کلاچ، صفحه کلاچ، بلبرینگ کلاچ' },
        { key: 'نوع پری دمپر', value: 'دارای فنرهای دوبل ضد لرزش' },
        { key: 'کشور مبدا برند', value: 'والئو فرانسه' },
      ],
      compatModelIds: ['vm_peugeot_206_t5', 'vm_peugeot_207', 'vm_peugeot_pars'],
    },
    {
      id: 'prod_6',
      name: 'دیسک و صفحه کلاچ عظام مدل پراید ۲۰۰ میلی‌متر پلاس',
      slug: 'ezam-clutch-kit-pride-200mm',
      sku: 'CL-EZM-PRD',
      brandId: 'br_ezam',
      categoryId: 'cat_transmission',
      shortDescription: 'کیت کلاچ استاندارد با گارانتی ۱۲ ماهه عظام ویژه پراید و تیبا.',
      fullDescription: 'محصول عظام با بهره‌گیری از مواد کامپوزیت اصطکاکی باکیفیت و فنربندی دوبل، دوام فوق‌العاده‌ای در ترافیک‌های شهری دارد.',
      purchasePrice: 1950000,
      sellingPrice: 2550000,
      stock: 25,
      minStock: 5,
      status: 'active',
      isFeatured: false,
      isBestSeller: false,
      images: [
        'https://images.unsplash.com/photo-1541348263662-e0c8de4259ba?auto=format&fit=crop&w=800&q=80',
      ],
      specs: [
        { key: 'قطر خارجی صفحه', value: '۲۰۰ میلی‌متر' },
        { key: 'گارانتی', value: '۱۲ ماه ضمانت رسمی تعویض عظام' },
      ],
      compatModelIds: ['vm_pride_all', 'vm_tiba', 'vm_saina_quick'],
    },
    {
      id: 'prod_7',
      name: 'فیلتر روغن مان (Mann-Filter) اورجینال آلمان مخصوص پژو ۲۰۶ و ۲۰۷',
      slug: 'mann-oil-filter-peugeot-206-207-tu5',
      sku: 'FL-MAN-HU711',
      brandId: 'br_mann',
      categoryId: 'cat_filters',
      shortDescription: 'فیلتر روغن کارتریجی اورجینال با کاغذ فیلتراسیون سنتتیک برای پاکسازی ۹۹.۹٪ ذرات میکرونی.',
      fullDescription: 'فیلتر روغن آلمانی MANN بالاترین درجه جذب رسوبات کربنی و ذرات معلق روغن موتور را دارد و فشار هیدرولیک روغن را در کانال‌های روغن‌کاری موتور TU5 پایدار نگه می‌دارد.',
      purchasePrice: 210000,
      sellingPrice: 320000,
      stock: 60,
      minStock: 15,
      status: 'active',
      isFeatured: false,
      isBestSeller: true,
      images: [
        'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=800&q=80',
      ],
      specs: [
        { key: 'نوع فیلتر', value: 'المنتی کارتریجی' },
        { key: 'کشور سازنده', value: 'آلمان' },
        { key: 'دوره تعویض پیشنهادی', value: 'هر ۵,۰۰۰ الی ۷,۰۰۰ کیلومتر' },
      ],
      compatModelIds: ['vm_peugeot_206_t5', 'vm_peugeot_207', 'vm_tara', 'vm_tondar90'],
    },
    {
      id: 'prod_8',
      name: 'فیلتر هوای سرکان شرکتی برای سمند EF7 و دنا',
      slug: 'serkan-air-filter-samand-ef7-dena',
      sku: 'FL-SRK-EF7',
      brandId: 'br_isaco',
      categoryId: 'cat_filters',
      shortDescription: 'فیلتر هوای استاندارد با الیاف نانو جهت جلوگیری از ورود گردوغبار به منیفولد هوا.',
      fullDescription: 'هوای تمیز برای سنسور مپ و دریچه گاز موتور EF7 حیاتی است. فیلتر هوای سرکان با واشر دور لاستیکی مقاوم مانع نشتی هوای فیلتر نشده به موتور می‌شود.',
      purchasePrice: 110000,
      sellingPrice: 175000,
      stock: 45,
      minStock: 10,
      status: 'active',
      isFeatured: false,
      isBestSeller: false,
      images: [
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
      ],
      specs: [
        { key: 'نوع تصفیه', value: 'کاغذ سلولزی اشباع شده با واشر پلی‌اورتان' },
        { key: 'مناسب برای', value: 'سمند EF7 بنزینی و دوگانه‌سوز و خانواده دنا' },
      ],
      compatModelIds: ['vm_samand_ef7', 'vm_dena_plus'],
    },
    {
      id: 'prod_9',
      name: 'فیلتر کابین کربن اکتیو بوش برای رنو ال 90 و ساندرو',
      slug: 'bosch-cabin-air-filter-carbon-l90-sandero',
      sku: 'FL-BSH-L90C',
      brandId: 'br_bosch',
      categoryId: 'cat_filters',
      shortDescription: 'فیلتر هوای اتاق دارای لایه کربن فعال جاذب بو، دود اگزوز و گرده‌های آلرژی‌زا.',
      fullDescription: 'این فیلتر اتاق با زغال اکتیو تمامی ذرات آلاینده شهری و گازهای بدبوی اگزوز را پیش از ورود به کابین تصفیه نموده و بوی کولر و بخاری را کاملاً مطبوع می‌سازد.',
      purchasePrice: 280000,
      sellingPrice: 395000,
      stock: 30,
      minStock: 6,
      status: 'active',
      isFeatured: false,
      isBestSeller: false,
      images: [
        'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=800&q=80',
      ],
      specs: [
        { key: 'لایه تصفیه', value: 'الیاف هپا + پودر کربن فعال' },
        { key: 'عمر مفید', value: 'یک سال یا ۱۰ هزار کیلومتر' },
      ],
      compatModelIds: ['vm_tondar90'],
    },
    {
      id: 'prod_10',
      name: 'تسمه تایم پاورگریپ (Gates PowerGrip) اصلی مدل ۴۰۵ و سمند XU7',
      slug: 'gates-timing-belt-peugeot-405-samand-xu7',
      sku: 'TB-GTS-405-114',
      brandId: 'br_isaco',
      categoryId: 'cat_engine',
      shortDescription: 'تسمه تایمینگ ۱۱۴ دندانه دارای بافت تقویت‌شده ضد کشیدگی و پارگی نابهنگام.',
      fullDescription: 'تسمه تایم برند گیتس پاورگریپ با تاییدیه شرکتی ایساکو، ایمن‌ترین انتخاب برای پیشگیری از تایم‌ردکردن و کج شدن سوپاپ‌های حساس موتور ۱۸۰۰ سی‌سی پژو و سمند است.',
      purchasePrice: 620000,
      sellingPrice: 840000,
      discountPrice: 790000,
      stock: 40,
      minStock: 10,
      status: 'active',
      isFeatured: true,
      isBestSeller: true,
      images: [
        'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80',
      ],
      specs: [
        { key: 'تعداد دندانه', value: '۱۱۴ دندانه گرد HNBR' },
        { key: 'گارانتی کارکرد', value: '۶۰,۰۰۰ کیلومتر یا ۲ سال' },
      ],
      compatModelIds: ['vm_peugeot_405', 'vm_peugeot_pars', 'vm_samand_ef7'],
    },
    {
      id: 'prod_11',
      name: 'تسمه دینام و هیدرولیک دانگیل (Dongil) اصل کره مدل ۶PK1565 برای پژو ۲۰۶',
      slug: 'dongil-accessory-drive-belt-peugeot-206-tu5',
      sku: 'AB-DNG-6PK1565',
      brandId: 'br_mobis',
      categoryId: 'cat_engine',
      shortDescription: 'تسمه شیاری دینام کره جنوبی با طول عمر بالا و بدون صدای جیرجیر در هوای سرد و مرطوب.',
      fullDescription: 'تسمه دینام دانگیل ساخت کره با متریال EPDM در برابر حرارت بالا، روغن و سایش مقاومت فوق‌العاده دارد و چرخش بی‌نقص واترپمپ، هیدرولیک و دینام را فراهم می‌سازد.',
      purchasePrice: 410000,
      sellingPrice: 590000,
      stock: 35,
      minStock: 8,
      status: 'active',
      isFeatured: false,
      isBestSeller: false,
      images: [
        'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80',
      ],
      specs: [
        { key: 'سایز و شیار', value: '۶ شیار با طول ۱۵۶۵ میلی‌متر' },
        { key: 'کشور سازنده', value: 'کره جنوبی' },
      ],
      compatModelIds: ['vm_peugeot_206_t5', 'vm_peugeot_207'],
    },
    {
      id: 'prod_12',
      name: 'دیسک چرخ جلو سوراخ‌دار و شیاردار برمبو مدل پژو ۲۰۶ تیپ ۵',
      slug: 'brembo-drilled-front-brake-disc-peugeot-206-t5',
      sku: 'BD-BRM-206F',
      brandId: 'br_textar',
      categoryId: 'cat_brakes',
      shortDescription: 'دیسک ترمز خنک‌شونده اسپرت با دفع سریع گازها و حرارت لنت در ترمزهای سنگین.',
      fullDescription: 'دیسک ترمز جلو برمبو شیاردار علاوه بر زیبایی، از شیشه‌ای شدن لنت‌ها جلوگیری نموده و مسافت توقف خودرو را به طرز چشمگیری کاهش می‌دهد.',
      purchasePrice: 1850000,
      sellingPrice: 2490000,
      discountPrice: 2350000,
      stock: 12,
      minStock: 3,
      status: 'active',
      isFeatured: true,
      isBestSeller: false,
      images: [
        'https://images.unsplash.com/photo-1600790142055-619df03207e6?auto=format&fit=crop&w=800&q=80',
      ],
      specs: [
        { key: 'نوع دیسک', value: 'تهویه‌دار سوراخ‌دار و شیاردار' },
        { key: 'قطر خارجی', value: '۲۶۶ میلی‌متر' },
      ],
      compatModelIds: ['vm_peugeot_206_t5', 'vm_peugeot_207', 'vm_peugeot_pars'],
    },
    {
      id: 'prod_13',
      name: 'کمک فنر جلو هیدرولیکی عظام شرکتی مخصوص پراید (جفت چپ و راست)',
      slug: 'ezam-front-shock-absorbers-pride-pair',
      sku: 'SA-EZM-PRDF',
      brandId: 'br_ezam',
      categoryId: 'cat_suspension',
      shortDescription: 'جفت کمک فنر روغنی با ضربه‌گیری استاندارد و سواری نرم و بدون کوبش.',
      fullDescription: 'کمک فنرهای شرکتی عظام با استفاده از روغن هیدرولیک ویسکوزیته بالا و واشرهای کاسه‌نمد ژاپنی، ضربات دست‌اندازهای جاده را به بهترین شکل مستهلک می‌کنند.',
      purchasePrice: 2200000,
      sellingPrice: 2890000,
      stock: 16,
      minStock: 4,
      status: 'active',
      isFeatured: false,
      isBestSeller: true,
      images: [
        'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=800&q=80',
      ],
      specs: [
        { key: 'نوع کمک', value: 'هیدرولیک روغنی دو جداره' },
        { key: 'تعداد در بسته', value: '۲ عدد (یک جفت جلو چپ و راست)' },
      ],
      compatModelIds: ['vm_pride_all'],
    },
    {
      id: 'prod_14',
      name: 'کمک فنر عقب گازی-روغنی ماندو (Mando) کره مناسب پژو پارس و ۴۰۵',
      slug: 'mando-rear-gas-shock-absorber-peugeot-pars-405',
      sku: 'SA-MND-405R',
      brandId: 'br_mobis',
      categoryId: 'cat_suspension',
      shortDescription: 'کمک فنر گازی کره‌ای اصلی با هندلینگ فوق‌العاده در پیچ‌ها و پایداری در بار سنگین.',
      fullDescription: 'کمک فنر ماندو با ترکیب گاز نیتروژن فشرده و روغن سیلیکونی، مانع از کف کردن روغن در سرعت‌های بالا شده و چسبندگی چرخ‌های عقب خودرو را در مسیرهای ناهموار حفظ می‌کند.',
      purchasePrice: 1750000,
      sellingPrice: 2320000,
      stock: 20,
      minStock: 4,
      status: 'active',
      isFeatured: true,
      isBestSeller: false,
      images: [
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
      ],
      specs: [
        { key: 'تکنولوژی', value: 'گازی هیدرولیکی پرفشار نیتروژن' },
        { key: 'موقعیت', value: 'چرخ‌های عقب' },
      ],
      compatModelIds: ['vm_peugeot_405', 'vm_peugeot_pars', 'vm_samand_ef7', 'vm_dena_plus'],
    },
    {
      id: 'prod_15',
      name: 'کیت کامل جلوبندی امیرنیا شامل سیبک، طبق و موج‌گیر ویژه تیبا و ساینا',
      slug: 'amirnia-full-suspension-kit-tiba-saina',
      sku: 'SP-AMR-TIB-KIT',
      brandId: 'br_amirnia',
      categoryId: 'cat_suspension',
      shortDescription: 'مجموعه کامل قطعات جلوبندی با فلز فورج گرم و لاستیک‌های ضد سایش با گارانتی بی قید و شرط.',
      fullDescription: 'کیت کامل جلوبندی امیرنیا تمامی صداهای اضافی چرخ‌ها و فرمان را برطرف نموده و شامل ۲ عدد طبق با بوش، ۲ عدد سیبک فرمان، ۲ عدد سیبک زیر کمک و میل موج‌گیر است.',
      purchasePrice: 2800000,
      sellingPrice: 3650000,
      discountPrice: 3450000,
      stock: 10,
      minStock: 2,
      status: 'active',
      isFeatured: true,
      isBestSeller: true,
      images: [
        'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80',
      ],
      specs: [
        { key: 'محتویات', value: 'طبق، سیبک فرمان، سیبک زیر کمک، میل موج‌گیر (۶ قطعه)' },
        { key: 'استاندارد ساخت', value: 'فولاد آلیاژی گرید صنعتی با فورج گرم' },
      ],
      compatModelIds: ['vm_tiba', 'vm_saina_quick'],
    },
    {
      id: 'prod_16',
      name: 'روغن موتور تمام سنتتیک بهران سوپر رانا 5W-40 ظرف ۴ لیتری',
      slug: 'behran-super-rana-5w40-synthetic-engine-oil-4l',
      sku: 'OIL-BHR-5W40-4L',
      brandId: 'br_behran',
      categoryId: 'cat_oils',
      shortDescription: 'روغن موتور تمام سنتتیک سطح کیفی API SN با روان‌کاری عالی در استارت زمستانی و تابستان.',
      fullDescription: 'بهران سوپر رانا از روغن پایه تمام سنتزی و مواد افزودنی بسیار مرغوب تولید شده است. این روغن حداکثر محافظت از قطعات متحرک موتورهای توربو و ۱۶ سوپاپ مانند TU5، EF7 و تارا را در برابر سایش به ارمغان می‌آورد.',
      purchasePrice: 780000,
      sellingPrice: 1050000,
      discountPrice: 990000,
      stock: 50,
      minStock: 12,
      status: 'active',
      isFeatured: true,
      isBestSeller: true,
      images: [
        'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80',
      ],
      specs: [
        { key: 'گرانروی (ویسکوزیته)', value: 'SAE 5W-40' },
        { key: 'سطح کیفیت', value: 'API SN / CF' },
        { key: 'حجم قوطی', value: '۴ لیتر' },
      ],
      compatModelIds: ['vm_peugeot_206_t5', 'vm_peugeot_207', 'vm_samand_ef7', 'vm_dena_plus', 'vm_tara', 'vm_shahin'],
    },
    {
      id: 'prod_17',
      name: 'روغن موتور کاسترول مگناتک (Castrol Magnatec) 10W-40 ظرف ۴ لیتری',
      slug: 'castrol-magnatec-10w40-engine-oil-4l',
      sku: 'OIL-CST-10W40-4L',
      brandId: 'br_castrol',
      categoryId: 'cat_oils',
      shortDescription: 'دارای مولکول‌های هوشمند چسبنده به فلز جهت محافظت ۷۵ درصدی از موتور در زمان استارت.',
      fullDescription: 'کاسترول مگناتک با فرمولاسیون ذرات مغناطیسی، حتی پس از خاموش شدن موتور روغن را بر روی جداره سیلندر و سوپاپ‌ها نگه داشته و خط و خش ناشی از استارت اولیه را از بین می‌برد.',
      purchasePrice: 1250000,
      sellingPrice: 1690000,
      stock: 28,
      minStock: 6,
      status: 'active',
      isFeatured: false,
      isBestSeller: true,
      images: [
        'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=800&q=80',
      ],
      specs: [
        { key: 'گرانروی', value: '10W-40 نیمه سنتتیک' },
        { key: 'حجم', value: '۴ لیتر' },
      ],
      compatModelIds: ['vm_peugeot_405', 'vm_peugeot_pars', 'vm_pride_all', 'vm_tondar90'],
    },
    {
      id: 'prod_18',
      name: 'رادیاتور آب دو لول ایران رادیاتور مخصوص پژو ۴۰۵ و پارس',
      slug: 'iran-radiator-two-row-cooling-radiator-peugeot-405',
      sku: 'RD-IRN-405-2R',
      brandId: 'br_isaco',
      categoryId: 'cat_cooling',
      shortDescription: 'رادیاتور دو لول آلومینیومی پربازده با خنک‌کنندگی عالی حتی در ترافیک‌های شدید تابستان.',
      fullDescription: 'رادیاتور آلومینیومی دو لول با فین‌های متراکم و لوله‌های پهن، تبادل حرارتی آب خروجی از سرسیلندر را تسریع کرده و از جوش آوردن خودرو در گرمای تابستان جلوگیری می‌کند.',
      purchasePrice: 1980000,
      sellingPrice: 2590000,
      stock: 14,
      minStock: 3,
      status: 'active',
      isFeatured: false,
      isBestSeller: false,
      images: [
        'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=800&q=80',
      ],
      specs: [
        { key: 'جنس پره‌ها', value: 'آلومینیوم بریزینگ با بازده حرارتی بالا' },
        { key: 'تعداد لول', value: '۲ لول پهن' },
      ],
      compatModelIds: ['vm_peugeot_405', 'vm_peugeot_pars', 'vm_samand_ef7'],
    },
    {
      id: 'prod_19',
      name: 'واتر پمپ شرکتی ایساکو موتور TU5 (پژو ۲۰۶ و ۲۰۷)',
      slug: 'isaco-water-pump-peugeot-206-207-tu5',
      sku: 'WP-ISC-TU5',
      brandId: 'br_isaco',
      categoryId: 'cat_cooling',
      shortDescription: 'پمپ آب موتور با پره‌های برنجی ضد زنگ و بلبرینگ دور بالا و واشر آب‌بندی فابریک.',
      fullDescription: 'واترپمپ ایساکو چرخش مداوم مایع ضدیخ را در مجاری سیلندر فراهم ساخته و پروانه مقاوم آن مانع از پوسیدگی و افت دبی گردش آب در مدار خنک‌کاری می‌شود.',
      purchasePrice: 690000,
      sellingPrice: 960000,
      stock: 25,
      minStock: 5,
      status: 'active',
      isFeatured: false,
      isBestSeller: false,
      images: [
        'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=800&q=80',
      ],
      specs: [
        { key: 'جنس پروانه', value: 'برنج ضد زنگ' },
        { key: 'بلبرینگ', value: 'دور بالا ضد نفوذ آب' },
      ],
      compatModelIds: ['vm_peugeot_206_t5', 'vm_peugeot_207', 'vm_tara'],
    },
    {
      id: 'prod_20',
      name: 'ترموستات ۸۳ درجه تامسون اصلی با هوزینگ آلومینیومی پژو ۴۰۵',
      slug: 'thomson-thermostat-83c-peugeot-405-pars',
      sku: 'TH-TMS-83',
      brandId: 'br_valeo',
      categoryId: 'cat_cooling',
      shortDescription: 'ترموستات حساس به دما با باز شدن سریع در ۸۳ درجه جهت تثبیت دمای بهینه کاری موتور.',
      fullDescription: 'ترموستات اصل تامسون ساخت فرانسه با فنر استیل تقویت شده و کپسول مومی دقیق از بالارفتن آمپر آب و سوختن واشر سرسیلندر در خودروهای موتور XU7 جلوگیری به عمل می‌آورد.',
      purchasePrice: 320000,
      sellingPrice: 470000,
      stock: 30,
      minStock: 8,
      status: 'active',
      isFeatured: false,
      isBestSeller: false,
      images: [
        'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
      ],
      specs: [
        { key: 'دمای باز شدن', value: '۸۳ درجه سانتی‌گراد' },
        { key: 'کشور سازنده', value: 'فرانسه' },
      ],
      compatModelIds: ['vm_peugeot_405', 'vm_peugeot_pars'],
    },
    {
      id: 'prod_21',
      name: 'باتری ۶۰ آمپر واریان صبا باتری اتمی همراه با گارانتی ۱۸ ماهه',
      slug: 'saba-battery-varian-60ah-atomic',
      sku: 'BT-SB-60AH',
      brandId: 'br_isaco',
      categoryId: 'cat_electrical',
      shortDescription: 'باتری سیلد اتمی بدون نیاز به آب با قدرت استارت‌زنی بالا در زمستان (CCA 510).',
      fullDescription: 'باتری واریان صبا باتری با فناوری صفحات کلسیمی اکسپند شده، آمپر خروجی استارت بالا و عمر طولانی، مناسب برای انواع خودروهای پژو، سمند، دنا و رنو تندر ۹۰ است.',
      purchasePrice: 2400000,
      sellingPrice: 2990000,
      discountPrice: 2850000,
      stock: 15,
      minStock: 3,
      status: 'active',
      isFeatured: true,
      isBestSeller: true,
      images: [
        'https://images.unsplash.com/photo-1541348263662-e0c8de4259ba?auto=format&fit=crop&w=800&q=80',
      ],
      specs: [
        { key: 'ظرفیت خروجی', value: '۶۰ آمپر ساعت' },
        { key: 'جریان استارت سرد (CCA)', value: '۵۱۰ آمپر' },
        { key: 'گارانتی', value: '۱۸ ماه ضمانت تعویض کشوری' },
      ],
      compatModelIds: ['vm_peugeot_206_t5', 'vm_peugeot_206_t2', 'vm_peugeot_405', 'vm_peugeot_pars', 'vm_samand_ef7', 'vm_tondar90'],
    },
    {
      id: 'prod_22',
      name: 'چراغ جلو کریستالی شفاف مدرن پژو پارس (جفت چپ و راست)',
      slug: 'modern-crystal-headlight-peugeot-pars-pair',
      sku: 'HL-MDR-PARS-P',
      brandId: 'br_isaco',
      categoryId: 'cat_electrical',
      shortDescription: 'چراغ جلو فابریک خط تولید با طلق شفاف ضد زردی پلی‌کربنات و کاسه رفلکتور کرومی.',
      fullDescription: 'این چراغ‌های جلو خط تولید شرکت مدرن برای پژو پارس، بیشترین زاویه و عمق پرتاب نور را در شب ایجاد کرده و دارای موتور تنظیم ارتفاع نور برقی است.',
      purchasePrice: 2100000,
      sellingPrice: 2750000,
      stock: 12,
      minStock: 2,
      status: 'active',
      isFeatured: false,
      isBestSeller: false,
      images: [
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
      ],
      specs: [
        { key: 'موقعیت', value: 'جفت جلو چپ و راست' },
        { key: 'نوع طلق', value: 'پلی‌کربنات ضد اشعه فرابنفش UV' },
      ],
      compatModelIds: ['vm_peugeot_pars'],
    },
    {
      id: 'prod_23',
      name: 'تیغه برف‌پاک‌کن هیبریدی ژاپنی مدل پراید و تیبا (جفت)',
      slug: 'hybrid-wiper-blades-pride-tiba-pair',
      sku: 'WP-HYB-PRD',
      brandId: 'br_consumables',
      categoryId: 'cat_consumables',
      shortDescription: 'تیغه برف‌پاک‌کن ژله‌ای هیبریدی بی‌صدا با پاک‌کنندگی شیشه بدون خط و خش در باران شدید.',
      fullDescription: 'این تیغه‌ها دارای بدنه آئودینامیک با روکش کربن و گرافیتی روی لاستیک تیغه هستند که فشار یکنواخت در تمام سطح شیشه را تضمین می‌کنند.',
      purchasePrice: 190000,
      sellingPrice: 295000,
      stock: 40,
      minStock: 10,
      status: 'active',
      isFeatured: false,
      isBestSeller: true,
      images: [
        'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=800&q=80',
      ],
      specs: [
        { key: 'تکنولوژی تیغه', value: 'هیبریدی با فریم فلزی پوشیده و لاستیک گرافیتی' },
        { key: 'سایز تیغه‌ها', value: '۲۰ و ۲۱ اینچ' },
      ],
      compatModelIds: ['vm_pride_all', 'vm_tiba', 'vm_saina_quick'],
    },
    {
      id: 'prod_24',
      name: 'لنت ترمز سرامیکی جلو گلد (Hi-Q Gold) کره مخصوص هیوندای سانتافه و کیا سراتو',
      slug: 'hiq-gold-ceramic-brake-pads-santafe-cerato',
      sku: 'BP-HIQ-SNF',
      brandId: 'br_mobis',
      categoryId: 'cat_brakes',
      shortDescription: 'لنت ترمز سرامیکی لوکس کره‌ای بدون هرگونه سوت یا داغ کردن در سراشیبی‌ها.',
      fullDescription: 'لنت‌های سری Gold شرکت Sangsin کره جنوبی ویژه خودروهای وارداتی شاسی‌بلند هیوندای و سدان کیا با تضمین ۱۰۰ درصدی عملکرد بدون صدا و گرد لنت.',
      purchasePrice: 2600000,
      sellingPrice: 3450000,
      discountPrice: 3290000,
      stock: 14,
      minStock: 3,
      status: 'active',
      isFeatured: true,
      isBestSeller: false,
      images: [
        'https://images.unsplash.com/photo-1600790142055-619df03207e6?auto=format&fit=crop&w=800&q=80',
      ],
      specs: [
        { key: 'فرمولاسیون', value: 'تمام سرامیکی با ذرات مس و تیتانیوم' },
        { key: 'کشور سازنده', value: 'کره جنوبی' },
      ],
      compatModelIds: ['vm_santafe', 'vm_cerato'],
    },
  ];

  // Map products and populate brand/category names
  const products: Product[] = rawProducts.map((p) => {
    const brand = brands.find((b) => b.id === p.brandId);
    const category = categories.find((c) => c.id === p.categoryId);
    const profit = p.sellingPrice - p.purchasePrice;
    const profitMargin = Math.round((profit / p.sellingPrice) * 100);

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      sku: p.sku,
      brandId: p.brandId,
      brandName: brand?.name || '',
      categoryId: p.categoryId,
      categoryName: category?.name || '',
      shortDescription: p.shortDescription,
      fullDescription: p.fullDescription,
      sellingPrice: p.sellingPrice,
      purchasePrice: p.purchasePrice,
      discountPrice: p.discountPrice,
      stock: p.stock,
      minStock: p.minStock,
      status: p.status,
      isFeatured: p.isFeatured,
      isBestSeller: p.isBestSeller,
      images: p.images,
      specs: p.specs,
      createdAt: now,
      updatedAt: now,
      profit,
      profitMargin,
    };
  });

  // Generate vehicle compatibility table entries
  const vehicleCompatibility: VehicleCompatibility[] = [];
  rawProducts.forEach((p) => {
    p.compatModelIds.forEach((mId) => {
      const model = vehicleModels.find((vm) => vm.id === mId);
      if (model) {
        vehicleCompatibility.push({
          id: `vc_${p.id}_${model.id}`,
          productId: p.id,
          vehicleModelId: model.id,
          modelName: model.modelName,
          vehicleMake: model.vehicleMake,
          yearFrom: model.yearStart,
          yearTo: model.yearEnd,
        });
      }
    });
  });

  // Coupons
  const discounts: DiscountCoupon[] = [
    {
      id: 'dsc_1',
      code: 'YADAK10',
      type: 'percent',
      value: 10,
      minOrderAmount: 500000,
      maxDiscount: 200000,
      usageLimit: 100,
      usageCount: 14,
      validFrom: '2026-01-01T00:00:00Z',
      validUntil: '2026-12-31T23:59:59Z',
      status: 'active',
    },
    {
      id: 'dsc_2',
      code: 'NOWRUZ',
      type: 'fixed',
      value: 200000,
      minOrderAmount: 1500000,
      usageLimit: 50,
      usageCount: 8,
      validFrom: '2026-01-01T00:00:00Z',
      validUntil: '2026-12-31T23:59:59Z',
      status: 'active',
    },
    {
      id: 'dsc_3',
      code: 'FIRSTBUY',
      type: 'percent',
      value: 15,
      minOrderAmount: 300000,
      maxDiscount: 300000,
      usageLimit: 500,
      usageCount: 32,
      validFrom: '2026-01-01T00:00:00Z',
      validUntil: '2026-12-31T23:59:59Z',
      status: 'active',
    },
  ];

  // Initial realistic sample orders demonstrating the sourcing/dropshipping pipeline
  const order1Date = new Date(Date.now() - 3600 * 1000 * 48).toISOString();
  const order2Date = new Date(Date.now() - 3600 * 1000 * 24).toISOString();
  const order3Date = new Date(Date.now() - 3600 * 1000 * 6).toISOString();
  const order4Date = new Date(Date.now() - 3600 * 1000 * 1).toISOString();

  const orders: Order[] = [
    {
      id: 'ord_1001',
      orderNumber: 'YP-100842',
      userId: 'usr_customer_1',
      customerName: 'علیرضا شفق',
      customerPhone: '09351234567',
      customerEmail: 'customer@gmail.com',
      province: 'تهران',
      city: 'تهران',
      address: 'خیابان شریعتی، بالاتر از پل رومی، پلاک ۴۲',
      unit: 'واحد ۵',
      postalCode: '1939543210',
      notes: 'لطفاً قبل از ارسال تماس گرفته شود',
      shippingMethod: 'express',
      shippingFee: 75000,
      discountAmount: 118000,
      couponCode: 'YADAK10',
      subtotal: 1180000,
      totalAmount: 1137000,
      paymentMethod: 'online',
      paymentStatus: 'paid',
      orderStatus: 'delivered', // already delivered
      trackingCode: 'POST-IR-9884210',
      items: [
        {
          id: 'item_1',
          orderId: 'ord_1001',
          productId: 'prod_1',
          productName: 'لنت ترمز جلو تکستار مدل 405 و پارس',
          sku: 'BP-TXT-405F',
          image: 'https://images.unsplash.com/photo-1600790142055-619df03207e6?auto=format&fit=crop&w=400&q=80',
          quantity: 1,
          sellingPrice: 1180000,
          purchasePrice: 920000,
          totalPrice: 1180000,
        },
      ],
      createdAt: order1Date,
      updatedAt: order1Date,
      totalCost: 920000,
      totalProfit: 217000,
    },
    {
      id: 'ord_1002',
      orderNumber: 'YP-100843',
      userId: 'usr_customer_2',
      customerName: 'محمدرضا کاظمی',
      customerPhone: '09197778899',
      customerEmail: 'm.kazemi@yahoo.com',
      province: 'اصفهان',
      city: 'اصفهان',
      address: 'خیابان بزرگمهر، خیابان ۲۲ بهمن، مجتمع نگین',
      unit: 'واحد ۲',
      postalCode: '8154678912',
      shippingMethod: 'standard',
      shippingFee: 49000,
      discountAmount: 0,
      subtotal: 5980000,
      totalAmount: 6029000,
      paymentMethod: 'online',
      paymentStatus: 'paid',
      orderStatus: 'shipped', // on the way
      trackingCode: 'TPX-9002148',
      items: [
        {
          id: 'item_2',
          orderId: 'ord_1002',
          productId: 'prod_5',
          productName: 'کیت کامل دیسک و صفحه کلاچ والئو (Valeo) جعبه سبز فرانسه - پژو 206 تیپ 5',
          sku: 'CL-VAL-206T5',
          image: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=400&q=80',
          quantity: 1,
          sellingPrice: 4990000,
          purchasePrice: 4200000,
          totalPrice: 4990000,
        },
        {
          id: 'item_3',
          orderId: 'ord_1002',
          productId: 'prod_16',
          productName: 'روغن موتور تمام سنتتیک بهران سوپر رانا 5W-40 ظرف ۴ لیتری',
          sku: 'OIL-BHR-5W40-4L',
          image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=400&q=80',
          quantity: 1,
          sellingPrice: 990000,
          purchasePrice: 780000,
          totalPrice: 990000,
        },
      ],
      createdAt: order2Date,
      updatedAt: order2Date,
      totalCost: 4980000,
      totalProfit: 1049000,
    },
    {
      id: 'ord_1003',
      orderNumber: 'YP-100844',
      userId: 'usr_customer_1',
      customerName: 'علیرضا شفق',
      customerPhone: '09351234567',
      customerEmail: 'customer@gmail.com',
      province: 'تهران',
      city: 'تهران',
      address: 'خیابان کارگر شمالی، نرسیده به امیرآباد',
      postalCode: '1417935411',
      shippingMethod: 'express',
      shippingFee: 75000,
      discountAmount: 200000,
      couponCode: 'NOWRUZ',
      subtotal: 3340000,
      totalAmount: 3215000,
      paymentMethod: 'online',
      paymentStatus: 'paid',
      orderStatus: 'sourcing', // Dropshipper is currently purchasing from wholesale supplier
      items: [
        {
          id: 'item_4',
          orderId: 'ord_1003',
          productId: 'prod_3',
          productName: 'شمع موتور ان‌جی‌کی (NGK) ایریدیوم پایه کوتاه ژاپن - پک ۴ عددی',
          sku: 'SP-NGK-BKR6EIX',
          image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=400&q=80',
          quantity: 1,
          sellingPrice: 1720000,
          purchasePrice: 1400000,
          totalPrice: 1720000,
        },
        {
          id: 'item_5',
          orderId: 'ord_1003',
          productId: 'prod_17',
          productName: 'روغن موتور کاسترول مگناتک (Castrol Magnatec) 10W-40 ظرف ۴ لیتری',
          sku: 'OIL-CST-10W40-4L',
          image: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=400&q=80',
          quantity: 1,
          sellingPrice: 1620000,
          purchasePrice: 1250000,
          totalPrice: 1620000,
        },
      ],
      createdAt: order3Date,
      updatedAt: order3Date,
      totalCost: 2650000,
      totalProfit: 565000,
    },
    {
      id: 'ord_1004',
      orderNumber: 'YP-100845',
      userId: 'usr_customer_2',
      customerName: 'محمدرضا کاظمی',
      customerPhone: '09197778899',
      customerEmail: 'm.kazemi@yahoo.com',
      province: 'اصفهان',
      city: 'کاشان',
      address: 'خیابان امیرکبیر، کوچه بوستان ۴',
      postalCode: '8719812345',
      shippingMethod: 'standard',
      shippingFee: 49000,
      discountAmount: 0,
      subtotal: 1480000,
      totalAmount: 1529000,
      paymentMethod: 'online',
      paymentStatus: 'paid',
      orderStatus: 'confirmed', // Confirmed, ready for sourcing
      items: [
        {
          id: 'item_6',
          orderId: 'ord_1004',
          productId: 'prod_4',
          productName: 'شمع موتور بوش (Bosch) دو پلاتین پایه بلند مناسب TU5 و EF7',
          sku: 'SP-BSH-FR7DC',
          image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=400&q=80',
          quantity: 1,
          sellingPrice: 1480000,
          purchasePrice: 1100000,
          totalPrice: 1480000,
        },
      ],
      createdAt: order4Date,
      updatedAt: order4Date,
      totalCost: 1100000,
      totalProfit: 380000,
    },
  ];

  const payments: Payment[] = [
    {
      id: 'pay_1',
      orderId: 'ord_1001',
      orderNumber: 'YP-100842',
      amount: 1137000,
      gateway: 'شتاب (درگاه پرداخت آنلاین شاپرک)',
      transactionId: 'TXN-984210',
      refNumber: 'REF-789412',
      status: 'paid',
      paidAt: order1Date,
      createdAt: order1Date,
    },
    {
      id: 'pay_2',
      orderId: 'ord_1002',
      orderNumber: 'YP-100843',
      amount: 6029000,
      gateway: 'شتاب (درگاه پرداخت آنلاین شاپرک)',
      transactionId: 'TXN-984211',
      refNumber: 'REF-789413',
      status: 'paid',
      paidAt: order2Date,
      createdAt: order2Date,
    },
    {
      id: 'pay_3',
      orderId: 'ord_1003',
      orderNumber: 'YP-100844',
      amount: 3215000,
      gateway: 'شتاب (درگاه پرداخت آنلاین شاپرک)',
      transactionId: 'TXN-984212',
      refNumber: 'REF-789414',
      status: 'paid',
      paidAt: order3Date,
      createdAt: order3Date,
    },
    {
      id: 'pay_4',
      orderId: 'ord_1004',
      orderNumber: 'YP-100845',
      amount: 1529000,
      gateway: 'شتاب (درگاه پرداخت آنلاین شاپرک)',
      transactionId: 'TXN-984213',
      refNumber: 'REF-789415',
      status: 'paid',
      paidAt: order4Date,
      createdAt: order4Date,
    },
  ];

  const notifications = [
    {
      id: 'notif_1',
      title: 'سفارش جدید ثبت شد',
      message: 'سفارش شماره YP-100845 با موفقیت پرداخت شد و در صف تأمین قرار گرفت.',
      type: 'order' as const,
      isRead: false,
      createdAt: order4Date,
    },
    {
      id: 'notif_2',
      title: 'هشدار کمبود موجودی',
      message: 'موجودی کالای «کیت کامل جلوبندی امیرنیا» به ۱۰ عدد رسیده است.',
      type: 'inventory' as const,
      isRead: true,
      createdAt: order3Date,
    },
  ];

  const adminLogs = [
    {
      id: 'log_1',
      userId: 'usr_admin',
      userName: 'مهندس حسینی',
      action: 'UPDATE_ORDER_STATUS',
      targetType: 'order',
      targetId: 'ord_1003',
      details: 'تغییر وضعیت به در حال تأمین (sourcing)',
      createdAt: order3Date,
    },
    {
      id: 'log_2',
      userId: 'usr_admin',
      userName: 'مهندس حسینی',
      action: 'UPDATE_ORDER_STATUS',
      targetType: 'order',
      targetId: 'ord_1002',
      details: 'افزودن کد پیگیری و ارسال سفارش (shipped)',
      createdAt: order2Date,
    },
  ];

  const settings: StoreSettings = {
    storeName: 'یدک‌پارت | بازارگاه تخصصی لوازم یدکی خودرو',
    phone: '۰۲۱-۸۸۹۹۰۰۱۱',
    supportHours: 'شنبه تا چهارشنبه ۹ الی ۱۸ | پنج‌شنبه ۹ الی ۱۴',
    address: 'تهران، خیابان امیرکبیر (چراغ برق)، پاساژ کاشانی، طبقه ۲، واحد ۲۴',
    standardShippingFee: 49000,
    expressShippingFee: 75000,
    freeShippingThreshold: 2500000, // Free shipping for orders above 2.5m Toman
    enableCod: false,
    lowStockThreshold: 5,
  };

  return {
    users,
    roles,
    categories,
    brands,
    vehicles,
    vehicleModels,
    vehicleCompatibility,
    products,
    carts: {},
    orders,
    payments,
    discounts,
    adminLogs,
    notifications,
    settings,
  };
}

// In-Memory Database with Atomic Disk Persistence
class RelationalDatabase {
  private data: DatabaseSchema;
  private isLoaded = false;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    ensureDataDir();
    if (fs.existsSync(DB_FILE_PATH)) {
      try {
        const content = fs.readFileSync(DB_FILE_PATH, 'utf-8');
        const parsed = JSON.parse(content);
        this.isLoaded = true;
        return parsed;
      } catch (err) {
        console.error('Failed to parse database file, re-initializing seed data:', err);
      }
    }

    const initial = generateInitialDatabase();
    this.save(initial);
    this.isLoaded = true;
    return initial;
  }

  private save(dataToSave: DatabaseSchema) {
    ensureDataDir();
    try {
      const tempPath = `${DB_FILE_PATH}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(dataToSave, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE_PATH);
    } catch (err) {
      console.error('Failed to persist database to disk:', err);
    }
  }

  public commit() {
    this.save(this.data);
  }

  // --- Users & Auth ---
  public getUsers() {
    return this.data.users;
  }

  public findUserById(id: string) {
    return this.data.users.find((u) => u.id === id);
  }

  public findUserByEmailOrPhone(identifier: string) {
    const clean = identifier.trim().toLowerCase();
    return this.data.users.find(
      (u) => u.email.toLowerCase() === clean || u.phone.trim() === clean
    );
  }

  public createUser(user: User & { passwordHash: string }) {
    this.data.users.push(user);
    this.commit();
    return user;
  }

  public updateUser(id: string, updates: Partial<User>) {
    const idx = this.data.users.findIndex((u) => u.id === id);
    if (idx !== -1) {
      this.data.users[idx] = { ...this.data.users[idx], ...updates, updatedAt: new Date().toISOString() };
      this.commit();
      return this.data.users[idx];
    }
    return null;
  }

  // --- Categories & Brands ---
  public getCategories() {
    return this.data.categories.map((c) => {
      const count = this.data.products.filter((p) => p.categoryId === c.id && p.status === 'active').length;
      return { ...c, productCount: count };
    });
  }

  public getCategoryBySlug(slug: string) {
    return this.data.categories.find((c) => c.slug === slug);
  }

  public addCategory(cat: Omit<Category, 'id'>) {
    const newCat = { ...cat, id: generateId('cat') };
    this.data.categories.push(newCat);
    this.commit();
    return newCat;
  }

  public updateCategory(id: string, updates: Partial<Category>) {
    const idx = this.data.categories.findIndex((c) => c.id === id);
    if (idx !== -1) {
      this.data.categories[idx] = { ...this.data.categories[idx], ...updates };
      this.commit();
      return this.data.categories[idx];
    }
    return null;
  }

  public deleteCategory(id: string) {
    const idx = this.data.categories.findIndex((c) => c.id === id);
    if (idx !== -1) {
      this.data.categories.splice(idx, 1);
      this.commit();
      return true;
    }
    return false;
  }

  public getBrands() {
    return this.data.brands;
  }

  public addBrand(brand: Omit<Brand, 'id'>) {
    const newBrand = { ...brand, id: generateId('br') };
    this.data.brands.push(newBrand);
    this.commit();
    return newBrand;
  }

  public updateBrand(id: string, updates: Partial<Brand>) {
    const idx = this.data.brands.findIndex((b) => b.id === id);
    if (idx !== -1) {
      this.data.brands[idx] = { ...this.data.brands[idx], ...updates };
      this.commit();
      return this.data.brands[idx];
    }
    return null;
  }

  public deleteBrand(id: string) {
    const idx = this.data.brands.findIndex((b) => b.id === id);
    if (idx !== -1) {
      this.data.brands.splice(idx, 1);
      this.commit();
      return true;
    }
    return false;
  }

  // --- Vehicles & Models ---
  public getVehicles() {
    return this.data.vehicles;
  }

  public getVehicleModels(vehicleId?: string) {
    if (vehicleId) {
      return this.data.vehicleModels.filter((m) => m.vehicleId === vehicleId);
    }
    return this.data.vehicleModels;
  }

  public getVehicleModelById(id: string) {
    return this.data.vehicleModels.find((m) => m.id === id);
  }

  // --- Products ---
  public getProducts(options: {
    isAdmin?: boolean;
    categoryId?: string;
    brandId?: string;
    vehicleModelId?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    inStockOnly?: boolean;
    featured?: boolean;
    bestSeller?: boolean;
    sort?: 'newest' | 'price_asc' | 'price_desc' | 'popular';
  } = {}) {
    let list = [...this.data.products];

    // Customer only sees active products
    if (!options.isAdmin) {
      list = list.filter((p) => p.status === 'active');
    }

    if (options.categoryId) {
      list = list.filter((p) => p.categoryId === options.categoryId);
    }

    if (options.brandId) {
      list = list.filter((p) => p.brandId === options.brandId);
    }

    if (options.featured !== undefined) {
      list = list.filter((p) => p.isFeatured === options.featured);
    }

    if (options.bestSeller !== undefined) {
      list = list.filter((p) => p.isBestSeller === options.bestSeller);
    }

    if (options.inStockOnly) {
      list = list.filter((p) => p.stock > 0);
    }

    if (options.minPrice !== undefined) {
      list = list.filter((p) => (p.discountPrice || p.sellingPrice) >= options.minPrice!);
    }

    if (options.maxPrice !== undefined) {
      list = list.filter((p) => (p.discountPrice || p.sellingPrice) <= options.maxPrice!);
    }

    // Vehicle compatibility filter
    if (options.vehicleModelId) {
      const compatibleProductIds = new Set(
        this.data.vehicleCompatibility
          .filter((vc) => vc.vehicleModelId === options.vehicleModelId)
          .map((vc) => vc.productId)
      );
      list = list.filter((p) => compatibleProductIds.has(p.id));
    }

    // Search query: matching name, sku, brand, category, description
    if (options.search && options.search.trim()) {
      const query = options.search.trim().toLowerCase();
      list = list.filter((p) => {
        return (
          p.name.toLowerCase().includes(query) ||
          p.sku.toLowerCase().includes(query) ||
          p.shortDescription.toLowerCase().includes(query) ||
          (p.brandName && p.brandName.toLowerCase().includes(query)) ||
          (p.categoryName && p.categoryName.toLowerCase().includes(query))
        );
      });
    }

    // Sorting
    if (options.sort === 'price_asc') {
      list.sort((a, b) => (a.discountPrice || a.sellingPrice) - (b.discountPrice || b.sellingPrice));
    } else if (options.sort === 'price_desc') {
      list.sort((a, b) => (b.discountPrice || b.sellingPrice) - (a.discountPrice || a.sellingPrice));
    } else if (options.sort === 'popular') {
      list.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
    } else {
      // Default newest
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    // STRICT SANITIZATION: If not admin, remove purchasePrice and profit data!
    return list.map((p) => {
      const copy = { ...p };
      // Attach compatible models
      const compatList = this.data.vehicleCompatibility
        .filter((vc) => vc.productId === p.id)
        .map((vc) => this.data.vehicleModels.find((vm) => vm.id === vc.vehicleModelId))
        .filter(Boolean) as VehicleModel[];
      copy.compatibleModels = compatList;

      if (!options.isAdmin) {
        delete copy.purchasePrice;
        delete copy.profit;
        delete copy.profitMargin;
      }
      return copy;
    });
  }

  public getProductByIdOrSlug(identifier: string, isAdmin = false) {
    const product = this.data.products.find((p) => p.id === identifier || p.slug === identifier);
    if (!product) return null;

    const copy = { ...product };
    const compatList = this.data.vehicleCompatibility
      .filter((vc) => vc.productId === product.id)
      .map((vc) => this.data.vehicleModels.find((vm) => vm.id === vc.vehicleModelId))
      .filter(Boolean) as VehicleModel[];
    copy.compatibleModels = compatList;

    if (!isAdmin) {
      delete copy.purchasePrice;
      delete copy.profit;
      delete copy.profitMargin;
    }
    return copy;
  }

  public addProduct(
    productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'profit' | 'profitMargin'> & {
      compatibleModelIds?: string[];
    }
  ) {
    const id = generateId('prod');
    const now = new Date().toISOString();
    const brand = this.data.brands.find((b) => b.id === productData.brandId);
    const category = this.data.categories.find((c) => c.id === productData.categoryId);

    const purchasePrice = Number(productData.purchasePrice) || 0;
    const sellingPrice = Number(productData.sellingPrice) || 0;
    const profit = sellingPrice - purchasePrice;
    const profitMargin = sellingPrice > 0 ? Math.round((profit / sellingPrice) * 100) : 0;

    const newProduct: Product = {
      ...productData,
      id,
      brandName: brand?.name || '',
      categoryName: category?.name || '',
      purchasePrice,
      sellingPrice,
      profit,
      profitMargin,
      createdAt: now,
      updatedAt: now,
    };

    this.data.products.push(newProduct);

    // Save compatibility
    if (productData.compatibleModelIds && productData.compatibleModelIds.length > 0) {
      productData.compatibleModelIds.forEach((mId) => {
        const model = this.data.vehicleModels.find((vm) => vm.id === mId);
        if (model) {
          this.data.vehicleCompatibility.push({
            id: generateId('vc'),
            productId: id,
            vehicleModelId: mId,
            modelName: model.modelName,
            vehicleMake: model.vehicleMake,
            yearFrom: model.yearStart,
            yearTo: model.yearEnd,
          });
        }
      });
    }

    this.commit();
    return newProduct;
  }

  public updateProduct(
    id: string,
    updates: Partial<Product> & { compatibleModelIds?: string[] }
  ) {
    const idx = this.data.products.findIndex((p) => p.id === id);
    if (idx === -1) return null;

    const current = this.data.products[idx];
    const brand = updates.brandId ? this.data.brands.find((b) => b.id === updates.brandId) : undefined;
    const category = updates.categoryId ? this.data.categories.find((c) => c.id === updates.categoryId) : undefined;

    const purchasePrice = updates.purchasePrice !== undefined ? Number(updates.purchasePrice) : current.purchasePrice || 0;
    const sellingPrice = updates.sellingPrice !== undefined ? Number(updates.sellingPrice) : current.sellingPrice;
    const profit = sellingPrice - purchasePrice;
    const profitMargin = sellingPrice > 0 ? Math.round((profit / sellingPrice) * 100) : 0;

    this.data.products[idx] = {
      ...current,
      ...updates,
      brandName: brand ? brand.name : current.brandName,
      categoryName: category ? category.name : current.categoryName,
      purchasePrice,
      sellingPrice,
      profit,
      profitMargin,
      updatedAt: new Date().toISOString(),
    };

    // Update vehicle compatibility if provided
    if (updates.compatibleModelIds) {
      this.data.vehicleCompatibility = this.data.vehicleCompatibility.filter((vc) => vc.productId !== id);
      updates.compatibleModelIds.forEach((mId) => {
        const model = this.data.vehicleModels.find((vm) => vm.id === mId);
        if (model) {
          this.data.vehicleCompatibility.push({
            id: generateId('vc'),
            productId: id,
            vehicleModelId: mId,
            modelName: model.modelName,
            vehicleMake: model.vehicleMake,
            yearFrom: model.yearStart,
            yearTo: model.yearEnd,
          });
        }
      });
    }

    this.commit();
    return this.data.products[idx];
  }

  public deleteProduct(id: string) {
    const idx = this.data.products.findIndex((p) => p.id === id);
    if (idx !== -1) {
      this.data.products.splice(idx, 1);
      this.data.vehicleCompatibility = this.data.vehicleCompatibility.filter((vc) => vc.productId !== id);
      this.commit();
      return true;
    }
    return false;
  }

  // --- Cart ---
  public getCart(userIdOrSession: string): CartItem[] {
    return this.data.carts[userIdOrSession] || [];
  }

  public setCart(userIdOrSession: string, items: CartItem[]) {
    this.data.carts[userIdOrSession] = items;
    this.commit();
    return items;
  }

  public clearCart(userIdOrSession: string) {
    delete this.data.carts[userIdOrSession];
    this.commit();
  }

  // --- Orders ---
  public getOrders(options: { userId?: string; status?: OrderStatus; search?: string } = {}) {
    let list = [...this.data.orders];

    if (options.userId) {
      list = list.filter((o) => o.userId === options.userId);
    }

    if (options.status) {
      list = list.filter((o) => o.orderStatus === options.status);
    }

    if (options.search) {
      const q = options.search.trim().toLowerCase();
      list = list.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.customerPhone.includes(q) ||
          (o.trackingCode && o.trackingCode.toLowerCase().includes(q))
      );
    }

    // Sort newest first
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getOrderById(id: string) {
    return this.data.orders.find((o) => o.id === id || o.orderNumber === id);
  }

  public getOrderByTracking(orderNumber: string, phone: string) {
    const cleanNum = orderNumber.trim().toUpperCase();
    const cleanPhone = phone.trim();
    return this.data.orders.find(
      (o) => o.orderNumber.toUpperCase() === cleanNum && o.customerPhone.trim() === cleanPhone
    );
  }

  public createOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>) {
    const id = generateId('ord');
    const orderNumber = `YP-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date().toISOString();

    // Calculate total cost and profit for admin metrics
    let totalCost = 0;
    orderData.items.forEach((item) => {
      const prod = this.data.products.find((p) => p.id === item.productId);
      const purchasePrice = prod?.purchasePrice || 0;
      item.purchasePrice = purchasePrice;
      totalCost += purchasePrice * item.quantity;
    });

    const totalProfit = Math.max(0, orderData.subtotal - orderData.discountAmount - totalCost);

    const newOrder: Order = {
      ...orderData,
      id,
      orderNumber,
      totalCost,
      totalProfit,
      createdAt: now,
      updatedAt: now,
    };

    this.data.orders.unshift(newOrder);

    // Add notification for admin
    this.addNotification({
      title: 'سفارش جدید ثبت شد',
      message: `سفارش ${orderNumber} به ارزش ${orderData.totalAmount.toLocaleString('fa-IR')} تومان ثبت شد.`,
      type: 'order',
    });

    this.commit();
    return newOrder;
  }

  public updateOrderStatus(id: string, status: OrderStatus, trackingCode?: string, adminUserId?: string) {
    const order = this.data.orders.find((o) => o.id === id || o.orderNumber === id);
    if (!order) return null;

    const oldStatus = order.orderStatus;
    order.orderStatus = status;
    if (trackingCode !== undefined) {
      order.trackingCode = trackingCode;
    }
    order.updatedAt = new Date().toISOString();

    // If order transitioned to paid/confirmed, deduct stock if not yet deducted
    if (status === 'confirmed' || status === 'sourcing' || status === 'purchased') {
      order.items.forEach((item) => {
        const p = this.data.products.find((prod) => prod.id === item.productId);
        if (p && !order.paymentStatus) {
          p.stock = Math.max(0, p.stock - item.quantity);
        }
      });
    }

    // Add admin audit log
    if (adminUserId) {
      const adminUser = this.findUserById(adminUserId);
      this.data.adminLogs.unshift({
        id: generateId('log'),
        userId: adminUserId,
        userName: adminUser?.name || 'مدیر',
        action: 'UPDATE_ORDER_STATUS',
        targetType: 'order',
        targetId: order.id,
        details: `تغییر وضعیت از ${oldStatus} به ${status}${trackingCode ? ` (کد رهگیری: ${trackingCode})` : ''}`,
        createdAt: new Date().toISOString(),
      });
    }

    this.commit();
    return order;
  }

  public createPayment(paymentData: Omit<Payment, 'id' | 'createdAt'>) {
    const id = generateId('pay');
    const now = new Date().toISOString();
    const newPayment: Payment = {
      ...paymentData,
      id,
      createdAt: now,
    };
    this.data.payments.unshift(newPayment);

    // Update order payment status
    const order = this.data.orders.find((o) => o.id === paymentData.orderId);
    if (order) {
      order.paymentStatus = paymentData.status;
      if (paymentData.status === 'paid') {
        order.orderStatus = 'confirmed'; // automatically moves to confirmed once paid
        // Deduct inventory
        order.items.forEach((item) => {
          const prod = this.data.products.find((p) => p.id === item.productId);
          if (prod) {
            prod.stock = Math.max(0, prod.stock - item.quantity);
            // Low stock warning
            if (prod.stock <= prod.minStock) {
              this.addNotification({
                title: 'کمبود موجودی قطعه',
                message: `موجودی قطعه «${prod.name}» به ${prod.stock} عدد کاهش یافته است.`,
                type: 'inventory',
              });
            }
          }
        });
      }
      order.updatedAt = now;
    }

    this.commit();
    return newPayment;
  }

  // --- Coupons / Discounts ---
  public getDiscounts() {
    return this.data.discounts;
  }

  public findDiscountByCode(code: string) {
    return this.data.discounts.find((d) => d.code.toUpperCase() === code.trim().toUpperCase());
  }

  public addDiscount(coupon: Omit<DiscountCoupon, 'id' | 'usageCount'>) {
    const newCoupon: DiscountCoupon = {
      ...coupon,
      id: generateId('dsc'),
      usageCount: 0,
    };
    this.data.discounts.push(newCoupon);
    this.commit();
    return newCoupon;
  }

  public updateDiscount(id: string, updates: Partial<DiscountCoupon>) {
    const idx = this.data.discounts.findIndex((d) => d.id === id);
    if (idx !== -1) {
      this.data.discounts[idx] = { ...this.data.discounts[idx], ...updates };
      this.commit();
      return this.data.discounts[idx];
    }
    return null;
  }

  public deleteDiscount(id: string) {
    const idx = this.data.discounts.findIndex((d) => d.id === id);
    if (idx !== -1) {
      this.data.discounts.splice(idx, 1);
      this.commit();
      return true;
    }
    return false;
  }

  // --- Notifications & Admin Logs ---
  public getNotifications() {
    return this.data.notifications;
  }

  public addNotification(notif: { title: string; message: string; type: 'order' | 'system' | 'inventory' | 'payment' }) {
    this.data.notifications.unshift({
      id: generateId('notif'),
      ...notif,
      isRead: false,
      createdAt: new Date().toISOString(),
    });
    this.commit();
  }

  public markNotificationAsRead(id: string) {
    const n = this.data.notifications.find((notif) => notif.id === id);
    if (n) {
      n.isRead = true;
      this.commit();
    }
  }

  public getAdminLogs() {
    return this.data.adminLogs;
  }

  // --- Store Settings ---
  public getSettings() {
    return this.data.settings;
  }

  public updateSettings(updates: Partial<StoreSettings>) {
    this.data.settings = { ...this.data.settings, ...updates };
    this.commit();
    return this.data.settings;
  }

  // --- Dashboard & Analytics Stats ---
  public getAdminDashboardStats() {
    const paidOrders = this.data.orders.filter((o) => o.paymentStatus === 'paid');
    const totalSales = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalProfit = paidOrders.reduce((sum, o) => sum + (o.totalProfit || 0), 0);
    const profitMarginPercent = totalSales > 0 ? Math.round((totalProfit / totalSales) * 100) : 0;

    const ordersByStatus: Record<OrderStatus, number> = {
      pending: 0,
      confirmed: 0,
      sourcing: 0,
      purchased: 0,
      preparing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };

    this.data.orders.forEach((o) => {
      ordersByStatus[o.orderStatus] = (ordersByStatus[o.orderStatus] || 0) + 1;
    });

    const lowStockProducts = this.data.products.filter((p) => p.stock <= p.minStock);

    // Sales by Iranian month name or chronological buckets
    const monthNames = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
    const monthlySales = [
      { month: 'آبان', sales: 18500000, profit: 4200000, ordersCount: 12 },
      { month: 'آذر', sales: 24200000, profit: 5600000, ordersCount: 16 },
      { month: 'دی', sales: 31000000, profit: 7100000, ordersCount: 21 },
      { month: 'بهمن', sales: 42500000, profit: 9800000, ordersCount: 29 },
      { month: 'اسفند', sales: totalSales > 0 ? totalSales : 54000000, profit: totalProfit > 0 ? totalProfit : 12400000, ordersCount: this.data.orders.length },
    ];

    // Top selling items
    const productSalesMap = new Map<string, { product: Product; quantitySold: number; totalRevenue: number }>();
    this.data.orders.forEach((order) => {
      order.items.forEach((item) => {
        const existing = productSalesMap.get(item.productId);
        const prod = this.data.products.find((p) => p.id === item.productId);
        if (prod) {
          if (existing) {
            existing.quantitySold += item.quantity;
            existing.totalRevenue += item.totalPrice;
          } else {
            productSalesMap.set(item.productId, {
              product: prod,
              quantitySold: item.quantity,
              totalRevenue: item.totalPrice,
            });
          }
        }
      });
    });

    const topSellingProducts = Array.from(productSalesMap.values())
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, 5);

    return {
      totalSales,
      totalProfit,
      profitMarginPercent,
      totalOrders: this.data.orders.length,
      totalCustomers: this.data.users.filter((u) => u.role === 'customer').length,
      totalProducts: this.data.products.length,
      ordersByStatus,
      lowStockCount: lowStockProducts.length,
      monthlySales,
      recentOrders: this.data.orders.slice(0, 7),
      lowStockProducts,
      topSellingProducts,
    };
  }

  // Customer summaries for admin
  public getCustomersSummary() {
    const customers = this.data.users.filter((u) => u.role === 'customer');
    return customers.map((c) => {
      const userOrders = this.data.orders.filter((o) => o.userId === c.id);
      const totalSpent = userOrders.filter((o) => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.totalAmount, 0);
      const lastOrder = userOrders[0];
      return {
        id: c.id,
        name: c.name,
        phone: c.phone,
        email: c.email,
        ordersCount: userOrders.length,
        totalSpent,
        lastOrderDate: lastOrder ? lastOrder.createdAt : undefined,
        createdAt: c.createdAt,
        isActive: c.isActive,
      };
    });
  }
}

// Singleton database instance
export const db = new RelationalDatabase();
