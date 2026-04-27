
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
  BarChart3
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
  BarChart,
  Bar
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

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
  const [comboCategoryFilter, setComboCategoryFilter] = useState("all");
  const [isSettingsMode, setIsSettingsMode] = useState(false);
  const [isCatalogMode, setIsCatalogMode] = useState(false);
  const [isComboMode, setIsComboMode] = useState(false);
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

  const usersQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, "users"), orderBy("name", "asc"));
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
  const { data: users } = useCollection<UserProfile>(usersQuery as any);
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

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    let result = orders;
    
    if (cityFilter !== "all") {
      result = result.filter(o => o.address?.city === cityFilter);
    }
    
    if (selectedDate) {
      result = result.filter(o => {
        const orderDate = new Date(o.createdAt);
        return isSameDay(orderDate, selectedDate);
      });
    }
    
    return result;
  }, [orders, cityFilter, selectedDate]);

  const stats = useMemo(() => {
    const revenue = filteredOrders?.reduce((acc, order) => acc + order.total, 0) || 0;
    const active = filteredOrders?.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length || 0;
    
    const leadsForDay = selectedDate 
      ? leads?.filter(l => isSameDay(new Date(l.createdAt), selectedDate))
      : leads;
    
    const pendingLeadsCount = leadsForDay?.filter(l => l.status === 'pending').length || 0;
    const totalOrders = filteredOrders?.length || 0;
    
    return {
      totalSales: totalOrders,
      orderCount: totalOrders,
      activeOrders: active,
      revenue,
      pendingLeads: pendingLeadsCount
    };
  }, [filteredOrders, leads, selectedDate]);

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
    updateDoc(orderRef, { status: newStatus })
      .catch(error => {
        const permissionError = new FirestorePermissionError({
          path: orderRef.path,
          operation: 'update',
          requestResourceData: { status: newStatus }
        });
        errorEmitter.emit('permission-error', permissionError);
      });
    toast({ title: "Status Atualizado", description: `Pedido movido para ${newStatus}` });
  };

  const handleUpdateLeadStatus = (leadId: string, newStatus: string) => {
    if (!firestore) return;
    const leadRef = doc(firestore, "leads", leadId);
    updateDoc(leadRef, { status: newStatus })
      .catch(error => {
        const permissionError = new FirestorePermissionError({
          path: leadRef.path,
          operation: 'update',
          requestResourceData: { status: newStatus }
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  const handleSaveSettings = (key: keyof SiteSettings, value: any) => {
    if (!firestore) return;
    const newSettings = { ...settings, [key]: value };
    const settingsRef = doc(firestore, "settings", "global");
    setDoc(settingsRef, newSettings, { merge: true })
      .catch(error => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: settingsRef.path, operation: 'write', requestResourceData: newSettings }));
      });
    toast({ title: "Configuração Salva", description: "As mudanças já estão ativas no site." });
  };

  const handleDeleteMeal = (mealId: string) => {
    if (!firestore) return;
    const mealRef = doc(firestore, "meals", mealId);
    deleteDoc(mealRef).catch(error => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: mealRef.path, operation: 'delete' }));
    });
    toast({ title: "Prato Removido", description: "O item foi excluído do catálogo." });
  };

  const handleArchiveMeal = (meal: Meal) => {
    if (!firestore) return;
    const mealRef = doc(firestore, "meals", meal.id);
    const newStatus = !meal.isArchived;
    updateDoc(mealRef, { isArchived: newStatus })
      .catch(error => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: mealRef.path, operation: 'update', requestResourceData: { isArchived: newStatus } }));
      });
  };

  const handleToggleComboAvailability = (meal: Meal) => {
    if (!firestore) return;
    const mealRef = doc(firestore, "meals", meal.id);
    const newStatus = !meal.isAvailableForCombo;
    updateDoc(mealRef, { isAvailableForCombo: newStatus })
      .catch(error => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: mealRef.path, operation: 'update', requestResourceData: { isAvailableForCombo: newStatus } }));
      });
  };

  const handleSaveMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !editingMeal) return;
    const mealData = {
      ...editingMeal,
      id: editingMeal.id || doc(collection(firestore, "meals")).id,
      imageUrl: editingMeal.imageUrl || "https://picsum.photos/seed/harvest/400/300",
      rating: editingMeal.rating || 5.0,
      isArchived: editingMeal.isArchived || false,
      isAvailableForCombo: editingMeal.isAvailableForCombo !== undefined ? editingMeal.isAvailableForCombo : true
    };
    const mealRef = doc(firestore, "meals", mealData.id);
    setDoc(mealRef, mealData, { merge: true })
      .catch(error => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: mealRef.path, operation: 'write', requestResourceData: mealData }));
      });
    setIsMealDialogOpen(false);
    setEditingMeal(null);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !editingCategory) return;
    const categoryData = {
      ...editingCategory,
      id: editingCategory.id || editingCategory.label.replace(/\s+/g, '-').toLowerCase()
    };
    const categoryRef = doc(firestore, "categories", categoryData.id);
    setDoc(categoryRef, categoryData, { merge: true });
    setIsCategoryDialogOpen(false);
    setEditingCategory(null);
  };

  const handleSaveCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !editingCoupon) return;
    const couponData: Coupon = {
      ...editingCoupon,
      id: editingCoupon.id || doc(collection(firestore, "coupons")).id,
      code: (editingCoupon.code || "").toUpperCase(),
      discountPercent: editingCoupon.discountPercent || 0,
      isActive: editingCoupon.isActive !== undefined ? editingCoupon.isActive : true,
      description: editingCoupon.description || "",
      owner: editingCoupon.owner || "",
      createdAt: editingCoupon.createdAt || new Date().toISOString()
    } as Coupon;
    const couponRef = doc(firestore, "coupons", couponData.id);
    setDoc(couponRef, couponData, { merge: true });
    setIsCouponEditorOpen(false);
    setEditingCoupon(null);
  };

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrders(prev => prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]);
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
    return <Badge className={cn("border-none px-3 py-1 text-[10px] font-black uppercase tracking-widest", color)}>{label}</Badge>;
  };

  const formatCurrency = (value: number) => `R$ ${value.toFixed(2).replace('.', ',')}`;

  if (isComboMode || isCatalogMode || isSettingsMode) {
    // Rendereização de sub-modos (simplificada para brevidade)
    // No ambiente real, esses componentes seriam arquivos separados ou layouts aninhados
  }

  return (
    <div className="min-h-screen bg-muted/20 p-6 md:p-10 font-body">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div>
            <button 
              onClick={() => window.location.href = '/'}
              className="flex items-center gap-2 text-primary font-black uppercase text-xs mb-3 hover:translate-x-[-4px] transition-transform"
            >
              <ArrowLeft size={16} /> Voltar ao Site
            </button>
            <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase">Harvest Admin</h1>
            <p className="text-muted-foreground font-medium mt-1 uppercase text-[10px] tracking-[0.2em]">Gestão Estratégica & IA</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="rounded-2xl h-12 px-6 border-none shadow-sm bg-white font-black text-xs uppercase">
                <CalendarIcon size={16} className="mr-2" /> 
                {selectedDate ? format(selectedDate, "dd MMM", { locale: ptBR }) : "Selecionar Data"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 rounded-3xl" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                initialFocus
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>

          <div className="bg-primary text-white p-3 rounded-2xl shadow-xl shadow-primary/20">
            <LayoutDashboard size={24} />
          </div>
        </div>
      </header>

      <main>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard title="Receita do Dia" value={formatCurrency(stats.revenue)} icon={Wallet} trend="Sincronizado" color="primary" />
          <StatCard title="Pedidos do Dia" value={stats.orderCount.toString()} icon={ShoppingBag} trend="Total diário" color="secondary" />
          <StatCard title="Pedidos Ativos" value={stats.activeOrders.toString()} icon={Clock} trend="Acompanhamento" color="amber" />
          <StatCard title="Leads de IA" value={stats.pendingLeads.toString()} icon={Sparkles} trend="Novos planos" color="purple" />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white p-1.5 rounded-2xl shadow-sm inline-flex h-14 w-full md:w-auto border border-border/40 overflow-x-auto no-scrollbar">
            <TabsTrigger value="dashboard" className="rounded-xl px-8 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white transition-all">Visão Geral</TabsTrigger>
            <TabsTrigger value="orders" className="rounded-xl px-8 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white transition-all">Pedidos</TabsTrigger>
            <TabsTrigger value="leads" className="rounded-xl px-8 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white transition-all">Leads de Planos</TabsTrigger>
            <TabsTrigger value="catalog" className="rounded-xl px-8 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white transition-all">Cardápio</TabsTrigger>
            <TabsTrigger value="settings" className="rounded-xl px-8 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white transition-all">Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-2 rounded-[2.5rem] border-none shadow-xl bg-white p-8">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
                      <BarChart3 className="text-primary" size={20} /> Tendência de Vendas (Mês Atual)
                    </CardTitle>
                    <CardDescription>Acompanhamento diário da receita bruta.</CardDescription>
                  </div>
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
                        contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                        formatter={(value: any) => [formatCurrency(value), "Receita"]}
                      />
                      <Area type="monotone" dataKey="vendas" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <div className="space-y-8">
                <Card className="rounded-[2.5rem] border-none shadow-xl bg-primary p-8 text-white relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
                  <div className="relative z-10">
                    <TrendingUp className="mb-4" size={32} />
                    <h3 className="text-2xl font-black tracking-tighter mb-1 leading-none uppercase">Eficiência IA</h3>
                    <p className="text-white/60 font-bold uppercase text-[9px] tracking-widest mb-6">Pedidos convertidos por análise</p>
                    <div className="space-y-2">
                       <div className="flex justify-between text-[10px] font-black uppercase">
                         <span>Taxa de Conversão</span>
                         <span>74%</span>
                       </div>
                       <Progress value={74} className="h-2 bg-white/20" />
                    </div>
                  </div>
                </Card>

                <Card className="rounded-[2.5rem] border-none shadow-xl bg-white p-8">
                  <h3 className="text-lg font-black uppercase tracking-tighter mb-6">Links Rápidos</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <QuickLinkButton label="Novo Cupom" icon={Ticket} onClick={() => { setActiveTab("settings"); setIsCouponEditorOpen(true); }} />
                    <QuickLinkButton label="Novo Prato" icon={Plus} onClick={() => { setActiveTab("catalog"); setIsMealDialogOpen(true); }} />
                    <QuickLinkButton label="Ver Clientes" icon={Users} onClick={() => setActiveTab("orders")} />
                    <QuickLinkButton label="Relatórios" icon={FileText} onClick={() => {}} />
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
                <CardDescription>Clientes que enviaram fotos de suas dietas para orçamento.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {leads?.map((lead) => (
                    <div key={lead.id} className="bg-muted/10 p-6 rounded-[2rem] border border-border/40 group hover:border-primary/40 transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                           <div className="bg-white p-3 rounded-2xl shadow-sm">
                             <UserIcon size={20} className="text-primary" />
                           </div>
                           <div>
                             <h4 className="font-black text-sm uppercase">{lead.customerName}</h4>
                             <p className="text-[10px] font-bold text-muted-foreground uppercase">{lead.userId}</p>
                           </div>
                        </div>
                        {getStatusBadge(lead.status)}
                      </div>
                      
                      <div className="space-y-4">
                        <div className="bg-white p-4 rounded-2xl shadow-sm text-[11px] font-medium italic text-muted-foreground line-clamp-3">
                          "{lead.textPlan || "Sem descrição de texto..."}"
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black text-muted-foreground uppercase">{format(new Date(lead.createdAt), "dd MMM, HH:mm", { locale: ptBR })}</span>
                          <div className="flex gap-2">
                            {lead.photoDataUri && (
                              <Button size="sm" variant="outline" className="rounded-xl h-10 px-4 font-black text-[9px] uppercase" onClick={() => window.open(lead.photoDataUri, '_blank')}>
                                <Eye size={12} className="mr-2" /> Ver Foto
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              className="rounded-xl h-10 px-4 font-black text-[9px] uppercase"
                              onClick={() => handleUpdateLeadStatus(lead.id, lead.status === 'pending' ? 'responded' : 'pending')}
                            >
                              {lead.status === 'pending' ? 'Finalizar' : 'Reabrir'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {leads?.length === 0 && <div className="col-span-full py-20 text-center font-bold text-muted-foreground uppercase text-xs">Nenhum lead pendente.</div>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Outras abas (simplificadas para o protótipo) */}
        </Tabs>
      </main>
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
