
"use client";

import * as React from "react";
import { useState, useMemo, useEffect } from "react";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  Settings, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Package,
  ArrowLeft,
  Search,
  ChevronRight,
  Filter,
  MoreVertical,
  Calendar as CalendarIcon,
  Wallet,
  MapPin,
  Sparkles,
  MessageSquare,
  FileText,
  Eye,
  ExternalLink,
  ShieldCheck,
  Bell,
  ToggleLeft,
  ToggleRight,
  Zap,
  Truck,
  Ticket,
  Loader2,
  ChevronDown,
  Plus,
  Pencil,
  Trash2,
  Utensils,
  Layers,
  Tag,
  Save,
  Archive,
  RefreshCcw,
  ChefHat,
  Dna,
  Wheat,
  Salad,
  Store,
  CalendarClock,
  CircleCheck,
  CircleX,
  User as UserIcon,
  BarChart3,
  ListFilter
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  useCollection, 
  useDoc, 
  useFirestore 
} from "@/firebase";
import { collection, query, orderBy, limit, doc, updateDoc, setDoc, deleteDoc, addDoc, getDocs } from "firebase/firestore";
import { Order, Meal } from "@/app/types/meal";
import { MEALS } from "@/app/data/meals";
import { UserProfile } from "@/app/page";
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, isWithinInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { useToast } from "@/hooks/use-toast";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface MealPlanLead {
  id: string;
  userId: string;
  customerName: string;
  textPlan: string;
  photoDataUri?: string;
  status: 'pending' | 'responded';
  createdAt: string;
}

interface SiteSettings {
  isAiAnalysisEnabled: boolean;
  isCouponsEnabled: boolean;
  isVeggieCategoryVisible: boolean;
  isDeliveryOpen: boolean;
  activeCouponCode: string;
  couponDiscountPercent: number;
  nextDeliveryDate: string;
  orderDeadline: string;
  openingHours: string;
}

interface Coupon {
  id: string;
  code: string;
  discountPercent: number;
  isActive: boolean;
  description: string;
  owner: string;
  createdAt: string;
}

const ALL_SERVICED_CITIES = [
  "São Miguel - RN",
  "Coronel João Pessoa - RN",
  "Dr. Severiano - RN",
  "Encanto - RN",
  "Pau dos Ferros - RN",
  "Ereré - CE",
  "Pereiro - CE"
];

