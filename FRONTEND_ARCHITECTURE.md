# 📱 Arquitectura Frontend - ChickenCore

## 🎯 **Recomendación de Stack Tecnológico**

### **Stack Recomendado: React + Capacitor**

```bash
# Tecnologías principales
- React 18 + TypeScript
- Capacitor (Ionic) para apps móviles
- Tailwind CSS para styling
- Zustand para estado global
- React Hook Form para formularios
- React Query (TanStack Query) para API calls
- React Router para navegación
- Framer Motion para animaciones
```

### **¿Por qué esta combinación?**

1. **React + Capacitor**: 
   - Una sola base de código para web y móvil
   - Rendimiento nativo en móviles
   - Acceso a APIs nativas del dispositivo
   - Comunidad grande y estable

2. **Tailwind CSS**:
   - Desarrollo rápido y consistente
   - Optimización automática
   - Responsive design fácil
   - Componentes reutilizables

3. **Zustand**:
   - Más simple que Redux
   - TypeScript nativo
   - Menos boilerplate
   - Perfecto para apps medianas

---

## 🏗️ **Estructura del Proyecto**

```
frontend/
├── public/
│   ├── icons/
│   └── images/
├── src/
│   ├── components/           # Componentes reutilizables
│   │   ├── ui/              # Componentes base (Button, Input, etc.)
│   │   ├── forms/           # Formularios específicos
│   │   ├── layout/          # Layout components
│   │   └── features/        # Componentes por feature
│   ├── pages/               # Páginas de la aplicación
│   │   ├── auth/
│   │   ├── products/
│   │   ├── cart/
│   │   ├── orders/
│   │   └── admin/
│   ├── hooks/               # Custom hooks
│   ├── services/            # API calls y servicios
│   ├── store/               # Estado global (Zustand)
│   ├── types/               # TypeScript types
│   ├── utils/               # Utilidades y helpers
│   ├── constants/           # Constantes de la app
│   └── styles/              # Estilos globales
├── capacitor.config.ts      # Configuración Capacitor
├── tailwind.config.js       # Configuración Tailwind
└── package.json
```

---

## 🚀 **Configuración Inicial**

### **1. Crear el proyecto**

```bash
# Crear proyecto React con TypeScript
npx create-react-app chickencore-frontend --template typescript
cd chickencore-frontend

# Instalar dependencias principales
npm install @capacitor/core @capacitor/cli
npm install @tanstack/react-query
npm install zustand
npm install react-hook-form
npm install react-router-dom
npm install framer-motion
npm install tailwindcss postcss autoprefixer
npm install @headlessui/react @heroicons/react
npm install axios
npm install date-fns
npm install react-hot-toast

# Instalar tipos de TypeScript
npm install -D @types/node

# Inicializar Tailwind
npx tailwindcss init -p

# Inicializar Capacitor
npx cap init chickencore-frontend com.chickencore.app ChickenCore
```

### **2. Configurar Tailwind CSS**

```javascript
// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff7ed',
          100: '#ffedd5',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
        },
        secondary: {
          50: '#f0f9ff',
          500: '#0ea5e9',
          600: '#0284c7',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
```

### **3. Configurar Capacitor**

```typescript
// capacitor.config.ts
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.chickencore.app',
  appName: 'ChickenCore',
  webDir: 'build',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#f97316",
      showSpinner: false,
    },
  },
};

export default config;
```

---

## 🔧 **Configuración de Servicios**

### **1. Configuración de API**

```typescript
// src/services/api.ts
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autenticación
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### **2. Servicios específicos**

```typescript
// src/services/auth.service.ts
import { api } from './api';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

export const authService = {
  login: async (data: LoginData) => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterData) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  logout: async () => {
    await api.post('/auth/logout');
    localStorage.removeItem('token');
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
};
```

```typescript
// src/services/products.service.ts
import { api } from './api';

export const productsService = {
  getProducts: async (params?: {
    categoryId?: number;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get('/products', { params });
    return response.data;
  },

  getProduct: async (id: number) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  getCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },

  getAvailableGifts: async () => {
    const response = await api.get('/products/gifts');
    return response.data;
  },
};
```

```typescript
// src/services/cart.service.ts
import { api } from './api';

