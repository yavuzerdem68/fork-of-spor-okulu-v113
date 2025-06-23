import React, { useState, useEffect } from "react";
import Head from "next/head";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Package, 
  ShoppingCart, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Download,
  Upload,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Banknote,
  Users,
  Calendar,
  Eye,
  BarChart3,
  Package2,
  ShoppingBag,
  Shirt,
  Home,
  Bell,
  Settings
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/router";
import { toast } from "sonner";
import Sidebar from '@/components/Sidebar';

interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  size?: string;
  color?: string;
  brand?: string;
  image?: string;
  status: 'Aktif' | 'Pasif';
  createdAt: string;
  updatedAt: string;
}

interface Sale {
  id: string;
  productId: string;
  productName: string;
  athleteId: string;
  athleteName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discount: number;
  finalPrice: number;
  paymentMethod: string;
  paymentStatus: 'Ödendi' | 'Bekliyor' | 'Kısmi';
  saleDate: string;
  notes?: string;
  soldBy: string;
}

interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: 'Giriş' | 'Çıkış' | 'Düzeltme';
  quantity: number;
  reason: string;
  date: string;
  user: string;
  notes?: string;
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
};

const categories = [
  'Forma',
  'Eşofman',
  'Sweatshirt',
  'T-Shirt',
  'Şort',
  'Ayakkabı',
  'Çanta',
  'Aksesuar',
  'Ekipman',
  'Diğer'
];

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', '38', '40', '42', '44', '46'];
const colors = ['Beyaz', 'Siyah', 'Kırmızı', 'Mavi', 'Yeşil', 'Sarı', 'Turuncu', 'Mor', 'Pembe', 'Gri', 'Lacivert'];

