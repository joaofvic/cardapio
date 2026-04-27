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
  Calendar,
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
  ChevronDown
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
  useCollection, 
  useDoc, 
  useFirestore 
} from "@/firebase";
import { collection, query, orderBy, limit, doc, updateDoc, setDoc } from "firebase/firestore";
import { Order } from "@/app/types/meal";
import { UserProfile } from "@/app/page";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { useToast } from "@/hooks/use-toast";

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
  activeCouponCode: string;
  couponDiscountPercent: number;
  nextDeliveryDate: string;
  orderDeadline: string;
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

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [cityFilter, setCityFilter] = useState("all");
  const [isSettingsMode, setIsSettingsMode] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState<string[]>([]);
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

  const settingsDocRef = useMemo(() => {
    if (!firestore) return null;
    return doc(firestore, "settings", "global");
  }, [firestore]);

  const { data: orders, loading: loadingOrders } = useCollection<Order>(ordersQuery as any);
  const { data: users, loading: loadingUsers } = useCollection<UserProfile>(usersQuery as any);
  const { data: leads, loading: loadingLeads } = useCollection<MealPlanLead>(leadsQuery as any);
  const { data: settingsData, loading: loadingSettings } = useDoc<SiteSettings>(settingsDocRef as any);

  const settings = settingsData || {
    isAiAnalysisEnabled: true,
    isCouponsEnabled: true,
    isVeggieCategoryVisible: true,
    activeCouponCode: "ADAS",
    couponDiscountPercent: 50,
    nextDeliveryDate: "18/12/2025",
    orderDeadline: "Quinta-feira"
  };

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    if (cityFilter === "all") return orders;
    return orders.filter(o => o.address?.city === cityFilter);
  }, [orders, cityFilter]);

  const stats = useMemo(() => {
    const revenue = orders?.reduce((acc, order) => acc + order.total, 0) || 0;
    const active = orders?.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length || 0;
    const pendingLeadsCount = leads?.filter(l => l.status === 'pending').length || 0;
    const totalOrders = orders?.length || 0;
    
    return {
      totalSales: totalOrders,
      orderCount: totalOrders,
      activeOrders: active,
      revenue,
      pendingLeads: pendingLeadsCount
    };
  }, [orders, leads]);

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
        const permissionError = new FirestorePermissionError({
          path: settingsRef.path,
          operation: 'write',
          requestResourceData: newSettings
        });
        errorEmitter.emit('permission-error', permissionError);
      });

    toast({ title: "Configuração Salva", description: "As mudanças já estão ativas no site." });
  };

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrders(prev => 
      prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
    );
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

  if (isSettingsMode) {
    return (
      <div className="min-h-screen bg-muted/20 p-6 md:p-10 font-body animate-in fade-in slide-in-from-right duration-500">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <button 
              onClick={() => setIsSettingsMode(false)}
              className="flex items-center gap-2 text-primary font-black uppercase text-xs mb-3 hover:translate-x-[-4px] transition-transform"
            >
              <ArrowLeft size={16} /> Voltar ao Painel
            </button>
            <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase">Configurações do Site</h1>
            <p className="text-muted-foreground font-medium mt-1 uppercase text-[10px] tracking-[0.2em]">Gerencie as funções visíveis para o cliente</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden">
              <CardHeader className="p-8">
                <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
                  <Zap className="text-primary" size={20} /> Funções e Visibilidade
                </CardTitle>
                <CardDescription>Ative ou desative recursos que os clientes podem acessar no site.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-6">
                <div className="flex items-center justify-between p-6 rounded-3xl bg-muted/20 border border-border/40">
                  <div className="space-y-1">
                    <h4 className="font-black text-sm uppercase">Análise de Plano Alimentar (IA)</h4>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Permite que clientes enviem fotos de suas dietas para orçamento.</p>
                  </div>
                  <Switch 
                    checked={settings.isAiAnalysisEnabled} 
                    onCheckedChange={(val) => handleSaveSettings('isAiAnalysisEnabled', val)}
                  />
                </div>

                <div className="flex items-center justify-between p-6 rounded-3xl bg-muted/20 border border-border/40">
                  <div className="space-y-1">
                    <h4 className="font-black text-sm uppercase">Cupons de Desconto</h4>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Habilita o campo de inserção de cupons na cesta de compras.</p>
                  </div>
                  <Switch 
                    checked={settings.isCouponsEnabled} 
                    onCheckedChange={(val) => handleSaveSettings('isCouponsEnabled', val)}
                  />
                </div>

                <div className="flex items-center justify-between p-6 rounded-3xl bg-muted/20 border border-border/40">
                  <div className="space-y-1">
                    <h4 className="font-black text-sm uppercase">Filtro de Categoria "Legumes"</h4>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Exibe ou oculta a categoria de refeições vegetarianas no menu.</p>
                  </div>
                  <Switch 
                    checked={settings.isVeggieCategoryVisible} 
                    onCheckedChange={(val) => handleSaveSettings('isVeggieCategoryVisible', val)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden">
              <CardHeader className="p-8">
                <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
                  <Truck className="text-primary" size={20} /> Logística e Prazos
                </CardTitle>
                <CardDescription>Configure avisos de entrega para cidades fora de São Miguel.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Próxima Data de Entrega (Rotas)</label>
                    <Input 
                      value={settings.nextDeliveryDate} 
                      onChange={(e) => handleSaveSettings('nextDeliveryDate', e.target.value)}
                      className="h-12 rounded-xl bg-muted/30 border-none font-bold" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Limite para Pedidos Semanais</label>
                    <Input 
                      value={settings.orderDeadline} 
                      onChange={(e) => handleSaveSettings('orderDeadline', e.target.value)}
                      className="h-12 rounded-xl bg-muted/30 border-none font-bold" 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
             <Card className="rounded-[2.5rem] border-none shadow-xl bg-primary p-10 text-white relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
                <div className="relative z-10">
                  <Ticket className="mb-4" size={32} />
                  <h3 className="text-2xl font-black tracking-tighter mb-2 leading-none">CUPOM ATIVO</h3>
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="text-[9px] font-black uppercase tracking-widest text-white/60">Código Atual</label>
                      <Input 
                        value={settings.activeCouponCode}
                        onChange={(e) => handleSaveSettings('activeCouponCode', e.target.value.toUpperCase())}
                        className="bg-white/10 border-white/20 text-white font-black uppercase placeholder:text-white/30 h-10 mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-black uppercase tracking-widest text-white/60">Desconto (%)</label>
                      <Input 
                        type="number"
                        value={settings.couponDiscountPercent}
                        onChange={(e) => handleSaveSettings('couponDiscountPercent', Number(e.target.value))}
                        className="bg-white/10 border-white/20 text-white font-black h-10 mt-1"
                      />
                    </div>
                  </div>
                  <Badge className="w-full bg-white text-primary justify-center h-10 font-black uppercase text-xs">Cupom Operacional</Badge>
                </div>
              </Card>

              <Card className="rounded-[2.5rem] border-none shadow-xl bg-white p-8">
                <h3 className="text-xl font-black uppercase tracking-tighter mb-6 flex items-center gap-3">
                  <Bell className="text-primary" size={20} /> Notificações Admin
                </h3>
                <div className="space-y-4">
                   <div className="flex items-center justify-between">
                     <span className="text-xs font-bold uppercase">Avisar Novos Pedidos</span>
                     <Switch defaultChecked />
                   </div>
                   <div className="flex items-center justify-between">
                     <span className="text-xs font-bold uppercase">Resumo de Vendas Diário</span>
                     <Switch />
                   </div>
                </div>
              </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 p-6 md:p-10 font-body">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <button 
            onClick={() => window.location.href = '/'}
            className="flex items-center gap-2 text-primary font-black uppercase text-xs mb-3 hover:translate-x-[-4px] transition-transform"
          >
            <ArrowLeft size={16} /> Voltar ao Site
          </button>
          <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase">Harvest Admin</h1>
          <p className="text-muted-foreground font-medium mt-1 uppercase text-[10px] tracking-[0.2em]">Painel de Controle Estratégico</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-2xl h-12 px-6 border-none shadow-sm bg-white font-black text-xs uppercase">
            <Calendar size={16} className="mr-2" /> {format(new Date(), "dd MMM", { locale: ptBR })}
          </Button>
          <div className="bg-primary text-white p-3 rounded-2xl shadow-xl shadow-primary/20">
            <LayoutDashboard size={24} />
          </div>
        </div>
      </header>

      <main>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard 
            title="Receita Total" 
            value={formatCurrency(stats.revenue)} 
            icon={Wallet} 
            trend="+12% que ontem" 
            color="primary"
          />
          <StatCard 
            title="Pedidos Totais" 
            value={stats.orderCount.toString()} 
            icon={ShoppingBag} 
            trend="+5 novos hoje" 
            color="secondary"
          />
          <StatCard 
            title="Pedidos Ativos" 
            value={stats.activeOrders.toString()} 
            icon={Clock} 
            trend="Urgência: Média" 
            color="amber"
          />
          <StatCard 
            title="Planos Pendentes" 
            value={stats.pendingLeads.toString()} 
            icon={FileText} 
            trend="Aguardando retorno" 
            color="purple"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <Card className="rounded-[2.5rem] border-none shadow-xl shadow-black/5 bg-white p-8 group hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-6">
                <div className="p-4 rounded-[1.5rem] bg-secondary/20 text-secondary-foreground transition-transform group-hover:scale-110">
                  <Sparkles size={28} />
                </div>
                {stats.pendingLeads > 0 && (
                  <Badge className="bg-secondary text-secondary-foreground border-none font-black text-[9px] uppercase tracking-widest animate-pulse">Ação Necessária</Badge>
                )}
              </div>
              <div className="space-y-1 mb-8">
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Planos Alimentares Enviados</p>
                <h3 className="text-3xl font-black text-foreground tracking-tighter">
                  {stats.pendingLeads} {stats.pendingLeads === 1 ? 'Cliente' : 'Clientes'} aguardando retorno
                </h3>
                <p className="text-[10px] font-bold text-secondary-foreground mt-2 flex items-center gap-1">
                  <MessageSquare size={12} /> Transforme leads em vendas hoje mesmo
                </p>
              </div>
            </div>
            <Button 
              className="w-full h-14 rounded-2xl bg-secondary text-secondary-foreground hover:bg-secondary/90 font-black uppercase text-xs tracking-widest transition-all"
              onClick={() => setActiveTab("leads")}
            >
              VER TODAS AS SOLICITAÇÕES <ChevronRight size={16} className="ml-2" />
            </Button>
          </Card>

          <Card className="rounded-[2.5rem] border-none shadow-xl shadow-black/5 bg-white p-8 group hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-6">
                <div className="p-4 rounded-[1.5rem] bg-primary/10 text-primary transition-transform group-hover:scale-110">
                  <ShieldCheck size={28} />
                </div>
              </div>
              <div className="space-y-1 mb-8">
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Admin</p>
                <h3 className="text-3xl font-black text-foreground tracking-tighter">
                  Configurações do Site
                </h3>
                <p className="text-[10px] font-bold text-muted-foreground mt-2 flex items-center gap-1">
                  <Settings size={12} /> Gerencie funções visíveis para o cliente
                </p>
              </div>
            </div>
            <Button 
              className="w-full h-14 rounded-2xl bg-muted text-foreground hover:bg-muted/90 font-black uppercase text-xs tracking-widest transition-all"
              onClick={() => setIsSettingsMode(true)}
            >
              GERENCIAR FUNÇÕES <ChevronRight size={16} className="ml-2" />
            </Button>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white p-1.5 rounded-2xl shadow-sm inline-flex h-14 w-full md:w-auto border border-border/40 overflow-x-auto">
            <TabsTrigger value="dashboard" className="rounded-xl px-8 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="orders" className="rounded-xl px-8 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
              Pedidos
            </TabsTrigger>
            <TabsTrigger value="leads" className="rounded-xl px-8 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
              Solicitações
            </TabsTrigger>
            <TabsTrigger value="users" className="rounded-xl px-8 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
              Clientes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-2 rounded-[2.5rem] border-none shadow-xl shadow-black/5 bg-white overflow-hidden">
                <CardHeader className="p-8 pb-0">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-2xl font-black uppercase tracking-tighter">Pedidos Recentes</CardTitle>
                      <CardDescription className="font-medium">Acompanhe as últimas transações do sistema.</CardDescription>
                    </div>
                    <Button variant="ghost" className="rounded-xl font-black text-[10px] uppercase tracking-widest text-primary" onClick={() => setActiveTab("orders")}>Ver Tudo</Button>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="rounded-3xl border border-border/40 overflow-hidden bg-muted/10">
                    <Table>
                      <TableHeader className="bg-muted/30">
                        <TableRow className="border-none hover:bg-transparent">
                          <TableHead className="font-black text-[10px] uppercase tracking-widest p-6">ID Pedido</TableHead>
                          <TableHead className="font-black text-[10px] uppercase tracking-widest p-6">Cliente</TableHead>
                          <TableHead className="font-black text-[10px] uppercase tracking-widest p-6 text-center">Data</TableHead>
                          <TableHead className="font-black text-[10px] uppercase tracking-widest p-6 text-right">Total</TableHead>
                          <TableHead className="font-black text-[10px] uppercase tracking-widest p-6 text-center">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loadingOrders ? (
                          <TableRow><TableCell colSpan={5} className="p-10 text-center font-bold text-muted-foreground">Carregando dados...</TableCell></TableRow>
                        ) : orders?.slice(0, 5).map((order) => (
                          <TableRow key={order.id} className="border-border/40 hover:bg-muted/20 transition-colors">
                            <TableCell className="p-6 font-black text-xs text-primary">{order.id}</TableCell>
                            <TableCell className="p-6">
                              <div className="flex flex-col">
                                <span className="font-black text-xs">{order.customerName}</span>
                                <span className="text-[10px] text-muted-foreground font-bold">{order.userId}</span>
                              </div>
                            </TableCell>
                            <TableCell className="p-6 text-center text-[10px] font-bold text-muted-foreground">
                              {format(new Date(order.createdAt), "dd MMM, HH:mm", { locale: ptBR })}
                            </TableCell>
                            <TableCell className="p-6 text-right font-black text-xs">{formatCurrency(order.total)}</TableCell>
                            <TableCell className="p-6 text-center">{getStatusBadge(order.status)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-8">
                <Card className="rounded-[2.5rem] border-none shadow-xl shadow-black/5 bg-white p-8">
                  <h3 className="text-xl font-black uppercase tracking-tighter mb-6 flex items-center gap-3">
                    <TrendingUp className="text-primary" /> Atividade de Hoje
                  </h3>
                  <div className="space-y-6">
                    <ActivityItem 
                      title="Solicitação de Plano" 
                      subtitle={`${stats.pendingLeads} novos leads aguardando`} 
                      time="Tempo real" 
                      status="new" 
                    />
                    <ActivityItem 
                      title="Novos Pedidos" 
                      subtitle={`${orders?.length || 0} total acumulado`} 
                      time="Hoje" 
                      status="success" 
                    />
                  </div>
                </Card>

                <Card className="rounded-[2.5rem] border-none shadow-xl bg-primary p-10 text-white relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
                  <div className="relative z-10">
                    <h3 className="text-2xl font-black tracking-tighter mb-2 leading-none">META SEMANAL</h3>
                    <p className="text-white/60 font-bold uppercase text-[9px] tracking-widest mb-6">Estamos em 82% da meta</p>
                    <Progress value={82} className="h-3 bg-white/20 mb-6" />
                    <Button className="w-full h-14 rounded-2xl bg-white text-primary font-black uppercase text-xs hover:bg-white/90">
                      Analisar Tendências
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="orders" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="rounded-[2.5rem] border-none shadow-xl bg-white">
              <CardHeader className="p-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <CardTitle className="text-2xl font-black uppercase tracking-tighter">Gestão de Pedidos</CardTitle>
                    <CardDescription className="font-medium">Total de {filteredOrders.length} pedidos encontrados.</CardDescription>
                  </div>
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap">Filtrar por Cidade:</label>
                    <Select value={cityFilter} onValueChange={setCityFilter}>
                      <SelectTrigger className="w-full md:w-[220px] rounded-xl border-border/40 font-bold text-xs uppercase h-11">
                        <SelectValue placeholder="Todas as Cidades" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-border/40">
                        <SelectItem value="all" className="font-bold text-xs uppercase">Todas as Cidades</SelectItem>
                        {ALL_SERVICED_CITIES.map(city => (
                          <SelectItem key={city} value={city} className="font-bold text-xs uppercase">{city}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                <div className="rounded-3xl border border-border/40 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow className="border-none">
                        <TableHead className="w-[50px]"></TableHead>
                        <TableHead className="font-black text-[10px] uppercase p-6">ID</TableHead>
                        <TableHead className="font-black text-[10px] uppercase p-6">Cliente</TableHead>
                        <TableHead className="font-black text-[10px] uppercase p-6">Cidade</TableHead>
                        <TableHead className="font-black text-[10px] uppercase p-6 text-right">Valor</TableHead>
                        <TableHead className="font-black text-[10px] uppercase p-6 text-center">Status</TableHead>
                        <TableHead className="font-black text-[10px] uppercase p-6 text-center">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.length === 0 ? (
                        <TableRow><TableCell colSpan={7} className="p-10 text-center font-bold text-muted-foreground">Nenhum pedido encontrado para este filtro.</TableCell></TableRow>
                      ) : filteredOrders.map((order) => (
                        <React.Fragment key={order.id}>
                          <TableRow className="border-border/40 hover:bg-muted/10 cursor-pointer" onClick={() => toggleOrderExpansion(order.id)}>
                            <TableCell className="p-4 text-center">
                              <ChevronDown className={cn("text-muted-foreground transition-transform", expandedOrders.includes(order.id) && "rotate-180")} size={16} />
                            </TableCell>
                            <TableCell className="p-6 font-black text-xs">{order.id}</TableCell>
                            <TableCell className="p-6">
                              <div className="flex flex-col">
                                <span className="font-black text-xs">{order.customerName}</span>
                                <span className="text-[10px] text-muted-foreground font-bold">{order.userId}</span>
                              </div>
                            </TableCell>
                            <TableCell className="p-6">
                              <Badge variant="outline" className="rounded-lg border-primary/20 text-primary font-black text-[9px] uppercase tracking-widest px-3">
                                {order.address?.city || "S/ INF"}
                              </Badge>
                            </TableCell>
                            <TableCell className="p-6 text-right font-black text-xs text-primary">{formatCurrency(order.total)}</TableCell>
                            <TableCell className="p-6 text-center">{getStatusBadge(order.status)}</TableCell>
                            <TableCell className="p-6 text-center">
                              <div className="flex justify-center gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="h-8 w-8 p-0 rounded-lg hover:bg-primary hover:text-white"
                                  onClick={(e) => { e.stopPropagation(); handleUpdateStatus(order.id, 'completed'); }}
                                >
                                  <CheckCircle2 size={16} />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="h-8 w-8 p-0 rounded-lg hover:bg-red-500 hover:text-white"
                                  onClick={(e) => { e.stopPropagation(); handleUpdateStatus(order.id, 'cancelled'); }}
                                >
                                  <XCircle size={16} />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                          {expandedOrders.includes(order.id) && (
                            <TableRow className="bg-muted/20 border-none">
                              <TableCell colSpan={7} className="p-8">
                                <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                                  <h4 className="font-black text-[10px] uppercase tracking-widest text-primary">Itens do Pedido</h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {order.items.map((item, idx) => (
                                      <div key={idx} className="bg-white p-4 rounded-2xl flex items-center gap-4 shadow-sm">
                                        <div className="relative h-12 w-12 rounded-xl overflow-hidden shrink-0 border border-border/40">
                                          <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                                        </div>
                                        <div>
                                          <p className="font-black text-xs leading-none">{item.name}</p>
                                          <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase">{item.quantity} Unidades</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                  <div className="pt-4 flex flex-col md:flex-row gap-6">
                                    <div className="flex-1 space-y-1">
                                      <h4 className="font-black text-[10px] uppercase tracking-widest text-primary">Endereço de Entrega</h4>
                                      <p className="text-xs font-bold">{order.address?.street}, {order.address?.number}</p>
                                      <p className="text-[10px] text-muted-foreground font-medium uppercase">{order.address?.neighborhood} - {order.address?.city}</p>
                                    </div>
                                    <div className="flex-1 space-y-1">
                                      <h4 className="font-black text-[10px] uppercase tracking-widest text-primary">Pagamento</h4>
                                      <p className="text-xs font-bold uppercase">{order.paymentMethod.replace('_', ' ')}</p>
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

          <TabsContent value="leads" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="rounded-[2.5rem] border-none shadow-xl bg-white">
              <CardHeader className="p-8">
                <CardTitle className="text-2xl font-black uppercase tracking-tighter">Planos Alimentares para Orçamento</CardTitle>
                <CardDescription className="font-medium">Visualize os planos enviados e entre em contato com os clientes.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                <div className="rounded-3xl border border-border/40 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow className="border-none">
                        <TableHead className="font-black text-[10px] uppercase p-6">Data</TableHead>
                        <TableHead className="font-black text-[10px] uppercase p-6">Cliente</TableHead>
                        <TableHead className="font-black text-[10px] uppercase p-6">Detalhes do Plano</TableHead>
                        <TableHead className="font-black text-[10px] uppercase p-6 text-center">Foto</TableHead>
                        <TableHead className="font-black text-[10px] uppercase p-6 text-center">Status</TableHead>
                        <TableHead className="font-black text-[10px] uppercase p-6 text-center">Ação</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loadingLeads ? (
                        <TableRow><TableCell colSpan={6} className="p-10 text-center font-bold">Carregando leads...</TableCell></TableRow>
                      ) : leads?.length === 0 ? (
                        <TableRow><TableCell colSpan={6} className="p-10 text-center font-bold">Nenhum plano enviado ainda.</TableCell></TableRow>
                      ) : leads?.map((lead) => (
                        <TableRow key={lead.id} className="border-border/40 hover:bg-muted/10">
                          <TableCell className="p-6 text-[10px] font-bold text-muted-foreground">
                            {format(new Date(lead.createdAt), "dd/MM/yy HH:mm", { locale: ptBR })}
                          </TableCell>
                          <TableCell className="p-6">
                            <div className="flex flex-col">
                              <span className="font-black text-xs uppercase">{lead.customerName}</span>
                              <a 
                                href={`https://wa.me/55${lead.userId.replace(/\D/g, '')}`} 
                                target="_blank" 
                                className="text-[10px] text-primary font-black flex items-center gap-1 hover:underline"
                              >
                                <MessageSquare size={10} /> {lead.userId}
                              </a>
                            </div>
                          </TableCell>
                          <TableCell className="p-6 max-w-xs">
                            <p className="text-[10px] font-medium text-foreground line-clamp-2 italic">
                              {lead.textPlan || "Sem descrição textual fornecida."}
                            </p>
                          </TableCell>
                          <TableCell className="p-6 text-center">
                            {lead.photoDataUri ? (
                              <div className="relative h-10 w-10 mx-auto rounded-lg overflow-hidden border border-border group cursor-pointer" onClick={() => window.open(lead.photoDataUri, '_blank')}>
                                <Image src={lead.photoDataUri} alt="Plano" fill className="object-cover" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Eye className="text-white" size={14} />
                                </div>
                              </div>
                            ) : (
                              <span className="text-[9px] font-black text-muted-foreground uppercase">S/ FOTO</span>
                            )}
                          </TableCell>
                          <TableCell className="p-6 text-center">{getStatusBadge(lead.status)}</TableCell>
                          <TableCell className="p-6 text-center">
                            <Button 
                              size="sm" 
                              variant={lead.status === 'pending' ? "default" : "outline"}
                              className={cn("rounded-xl h-10 px-4 font-black uppercase text-[9px] tracking-widest", lead.status === 'pending' ? "bg-primary" : "opacity-50")}
                              onClick={() => handleUpdateLeadStatus(lead.id, lead.status === 'pending' ? 'responded' : 'pending')}
                            >
                              {lead.status === 'pending' ? 'Marcar como Lido' : 'Reabrir'}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="rounded-[2.5rem] border-none shadow-xl bg-white">
              <CardHeader className="p-8">
                <CardTitle className="text-2xl font-black uppercase tracking-tighter">Base de Clientes</CardTitle>
                <CardDescription className="font-medium">Visualize os usuários cadastrados no sistema.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {users?.map((user) => (
                    <div key={user.phone} className="p-6 rounded-3xl border border-border/40 bg-muted/10 group">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="bg-primary/10 p-3 rounded-2xl group-hover:bg-primary group-hover:text-white transition-colors">
                          <Users size={24} />
                        </div>
                        <div>
                          <h4 className="font-black text-sm uppercase">{user.name}</h4>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase">{user.phone}</p>
                        </div>
                      </div>
                      <div className="space-y-2 pt-4 border-t border-border/40">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase">
                          <MapPin size={12} /> {user.address?.city || 'Cidade não informada'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
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
    <Card className="rounded-[2.5rem] border-none shadow-xl shadow-black/5 bg-white p-8 group hover:-translate-y-1 transition-all duration-300">
      <div className="flex justify-between items-start mb-6">
        <div className={cn("p-4 rounded-[1.5rem] transition-transform group-hover:scale-110", colorMap[color])}>
          <Icon size={28} />
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{title}</p>
        <h3 className="text-3xl font-black text-foreground tracking-tighter">{value}</h3>
        <p className="text-[10px] font-bold text-primary mt-2">{trend}</p>
      </div>
    </Card>
  );
}

function ActivityItem({ title, subtitle, time, status }: { title: string, subtitle: string, time: string, status: string }) {
  const statusColors: Record<string, string> = {
    new: 'bg-primary',
    success: 'bg-green-500',
    route: 'bg-purple-500'
  };

  return (
    <div className="flex gap-4 group">
      <div className="relative">
        <div className={cn("w-3 h-3 rounded-full mt-1.5", statusColors[status])} />
        <div className="absolute top-6 bottom-0 left-[5px] w-[2px] bg-border/40 group-last:hidden" />
      </div>
      <div className="flex flex-col gap-1 pb-6">
        <h4 className="text-sm font-black uppercase tracking-tight leading-none">{title}</h4>
        <p className="text-[11px] font-medium text-muted-foreground">{subtitle}</p>
        <span className="text-[9px] font-bold text-muted-foreground/60 uppercase">{time}</span>
      </div>
    </div>
  );
}