const DEFAULT_CATEGORIES = [
  { id: 'Chicken', label: 'Frango' },
  { id: 'Beef', label: 'Carne Bovina' },
  { id: 'Fish', label: 'Outros' },
  { id: 'Carbs', label: 'Carboidratos' },
  { id: 'Veggie', label: 'Legumes e Vegetais' },
  { id: 'Combo', label: 'Combo' }
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [cityFilter, setCityFilter] = useState("all");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [mealCategoryFilter, setMealCategoryFilter] = useState("all");
  const [isComboView, setIsComboView] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState<string[]>([]);
  
  const [isMealDialogOpen, setIsMealDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isCouponListOpen, setIsCouponListOpen] = useState(false);
  const [isCouponEditorOpen, setIsCouponEditorOpen] = useState(false);
  
  const [editingMeal, setEditingMeal] = useState<Partial<Meal> | null>(null);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [editingCoupon, setEditingCoupon] = useState<Partial<Coupon> | null>(null);

  const firestore = useFirestore();
  const { toast } = useToast();

  const ordersQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, "orders"), orderBy("createdAt", "desc"));
  }, [firestore]);

  const leadsQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, "leads"), orderBy("createdAt", "desc"));
  }, [firestore]);

  const mealsQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, "meals"), orderBy("name", "asc"));
  }, [firestore]);

  const categoriesQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, "categories"), orderBy("label", "asc"));
  }, [firestore]);

  const couponsQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, "coupons"), orderBy("createdAt", "desc"));
  }, [firestore]);

  const settingsDocRef = useMemo(() => {
    if (!firestore) return null;
    return doc(firestore, "settings", "global");
  }, [firestore]);

  const { data: orders } = useCollection<Order>(ordersQuery as any);
  const { data: leads } = useCollection<MealPlanLead>(leadsQuery as any);
  const { data: meals, loading: loadingMeals } = useCollection<Meal>(mealsQuery as any);
  const { data: categoriesData, loading: loadingCategories } = useCollection<any>(categoriesQuery as any);
  const { data: coupons } = useCollection<Coupon>(couponsQuery as any);
  const { data: settingsData } = useDoc<SiteSettings>(settingsDocRef as any);

  const settings = settingsData || {
    isAiAnalysisEnabled: true,
    isCouponsEnabled: true,
    isVeggieCategoryVisible: true,
    isDeliveryOpen: true,
    activeCouponCode: "ADAS",
    couponDiscountPercent: 50,
    nextDeliveryDate: "18/12/2025",
    orderDeadline: "Quinta-feira",
    openingHours: "Segunda a Sábado, das 10h às 22h"
  };

  const currentCategories = categoriesData?.length > 0 ? categoriesData : DEFAULT_CATEGORIES;

  useEffect(() => {
    if (!firestore || loadingMeals || loadingCategories) return;

    if (meals && meals.length === 0) {
      MEALS.forEach(meal => {
        const mealRef = doc(firestore, "meals", meal.id);
        setDoc(mealRef, { 
          ...meal, 
          isArchived: meal.isArchived || false,
          isAvailableForCombo: meal.isAvailableForCombo !== undefined ? meal.isAvailableForCombo : meal.category !== 'Combo' 
        }, { merge: true });
      });
    }

    if (categoriesData && categoriesData.length === 0) {
      DEFAULT_CATEGORIES.forEach(cat => {
        const catRef = doc(firestore, "categories", cat.id);
        setDoc(catRef, cat, { merge: true });
      });
    }
  }, [firestore, meals, categoriesData, loadingMeals, loadingCategories]);

  const stats = useMemo(() => {
    const filteredOrders = orders?.filter(o => {
      const orderDate = new Date(o.createdAt);
      return selectedDate ? isSameDay(orderDate, selectedDate) : true;
    }) || [];

    const revenue = filteredOrders.reduce((acc, order) => acc + order.total, 0);
    const active = filteredOrders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length;
    
    const leadsCount = leads?.filter(l => l.status === 'pending').length || 0;
    
    return {
      totalSales: filteredOrders.length,
      activeOrders: active,
      revenue,
      pendingLeads: leadsCount
    };
  }, [orders, leads, selectedDate]);

  const chartData = useMemo(() => {
    if (!orders) return [];
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);
    const days = eachDayOfInterval({ start, end });

    return days.map(day => {
      const dayOrders = orders.filter(o => isSameDay(new Date(o.createdAt), day));
      const revenue = dayOrders.reduce((acc, o) => acc + o.total, 0);
      return {
        date: format(day, "dd/MM"),
        vendas: revenue
      };
    });
  }, [orders]);

  const handleUpdateStatus = (orderId: string, newStatus: string) => {
    if (!firestore) return;
    const orderRef = doc(firestore, "orders", orderId);
    updateDoc(orderRef, { status: newStatus });
    toast({ title: "Status Atualizado", description: `Pedido movido para ${newStatus}` });
  };

  const handleSaveSettings = (key: keyof SiteSettings, value: any) => {
    if (!firestore) return;
    const newSettings = { ...settings, [key]: value };
    const settingsRef = doc(firestore, "settings", "global");
    setDoc(settingsRef, newSettings, { merge: true });
    toast({ title: "Configuração Salva", description: "Alteração aplicada com sucesso." });
  };

  const handleSaveMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !editingMeal) return;
    const mealId = editingMeal.id || doc(collection(firestore, "meals")).id;
    const mealData = {
      ...editingMeal,
      id: mealId,
      imageUrl: editingMeal.imageUrl || "https://picsum.photos/seed/harvest/400/300",
      rating: editingMeal.rating || 5.0,
      isArchived: editingMeal.isArchived || false,
      isAvailableForCombo: editingMeal.isAvailableForCombo !== undefined ? editingMeal.isAvailableForCombo : true
    };
    const mealRef = doc(firestore, "meals", mealId);
    setDoc(mealRef, mealData, { merge: true });
    setIsMealDialogOpen(false);
    setEditingMeal(null);
    toast({ title: "Sucesso", description: "Prato salvo no cardápio." });
  };

  const handleArchiveMeal = (meal: Meal) => {
    if (!firestore) return;
    const mealRef = doc(firestore, "meals", meal.id);
    updateDoc(mealRef, { isArchived: !meal.isArchived });
    toast({ title: meal.isArchived ? "Prato Reativado" : "Prato Arquivado" });
  };

  const handleToggleComboAvailability = (mealId: string, value: boolean) => {
    if (!firestore) return;
    const mealRef = doc(firestore, "meals", mealId);
    updateDoc(mealRef, { isAvailableForCombo: value });
  };

  const handleSaveCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !editingCoupon) return;
    const couponId = editingCoupon.id || doc(collection(firestore, "coupons")).id;
    const couponData = {
      ...editingCoupon,
      id: couponId,
      code: (editingCoupon.code || "").toUpperCase(),
      createdAt: editingCoupon.createdAt || new Date().toISOString(),
      isActive: editingCoupon.isActive !== undefined ? editingCoupon.isActive : true
    };
    const couponRef = doc(firestore, "coupons", couponId);
    setDoc(couponRef, couponData, { merge: true });
    setIsCouponEditorOpen(false);
    setEditingCoupon(null);
    toast({ title: "Cupom Salvo" });
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string, color: string }> = {
      'pending': { label: 'Pendente', color: 'bg-amber-100 text-amber-700' },
      'preparing': { label: 'Preparando', color: 'bg-blue-100 text-blue-700' },
      'delivery': { label: 'Em Rota', color: 'bg-purple-100 text-purple-700' },
      'completed': { label: 'Concluído', color: 'bg-green-100 text-green-700' },
      'cancelled': { label: 'Cancelado', color: 'bg-red-100 text-red-700' }
    };
    const { label, color } = map[status] || { label: status, color: 'bg-gray-100' };
    return <Badge className={cn("border-none px-3 py-1 text-[10px] font-black uppercase", color)}>{label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-muted/20 p-6 md:p-10 font-body">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <button onClick={() => window.location.href = '/'} className="flex items-center gap-2 text-primary font-black uppercase text-xs mb-3 hover:translate-x-[-4px] transition-transform">
            <ArrowLeft size={16} /> Voltar ao Site
          </button>
          <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase">Harvest Admin</h1>
          <p className="text-muted-foreground font-medium mt-1 uppercase text-[10px] tracking-[0.2em]">Gestão Estratégica & IA</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="rounded-2xl h-12 px-6 border-none shadow-sm bg-white font-black text-xs uppercase">
                <CalendarIcon size={16} className="mr-2" /> 
                {selectedDate ? format(selectedDate, "dd MMM", { locale: ptBR }) : "Filtrar Data"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 rounded-3xl" align="end">
              <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} locale={ptBR} initialFocus />
            </PopoverContent>
          </Popover>
          <div className="bg-primary text-white p-3 rounded-2xl shadow-xl shadow-primary/20"><LayoutDashboard size={24} /></div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard title="Receita Bruta" value={`R$ ${stats.revenue.toFixed(2)}`} icon={Wallet} trend="Sincronizado" color="primary" />
        <StatCard title="Total Pedidos" value={stats.totalSales.toString()} icon={ShoppingBag} trend="Do período" color="secondary" />
        <StatCard title="Pedidos Ativos" value={stats.activeOrders.toString()} icon={Clock} trend="Acompanhamento" color="amber" />
        <StatCard title="Leads de IA" value={stats.pendingLeads.toString()} icon={Sparkles} trend="Novos planos" color="purple" />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white p-1.5 rounded-2xl shadow-sm inline-flex h-14 w-full md:w-auto border border-border/40 overflow-x-auto no-scrollbar">
          <TabsTrigger value="dashboard" className="rounded-xl px-8 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white">Visão Geral</TabsTrigger>
          <TabsTrigger value="catalog" className="rounded-xl px-8 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white">Cardápio</TabsTrigger>
          <TabsTrigger value="orders" className="rounded-xl px-8 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white">Pedidos</TabsTrigger>
          <TabsTrigger value="leads" className="rounded-xl px-8 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white">Leads de Planos</TabsTrigger>
          <TabsTrigger value="settings" className="rounded-xl px-8 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 rounded-[2.5rem] border-none shadow-xl bg-white p-8">
              <div className="flex justify-between items-center mb-8">
                <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
                  <BarChart3 className="text-primary" size={20} /> Tendência de Vendas
                </CardTitle>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{ borderRadius: '1rem', border: 'none', shadow: 'none' }}
                      formatter={(v: any) => [`R$ ${v}`, 'Vendas']}
                    />
                    <Area type="monotone" dataKey="vendas" stroke="hsl(var(--primary))" strokeWidth={3} fill="url(#colorSales)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <div className="space-y-8">
              <Card className="rounded-[2.5rem] border-none shadow-xl bg-white p-8">
                <h3 className="text-lg font-black uppercase mb-6 tracking-tighter">Ações Rápidas</h3>
                <div className="grid grid-cols-2 gap-4">
                  <QuickLinkButton label="Novo Cupom" icon={Ticket} onClick={() => { setActiveTab("settings"); setIsCouponEditorOpen(true); }} />
                  <QuickLinkButton label="Novo Prato" icon={Plus} onClick={() => { setActiveTab("catalog"); setIsMealDialogOpen(true); }} />
                  <QuickLinkButton label="Abrir Delivery" icon={Store} onClick={() => handleSaveSettings("isDeliveryOpen", true)} />
                  <QuickLinkButton label="Fechar Delivery" icon={XCircle} onClick={() => handleSaveSettings("isDeliveryOpen", false)} />
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="catalog" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <Card className="lg:col-span-1 rounded-[2.5rem] border-none shadow-xl bg-white p-6">
              <div className="flex justify-between items-center mb-6 px-2">
                <h3 className="font-black text-sm uppercase tracking-widest text-muted-foreground">Categorias</h3>
                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-xl text-primary" onClick={() => { setEditingCategory({}); setIsCategoryDialogOpen(true); }}>
                  <Plus size={18} />
                </Button>
              </div>
              <div className="space-y-2">
                <button 
                  onClick={() => setMealCategoryFilter("all")}
                  className={cn("w-full flex items-center justify-between p-4 rounded-2xl transition-all font-black text-xs uppercase", mealCategoryFilter === 'all' ? "bg-primary text-white" : "bg-muted/30 hover:bg-muted/50")}
                >
                  Todos os Pratos <ChevronRight size={14} />
                </button>
                {currentCategories.map((cat: any) => (
                  <div key={cat.id} className="relative group">
                    <button 
                      onClick={() => setMealCategoryFilter(cat.id)}
                      className={cn("w-full flex items-center justify-between p-4 rounded-2xl transition-all font-black text-xs uppercase", mealCategoryFilter === cat.id ? "bg-primary text-white" : "bg-muted/30 hover:bg-muted/50")}
                    >
                      {cat.label} <ChevronRight size={14} />
                    </button>
                  </div>
                ))}
              </div>
              
              <Separator className="my-8" />
              
              <button 
                onClick={() => setIsComboView(!isComboView)}
                className={cn("w-full p-6 rounded-[2rem] border-2 flex flex-col items-center gap-3 transition-all", isComboView ? "border-primary bg-primary/5 text-primary" : "border-muted-foreground/10 bg-white hover:border-primary/20")}
              >
                <div className={cn("p-4 rounded-2xl", isComboView ? "bg-primary text-white" : "bg-muted text-muted-foreground")}>
                  <Utensils size={28} />
                </div>
                <span className="font-black text-[10px] uppercase tracking-widest">Montagem de Combos</span>
              </button>
            </Card>

            <Card className="lg:col-span-3 rounded-[2.5rem] border-none shadow-xl bg-white p-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter">
                    {isComboView ? "Itens para Montagem de Combos" : "Gestão do Cardápio"}
                  </h3>
                  <p className="text-muted-foreground text-xs font-bold uppercase mt-1">
                    {isComboView ? "Ative o que o cliente pode escolher no kit personalizado" : "Gerencie seus pratos, preços e disponibilidade"}
                  </p>
                </div>
                {!isComboView && (
                  <Button className="rounded-2xl h-12 px-6 font-black uppercase text-xs" onClick={() => { setEditingMeal({}); setIsMealDialogOpen(true); }}>
                    <Plus size={18} className="mr-2" /> Novo Prato
                  </Button>
                )}
              </div>

              <div className="rounded-3xl border border-border/40 overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead className="font-black text-[10px] uppercase p-6">Prato / Ingrediente</TableHead>
                      <TableHead className="font-black text-[10px] uppercase p-6 text-center">Categoria</TableHead>
                      {isComboView ? (
                        <TableHead className="font-black text-[10px] uppercase p-6 text-center">Liberado p/ Combo?</TableHead>
                      ) : (
                        <>
                          <TableHead className="font-black text-[10px] uppercase p-6 text-center">Preço</TableHead>
                          <TableHead className="font-black text-[10px] uppercase p-6 text-center">Status</TableHead>
                          <TableHead className="font-black text-[10px] uppercase p-6 text-right">Ações</TableHead>
                        </>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(meals || [])
                      .filter(m => mealCategoryFilter === 'all' || m.category === mealCategoryFilter)
                      .map((meal) => (
                        <TableRow key={meal.id} className="hover:bg-muted/10">
                          <TableCell className="p-6">
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-12 rounded-xl overflow-hidden relative border shadow-sm shrink-0">
                                <Image src={meal.imageUrl} alt={meal.name} fill className="object-cover" />
                              </div>
                              <div>
                                <h4 className="font-black text-sm uppercase leading-none">{meal.name}</h4>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">ID: {meal.id}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="p-6 text-center">
                            <Badge variant="outline" className="rounded-lg font-black uppercase text-[9px] px-3">{meal.category}</Badge>
                          </TableCell>
                          {isComboView ? (
                            <TableCell className="p-6 text-center">
                              <Switch 
                                checked={meal.isAvailableForCombo} 
                                onCheckedChange={(v) => handleToggleComboAvailability(meal.id, v)} 
                                className="data-[state=checked]:bg-primary"
                              />
                            </TableCell>
                          ) : (
                            <>
                              <TableCell className="p-6 text-center font-black text-primary">
                                {meal.price > 0 ? `R$ ${meal.price.toFixed(2)}` : "-"}
                              </TableCell>
                              <TableCell className="p-6 text-center">
                                {meal.isArchived ? (
                                  <Badge className="bg-red-50 text-red-600 border-none font-black text-[9px] uppercase">Arquivado</Badge>
                                ) : (
                                  <Badge className="bg-green-50 text-green-600 border-none font-black text-[9px] uppercase">Ativo</Badge>
                                )}
                              </TableCell>
                              <TableCell className="p-6 text-right">
                                <div className="flex justify-end gap-2">
                                  <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl text-primary" onClick={() => { setEditingMeal(meal); setIsMealDialogOpen(true); }}>
                                    <Pencil size={16} />
                                  </Button>
                                  <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl text-muted-foreground" onClick={() => handleArchiveMeal(meal)}>
                                    <Archive size={16} />
                                  </Button>
                                </div>
                              </TableCell>
                            </>
                          )}
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="rounded-[2.5rem] border-none shadow-xl bg-white p-8">
              <CardTitle className="text-xl font-black uppercase tracking-tighter mb-8 flex items-center gap-2">
                <Store className="text-primary" /> Ajustes da Loja
              </CardTitle>
              <div className="space-y-8">
                <div className="flex items-center justify-between p-6 bg-muted/20 rounded-3xl border border-border/40">
                  <div className="space-y-1">
                    <h4 className="font-black text-sm uppercase">Status do Delivery</h4>
                    <p className="text-xs font-medium text-muted-foreground">Abrir ou fechar a loja instantaneamente.</p>
                  </div>
                  <Switch 
                    checked={settings.isDeliveryOpen} 
                    onCheckedChange={(v) => handleSaveSettings("isDeliveryOpen", v)} 
                    className="data-[state=checked]:bg-primary scale-125"
                  />
                </div>
                
                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Horário de Funcionamento</Label>
                  <Textarea 
                    className="rounded-2xl h-24 bg-muted/20 border-none p-4 font-bold focus-visible:ring-primary"
                    value={settings.openingHours}
                    onChange={(e) => handleSaveSettings("openingHours", e.target.value)}
                  />
                </div>
              </div>
            </Card>

            <Card className="rounded-[2.5rem] border-none shadow-xl bg-primary p-10 text-white relative overflow-hidden">
               <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
               <h3 className="text-2xl font-black uppercase tracking-tighter mb-8 flex items-center gap-3">
                 <Ticket size={28} /> Cupons de Desconto
               </h3>
               <div className="space-y-6 relative z-10">
                 <div className="bg-white/10 p-6 rounded-3xl border border-white/20">
                   <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Código Ativo Principal</p>
                   <div className="flex items-center justify-between">
                     <span className="text-3xl font-black tracking-tight">{settings.activeCouponCode}</span>
                     <Badge className="bg-secondary text-secondary-foreground font-black px-4 py-1">{settings.couponDiscountPercent}% OFF</Badge>
                   </div>
                 </div>
                 <div className="flex gap-4">
                   <Button className="flex-1 h-14 rounded-2xl bg-white text-primary hover:bg-white/90 font-black uppercase text-xs" onClick={() => setIsCouponListOpen(true)}>
                     Listar Cupons
                   </Button>
                   <Button variant="outline" className="flex-1 h-14 rounded-2xl border-white/20 text-white hover:bg-white/10 font-black uppercase text-xs" onClick={() => { setEditingCoupon({}); setIsCouponEditorOpen(true); }}>
                     Novo Cupom
                   </Button>
                 </div>
               </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="leads" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
           <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden">
              <CardHeader className="p-8">
                <CardTitle className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
                  <Sparkles className="text-primary" /> Leads de Planos Alimentares
                </CardTitle>
                <CardDescription>Clientes que enviaram dietas para orçamento.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {leads?.map((lead) => (
                    <div key={lead.id} className="bg-muted/10 p-6 rounded-[2rem] border border-border/40 hover:border-primary/40 transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                           <div className="bg-white p-3 rounded-2xl shadow-sm"><UserIcon size={20} className="text-primary" /></div>
                           <div>
                             <h4 className="font-black text-sm uppercase">{lead.customerName}</h4>
                             <p className="text-[10px] font-bold text-muted-foreground uppercase">{lead.userId}</p>
                           </div>
                        </div>
                        {getStatusBadge(lead.status)}
                      </div>
                      <div className="space-y-4">
                        <div className="bg-white p-4 rounded-2xl shadow-sm text-[11px] font-medium italic text-muted-foreground line-clamp-3 italic">
                          "{lead.textPlan || "Sem descrição de texto..."}"
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black text-muted-foreground uppercase">{format(new Date(lead.createdAt), "dd MMM, HH:mm", { locale: ptBR })}</span>
                          <div className="flex gap-2">
                            {lead.photoDataUri && (
                              <Button size="sm" variant="outline" className="rounded-xl h-10 px-4 font-black text-[9px] uppercase" onClick={() => window.open(lead.photoDataUri, '_blank')}>
                                <Eye size={12} className="mr-2" /> Foto
                              </Button>
                            )}
                            <Button size="sm" className="rounded-xl h-10 px-4 font-black text-[9px] uppercase" onClick={() => handleUpdateStatus(lead.id, lead.status === 'pending' ? 'responded' : 'pending')}>
                              {lead.status === 'pending' ? 'Finalizar' : 'Reabrir'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
           </Card>
        </TabsContent>
        
        <TabsContent value="orders" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
           <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden">
              <CardHeader className="p-8 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-black uppercase tracking-tighter">Fluxo de Pedidos</CardTitle>
                  <CardDescription>Acompanhe e gerencie as entregas do dia.</CardDescription>
                </div>
                <div className="flex gap-3">
                  <Select value={cityFilter} onValueChange={setCityFilter}>
                    <SelectTrigger className="w-[200px] h-11 rounded-xl bg-muted/30 border-none font-black text-xs uppercase">
                      <ListFilter size={14} className="mr-2" />
                      <SelectValue placeholder="Cidade" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      <SelectItem value="all">Todas as Cidades</SelectItem>
                      {ALL_SERVICED_CITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                <div className="rounded-3xl border border-border/40 overflow-hidden">
                   <Table>
                     <TableHeader className="bg-muted/30">
                       <TableRow>
                         <TableHead className="font-black text-[10px] uppercase p-6">ID Pedido</TableHead>
                         <TableHead className="font-black text-[10px] uppercase p-6">Cliente</TableHead>
                         <TableHead className="font-black text-[10px] uppercase p-6 text-center">Itens</TableHead>
                         <TableHead className="font-black text-[10px] uppercase p-6 text-center">Total</TableHead>
                         <TableHead className="font-black text-[10px] uppercase p-6 text-center">Status</TableHead>
                         <TableHead className="font-black text-[10px] uppercase p-6 text-right">Ações</TableHead>
                       </TableRow>
                     </TableHeader>
                     <TableBody>
                        {orders?.filter(o => cityFilter === 'all' || o.address?.city === cityFilter).map(order => (
                          <React.Fragment key={order.id}>
                            <TableRow className="hover:bg-muted/10 cursor-pointer" onClick={() => setExpandedOrders(prev => prev.includes(order.id) ? prev.filter(id => id !== order.id) : [...prev, order.id])}>
                              <TableCell className="p-6 font-black text-sm uppercase">{order.id.slice(-6)}</TableCell>
                              <TableCell className="p-6">
                                <div className="font-black text-sm uppercase">{order.customerName}</div>
                                <div className="text-[10px] font-bold text-muted-foreground uppercase">{order.address?.city}</div>
                              </TableCell>
                              <TableCell className="p-6 text-center font-bold text-sm">{order.items.length}</TableCell>
                              <TableCell className="p-6 text-center font-black text-primary">R$ {order.total.toFixed(2)}</TableCell>
                              <TableCell className="p-6 text-center">{getStatusBadge(order.status)}</TableCell>
                              <TableCell className="p-6 text-right">
                                <Select value={order.status} onValueChange={(s) => handleUpdateStatus(order.id, s)}>
                                  <SelectTrigger className="h-9 w-[130px] rounded-xl border-none bg-muted/50 font-black text-[10px] uppercase">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="rounded-2xl">
                                    <SelectItem value="pending">Pendente</SelectItem>
                                    <SelectItem value="preparing">Preparando</SelectItem>
                                    <SelectItem value="delivery">Em Rota</SelectItem>
                                    <SelectItem value="completed">Concluído</SelectItem>
                                    <SelectItem value="cancelled">Cancelado</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                            </TableRow>
                            {expandedOrders.includes(order.id) && (
                              <TableRow className="bg-muted/5">
                                <TableCell colSpan={6} className="p-8">
                                  <div className="grid grid-cols-2 gap-8 animate-in slide-in-from-top-2 duration-300">
                                    <div className="space-y-4">
                                      <h5 className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">Itens do Pedido</h5>
                                      {order.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-2xl border border-border/40">
                                          <div className="flex items-center gap-3">
                                            <span className="font-black text-primary text-xs">{item.quantity}x</span>
                                            <span className="font-bold text-xs uppercase">{item.name}</span>
                                          </div>
                                          <span className="text-xs font-black">R$ {(item.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                      ))}
                                    </div>
                                    <div className="space-y-4">
                                      <h5 className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">Dados de Entrega</h5>
                                      <div className="bg-white p-6 rounded-3xl border border-border/40 space-y-3">
                                        <div className="flex items-center gap-2 text-xs font-bold uppercase"><MapPin size={14} className="text-primary" /> {order.address?.street}, {order.address?.number}</div>
                                        <div className="text-[10px] font-bold text-muted-foreground uppercase ml-6">Bairro: {order.address?.neighborhood}</div>
                                        <div className="text-[10px] font-bold text-muted-foreground uppercase ml-6 italic">Ref: {order.address?.reference || "Sem referência"}</div>
                                        <div className="flex items-center gap-2 text-xs font-bold uppercase pt-2 border-t"><Wallet size={14} className="text-primary" /> Pagamento: {order.paymentMethod}</div>
                                      </div>
                                    </div>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </React.Fragment>
                        ))}
                     </TableBody>
                   </Table>
                </div>
              </CardContent>
           </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <Dialog open={isMealDialogOpen} onOpenChange={setIsMealDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] p-8">
          <DialogHeader><DialogTitle className="text-2xl font-black uppercase tracking-tighter">Editar Prato</DialogTitle></DialogHeader>
          <form onSubmit={handleSaveMeal} className="space-y-6 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label className="text-[10px] font-black uppercase ml-1">Nome do Prato</Label>
                <Input value={editingMeal?.name || ""} onChange={e => setEditingMeal({...editingMeal, name: e.target.value})} className="rounded-xl h-12 bg-muted/30 border-none font-bold" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase ml-1">Categoria</Label>
                <Select value={editingMeal?.category} onValueChange={v => setEditingMeal({...editingMeal, category: v as any})}>
                  <SelectTrigger className="rounded-xl h-12 bg-muted/30 border-none font-bold"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    {currentCategories.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase ml-1">Preço (R$)</Label>
                <Input type="number" step="0.01" value={editingMeal?.price || 0} onChange={e => setEditingMeal({...editingMeal, price: parseFloat(e.target.value)})} className="rounded-xl h-12 bg-muted/30 border-none font-bold" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase ml-1">Proteína (g)</Label>
                <Input type="number" value={editingMeal?.protein || 0} onChange={e => setEditingMeal({...editingMeal, protein: parseInt(e.target.value)})} className="rounded-xl h-12 bg-muted/30 border-none font-bold" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase ml-1">Calorias</Label>
                <Input type="number" value={editingMeal?.calories || 0} onChange={e => setEditingMeal({...editingMeal, calories: parseInt(e.target.value)})} className="rounded-xl h-12 bg-muted/30 border-none font-bold" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase ml-1">Descrição</Label>
              <Textarea value={editingMeal?.description || ""} onChange={e => setEditingMeal({...editingMeal, description: e.target.value})} className="rounded-2xl h-24 bg-muted/30 border-none font-medium" />
            </div>
            <div className="flex items-center gap-2 p-4 bg-muted/20 rounded-2xl">
              <Switch checked={editingMeal?.isAvailableForCombo} onCheckedChange={v => setEditingMeal({...editingMeal, isAvailableForCombo: v})} />
              <Label className="text-xs font-bold uppercase">Disponível para Combo Manual</Label>
            </div>
            <Button type="submit" className="w-full h-14 rounded-full font-black uppercase">Salvar Alterações</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isCouponListOpen} onOpenChange={setIsCouponListOpen}>
        <DialogContent className="sm:max-w-[700px] rounded-[2.5rem] p-8">
           <DialogHeader><DialogTitle className="text-2xl font-black uppercase tracking-tighter">Cupons de Desconto</DialogTitle></DialogHeader>
           <div className="pt-6">
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {(coupons || []).map(cp => (
                    <div key={cp.id} className="flex items-center justify-between p-6 bg-muted/30 rounded-3xl border border-border/40">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-black text-primary">{cp.code}</span>
                          <Badge className="bg-primary/10 text-primary border-none">{cp.discountPercent}% OFF</Badge>
                        </div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">{cp.description} • De: {cp.owner}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Switch checked={cp.isActive} onCheckedChange={(v) => {
                          const ref = doc(firestore!, "coupons", cp.id);
                          updateDoc(ref, { isActive: v });
                        }} />
                        <Button size="icon" variant="ghost" className="h-9 w-9 text-muted-foreground" onClick={() => { setEditingCoupon(cp); setIsCouponEditorOpen(true); }}>
                          <Pencil size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
           </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isCouponEditorOpen} onOpenChange={setIsCouponEditorOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-[2.5rem] p-8">
          <DialogHeader><DialogTitle className="text-2xl font-black uppercase tracking-tighter">Configurar Cupom</DialogTitle></DialogHeader>
          <form onSubmit={handleSaveCoupon} className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase ml-1">Código do Cupom</Label>
              <Input value={editingCoupon?.code || ""} onChange={e => setEditingCoupon({...editingCoupon, code: e.target.value.toUpperCase()})} className="rounded-xl h-12 bg-muted/30 border-none font-black text-center text-lg" placeholder="EX: VERÃO20" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase ml-1">Desconto (%)</Label>
                <Input type="number" value={editingCoupon?.discountPercent || 0} onChange={e => setEditingCoupon({...editingCoupon, discountPercent: parseInt(e.target.value)})} className="rounded-xl h-12 bg-muted/30 border-none font-bold" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase ml-1">Proprietário</Label>
                <Input value={editingCoupon?.owner || ""} onChange={e => setEditingCoupon({...editingCoupon, owner: e.target.value})} className="rounded-xl h-12 bg-muted/30 border-none font-bold" placeholder="Nome da pessoa" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase ml-1">Descrição/Campanha</Label>
              <Input value={editingCoupon?.description || ""} onChange={e => setEditingCoupon({...editingCoupon, description: e.target.value})} className="rounded-xl h-12 bg-muted/30 border-none font-bold" />
            </div>
            <Button type="submit" className="w-full h-14 rounded-full font-black uppercase">Ativar Cupom</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend, color }: { title: string, value: string, icon: any, trend: string, color: string }) {
  const colorMap: Record<string, string> = {
    primary: 'text-primary bg-primary/10',
    secondary: 'text-secondary-foreground bg-secondary/20',
    amber: 'text-amber-600 bg-amber-100',
    purple: 'text-purple-600 bg-purple-100'
  };
  return (
    <Card className="rounded-[2.5rem] border-none shadow-xl bg-white p-8 group hover:-translate-y-1 transition-all duration-300">
      <div className={cn("p-4 rounded-[1.5rem] w-fit mb-6 transition-transform group-hover:scale-110", colorMap[color])}>
        <Icon size={28} />
      </div>
      <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{title}</p>
      <h3 className="text-3xl font-black text-foreground tracking-tighter mt-1">{value}</h3>
      <p className="text-[10px] font-bold text-primary mt-2">{trend}</p>
    </Card>
  );
}

function QuickLinkButton({ label, icon: Icon, onClick }: { label: string, icon: any, onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center justify-center p-4 rounded-2xl bg-muted/30 hover:bg-primary/10 hover:text-primary border border-transparent hover:border-primary/20 transition-all gap-2">
      <Icon size={18} />
      <span className="text-[9px] font-black uppercase tracking-tight">{label}</span>
    </button>
  );
}
