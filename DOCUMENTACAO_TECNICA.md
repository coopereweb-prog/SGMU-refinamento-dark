# Documentação Técnica - Sistema de Gerenciamento de Pontos de Microcefalia

## 1. Visão Geral do Sistema

### 1.1 Arquitetura de Alto Nível

```mermaid
graph TB
    subgraph "Frontend"
        A["React + Vite"] --> B["Next.js 14"]
    end
    
    subgraph "Backend Services"
        C["Supabase Auth"] --> D["Supabase Database"]
        E["Supabase Functions"] --> D
        F["Google Maps API"] --> A
        F --> B
    end
    
    subgraph "Infrastructure"
        G["Vercel"] --> B
        H["GitHub Actions"] --> A
        H --> B
    end
    
    A --> C
    A --> D
    A --> E
    B --> C
    B --> D
    B --> E
```

### 1.2 Descrição do Sistema

O SGMU (Sistema de Gerenciamento de Pontos de Microcefalia) é uma aplicação web completa para gerenciamento de pontos de internet wireless, com funcionalidades de:

- **Mapa Interativo**: Visualização de pontos no mapa com filtros por status, tags e preços
- **Carrinho de Compras**: Reserva de pontos com diferentes períodos (1, 4 ou 5 anos)
- **Gestão de Pedidos**: Administração completa do ciclo de vida dos pedidos
- **Pipeline de Instalação**: Gerenciamento de tarefas para técnicos de campo
- **Sistema Multi-tenant**: Suporte para clientes, técnicos e administradores
- **Autenticação Baseada em Roles**: Controle de acesso granular por tipo de usuário

### 1.3 Estrutura de Diretórios

```
SGMU-refinamento-dark/
├── src/                          # React + Vite Frontend
│   ├── components/               # Componentes React
│   │   ├── ui/                  # Componentes de UI (shadcn-like)
│   │   ├── ProtectedRoute.jsx   # Proteção de rotas
│   │   └── GlobalCart.jsx       # Carrinho global
│   ├── contexts/               # Context API
│   │   ├── AuthContext.jsx      # Autenticação
│   │   ├── UserContext.jsx      # Dados do usuário
│   │   ├── CartContext.jsx      # Estado do carrinho
│   │   └── MapConfigContext.jsx # Configurações do mapa
│   ├── pages/                  # Páginas React
│   ├── lib/                    # Utilitários
│   │   └── supabase.js         # Helpers Supabase
│   └── App.jsx                 # Roteamento principal
│
├── sgmu-next/                  # Next.js 14 Frontend
│   ├── src/app/                # App Router
│   │   ├── admin/             # Área administrativa
│   │   ├── api/               # API Routes
│   │   └── login/             # Página de login
│   ├── src/components/        # Componentes Next.js
│   │   ├── admin/             # Componentes admin
│   │   └── ui/               # Componentes de UI
│   ├── src/contexts/          # Context API equivalente
│   ├── src/lib/              # Utilitários
│   │   ├── supabase.js       # Helpers Supabase (espelhado)
│   │   └── middleware.ts     # Proteção de rotas
│   └── vercel.json           # Configuração de deploy
│
├── .github/workflows/         # CI/CD
│   └── deploy.yml             # Pipeline de deploy
│
└── supabase/                  # Configurações Supabase
    └── migrations/            # Migrações de banco
```

## 2. Tecnologias Utilizadas

### 2.1 Stack Principal

| Tecnologia | Versão | Propósito |
|------------|---------|-----------|
| React | 18.2.0 | Frontend Framework |
| Next.js | 14.0.0 | Frontend Framework (espelho) |
| TypeScript | 5.0.0 | Tipagem estática |
| Vite | 4.4.0 | Build tool (React) |
| Tailwind CSS | 3.3.0 | Estilização |
| Supabase | Latest | Backend (Auth, DB, Functions) |
| Google Maps API | v3 | Mapas interativos |