export default function InventorySales() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("products");
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [athletes, setAthletes] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [showSaleDialog, setShowSaleDialog] = useState(false);
  const [showStockDialog, setShowStockDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);

  // Form states
  const [productForm, setProductForm] = useState({
    name: '',
    category: '',
    description: '',
    price: '',
    cost: '',
    stock: '',
    minStock: '',
    size: '',
    color: '',
    brand: '',
    status: 'Aktif'
  });

  const [saleForm, setSaleForm] = useState({
    productId: '',
    athleteId: '',
    quantity: '',
    discount: '',
    paymentMethod: 'Nakit',
    paymentStatus: 'Ödendi',
    notes: ''
  });

  const [stockForm, setStockForm] = useState({
    productId: '',
    type: 'Giriş',
    quantity: '',
    reason: '',
    notes: ''
  });

  useEffect(() => {
    // Check if user is logged in and has admin role
    const role = localStorage.getItem("userRole");
    if (role !== "admin") {
      router.push("/login");
      return;
    }

    loadData();
  }, [router]);

  const loadData = () => {
    // Load products
    const savedProducts = localStorage.getItem('inventory_products');
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    }

    // Load sales
    const savedSales = localStorage.getItem('inventory_sales');
    if (savedSales) {
      setSales(JSON.parse(savedSales));
    }

    // Load stock movements
    const savedMovements = localStorage.getItem('inventory_movements');
    if (savedMovements) {
      setStockMovements(JSON.parse(savedMovements));
    }

    // Load athletes
    const savedAthletes = localStorage.getItem('students');
    if (savedAthletes) {
      setAthletes(JSON.parse(savedAthletes));
    }
  };

  const saveProducts = (newProducts: Product[]) => {
    localStorage.setItem('inventory_products', JSON.stringify(newProducts));
    setProducts(newProducts);
  };

  const saveSales = (newSales: Sale[]) => {
    localStorage.setItem('inventory_sales', JSON.stringify(newSales));
    setSales(newSales);
  };

  const saveStockMovements = (newMovements: StockMovement[]) => {
    localStorage.setItem('inventory_movements', JSON.stringify(newMovements));
    setStockMovements(newMovements);
  };

  const handleAddProduct = () => {
    if (!productForm.name || !productForm.category || !productForm.price) {
      toast.error("Lütfen zorunlu alanları doldurun");
      return;
    }

    const newProduct: Product = {
      id: Date.now().toString(),
      name: productForm.name,
      category: productForm.category,
      description: productForm.description,
      price: parseFloat(productForm.price),
      cost: parseFloat(productForm.cost) || 0,
      stock: parseInt(productForm.stock) || 0,
      minStock: parseInt(productForm.minStock) || 0,
      size: productForm.size,
      color: productForm.color,
      brand: productForm.brand,
      status: productForm.status as 'Aktif' | 'Pasif',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedProducts = [...products, newProduct];
    saveProducts(updatedProducts);

    // Add stock movement if initial stock > 0
    if (newProduct.stock > 0) {
      const stockMovement: StockMovement = {
        id: Date.now().toString(),
        productId: newProduct.id,
        productName: newProduct.name,
        type: 'Giriş',
        quantity: newProduct.stock,
        reason: 'İlk stok girişi',
        date: new Date().toISOString(),
        user: 'Admin',
        notes: 'Ürün oluşturulurken yapılan ilk stok girişi'
      };
      const updatedMovements = [...stockMovements, stockMovement];
      saveStockMovements(updatedMovements);
    }

    resetProductForm();
    setShowProductDialog(false);
    toast.success("Ürün başarıyla eklendi");
  };

  const handleEditProduct = () => {
    if (!editingProduct || !productForm.name || !productForm.category || !productForm.price) {
      toast.error("Lütfen zorunlu alanları doldurun");
      return;
    }

    const updatedProduct: Product = {
      ...editingProduct,
      name: productForm.name,
      category: productForm.category,
      description: productForm.description,
      price: parseFloat(productForm.price),
      cost: parseFloat(productForm.cost) || 0,
      stock: parseInt(productForm.stock) || 0,
      minStock: parseInt(productForm.minStock) || 0,
      size: productForm.size,
      color: productForm.color,
      brand: productForm.brand,
      status: productForm.status as 'Aktif' | 'Pasif',
      updatedAt: new Date().toISOString()
    };

    const updatedProducts = products.map(p => p.id === editingProduct.id ? updatedProduct : p);
    saveProducts(updatedProducts);

    resetProductForm();
    setEditingProduct(null);
    setShowProductDialog(false);
    toast.success("Ürün başarıyla güncellendi");
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm("Bu ürünü silmek istediğinizden emin misiniz?")) {
      const updatedProducts = products.filter(p => p.id !== productId);
      saveProducts(updatedProducts);
      toast.success("Ürün başarıyla silindi");
    }
  };

  const handleAddSale = () => {
    if (!saleForm.productId || !saleForm.athleteId || !saleForm.quantity) {
      toast.error("Lütfen zorunlu alanları doldurun");
      return;
    }

    const product = products.find(p => p.id === saleForm.productId);
    const athlete = athletes.find(a => a.id === saleForm.athleteId);
    
    if (!product || !athlete) {
      toast.error("Ürün veya sporcu bulunamadı");
      return;
    }

    const quantity = parseInt(saleForm.quantity);
    if (quantity > product.stock) {
      toast.error("Yetersiz stok");
      return;
    }

    const discount = parseFloat(saleForm.discount) || 0;
    const totalPrice = product.price * quantity;
    const finalPrice = totalPrice - discount;

    const newSale: Sale = {
      id: Date.now().toString(),
      productId: product.id,
      productName: product.name,
      athleteId: athlete.id,
      athleteName: `${athlete.name} ${athlete.surname}`,
      quantity,
      unitPrice: product.price,
      totalPrice,
      discount,
      finalPrice,
      paymentMethod: saleForm.paymentMethod,
      paymentStatus: saleForm.paymentStatus as 'Ödendi' | 'Bekliyor' | 'Kısmi',
      saleDate: new Date().toISOString(),
      notes: saleForm.notes,
      soldBy: 'Admin'
    };

    const updatedSales = [...sales, newSale];
    saveSales(updatedSales);

    // Update product stock
    const updatedProducts = products.map(p => 
      p.id === product.id ? { ...p, stock: p.stock - quantity, updatedAt: new Date().toISOString() } : p
    );
    saveProducts(updatedProducts);

    // Add stock movement
    const stockMovement: StockMovement = {
      id: Date.now().toString(),
      productId: product.id,
      productName: product.name,
      type: 'Çıkış',
      quantity,
      reason: 'Satış',
      date: new Date().toISOString(),
      user: 'Admin',
      notes: `${athlete.name} ${athlete.surname} - Satış`
    };
    const updatedMovements = [...stockMovements, stockMovement];
    saveStockMovements(updatedMovements);

    resetSaleForm();
    setShowSaleDialog(false);
    toast.success("Satış başarıyla kaydedildi");
  };

  const handleStockMovement = () => {
    if (!stockForm.productId || !stockForm.quantity || !stockForm.reason) {
      toast.error("Lütfen zorunlu alanları doldurun");
      return;
    }

    const product = products.find(p => p.id === stockForm.productId);
    if (!product) {
      toast.error("Ürün bulunamadı");
      return;
    }

    const quantity = parseInt(stockForm.quantity);
    const newStock = stockForm.type === 'Giriş' 
      ? product.stock + quantity 
      : stockForm.type === 'Çıkış'
      ? Math.max(0, product.stock - quantity)
      : quantity; // Düzeltme

    // Update product stock
    const updatedProducts = products.map(p => 
      p.id === product.id ? { ...p, stock: newStock, updatedAt: new Date().toISOString() } : p
    );
    saveProducts(updatedProducts);

    // Add stock movement
    const stockMovement: StockMovement = {
      id: Date.now().toString(),
      productId: product.id,
      productName: product.name,
      type: stockForm.type as 'Giriş' | 'Çıkış' | 'Düzeltme',
      quantity,
      reason: stockForm.reason,
      date: new Date().toISOString(),
      user: 'Admin',
      notes: stockForm.notes
    };
    const updatedMovements = [...stockMovements, stockMovement];
    saveStockMovements(updatedMovements);

    resetStockForm();
    setShowStockDialog(false);
    toast.success("Stok hareketi başarıyla kaydedildi");
  };

  const resetProductForm = () => {
    setProductForm({
      name: '',
      category: '',
      description: '',
      price: '',
      cost: '',
      stock: '',
      minStock: '',
      size: '',
      color: '',
      brand: '',
      status: 'Aktif'
    });
  };

  const resetSaleForm = () => {
    setSaleForm({
      productId: '',
      athleteId: '',
      quantity: '',
      discount: '',
      paymentMethod: 'Nakit',
      paymentStatus: 'Ödendi',
      notes: ''
    });
  };

  const resetStockForm = () => {
    setStockForm({
      productId: '',
      type: 'Giriş',
      quantity: '',
      reason: '',
      notes: ''
    });
  };

  const openEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      category: product.category,
      description: product.description,
      price: product.price.toString(),
      cost: product.cost.toString(),
      stock: product.stock.toString(),
      minStock: product.minStock.toString(),
      size: product.size || '',
      color: product.color || '',
      brand: product.brand || '',
      status: product.status
    });
    setShowProductDialog(true);
  };

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate stats
  const totalProducts = products.length;
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const lowStockProducts = products.filter(p => p.stock <= p.minStock).length;
  const totalSalesValue = sales.reduce((sum, s) => sum + s.finalPrice, 0);
  const todaySales = sales.filter(s => new Date(s.saleDate).toDateString() === new Date().toDateString());
  const todaySalesValue = todaySales.reduce((sum, s) => sum + s.finalPrice, 0);

  return (
    <>
      <Head>
        <title>Stok ve Satış Yönetimi - SportsCRM</title>
        <meta name="description" content="Spor okulu stok ve satış yönetimi" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-background flex">
        {/* Sidebar */}
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentPath="/inventory-sales" />

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-card border-b border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Package className="h-6 w-6 text-blue-600" />
                  Stok ve Satış
                </h1>
                <p className="text-muted-foreground">Envanter ve satış işlemleri</p>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input 
                    placeholder="Ürün ara..." 
                    className="pl-10 w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Kategoriler</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm">
                  <Bell className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => router.push('/system-settings')}>
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </header>

          {/* Main Dashboard Content */}
          <main className="flex-1 p-6 space-y-6">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Toplam Ürün</p>
                    <p className="text-2xl font-bold">{totalProducts}</p>
                    <p className="text-xs text-muted-foreground">Aktif ürün sayısı</p>
                  </div>
                  <Package2 className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Toplam Stok</p>
                    <p className="text-2xl font-bold">{totalStock}</p>
                    <p className="text-xs text-muted-foreground">Adet</p>
                  </div>
                  <Package className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Düşük Stok</p>
                    <p className="text-2xl font-bold text-orange-600">{lowStockProducts}</p>
                    <p className="text-xs text-muted-foreground">Ürün</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Bugün Satış</p>
                    <p className="text-2xl font-bold">₺{todaySalesValue.toLocaleString('tr-TR')}</p>
                    <p className="text-xs text-muted-foreground">{todaySales.length} işlem</p>
                  </div>
                  <Banknote className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="products">Ürünler</TabsTrigger>
              <TabsTrigger value="sales">Satışlar</TabsTrigger>
              <TabsTrigger value="stock">Stok Hareketleri</TabsTrigger>
              <TabsTrigger value="reports">Raporlar</TabsTrigger>
            </TabsList>

            {/* Products Tab */}
            <TabsContent value="products">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Ürün Listesi</CardTitle>
                      <CardDescription>Mağaza ürünlerini yönetin</CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
                        <DialogTrigger asChild>
                          <Button onClick={() => { resetProductForm(); setEditingProduct(null); }}>
                            <Plus className="h-4 w-4 mr-2" />
                            Yeni Ürün
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>{editingProduct ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}</DialogTitle>
                            <DialogDescription>
                              Ürün bilgilerini girin
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="name">Ürün Adı *</Label>
                              <Input
                                id="name"
                                value={productForm.name}
                                onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                                placeholder="Ürün adı"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="category">Kategori *</Label>
                              <Select value={productForm.category} onValueChange={(value) => setProductForm({...productForm, category: value})}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Kategori seçin" />
                                </SelectTrigger>
                                <SelectContent>
                                  {categories.map(category => (
                                    <SelectItem key={category} value={category}>{category}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="price">Satış Fiyatı *</Label>
                              <Input
                                id="price"
                                type="number"
                                value={productForm.price}
                                onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                                placeholder="0.00"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="cost">Maliyet</Label>
                              <Input
                                id="cost"
                                type="number"
                                value={productForm.cost}
                                onChange={(e) => setProductForm({...productForm, cost: e.target.value})}
                                placeholder="0.00"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="stock">Stok Miktarı</Label>
                              <Input
                                id="stock"
                                type="number"
                                value={productForm.stock}
                                onChange={(e) => setProductForm({...productForm, stock: e.target.value})}
                                placeholder="0"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="minStock">Minimum Stok</Label>
                              <Input
                                id="minStock"
                                type="number"
                                value={productForm.minStock}
                                onChange={(e) => setProductForm({...productForm, minStock: e.target.value})}
                                placeholder="0"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="size">Beden</Label>
                              <Select value={productForm.size} onValueChange={(value) => setProductForm({...productForm, size: value})}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Beden seçin" />
                                </SelectTrigger>
                                <SelectContent>
                                  {sizes.map(size => (
                                    <SelectItem key={size} value={size}>{size}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="color">Renk</Label>
                              <Select value={productForm.color} onValueChange={(value) => setProductForm({...productForm, color: value})}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Renk seçin" />
                                </SelectTrigger>
                                <SelectContent>
                                  {colors.map(color => (
                                    <SelectItem key={color} value={color}>{color}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="brand">Marka</Label>
                              <Input
                                id="brand"
                                value={productForm.brand}
                                onChange={(e) => setProductForm({...productForm, brand: e.target.value})}
                                placeholder="Marka"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="status">Durum</Label>
                              <Select value={productForm.status} onValueChange={(value) => setProductForm({...productForm, status: value})}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Aktif">Aktif</SelectItem>
                                  <SelectItem value="Pasif">Pasif</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="col-span-2 space-y-2">
                              <Label htmlFor="description">Açıklama</Label>
                              <Textarea
                                id="description"
                                value={productForm.description}
                                onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                                placeholder="Ürün açıklaması"
                                rows={3}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setShowProductDialog(false)}>
                              İptal
                            </Button>
                            <Button onClick={editingProduct ? handleEditProduct : handleAddProduct}>
                              {editingProduct ? 'Güncelle' : 'Ekle'}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ürün</TableHead>
                        <TableHead>Kategori</TableHead>
                        <TableHead>Fiyat</TableHead>
                        <TableHead>Stok</TableHead>
                        <TableHead>Durum</TableHead>
                        <TableHead>İşlemler</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{product.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {product.brand && `${product.brand} • `}
                                {product.size && `${product.size} • `}
                                {product.color}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{product.category}</Badge>
                          </TableCell>
                          <TableCell>₺{product.price.toLocaleString('tr-TR')}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <span className={product.stock <= product.minStock ? 'text-orange-600 font-medium' : ''}>
                                {product.stock}
                              </span>
                              {product.stock <= product.minStock && (
                                <AlertTriangle className="h-4 w-4 text-orange-600" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={product.status === 'Aktif' ? 'default' : 'secondary'}>
                              {product.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="sm" onClick={() => openEditProduct(product)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteProduct(product.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Sales Tab */}
            <TabsContent value="sales">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Satış İşlemleri</CardTitle>
                      <CardDescription>Satış kayıtlarını görüntüleyin ve yeni satış yapın</CardDescription>
                    </div>
                    <Dialog open={showSaleDialog} onOpenChange={setShowSaleDialog}>
                      <DialogTrigger asChild>
                        <Button onClick={resetSaleForm}>
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Yeni Satış
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Yeni Satış</DialogTitle>
                          <DialogDescription>
                            Satış bilgilerini girin
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="productId">Ürün *</Label>
                            <Select value={saleForm.productId} onValueChange={(value) => setSaleForm({...saleForm, productId: value})}>
                              <SelectTrigger>
                                <SelectValue placeholder="Ürün seçin" />
                              </SelectTrigger>
                              <SelectContent>
                                {products.filter(p => p.status === 'Aktif' && p.stock > 0).map(product => (
                                  <SelectItem key={product.id} value={product.id}>
                                    {product.name} - ₺{product.price} (Stok: {product.stock})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="athleteId">Sporcu *</Label>
                            <Select value={saleForm.athleteId} onValueChange={(value) => setSaleForm({...saleForm, athleteId: value})}>
                              <SelectTrigger>
                                <SelectValue placeholder="Sporcu seçin" />
                              </SelectTrigger>
                              <SelectContent>
                                {athletes.map(athlete => (
                                  <SelectItem key={athlete.id} value={athlete.id}>
                                    {athlete.name} {athlete.surname}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="quantity">Miktar *</Label>
                              <Input
                                id="quantity"
                                type="number"
                                value={saleForm.quantity}
                                onChange={(e) => setSaleForm({...saleForm, quantity: e.target.value})}
                                placeholder="1"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="discount">İndirim</Label>
                              <Input
                                id="discount"
                                type="number"
                                value={saleForm.discount}
                                onChange={(e) => setSaleForm({...saleForm, discount: e.target.value})}
                                placeholder="0.00"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="paymentMethod">Ödeme Yöntemi</Label>
                              <Select value={saleForm.paymentMethod} onValueChange={(value) => setSaleForm({...saleForm, paymentMethod: value})}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Nakit">Nakit</SelectItem>
                                  <SelectItem value="Kredi Kartı">Kredi Kartı</SelectItem>
                                  <SelectItem value="Banka Kartı">Banka Kartı</SelectItem>
                                  <SelectItem value="Havale">Havale</SelectItem>
                                  <SelectItem value="Çek">Çek</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="paymentStatus">Ödeme Durumu</Label>
                              <Select value={saleForm.paymentStatus} onValueChange={(value) => setSaleForm({...saleForm, paymentStatus: value})}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Ödendi">Ödendi</SelectItem>
                                  <SelectItem value="Bekliyor">Bekliyor</SelectItem>
                                  <SelectItem value="Kısmi">Kısmi</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="notes">Notlar</Label>
                            <Textarea
                              id="notes"
                              value={saleForm.notes}
                              onChange={(e) => setSaleForm({...saleForm, notes: e.target.value})}
                              placeholder="Satış notları"
                              rows={3}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setShowSaleDialog(false)}>
                            İptal
                          </Button>
                          <Button onClick={handleAddSale}>
                            Satış Yap
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tarih</TableHead>
                        <TableHead>Ürün</TableHead>
                        <TableHead>Sporcu</TableHead>
                        <TableHead>Miktar</TableHead>
                        <TableHead>Tutar</TableHead>
                        <TableHead>Ödeme</TableHead>
                        <TableHead>Durum</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sales.slice().reverse().map((sale) => (
                        <TableRow key={sale.id}>
                          <TableCell>
                            {new Date(sale.saleDate).toLocaleDateString('tr-TR')}
                          </TableCell>
                          <TableCell>{sale.productName}</TableCell>
                          <TableCell>{sale.athleteName}</TableCell>
                          <TableCell>{sale.quantity}</TableCell>
                          <TableCell>
                            <div>
                              <div>₺{sale.finalPrice.toLocaleString('tr-TR')}</div>
                              {sale.discount > 0 && (
                                <div className="text-xs text-muted-foreground">
                                  (₺{sale.discount} indirim)
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{sale.paymentMethod}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              sale.paymentStatus === 'Ödendi' ? 'default' :
                              sale.paymentStatus === 'Bekliyor' ? 'destructive' : 'secondary'
                            }>
                              {sale.paymentStatus}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Stock Movements Tab */}
            <TabsContent value="stock">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Stok Hareketleri</CardTitle>
                      <CardDescription>Stok giriş/çıkış işlemlerini yönetin</CardDescription>
                    </div>
                    <Dialog open={showStockDialog} onOpenChange={setShowStockDialog}>
                      <DialogTrigger asChild>
                        <Button onClick={resetStockForm}>
                          <Package className="h-4 w-4 mr-2" />
                          Stok Hareketi
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Stok Hareketi</DialogTitle>
                          <DialogDescription>
                            Stok giriş/çıkış bilgilerini girin
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="productId">Ürün *</Label>
                            <Select value={stockForm.productId} onValueChange={(value) => setStockForm({...stockForm, productId: value})}>
                              <SelectTrigger>
                                <SelectValue placeholder="Ürün seçin" />
                              </SelectTrigger>
                              <SelectContent>
                                {products.map(product => (
                                  <SelectItem key={product.id} value={product.id}>
                                    {product.name} (Mevcut: {product.stock})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="type">İşlem Tipi *</Label>
                              <Select value={stockForm.type} onValueChange={(value) => setStockForm({...stockForm, type: value})}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Giriş">Giriş</SelectItem>
                                  <SelectItem value="Çıkış">Çıkış</SelectItem>
                                  <SelectItem value="Düzeltme">Düzeltme</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="quantity">Miktar *</Label>
                              <Input
                                id="quantity"
                                type="number"
                                value={stockForm.quantity}
                                onChange={(e) => setStockForm({...stockForm, quantity: e.target.value})}
                                placeholder="0"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="reason">Sebep *</Label>
                            <Input
                              id="reason"
                              value={stockForm.reason}
                              onChange={(e) => setStockForm({...stockForm, reason: e.target.value})}
                              placeholder="İşlem sebebi"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="notes">Notlar</Label>
                            <Textarea
                              id="notes"
                              value={stockForm.notes}
                              onChange={(e) => setStockForm({...stockForm, notes: e.target.value})}
                              placeholder="Ek notlar"
                              rows={3}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setShowStockDialog(false)}>
                            İptal
                          </Button>
                          <Button onClick={handleStockMovement}>
                            Kaydet
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tarih</TableHead>
                        <TableHead>Ürün</TableHead>
                        <TableHead>İşlem</TableHead>
                        <TableHead>Miktar</TableHead>
                        <TableHead>Sebep</TableHead>
                        <TableHead>Kullanıcı</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stockMovements.slice().reverse().map((movement) => (
                        <TableRow key={movement.id}>
                          <TableCell>
                            {new Date(movement.date).toLocaleDateString('tr-TR')}
                          </TableCell>
                          <TableCell>{movement.productName}</TableCell>
                          <TableCell>
                            <Badge variant={
                              movement.type === 'Giriş' ? 'default' :
                              movement.type === 'Çıkış' ? 'destructive' : 'secondary'
                            }>
                              {movement.type}
                            </Badge>
                          </TableCell>
                          <TableCell>{movement.quantity}</TableCell>
                          <TableCell>{movement.reason}</TableCell>
                          <TableCell>{movement.user}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Reports Tab */}
            <TabsContent value="reports">
              <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Satış Özeti</CardTitle>
                    <CardDescription>Genel satış istatistikleri</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-accent rounded-lg">
                      <div>
                        <p className="text-sm text-muted-foreground">Toplam Satış</p>
                        <p className="text-2xl font-bold">₺{totalSalesValue.toLocaleString('tr-TR')}</p>
                      </div>
                      <Banknote className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-accent rounded-lg">
                      <div>
                        <p className="text-sm text-muted-foreground">Toplam İşlem</p>
                        <p className="text-2xl font-bold">{sales.length}</p>
                      </div>
                      <ShoppingCart className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-accent rounded-lg">
                      <div>
                        <p className="text-sm text-muted-foreground">Ortalama Satış</p>
                        <p className="text-2xl font-bold">
                          ₺{sales.length > 0 ? (totalSalesValue / sales.length).toFixed(0) : '0'}
                        </p>
                      </div>
                      <BarChart3 className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Stok Durumu</CardTitle>
                    <CardDescription>Kritik stok seviyeleri</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {products.filter(p => p.stock <= p.minStock).slice(0, 5).map(product => (
                        <div key={product.id} className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground">{product.category}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-orange-600">{product.stock}</p>
                            <p className="text-xs text-muted-foreground">Min: {product.minStock}</p>
                          </div>
                        </div>
                      ))}
                      {products.filter(p => p.stock <= p.minStock).length === 0 && (
                        <div className="text-center py-8">
                          <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                          <p className="text-muted-foreground">Tüm ürünler yeterli stok seviyesinde</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
          </main>
        </div>
      </div>
    </>
  );
}