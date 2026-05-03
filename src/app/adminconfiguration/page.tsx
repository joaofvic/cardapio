
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
  ListFilter,
  EyeOff,
  BrainCircuit,
  ArrowUpRight,
  History,
  CalendarDays,
  Timer,
  Infinity,
  Phone,
  ThumbsUp,
  Ban
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
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
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, isWithinInterval, subDays, parseISO } from "date-fns";
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
  BarChart,
  Bar,
  Cell
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

interface DaySchedule {
  isOpen: boolean;
  openAt: string;
  closeAt: string;
}

interface SpecialDate {
  id: string;
  date: string;
  isOpen: boolean;
  label: string;
  openAt?: string;
  closeAt?: string;
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
  detailedSchedule?: Record<string, DaySchedule>;
  specialDates?: SpecialDate[];
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

const DAYS_OF_WEEK = [
  { id: 'monday', label: 'Segunda-feira' },
  { id: 'tuesday', label: 'Terça-feira' },
  { id: 'wednesday', label: 'Quarta-feira' },
  { id: 'thursday', label: 'Quinta-feira' },
  { id: 'friday', label: 'Sexta-feira' },
  { id: 'saturday', label: 'Sábado' },
  { id: 'sunday', label: 'Domingo' }
];

const DEFAULT_SCHEDULE: Record<string, DaySchedule> = {
  monday: { isOpen: true, openAt: '10:00', closeAt: '22:00' },
  tuesday: { isOpen: true, openAt: '10:00', closeAt: '22:00' },
  wednesday: { isOpen: true, openAt: '10:00', closeAt: '22:00' },
  thursday: { isOpen: true, openAt: '10:00', closeAt: '22:00' },
  friday: { isOpen: true, openAt: '10:00', closeAt: '22:00' },
  saturday: { isOpen: true, openAt: '10:00', closeAt: '22:00' },
  sunday: { isOpen: false, openAt: '10:00', closeAt: '18:00' }
};

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
  const [isSpecialDateDialogOpen, setIsSpecialDateDialogOpen] = useState(false);
  
  const [selectedLead, setSelectedLead] = useState<MealPlanLead | null>(null);
  const [editingMeal, setEditingMeal] = useState<Partial<Meal> | null>(null);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [editingCoupon, setEditingCoupon] = useState<Partial<Coupon> | null>(null);
  const [newSpecialDate, setNewSpecialDate] = useState<Partial<SpecialDate>>({
    isOpen: false,
    label: '',
    openAt: '10:00',
    closeAt: '22:00'
  });

  const [editingDayId, setEditingDayId] = useState<string | null>(null);
  const [tempDaySchedule, setTempDaySchedule] = useState<DaySchedule | null>(null);

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
    nextDeliveryDate: new Date().toISOString(),
    orderDeadline: new Date().toISOString(),
    openingHours: "Segunda a Sábado, das 10h às 22h",
    detailedSchedule: DEFAULT_SCHEDULE,
    specialDates: []
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
    const dayOrders = orders?.filter(o => isSameDay(new Date(o.createdAt), selectedDate || new Date())) || [];
    const revenue = dayOrders.reduce((acc, order) => acc + order.total, 0);
    const active = dayOrders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length;
    
    const totalLeads = leads?.length || 0;
    const pendingLeads = leads?.filter(l => l.status === 'pending').length || 0;
    const conversionRate = totalLeads > 0 ? ((totalLeads - pendingLeads) / totalLeads * 100).toFixed(1) : "0";

    const itemSales: Record<string, number> = {};
    orders?.forEach(o => o.items.forEach(i => {
      itemSales[i.name] = (itemSales[i.name] || 0) + i.quantity;
    }));
    const bestSeller = Object.entries(itemSales).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
    
