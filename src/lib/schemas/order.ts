import { z } from "zod";

export const AddressSchema = z.object({
  street: z.string().trim().min(1, "Rua é obrigatória"),
  number: z.string().trim().min(1, "Número é obrigatório"),
  neighborhood: z.string().trim().min(1, "Bairro é obrigatório"),
  city: z.string().trim().min(1, "Cidade é obrigatória"),
  complement: z.string().optional().default(""),
  reference: z.string().optional().default(""),
  lat: z.number().finite().optional(),
  lng: z.number().finite().optional(),
});

export type Address = z.infer<typeof AddressSchema>;

const OrderItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  price: z.number().nonnegative(),
  quantity: z.number().int().positive(),
  imageUrl: z.string().min(1),
});

export const OrderInsertSchema = z
  .object({
    id: z.string().min(1),
    userId: z.string().min(10, "Telefone inválido"),
    customerName: z.string().trim().min(2, "Nome muito curto"),
    items: z.array(OrderItemSchema).min(1, "Carrinho vazio"),
    subtotal: z.number().nonnegative(),
    deliveryFee: z.number().nonnegative(),
    total: z.number().nonnegative(),
    status: z.literal("pending"),
    paymentMethod: z.string().min(1, "Selecione forma de pagamento"),
    createdAt: z.string().min(1),
    address: AddressSchema,
  })
  .refine((o) => o.total <= o.subtotal + o.deliveryFee + 0.001, {
    message: "Total não pode exceder subtotal + frete",
    path: ["total"],
  });

export type OrderInsert = z.infer<typeof OrderInsertSchema>;

const PHOTO_MAX_BYTES = 5 * 1024 * 1024;

const photoDataUriSchema = z
  .string()
  .regex(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, "Formato de imagem inválido")
  .refine((s) => {
    const base64 = s.split(",", 2)[1] ?? "";
    const approxBytes = Math.floor((base64.length * 3) / 4);
    return approxBytes <= PHOTO_MAX_BYTES;
  }, "Imagem maior que 5MB")
  .nullable()
  .optional();

export const LeadInsertSchema = z
  .object({
    id: z.string().min(1),
    userId: z.string().min(10, "Telefone inválido"),
    customerName: z.string().trim().min(2, "Nome muito curto"),
    textPlan: z.string().max(2000, "Texto muito longo (máx 2000 caracteres)").optional().default(""),
    photoDataUri: photoDataUriSchema,
    status: z.literal("pending"),
    createdAt: z.string().min(1),
  })
  .refine((l) => (l.textPlan && l.textPlan.trim().length > 0) || !!l.photoDataUri, {
    message: "Envie uma foto ou descreva seu plano",
    path: ["textPlan"],
  });

export type LeadInsert = z.infer<typeof LeadInsertSchema>;