export interface AddToCartData {
  productId: number;
  quantity: number;
  selectedGifts?: {
    giftId: number;
    quantity: number;
  }[];
}

export const cartService = {
  getCart: async () => {
    const response = await api.get('/cart');
    return response.data;
  },

  addToCart: async (data: AddToCartData) => {
    const response = await api.post('/cart/add', data);
    return response.data;
  },

  updateCartItem: async (itemId: number, quantity: number) => {
    const response = await api.patch(`/cart/items/${itemId}`, { quantity });
    return response.data;
  },

  removeFromCart: async (itemId: number) => {
    const response = await api.delete(`/cart/items/${itemId}`);
    return response.data;
  },

  clearCart: async () => {
    const response = await api.delete('/cart/clear');
    return response.data;
  },

  getCartSummary: async () => {
    const response = await api.get('/cart/summary');
    return response.data;
  },
};
```

---

## 🗃️ **Estado Global con Zustand**

### **1. Store de autenticación**

```typescript
// src/store/auth.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => {
        localStorage.setItem('token', token);
        set({ user, token, isAuthenticated: true });
      },
      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
      },
      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),
    }),
    {
      name: 'auth-storage',
    }
  )
);
```

### **2. Store del carrito**

```typescript
// src/store/cart.store.ts
import { create } from 'zustand';

interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    presentation: string;
    price: number;
    imageUrl?: string;
  };
  selectedGifts: {
    id: number;
    giftId: number;
    quantity: number;
    gift: {
      id: number;
      name: string;
      presentation: string;
    };
  }[];
}

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
  isLoading: boolean;
  setCart: (items: CartItem[], total: number, itemCount: number) => void;
  addItem: (item: CartItem) => void;
  updateItem: (itemId: number, quantity: number) => void;
  removeItem: (itemId: number) => void;
  clearCart: () => void;
  setLoading: (loading: boolean) => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  total: 0,
  itemCount: 0,
  isLoading: false,
  setCart: (items, total, itemCount) => set({ items, total, itemCount }),
  addItem: (item) =>
    set((state) => ({
      items: [...state.items, item],
      itemCount: state.itemCount + item.quantity,
    })),
  updateItem: (itemId, quantity) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      ),
    })),
  removeItem: (itemId) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== itemId),
    })),
  clearCart: () => set({ items: [], total: 0, itemCount: 0 }),
  setLoading: (isLoading) => set({ isLoading }),
}));
```

---

## 🎨 **Componentes Base**

### **1. Componente Button**

```typescript
// src/components/ui/Button.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'font-medium rounded-lg transition-all duration-200 flex items-center justify-center';
  
  const variants = {
    primary: 'bg-primary-500 hover:bg-primary-600 text-white shadow-lg hover:shadow-xl',
    secondary: 'bg-secondary-500 hover:bg-secondary-600 text-white shadow-lg hover:shadow-xl',
    outline: 'border-2 border-primary-500 text-primary-500 hover:bg-primary-50',
    ghost: 'text-primary-500 hover:bg-primary-50',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className} ${
        (disabled || isLoading) ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
      ) : null}
      {children}
    </motion.button>
  );
};
```

### **2. Componente Input**

```typescript
// src/components/ui/Input.tsx
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        <input
          className={`
            w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
            ${icon ? 'pl-10' : ''}
            ${error ? 'border-red-500' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};
```

---

## 📱 **Páginas Principales**

### **1. Página de Productos**

```typescript
// src/pages/products/ProductsPage.tsx
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { productsService } from '../../services/products.service';
import { ProductCard } from '../../components/features/ProductCard';
import { CategoryFilter } from '../../components/features/CategoryFilter';
import { SearchBar } from '../../components/ui/SearchBar';

export const ProductsPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: products, isLoading } = useQuery({
    queryKey: ['products', selectedCategory, searchTerm],
    queryFn: () => productsService.getProducts({
      categoryId: selectedCategory,
      search: searchTerm,
    }),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: productsService.getCategories,
  });

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Cargando...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Productos</h1>
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Buscar productos..."
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <aside className="lg:w-64">
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </aside>

        <main className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products?.products?.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};
```

### **2. Página del Carrito**

```typescript
// src/pages/cart/CartPage.tsx
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartService } from '../../services/cart.service';
import { CartItem } from '../../components/features/CartItem';
import { CartSummary } from '../../components/features/CartSummary';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: cart, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: cartService.getCart,
  });

  const clearCartMutation = useMutation({
    mutationFn: cartService.clearCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Carrito vaciado');
    },
  });

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Cargando...</div>;
  }

  if (!cart?.items?.length) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Tu carrito está vacío</h1>
          <Button onClick={() => navigate('/products')}>
            Explorar productos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mi Carrito</h1>
        <Button
          variant="ghost"
          onClick={() => clearCartMutation.mutate()}
          isLoading={clearCartMutation.isPending}
        >
          Vaciar carrito
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {cart.items.map((item: any) => (
              <CartItem key={item.id} item={item} />
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          <CartSummary
            cart={cart}
            onCheckout={handleCheckout}
          />
        </div>
      </div>
    </div>
  );
};
```

---

## 📦 **Hooks Personalizados**

### **1. Hook para el carrito**

```typescript
// src/hooks/useCart.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartService, AddToCartData } from '../services/cart.service';
import { useCartStore } from '../store/cart.store';
import toast from 'react-hot-toast';

export const useCart = () => {
  const queryClient = useQueryClient();
  const { setCart, setLoading } = useCartStore();

  const { data: cart, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: cartService.getCart,
    onSuccess: (data) => {
      setCart(data.items || [], data.total || 0, data.itemCount || 0);
    },
  });

  const addToCartMutation = useMutation({
    mutationFn: (data: AddToCartData) => cartService.addToCart(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Producto agregado al carrito');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al agregar al carrito');
    },
  });

  const updateCartItemMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: number; quantity: number }) =>
      cartService.updateCartItem(itemId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const removeFromCartMutation = useMutation({
    mutationFn: (itemId: number) => cartService.removeFromCart(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Producto eliminado del carrito');
    },
  });

  return {
    cart,
    isLoading,
    addToCart: addToCartMutation.mutate,
    updateCartItem: updateCartItemMutation.mutate,
    removeFromCart: removeFromCartMutation.mutate,
    isAddingToCart: addToCartMutation.isPending,
  };
};
```

---

## 🔧 **Configuración para Móvil**

### **1. Agregar plataformas móviles**

```bash
# Agregar plataformas
npx cap add android
npx cap add ios

# Sincronizar archivos
npx cap sync

# Abrir en Android Studio
npx cap open android

# Abrir en Xcode
npx cap open ios
```

### **2. Configurar plugins nativos**

```bash
# Instalar plugins útiles
npm install @capacitor/camera
npm install @capacitor/geolocation
npm install @capacitor/push-notifications
npm install @capacitor/local-notifications
```

### **3. Configurar PWA**

```typescript
// src/utils/pwa.ts
export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
};
```

---

## 🚀 **Scripts de Desarrollo**

### **1. Actualizar package.json**

```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject",
    "build:mobile": "npm run build && npx cap sync",
    "android": "npm run build:mobile && npx cap open android",
    "ios": "npm run build:mobile && npx cap open ios",
    "dev:android": "npx cap run android",
    "dev:ios": "npx cap run ios"
  }
}
```

---

## 📝 **Próximos Pasos**

### **1. Implementar funcionalidades avanzadas**
- [ ] Notificaciones push
- [ ] Geolocalización para delivery
- [ ] Cámara para escanear códigos
- [ ] Pagos integrados

### **2. Optimizaciones**
- [ ] Lazy loading de componentes
- [ ] Caching inteligente
- [ ] Optimización de imágenes
- [ ] Bundle splitting

### **3. Testing**
- [ ] Unit tests con Jest
- [ ] Integration tests
- [ ] E2E tests con Cypress

---

## 🎯 **Conclusión**

Esta arquitectura te proporciona:

✅ **Una base sólida y escalable**
✅ **Código reutilizable para web y móvil**
✅ **Experiencia de usuario moderna**
✅ **Fácil mantenimiento y desarrollo**
✅ **Performance optimizada**

¿Quieres que implemente alguna parte específica o necesitas más detalles sobre algún componente?