    return {
      totalSales: dayOrders.length,
      activeOrders: active,
      revenue,
      pendingLeads,
      conversionRate,
      bestSeller
    };
  }, [orders, leads, selectedDate]);

  const chartData = useMemo(() => {
    if (!orders) return [];
    const days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), i)).reverse();

    return days.map(day => {
      const dayOrders = orders.filter(o => isSameDay(new Date(o.createdAt), day));
      const revenue = dayOrders.reduce((acc, o) => acc + o.total, 0);
      return {
        date: format(day, "eee", { locale: ptBR }).toUpperCase(),
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

  const handleCommitDaySchedule = () => {
    if (!editingDayId || !tempDaySchedule) return;
    
    const currentSchedule = settings.detailedSchedule || DEFAULT_SCHEDULE;
    const updatedSchedule = {
      ...currentSchedule,
      [editingDayId]: tempDaySchedule
    };
    handleSaveSettings("detailedSchedule", updatedSchedule);
    setEditingDayId(null);
    setTempDaySchedule(null);
  };

  const handleUpdateDayStatus = (dayId: string, isOpen: boolean) => {
    const currentSchedule = settings.detailedSchedule || DEFAULT_SCHEDULE;
    const updatedSchedule = {
      ...currentSchedule,
      [dayId]: {
        ...currentSchedule[dayId],
        isOpen
      }
    };
    handleSaveSettings("detailedSchedule", updatedSchedule);
  };

  const handleAddSpecialDate = () => {
    if (!newSpecialDate.date || !newSpecialDate.label) {
      toast({ variant: "destructive", title: "Dados incompletos", description: "Informe a data e o nome do evento." });
      return;
    }
    const currentDates = settings.specialDates || [];
    let updatedDates;
    if (newSpecialDate.id) {
      updatedDates = currentDates.map(d => d.id === newSpecialDate.id ? newSpecialDate : d);
    } else {
      updatedDates = [...currentDates, { ...newSpecialDate, id: Date.now().toString() } as SpecialDate];
    }
    handleSaveSettings("specialDates", updatedDates as SpecialDate[]);
    setNewSpecialDate({ isOpen: false, label: '', openAt: '10:00', closeAt: '22:00' });
    setIsSpecialDateDialogOpen(false);
  };

  const handleRemoveSpecialDate = (id: string) => {
    const updatedDates = (settings.specialDates || []).filter(d => d.id !== id);
    handleSaveSettings("specialDates", updatedDates);
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
      isAvailableForCombo: editingMeal.isAvailableForCombo !== undefined ? editingMeal.isAvailableForCombo : true,
      stockQuantity: editingMeal.stockQuantity === undefined || editingMeal.stockQuantity === null ? null : Number(editingMeal.stockQuantity)
    };
    const mealRef = doc(firestore, "meals", mealId);
    setDoc(mealRef, mealData, { merge: true })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: mealRef.path,
          operation: 'write',
          requestResourceData: mealData,
        });
        errorEmitter.emit('permission-error', permissionError);
      });
    setIsMealDialogOpen(false);
    setEditingMeal(null);
    toast({ title: "Sucesso", description: "Prato salvo no cardápio." });
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !editingCategory) return;
    
    const categoryId = editingCategory.id || editingCategory.label?.toLowerCase().replace(/\s+/g, '-') || doc(collection(firestore, "categories")).id;
    
    const categoryData = {
      ...editingCategory,
      id: categoryId,
      label: editingCategory.label
    };

    const categoryRef = doc(firestore, "categories", categoryId);
    setDoc(categoryRef, categoryData, { merge: true })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: categoryRef.path,
          operation: 'write',
          requestResourceData: categoryData,
        });
        errorEmitter.emit('permission-error', permissionError);
      });

    setIsCategoryDialogOpen(false);
    setEditingCategory(null);
    toast({ title: "Categoria Salva", description: "A categoria foi atualizada no cardápio." });
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
      'cancelled': { label: 'Cancelado', color: 'bg-red-100 text-red-700' },
      'responded': { label: 'Respondido', color: 'bg-green-100 text-green-700' }
    };
    const { label, color } = map[status] || { label: status, color: 'bg-gray-100' };
    return <Badge className={cn("border-none px-3 py-1 text-[10px] font-black uppercase", color)}>{label}</Badge>;
  };

  const formatDateValue = (dateStr: string) => {
    try {
      const d = parseISO(dateStr);
      return isNaN(d.getTime()) ? dateStr : format(d, "PPP", { locale: ptBR });
    } catch (e) {
      return dateStr;
    }
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
        <StatCard title="Receita (Dia)" value={`R$ ${stats.revenue.toFixed(2)}`} icon={Wallet} trend="Sincronizado" color="primary" />
        <StatCard title="Pedidos Hoje" value={stats.totalSales.toString()} icon={ShoppingBag} trend="Do período" color="secondary" />
        <StatCard title="Leads de IA" value={stats.pendingLeads.toString()} icon={Sparkles} trend={`${stats.conversionRate}% Conv.`} color="purple" />
        <StatCard title="Best Seller" value={stats.bestSeller} icon={TrendingUp} trend="Prato do momento" color="amber" />
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
                  <TrendingUp className="text-primary" size={20} /> Tendência de Vendas (7 dias)
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
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeights: 'bold'}} />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{ borderRadius: '1rem', border: 'none', shadow: 'none', fontWeights: 'bold' }}
                      formatter={(v: any) => [`R$ ${v}`, 'Vendas']}
                    />
                    <Area type="monotone" dataKey="vendas" stroke="hsl(var(--primary))" strokeWidth={4} fill="url(#colorSales)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <div className="space-y-8">
              <Card className="rounded-[2.5rem] border-none shadow-xl bg-white p-8">
                <h3 className="text-lg font-black uppercase mb-6 tracking-tighter">Atalhos Operacionais</h3>
                <div className="grid grid-cols-2 gap-4">
                  <QuickLinkButton label="Novo Cupom" icon={Ticket} onClick={() => { setActiveTab("settings"); setIsCouponEditorOpen(true); }} />
                  <QuickLinkButton label="Novo Prato" icon={Plus} onClick={() => { setActiveTab("catalog"); setIsMealDialogOpen(true); }} />
                  <QuickLinkButton label="Abrir Delivery" icon={Store} onClick={() => handleSaveSettings("isDeliveryOpen", true)} />
                  <QuickLinkButton label="Fechar Delivery" icon={XCircle} onClick={() => handleSaveSettings("isDeliveryOpen", false)} />
                </div>
              </Card>
              <Card className="rounded-[2.5rem] border-none shadow-xl bg-white p-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Status do Delivery</h3>
                  <Badge className={cn("border-none", settings.isDeliveryOpen ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                    {settings.isDeliveryOpen ? "ABERTO" : "FECHADO"}
                  </Badge>
                </div>
                <div className="flex items-center gap-3">
                  <div className={cn("w-3 h-3 rounded-full animate-pulse", settings.isDeliveryOpen ? "bg-green-500" : "bg-red-500")} />
                  <p className="text-xs font-bold uppercase">{settings.isDeliveryOpen ? "Recebendo pedidos normalmente" : "Pedidos pausados temporariamente"}</p>
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
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity text-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingCategory(cat);
                        setIsCategoryDialogOpen(true);
                      }}
                    >
                      <Pencil size={14} />
                    </Button>
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
                <span className="font-black text-[10px] uppercase tracking-widest text-center">Montagem de Marmitas (Manual)</span>
              </button>
            </Card>

            <Card className="lg:col-span-3 rounded-[2.5rem] border-none shadow-xl bg-white p-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter">
                    {isComboView ? "Itens do Combo Semanal" : "Cardápio Principal"}
                  </h3>
                  <p className="text-muted-foreground text-xs font-bold uppercase mt-1">
                    {isComboView ? "Libere os ingredientes para montagem manual do kit" : "Gerencie seus pratos gourmet prontos"}
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
                      <TableHead className="font-black text-[10px] uppercase p-6">Item</TableHead>
                      <TableHead className="font-black text-[10px] uppercase p-6 text-center">Categoria</TableHead>
                      <TableHead className="font-black text-[10px] uppercase p-6 text-center">Estoque</TableHead>
                      {isComboView ? (
                        <TableHead className="font-black text-[10px] uppercase p-6 text-center">Status no Combo</TableHead>
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
                                <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">{meal.protein}g P • {meal.calories} Kcal</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="p-6 text-center">
                            <Badge variant="outline" className="rounded-lg font-black uppercase text-[9px] px-3">{meal.category}</Badge>
                          </TableCell>
                          <TableCell className="p-6 text-center font-black">
                            {meal.stockQuantity === null || meal.stockQuantity === undefined ? (
                              <div className="flex items-center justify-center gap-1 text-muted-foreground">
                                <Infinity size={14} /> <span className="text-[9px] uppercase tracking-widest">Infinito</span>
                              </div>
                            ) : (
                              <span className={cn(meal.stockQuantity <= 5 ? "text-destructive" : "text-foreground")}>
                                {meal.stockQuantity} un
                              </span>
                            )}
                          </TableCell>
                          {isComboView ? (
                            <TableCell className="p-6 text-center">
                              <div className="flex flex-col items-center gap-2">
                                <Switch 
                                  checked={meal.isAvailableForCombo} 
                                  onCheckedChange={(v) => handleToggleComboAvailability(meal.id, v)} 
                                  className="data-[state=checked]:bg-primary"
                                />
                                <span className="text-[9px] font-black uppercase text-muted-foreground">
                                  {meal.isAvailableForCombo ? "Disponível" : "Indisponível"}
                                </span>
                              </div>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-8">
              <Card className="rounded-[2.5rem] border-none shadow-xl bg-white p-8">
                <CardTitle className="text-xl font-black uppercase tracking-tighter mb-8 flex items-center gap-2">
                  <Store className="text-primary" /> Operacional da Loja
                </CardTitle>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-6 bg-muted/20 rounded-3xl border border-border/40">
                    <div className="space-y-1">
                      <h4 className="font-black text-sm uppercase">Status do Delivery</h4>
                      <p className="text-xs font-medium text-muted-foreground">Controle a abertura instantânea da loja.</p>
                    </div>
                    <Switch 
                      checked={settings.isDeliveryOpen} 
                      onCheckedChange={(v) => handleSaveSettings("isDeliveryOpen", v)} 
                      className="data-[state=checked]:bg-primary scale-125"
                    />
                  </div>

                  <div className="flex items-center justify-between p-6 bg-muted/20 rounded-3xl border border-border/40">
                    <div className="space-y-1">
                      <h4 className="font-black text-sm uppercase flex items-center gap-2">Uso de Cupons <Ticket size={16} className="text-primary" /></h4>
                      <p className="text-xs font-medium text-muted-foreground">Habilitar checkout com descontos.</p>
                    </div>
                    <Switch 
                      checked={settings.isCouponsEnabled} 
                      onCheckedChange={(v) => handleSaveSettings("isCouponsEnabled", v)} 
                      className="data-[state=checked]:bg-primary scale-125"
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
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Destaque Atual</p>
                    <div className="flex items-center justify-between">
                      <span className="text-3xl font-black tracking-tight">{settings.activeCouponCode}</span>
                      <Badge className="bg-secondary text-secondary-foreground font-black px-4 py-1">{settings.couponDiscountPercent}% OFF</Badge>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Button className="flex-1 h-14 rounded-2xl bg-white text-primary hover:bg-white/90 font-black uppercase text-[10px] tracking-widest" onClick={() => setIsCouponListOpen(true)}>
                      Gerenciar Cupons
                    </Button>
                    <Button variant="outline" className="flex-1 h-14 rounded-2xl border-white/20 text-white hover:bg-white/10 font-black uppercase text-[10px] tracking-widest" onClick={() => { setEditingCoupon({}); setIsCouponEditorOpen(true); }}>
                      Novo Código
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            <div className="space-y-8">
              <Card className="rounded-[2.5rem] border-none shadow-xl bg-white p-8">
                <CardTitle className="text-xl font-black uppercase tracking-tighter mb-8 flex items-center gap-2">
                  <CalendarDays className="text-primary" /> Escala de Funcionamento
                </CardTitle>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    {DAYS_OF_WEEK.map((day) => {
                      const daySchedule = (settings.detailedSchedule || DEFAULT_SCHEDULE)[day.id];
                      return (
                        <div key={day.id} className="flex items-center justify-between p-4 bg-muted/10 rounded-2xl border border-border/40 hover:bg-white transition-all">
                          <div className="flex items-center gap-4">
                            <Switch 
                              checked={daySchedule.isOpen} 
                              onCheckedChange={(v) => handleUpdateDayStatus(day.id, v)}
                              className="data-[state=checked]:bg-primary"
                            />
                            <div>
                              <p className="font-black text-xs uppercase leading-none">{day.label}</p>
                              <p className={cn("text-[9px] font-bold uppercase mt-1", daySchedule.isOpen ? "text-primary" : "text-destructive")}>
                                {daySchedule.isOpen ? "Aberto" : "Fechado"}
                              </p>
                            </div>
                          </div>
                          
                          {daySchedule.isOpen && (
                            <div className="flex items-center gap-2">
                              <div className="hidden md:flex flex-col items-end">
                                <span className="text-[9px] font-black text-muted-foreground uppercase">{daySchedule.openAt} às {daySchedule.closeAt}</span>
                              </div>
                              <Popover onOpenChange={(open) => {
                                if (open) {
                                  setEditingDayId(day.id);
                                  setTempDaySchedule(daySchedule);
                                }
                              }}>
                                <PopoverTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-primary hover:bg-primary/10">
                                    <Pencil size={14} />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-64 p-4 rounded-[2rem] shadow-xl border-none">
                                  {tempDaySchedule && (
                                    <div className="space-y-4">
                                      <h4 className="font-black text-xs uppercase tracking-tighter mb-2">Editar: {day.label}</h4>
                                      <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                          <Label className="text-[10px] font-black uppercase opacity-60">Abertura</Label>
                                          <Input 
                                            type="time" 
                                            value={tempDaySchedule.openAt}
                                            onChange={(e) => setTempDaySchedule({...tempDaySchedule, openAt: e.target.value})}
                                            className="h-10 rounded-xl bg-muted/30 border-none font-bold text-xs"
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <Label className="text-[10px] font-black uppercase opacity-60">Fechamento</Label>
                                          <Input 
                                            type="time" 
                                            value={tempDaySchedule.closeAt}
                                            onChange={(e) => setTempDaySchedule({...tempDaySchedule, closeAt: e.target.value})}
                                            className="h-10 rounded-xl bg-muted/30 border-none font-bold text-xs"
                                          />
                                        </div>
                                      </div>
                                      <Button className="w-full h-10 rounded-xl font-black uppercase text-[10px] tracking-widest" onClick={handleCommitDaySchedule}>
                                        Confirmar Horário
                                      </Button>
                                    </div>
                                  )}
                                </PopoverContent>
                              </Popover>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <Separator className="my-6" />
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-black text-sm uppercase flex items-center gap-2">
                        <Timer size={16} className="text-primary" /> Datas Especiais & Exceções
                      </h4>
                      <Button size="icon" variant="ghost" className="h-8 w-8 rounded-xl text-primary" onClick={() => { setNewSpecialDate({ isOpen: false, label: '', openAt: '10:00', closeAt: '22:00' }); setIsSpecialDateDialogOpen(true); }}>
                        <Plus size={18} />
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      {(settings.specialDates || []).length === 0 ? (
                        <div className="p-10 border-2 border-dashed rounded-3xl text-center opacity-40">
                          <p className="text-[10px] font-black uppercase tracking-widest">Nenhuma exceção cadastrada</p>
                        </div>
                      ) : (
                        (settings.specialDates || []).map((date) => (
                          <div key={date.id} className="flex items-center justify-between p-5 bg-primary/5 rounded-[2rem] border border-primary/20">
                            <div className="flex items-center gap-4">
                              <div className="bg-white p-3 rounded-2xl shadow-sm"><CalendarIcon size={18} className="text-primary" /></div>
                              <div>
                                <p className="font-black text-sm uppercase leading-none">{date.label}</p>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">
                                  {format(parseISO(date.date), "dd/MM/yyyy")} • {date.isOpen ? `${date.openAt} às ${date.closeAt}` : "Fechado o dia todo"}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl text-primary hover:bg-primary/10" onClick={() => { setNewSpecialDate(date); setIsSpecialDateDialogOpen(true); }}>
                                <Pencil size={16} />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl text-destructive hover:bg-destructive/10" onClick={() => handleRemoveSpecialDate(date.id)}>
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="rounded-[2.5rem] border-none shadow-xl bg-white p-8">
                <CardTitle className="text-xl font-black uppercase tracking-tighter mb-8 flex items-center gap-2">
                  <CalendarClock className="text-primary" /> Agenda de Entregas
                </CardTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Próxima Data de Entrega</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-bold h-12 rounded-xl bg-muted/20 border-none shadow-none">
                          <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                          {formatDateValue(settings.nextDeliveryDate) || "Selecionar data"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 rounded-3xl" align="start">
                        <Calendar
                          mode="single"
                          selected={(() => { try { return parseISO(settings.nextDeliveryDate); } catch(e) { return undefined; } })()}
                          onSelect={(date) => date && handleSaveSettings("nextDeliveryDate", date.toISOString())}
                          initialFocus
                          locale={ptBR}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Prazo Final p/ Pedidos</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-bold h-12 rounded-xl bg-muted/20 border-none shadow-none">
                          <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                          {formatDateValue(settings.orderDeadline) || "Selecionar data"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 rounded-3xl" align="start">
                        <Calendar
                          mode="single"
                          selected={(() => { try { return parseISO(settings.orderDeadline); } catch(e) { return undefined; } })()}
                          onSelect={(date) => date && handleSaveSettings("orderDeadline", date.toISOString())}
                          initialFocus
                          locale={ptBR}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Informativo de Funcionamento (Exibido no Site)</Label>
                    <Textarea 
                      className="rounded-2xl h-24 bg-muted/20 border-none p-4 font-bold focus-visible:ring-primary"
                      value={settings.openingHours}
                      onChange={(e) => handleSaveSettings("openingHours", e.target.value)}
                    />
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="leads" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
           <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden">
              <CardHeader className="p-8">
                <CardTitle className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
                  <Sparkles className="text-primary" /> Análise de Planos Alimentares
                </CardTitle>
                <CardDescription>Clientes interessados em kits personalizados baseados em dietas.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {leads?.map((lead) => (
                    <div key={lead.id} className="group bg-muted/10 p-6 rounded-[2rem] border border-border/40 hover:border-primary/40 hover:bg-white transition-all duration-300 shadow-sm hover:shadow-xl">
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-3">
                           <div className="bg-white p-3 rounded-2xl shadow-sm border border-border/20 group-hover:bg-primary/10 transition-colors"><UserIcon size={20} className="text-primary" /></div>
                           <div>
                             <h4 className="font-black text-sm uppercase leading-none">{lead.customerName}</h4>
                             <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">ID: {lead.userId}</p>
                           </div>
                        </div>
                        {getStatusBadge(lead.status)}
                      </div>
                      <div className="space-y-4">
                        <div className="bg-white p-4 rounded-2xl shadow-inner text-[11px] font-medium italic text-muted-foreground min-h-[80px] line-clamp-4 leading-relaxed">
                          "{lead.textPlan || "Nenhum detalhe adicional informado."}"
                        </div>
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex flex-col">
                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Enviado em</span>
                            <span className="text-[10px] font-bold text-foreground">{format(new Date(lead.createdAt), "dd MMM, HH:mm", { locale: ptBR })}</span>
                          </div>
                          <div className="flex gap-2">
                            {lead.photoDataUri && (
                              <Button size="icon" variant="outline" className="rounded-xl h-10 w-10 text-primary border-primary/20" onClick={() => setSelectedLead(lead)}>
                                <Eye size={16} />
                              </Button>
                            )}
                            <Button className="rounded-xl h-10 px-5 font-black text-[9px] uppercase tracking-widest" onClick={() => handleUpdateStatus(lead.id, lead.status === 'pending' ? 'responded' : 'pending')}>
                              {lead.status === 'pending' ? 'Marcar como Lido' : 'Reabrir'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {leads?.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 opacity-40">
                      <History size={64} className="mb-4 text-muted-foreground" />
                      <p className="font-black text-xs uppercase tracking-widest">Nenhum lead pendente</p>
                    </div>
                  )}
                </div>
              </CardContent>
           </Card>
        </TabsContent>
        
        <TabsContent value="orders" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
           <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden">
              <CardHeader className="p-8 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-black uppercase tracking-tighter">Fluxo de Pedidos</CardTitle>
                  <CardDescription>Gestão centralizada das entregas e aprovações.</CardDescription>
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
                         <TableHead className="font-black text-[10px] uppercase p-6">Pedido</TableHead>
                         <TableHead className="font-black text-[10px] uppercase p-6">Cliente & Contato</TableHead>
                         <TableHead className="font-black text-[10px] uppercase p-6 text-center">Qtde</TableHead>
                         <TableHead className="font-black text-[10px] uppercase p-6 text-center">Total</TableHead>
                         <TableHead className="font-black text-[10px] uppercase p-6 text-center">Status</TableHead>
                         <TableHead className="font-black text-[10px] uppercase p-6 text-right">Gestão</TableHead>
                       </TableRow>
                     </TableHeader>
                     <TableBody>
                        {orders?.filter(o => cityFilter === 'all' || o.address?.city === cityFilter).map(order => (
                          <React.Fragment key={order.id}>
                            <TableRow className="hover:bg-muted/10 cursor-pointer" onClick={() => setExpandedOrders(prev => prev.includes(order.id) ? prev.filter(id => id !== order.id) : [...prev, order.id])}>
                              <TableCell className="p-6 font-black text-sm uppercase">#{order.id.slice(-4)}</TableCell>
                              <TableCell className="p-6">
                                <div className="font-black text-sm uppercase leading-none">{order.customerName}</div>
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase mt-1">
                                  <Phone size={10} className="text-primary" /> {order.userId}
                                </div>
                                <div className="text-[9px] font-bold text-muted-foreground uppercase mt-0.5">{order.address?.city}</div>
                              </TableCell>
                              <TableCell className="p-6 text-center font-bold text-sm">{order.items.length}</TableCell>
                              <TableCell className="p-6 text-center font-black text-primary">R$ {order.total.toFixed(2)}</TableCell>
                              <TableCell className="p-6 text-center">{getStatusBadge(order.status)}</TableCell>
                              <TableCell className="p-6 text-right">
                                <div className="flex justify-end items-center gap-2">
                                  {order.status === 'pending' && (
                                    <>
                                      <Button 
                                        size="sm" 
                                        className="h-8 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 border-none font-black text-[9px] uppercase px-3"
                                        onClick={(e) => { e.stopPropagation(); handleUpdateStatus(order.id, 'preparing'); }}
                                      >
                                        <ThumbsUp size={12} className="mr-1" /> Aprovar
                                      </Button>
                                      <Button 
                                        size="sm" 
                                        variant="ghost"
                                        className="h-8 rounded-lg text-red-600 hover:bg-red-50 font-black text-[9px] uppercase px-3"
                                        onClick={(e) => { e.stopPropagation(); handleUpdateStatus(order.id, 'cancelled'); }}
                                      >
                                        <Ban size={12} className="mr-1" /> Cancelar
                                      </Button>
                                    </>
                                  )}
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
                                  {expandedOrders.includes(order.id) ? <ChevronDown size={14} className="text-muted-foreground rotate-180 transition-transform" /> : <ChevronDown size={14} className="text-muted-foreground transition-transform" />}
                                </div>
                              </TableCell>
                            </TableRow>
                            {expandedOrders.includes(order.id) && (
                              <TableRow className="bg-muted/5">
                                <TableCell colSpan={6} className="p-8">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-top-2 duration-300">
                                    <div className="space-y-4">
                                      <h5 className="font-black text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                        <Package size={14} /> Detalhamento do Pedido
                                      </h5>
                                      {order.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center bg-white p-4 rounded-2xl border border-border/40 shadow-sm">
                                          <div className="flex items-center gap-4">
                                            <div className="bg-primary/10 w-10 h-10 rounded-xl flex items-center justify-center font-black text-primary text-xs">{item.quantity}x</div>
                                            <div>
                                              <span className="font-bold text-xs uppercase block">{item.name}</span>
                                              <span className="text-[9px] font-black text-muted-foreground uppercase">Unid: R$ {item.price.toFixed(2)}</span>
                                            </div>
                                          </div>
                                          <span className="text-sm font-black text-foreground">R$ {(item.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                      ))}
                                    </div>
                                    <div className="space-y-4">
                                      <h5 className="font-black text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                        <MapPin size={14} /> Logística de Entrega
                                      </h5>
                                      <div className="bg-white p-6 rounded-[2rem] border border-border/40 space-y-4 shadow-sm">
                                        <div className="space-y-1">
                                          <div className="flex items-center gap-2 text-xs font-black uppercase text-foreground">
                                            <MapPin size={14} className="text-primary" /> {order.address?.street}, {order.address?.number}
                                          </div>
                                          <div className="text-[10px] font-bold text-muted-foreground uppercase ml-6">Bairro: {order.address?.neighborhood}</div>
                                          <div className="text-[10px] font-bold text-muted-foreground uppercase ml-6 italic opacity-70">Ponto de Ref: {order.address?.reference || "Não informado"}</div>
                                        </div>
                                        <Separator />
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-2 text-xs font-black uppercase text-foreground">
                                            <Wallet size={14} className="text-primary" /> Pagamento
                                          </div>
                                          <Badge className="bg-muted text-foreground border-none font-black text-[9px] uppercase">{order.paymentMethod}</Badge>
                                        </div>
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

      {/* Category Dialog */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-[2.5rem] p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-tighter">
              {editingCategory?.id ? "Editar Categoria" : "Nova Categoria"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveCategory} className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Nome da Categoria</Label>
              <Input 
                value={editingCategory?.label || ""} 
                onChange={e => setEditingCategory({...editingCategory, label: e.target.value})}
                placeholder="Ex: Massas"
                className="rounded-xl h-12 bg-muted/30 border-none font-bold"
                required
              />
            </div>
            <Button type="submit" className="w-full h-14 rounded-full font-black uppercase tracking-widest shadow-xl shadow-primary/20">
              Salvar Categoria
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Special Date Dialog */}
      <Dialog open={isSpecialDateDialogOpen} onOpenChange={setIsSpecialDateDialogOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-[2.5rem] p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-tighter">
              {newSpecialDate.id ? "Editar Exceção" : "Nova Exceção"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nome do Evento</Label>
              <Input 
                value={newSpecialDate.label} 
                onChange={e => setNewSpecialDate({...newSpecialDate, label: e.target.value})}
                placeholder="Ex: Feriado de Natal"
                className="rounded-xl h-12 bg-muted/30 border-none font-bold"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Data</Label>
              <Input 
                type="date"
                value={newSpecialDate.date} 
                onChange={e => setNewSpecialDate({...newSpecialDate, date: e.target.value})}
                className="rounded-xl h-12 bg-muted/30 border-none font-bold"
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-muted/10 rounded-2xl">
               <Label className="font-bold uppercase text-xs">Estará Aberto?</Label>
               <Switch 
                 checked={newSpecialDate.isOpen} 
                 onCheckedChange={v => setNewSpecialDate({...newSpecialDate, isOpen: v})}
               />
            </div>
            {newSpecialDate.isOpen && (
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Abre às</Label>
                   <Input 
                     type="time"
                     value={newSpecialDate.openAt} 
                     onChange={e => setNewSpecialDate({...newSpecialDate, openAt: e.target.value})}
                     className="rounded-xl h-12 bg-muted/30 border-none font-bold text-center"
                   />
                 </div>
                 <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Fecha às</Label>
                   <Input 
                     type="time"
                     value={newSpecialDate.closeAt} 
                     onChange={e => setNewSpecialDate({...newSpecialDate, closeAt: e.target.value})}
                     className="rounded-xl h-12 bg-muted/30 border-none font-bold text-center"
                   />
                 </div>
               </div>
            )}
            <Button className="w-full h-14 rounded-full font-black uppercase tracking-widest shadow-xl shadow-primary/20" onClick={handleAddSpecialDate}>
              Salvar Alterações
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Leads Photo Preview Dialog */}
      <Dialog open={!!selectedLead} onOpenChange={(open) => !open && setSelectedLead(null)}>
        <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          {selectedLead && (
            <div className="relative aspect-square w-full">
              <Image src={selectedLead.photoDataUri || ""} alt="Plano Alimentar" fill className="object-contain bg-black" />
              <button 
                onClick={() => setSelectedLead(null)}
                className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 p-2 rounded-full backdrop-blur-md transition-colors"
              >
                <XCircle className="text-white" />
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Existing Dialogs for Meal, Category, Coupon */}
      <Dialog open={isMealDialogOpen} onOpenChange={setIsMealDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] p-8">
          <DialogHeader><DialogTitle className="text-2xl font-black uppercase tracking-tighter">Ficha Técnica do Prato</DialogTitle></DialogHeader>
          <form onSubmit={handleSaveMeal} className="space-y-6 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label className="text-[10px] font-black uppercase ml-1 tracking-widest text-muted-foreground">Nome Comercial</Label>
                <Input value={editingMeal?.name || ""} onChange={e => setEditingMeal({...editingMeal, name: e.target.value})} className="rounded-xl h-12 bg-muted/30 border-none font-bold" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase ml-1 tracking-widest text-muted-foreground">Categoria</Label>
                <Select value={editingMeal?.category} onValueChange={v => setEditingMeal({...editingMeal, category: v as any})}>
                  <SelectTrigger className="rounded-xl h-12 bg-muted/30 border-none font-bold"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    {currentCategories.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase ml-1 tracking-widest text-muted-foreground">Preço (R$)</Label>
                <Input type="number" step="0.01" value={editingMeal?.price || 0} onChange={e => setEditingMeal({...editingMeal, price: parseFloat(e.target.value)})} className="rounded-xl h-12 bg-muted/30 border-none font-bold" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase ml-1 tracking-widest text-muted-foreground">Proteína (g)</Label>
                <Input type="number" value={editingMeal?.protein || 0} onChange={e => setEditingMeal({...editingMeal, protein: parseInt(e.target.value)})} className="rounded-xl h-12 bg-muted/30 border-none font-bold" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase ml-1 tracking-widest text-muted-foreground">Calorias (Kcal)</Label>
                <Input type="number" value={editingMeal?.calories || 0} onChange={e => setEditingMeal({...editingMeal, calories: parseInt(e.target.value)})} className="rounded-xl h-12 bg-muted/30 border-none font-bold" />
              </div>
              <div className="space-y-2 col-span-2">
                <Label className="text-[10px] font-black uppercase ml-1 tracking-widest text-muted-foreground">Quantidade em Estoque (Deixe em branco para infinito)</Label>
                <Input 
                  type="number" 
                  value={editingMeal?.stockQuantity === null || editingMeal?.stockQuantity === undefined ? "" : editingMeal.stockQuantity} 
                  onChange={e => setEditingMeal({...editingMeal, stockQuantity: e.target.value === "" ? null : parseInt(e.target.value)})} 
                  className="rounded-xl h-12 bg-muted/30 border-none font-bold" 
                  placeholder="Ex: 12"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase ml-1 tracking-widest text-muted-foreground">Descrição Gastronômica</Label>
              <Textarea value={editingMeal?.description || ""} onChange={e => setEditingMeal({...editingMeal, description: e.target.value})} className="rounded-2xl h-24 bg-muted/30 border-none font-medium resize-none" />
            </div>
            <div className="flex items-center gap-3 p-5 bg-primary/5 rounded-2xl border border-primary/10">
              <Switch checked={editingMeal?.isAvailableForCombo} onCheckedChange={v => setEditingMeal({...editingMeal, isAvailableForCombo: v})} />
              <div className="space-y-0.5">
                <Label className="text-xs font-black uppercase tracking-tight">Liberar para Montagem Manual</Label>
                <p className="text-[9px] font-bold text-muted-foreground leading-none">O cliente poderá escolher este item no configurador de marmitas.</p>
              </div>
            </div>
            <Button type="submit" className="w-full h-14 rounded-full font-black uppercase tracking-widest shadow-xl shadow-primary/20">Salvar Alterações</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isCouponListOpen} onOpenChange={setIsCouponListOpen}>
        <DialogContent className="sm:max-w-[700px] rounded-[2.5rem] p-8">
           <DialogHeader><DialogTitle className="text-2xl font-black uppercase tracking-tighter">Central de Cupons</DialogTitle></DialogHeader>
           <div className="pt-6">
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {coupons?.length === 0 ? (
                    <div className="p-20 text-center flex flex-col items-center gap-4 opacity-30">
                      <Ticket size={48} />
                      <p className="font-black text-xs uppercase tracking-widest">Nenhum cupom ativo</p>
                    </div>
                  ) : coupons?.map(cp => (
                    <div key={cp.id} className="group flex items-center justify-between p-6 bg-muted/30 rounded-[2rem] border border-border/40 hover:bg-white hover:border-primary/40 transition-all shadow-sm">
                      <div className="flex items-center gap-6">
                        <div className="bg-primary/10 p-4 rounded-2xl text-primary font-black text-xl tracking-tighter shadow-inner">
                          {cp.code}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-black text-sm uppercase leading-none">{cp.description}</h4>
                            <Badge className="bg-primary text-white border-none text-[9px] font-black h-5">{cp.discountPercent}% OFF</Badge>
                          </div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Responsável: {cp.owner}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end gap-1">
                          <Switch checked={cp.isActive} onCheckedChange={(v) => {
                            const ref = doc(firestore!, "coupons", cp.id);
                            updateDoc(ref, { isActive: v });
                          }} />
                          <span className="text-[8px] font-black uppercase text-muted-foreground">{cp.isActive ? "Ativo" : "Inativo"}</span>
                        </div>
                        <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl text-primary hover:bg-primary/10" onClick={() => { setEditingCoupon(cp); setIsCouponEditorOpen(true); }}>
                          <Pencil size={18} />
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
          <DialogHeader><DialogTitle className="text-2xl font-black uppercase tracking-tighter">Criar Código de Desconto</DialogTitle></DialogHeader>
          <form onSubmit={handleSaveCoupon} className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase ml-1 tracking-widest text-muted-foreground">Código Único (Sem espaços)</Label>
              <Input value={editingCoupon?.code || ""} onChange={e => setEditingCoupon({...editingCoupon, code: e.target.value.toUpperCase()})} className="rounded-xl h-14 bg-muted/30 border-none font-black text-center text-2xl tracking-tighter" placeholder="EX: VERÃO30" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase ml-1 tracking-widest text-muted-foreground">Desconto (%)</Label>
                <Input type="number" value={editingCoupon?.discountPercent || 0} onChange={e => setEditingCoupon({...editingCoupon, discountPercent: parseInt(e.target.value)})} className="rounded-xl h-12 bg-muted/30 border-none font-bold" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase ml-1 tracking-widest text-muted-foreground">Proprietário/Influencer</Label>
                <Input value={editingCoupon?.owner || ""} onChange={e => setEditingCoupon({...editingCoupon, owner: e.target.value})} className="rounded-xl h-12 bg-muted/30 border-none font-bold" placeholder="Nome" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase ml-1 tracking-widest text-muted-foreground">Campanha Associada</Label>
              <Input value={editingCoupon?.description || ""} onChange={e => setEditingCoupon({...editingCoupon, description: e.target.value})} className="rounded-xl h-12 bg-muted/30 border-none font-bold" placeholder="Ex: Black Friday" />
            </div>
            <Button type="submit" className="w-full h-14 rounded-full font-black uppercase tracking-widest shadow-xl shadow-primary/20">Ativar Desconto</Button>
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
      <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest leading-none">{title}</p>
      <h3 className="text-3xl font-black text-foreground tracking-tighter mt-2 line-clamp-1">{value}</h3>
      <div className="flex items-center gap-1.5 mt-2">
        <ArrowUpRight size={14} className="text-primary" />
        <p className="text-[10px] font-black text-primary uppercase">{trend}</p>
      </div>
    </Card>
  );
}

function QuickLinkButton({ label, icon: Icon, onClick }: { label: string, icon: any, onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center justify-center p-4 rounded-2xl bg-muted/30 hover:bg-primary/10 hover:text-primary border border-transparent hover:border-primary/20 transition-all gap-2 group">
      <div className="bg-white p-2 rounded-xl group-hover:bg-primary group-hover:text-white transition-colors shadow-sm">
        <Icon size={18} />
      </div>
      <span className="text-[9px] font-black uppercase tracking-tight">{label}</span>
    </button>
  );
}