### 2.2 Bibliotecas Principais

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.38.0",
    "react-router-dom": "^6.15.0",
    "@react-google-maps/api": "^2.19.0",
    "lucide-react": "^0.279.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^1.14.0"
  }
}
```

### 2.3 Infraestrutura

- **Hospedagem**: Vercel (Next.js) e serviço estático (React)
- **Banco de Dados**: PostgreSQL (Supabase)
- **Autenticação**: Supabase Auth
- **CI/CD**: GitHub Actions
- **CDN**: Vercel Edge Network

## 3. Detalhes de Implementação

### 3.1 Diagrama de Banco de Dados

```mermaid
erDiagram
    profiles {
        uuid id PK
        text role
        text name
        text email
        timestamp created_at
    }
    
    points {
        uuid id PK
        text name
        decimal latitude
        decimal longitude
        decimal price_1y
        decimal price_4y
        decimal price_5y
        uuid pricing_tier_id FK
        text status
        timestamp created_at
    }
    
    tags {
        uuid id PK
        text name
        text color
        timestamp created_at
    }
    
    point_tags {
        uuid point_id FK
        uuid tag_id FK
    }
    
    pricing_tiers {
        uuid id PK
        text name
        json config
        timestamp created_at
    }
    
    orders {
        uuid id PK
        uuid user_id FK
        text status
        text kit_type
        decimal total_price
        timestamp created_at
    }
    
    order_items {
        uuid id PK
        uuid order_id FK
        uuid point_id FK
        text point_name
        integer period_years
        decimal price
    }
    
    installation_tasks {
        uuid id PK
        uuid order_item_id FK
        uuid point_id FK
        uuid technician_id FK
        text status
        text notes
        timestamp created_at
    }
    
    profiles ||--o{ orders : "creates"
    points ||--o{ point_tags : "has"
    tags ||--o{ point_tags : "categorized_by"
    points ||--o{ order_items : "reserved_in"
    orders ||--o{ order_items : "contains"
    order_items ||--o{ installation_tasks : "generates"
    points ||--o{ installation_tasks : "installed"
    profiles ||--o{ installation_tasks : "assigned_to"
    pricing_tiers ||--o{ points : "applies_to"
```

### 3.2 Fluxo de Autenticação

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Middleware
    participant Supabase
    participant Database
    
    User->>Frontend: Login attempt
    Frontend->>Supabase: signInWithPassword
    Supabase->>Database: Validate credentials
    Database-->>Supabase: User data
    Supabase-->>Frontend: Session + JWT
    Frontend->>Frontend: Store in cookie
    Frontend->>Middleware: Request protected route
    Middleware->>Middleware: Parse JWT from cookie
    Middleware->>Database: Fetch user profile
    Database-->>Middleware: Profile with role
    Middleware->>Middleware: Check role permissions
    alt Has permission
        Middleware->>Frontend: Allow access
    else No permission
        Middleware->>Frontend: Redirect to login
    end
```

### 3.3 Sistema de Carrinho e Reserva

#### Contexto do Carrinho (CartContext)

```typescript
// src/contexts/CartContext.jsx
interface CartItem {
  id: string;
  point: Point;
  period: 1 | 4 | 5;
  price: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (point: Point, period: number) => void;
  removeItem: (id: string) => void;
  updatePeriod: (id: string, period: number) => void;
  clearCart: () => void;
  totalPrice: number;
}
```

#### Fluxo de Reserva

1. **Adicionar ao Carrinho**: Usuário seleciona ponto e período
2. **Persistência**: Dados salvos em localStorage
3. **Checkout**: Redirecionamento para login se não autenticado
4. **Criação de Pedido**: Chamada à função edge `create-order`
5. **Liberação de Pontos**: Atualização de status para 'reserved'

### 3.4 Sistema de Paginação para Grandes Datasets

#### Problema: Limite de 1000 Registros

```javascript
// sgmu-next/src/lib/supabase.js
export const getPoints = async () => {
  let allPoints = [];
  let offset = 0;
  const limit = 1000;
  
  while (true) {
    const { data: points, error } = await supabase
      .from('points')
      .select('*')
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);
      
    if (error) throw error;
    if (points.length === 0) break;
    
    allPoints = [...allPoints, ...points];
    offset += limit;
  }
  
  // Carregar relações de tags
  const { data: pointTags } = await supabase
    .from('point_tags')
    .select('*')
    .in('point_id', allPoints.map(p => p.id));
    
  // Mapear tags aos pontos
  return allPoints.map(point => ({
    ...point,
    tags: pointTags.filter(pt => pt.point_id === point.id)
  }));
};
```

### 3.5 Middleware de Autorização (Next.js)

```typescript
// sgmu-next/src/middleware.ts
export async function middleware(request: NextRequest) {
  const authToken = request.cookies.get('sb-kugysamxzumqgxinazds-auth-token')?.value;
  
  if (!authToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  try {
    const { user } = JSON.parse(authToken);
    const userRole = user.user_metadata.role;
    
    // Verificar permissões por rota
    const pathname = request.nextUrl.pathname;
    
    if (pathname.startsWith('/admin')) {
      if (userRole !== 'admin') {
        return NextResponse.redirect(new URL('/login', request.url));
      }
    } else if (pathname.startsWith('/technician')) {
      if (!['admin', 'technician'].includes(userRole)) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
    }
    
    return NextResponse.next();
  } catch (error) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/technician/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico|login).*)',
  ],
};
```

### 3.6 Componentes de UI Reutilizáveis

#### Exemplo: Card de Ponto no Mapa

```tsx
// sgmu-next/src/components/PointCard.tsx
interface PointCardProps {
  point: Point;
  onAddToCart: (point: Point) => void;
  isInCart: boolean;
}

export function PointCard({ point, onAddToCart, isInCart }: PointCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-gray-900">{point.name}</h3>
        <Badge variant={point.status === 'available' ? 'success' : 'secondary'}>
          {point.status}
        </Badge>
      </div>
      
      <div className="space-y-1 text-sm text-gray-600 mb-3">
        <p>1 ano: R$ {point.price_1y}</p>
        <p>4 anos: R$ {point.price_4y}</p>
        <p>5 anos: R$ {point.price_5y}</p>
      </div>
      
      <div className="flex flex-wrap gap-1 mb-3">
        {point.tags?.map((tag) => (
          <Badge key={tag.id} style={{ backgroundColor: tag.color }}>
            {tag.name}
          </Badge>
        ))}
      </div>
      
      <Button
        onClick={() => onAddToCart(point)}
        disabled={isInCart || point.status !== 'available'}
        className="w-full"
      >
        {isInCart ? 'No carrinho' : 'Adicionar ao carrinho'}
      </Button>
    </div>
  );
}
```

## 4. Requisitos de Ambiente

### 4.1 Variáveis de Ambiente (React)

```bash
# .env
VITE_SUPABASE_URL=https://kugysamxzumqgxinazds.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_GOOGLE_MAPS_API_KEY=AIzaSyCLz8ynTjFTfHicjp6jT0-pK5PF0KvQj1s
VITE_WHATSAPP_NUMBER=5519996850973
```

### 4.2 Variáveis de Ambiente (Next.js)

```bash
# sgmu-next/.env.local
NEXT_PUBLIC_SUPABASE_URL=https://kugysamxzumqgxinazds.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyCLz8ynTjFTfHicjp6jT0-pK5PF0KvQj1s
NEXT_PUBLIC_WHATSAPP_NUMBER=5519996850973
NODE_ENV=production
```

### 4.3 Requisitos de Sistema

- **Node.js**: >= 18.0.0
- **npm** ou **pnpm**: >= 8.0.0
- **Git**: >= 2.30.0

### 4.4 Permissões Supabase (RLS)

```sql
-- Permissões básicas para tabelas
GRANT SELECT ON points TO anon;
GRANT SELECT ON points TO authenticated;
GRANT ALL ON points TO authenticated;

GRANT SELECT ON tags TO anon;
GRANT SELECT ON tags TO authenticated;

GRANT SELECT ON pricing_tiers TO anon;
GRANT SELECT ON pricing_tiers TO authenticated;

-- Permissões para pedidos (apenas donos ou admin)
GRANT SELECT ON orders TO authenticated;
GRANT INSERT ON orders TO authenticated;
GRANT UPDATE ON orders TO authenticated;

-- Permissões para tarefas de instalação
GRANT SELECT ON installation_tasks TO authenticated;
GRANT UPDATE ON installation_tasks TO authenticated;
```

## 5. Guia de Desenvolvimento

### 5.1 Configuração Inicial

```bash
# Clone do repositório
git clone <repository-url>

# Instalação de dependências (React)
npm install
# ou
pnpm install

# Instalação de dependências (Next.js)
cd sgmu-next
npm install
# ou
pnpm install
```

### 5.2 Desenvolvimento Local

```bash
# React (Terminal 1)
npm run dev
# Aplicação disponível em: http://localhost:5173

# Next.js (Terminal 2)
cd sgmu-next
npm run dev
# Aplicação disponível em: http://localhost:3000
```

### 5.3 Estrutura de Branches

```
main
├── develop
├── feature/admin-dashboard
├── feature/installation-pipeline
├── bugfix/pagination-limit
└── hotfix/auth-middleware
```

### 5.4 Padrões de Código

#### Nomenclatura
- **Componentes**: PascalCase (`PointCard.tsx`)
- **Funções**: camelCase (`getPoints()`)
- **Constantes**: UPPER_SNAKE_CASE (`API_ENDPOINTS`)
- **Arquivos**: kebab-case para utilitários (`date-utils.ts`)

#### Estrutura de Componentes

```tsx
// Exemplo de componente bem estruturado
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

interface ComponentProps {
  title: string;
  data: DataType[];
  onAction: (id: string) => void;
}

export function MyComponent({ title, data, onAction }: ComponentProps) {
  const [localState, setLocalState] = useState<string>('');
  
  useEffect(() => {
    // Lógica de efeito
  }, [data]);
  
  return (
    <Card>
      <CardHeader>
        <h2>{title}</h2>
      </CardHeader>
      <CardContent>
        {/* Conteúdo */}
      </CardContent>
    </Card>
  );
}
```

### 5.5 Testes

```bash
# Executar testes (React)
npm run test

# Executar testes (Next.js)
cd sgmu-next
npm run test

# Testes de tipo (TypeScript)
npm run typecheck
```

## 6. Operações e Monitoramento

### 6.1 Deploy para Produção

#### React (Vite)

```bash
# Build de produção
npm run build

# Preview do build
npm run preview

# Deploy (configurado via GitHub Actions)
git push origin main
```

#### Next.js (Vercel)

```bash
# Build de produção
cd sgmu-next
npm run build

# Deploy automático via Vercel
git push origin main
```

### 6.2 Monitoramento e Logs

#### Logs de Aplicação

```bash
# Ver logs no Vercel Dashboard
# URL: https://vercel.com/dashboard

# Logs locais (Next.js)
npm run dev 2>&1 | tee logs/nextjs.log

# Logs locais (React)
npm run dev 2>&1 | tee logs/react.log
```

#### Métricas de Performance

- **Web Vitals**: Monitoramento automático via Next.js
- **Supabase Metrics**: Dashboard do Supabase
- **Google Maps API**: Console de APIs do Google

### 6.3 Manutenção e Backup

#### Backup do Banco de Dados

```bash
# Backup via Supabase CLI
supabase db dump --schema public > backup_$(date +%Y%m%d).sql

# Restore
supabase db restore backup_20240101.sql
```

#### Manutenção de Rotina

1. **Verificar logs de erro** semanalmente
2. **Atualizar dependências** mensalmente
3. **Revisar permissões** trimestralmente
4. **Backup completo** mensalmente

### 6.4 Troubleshooting Comum

#### Problema: "Permission denied for table"

**Solução**: Verificar e atualizar permissões RLS

```sql
-- Verificar permissões atuais
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND grantee IN ('anon', 'authenticated');

-- Conceder permissões necessárias
GRANT SELECT ON table_name TO anon;
GRANT ALL ON table_name TO authenticated;
```

#### Problema: Limite de 1000 registros

**Solução**: Implementar paginação como mostrado na seção 3.4

#### Problema: Middleware não redirecionando corretamente

**Solução**: Verificar configuração do matcher

```typescript
// Verificar se as rotas estão corretas
export const config = {
  matcher: [
    '/admin/:path*',
    '/technician/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico|login).*)',
  ],
};
```

### 6.5 Contatos e Suporte

- **Desenvolvimento**: [Equipe de Desenvolvimento]
- **Infraestrutura**: [Equipe de DevOps]
- **Supabase**: support@supabase.io
- **Vercel**: support@vercel.com

---

## Apêndices

### A. Links Úteis

- [Documentação Supabase](https://supabase.com/docs)
- [Documentação Next.js](https://nextjs.org/docs)
- [Documentação React](https://react.dev/)
- [Google Maps API](https://developers.google.com/maps)

### B. Glossário

- **RLS**: Row Level Security - Segurança em nível de linha
- **RBAC**: Role-Based Access Control - Controle de acesso baseado em roles
- **CSR**: Client-Side Rendering - Renderização no lado do cliente
- **SSR**: Server-Side Rendering - Renderização no lado do servidor
- **ISR**: Incremental Static Regeneration - Regeneração estática incremental

### C. Histórico de Versões

| Versão | Data | Descrição |
|--------|------|-----------|
| 1.0.0 | 2024-01-01 | Versão inicial com React + Vite |
| 1.1.0 | 2024-01-15 | Adicionado Next.js como espelho |
| 1.2.0 | 2024-02-01 | Sistema de paginação implementado |
| 1.3.0 | 2024-02-15 | Pipeline de instalação completo |
| 1.4.0 | 2024-03-01 | Documentação técnica completa |