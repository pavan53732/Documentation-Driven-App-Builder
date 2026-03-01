import { DetectedFramework, CompatibilityIssue, FrameworkCategory } from '../types';

interface FrameworkConfig {
  name: string;
  category: FrameworkCategory;
  patterns: RegExp[];
}

const EXTENDED_FRAMEWORKS: Record<string, FrameworkConfig> = {
  // Frontend
  nextjs: {
    name: 'Next.js',
    category: 'frontend',
    patterns: [/next\.js/gi, /app\s+router/gi, /pages\s+router/gi, /getServerSideProps/g, /getStaticProps/g, /'use\s+client'/g, /'use\s+server'/g, /next\/image/g, /next\/link/g]
  },
  react: {
    name: 'React',
    category: 'frontend',
    patterns: [/react/gi, /useState/g, /useEffect/g, /useContext/g, /jsx/gi, /tsx/gi, /createRoot/g]
  },
  vue: {
    name: 'Vue.js',
    category: 'frontend',
    patterns: [/vue\.js/gi, /v-if/g, /v-for/g, /v-model/g, /\.vue/g, /defineComponent/g]
  },
  angular: {
    name: 'Angular',
    category: 'frontend',
    patterns: [/angular/gi, /@Component/g, /@NgModule/g, /@Injectable/g, /rxjs/gi]
  },
  remix: {
    name: 'Remix',
    category: 'frontend',
    patterns: [/remix/gi, /@remix-run/g, /loader\s*:/g, /action\s*:/g, /useLoaderData/g]
  },
  astro: {
    name: 'Astro',
    category: 'frontend',
    patterns: [/astro/gi, /\.astro/g, /Astro\.props/g, /client:load/g]
  },
  svelte: {
    name: 'Svelte',
    category: 'frontend',
    patterns: [/svelte/gi, /\.svelte/g, /bind:value/g, /on:click/g, /export\s+let/g]
  },
  solid: {
    name: 'SolidJS',
    category: 'frontend',
    patterns: [/solidjs/gi, /createSignal/g, /createEffect/g, /Show\s+when/g, /For\s+each/g]
  },
  qwik: {
    name: 'Qwik',
    category: 'frontend',
    patterns: [/qwik/gi, /component\$/g, /useSignal/g, /useStore/g, /useTask\$/g]
  },
  
  // State Management
  redux: {
    name: 'Redux',
    category: 'state',
    patterns: [/redux/gi, /@reduxjs\/toolkit/g, /useSelector/g, /useDispatch/g, /createSlice/g]
  },
  zustand: {
    name: 'Zustand',
    category: 'state',
    patterns: [/zustand/gi, /create\s*\(\s*set/g]
  },
  jotai: {
    name: 'Jotai',
    category: 'state',
    patterns: [/jotai/gi, /atom\(/g, /useAtom/g]
  },
  recoil: {
    name: 'Recoil',
    category: 'state',
    patterns: [/recoil/gi, /atom\(/g, /selector\(/g, /useRecoilState/g]
  },
  mobx: {
    name: 'MobX',
    category: 'state',
    patterns: [/mobx/gi, /makeObservable/g, /makeAutoObservable/g, /observer\(/g]
  },
  xstate: {
    name: 'XState',
    category: 'state',
    patterns: [/xstate/gi, /createMachine/g, /useMachine/g, /assign\(/g]
  },

  // Data Fetching
  reactquery: {
    name: 'React Query',
    category: 'data-fetching',
    patterns: [/react-query/gi, /@tanstack\/react-query/g, /useQuery/g, /useMutation/g]
  },
  swr: {
    name: 'SWR',
    category: 'data-fetching',
    patterns: [/swr/gi, /useSWR/g]
  },
  apollo: {
    name: 'Apollo GraphQL',
    category: 'data-fetching',
    patterns: [/apollo/gi, /@apollo\/client/g, /useQuery/g, /useMutation/g, /gql`/g]
  },
  urql: {
    name: 'urql',
    category: 'data-fetching',
    patterns: [/urql/gi, /useQuery/g, /useMutation/g, /Provider\s+value=\{client\}/g]
  },
  trpc: {
    name: 'tRPC',
    category: 'data-fetching',
    patterns: [/trpc/gi, /@trpc\/client/g, /@trpc\/server/g, /createTRPCReact/g]
  },
  
  // Database & ORM
  prisma: {
    name: 'Prisma',
    category: 'database',
    patterns: [/prisma/gi, /@prisma\/client/g, /schema\.prisma/g, /@@index/g]
  },
  drizzle: {
    name: 'Drizzle ORM',
    category: 'database',
    patterns: [/drizzle/gi, /drizzle-orm/g, /drizzle-kit/g]
  },
  supabase: {
    name: 'Supabase',
    category: 'database',
    patterns: [/supabase/gi, /@supabase\/supabase-js/g]
  },
  mongodb: {
    name: 'MongoDB',
    category: 'database',
    patterns: [/mongodb/gi, /mongoose/gi, /ObjectId/g]
  },
  postgres: {
    name: 'PostgreSQL',
    category: 'database',
    patterns: [/postgres/gi, /pg/gi, /postgresql/gi]
  },
  mysql: {
    name: 'MySQL',
    category: 'database',
    patterns: [/mysql/gi, /mysql2/gi]
  },
  firebase: {
    name: 'Firebase',
    category: 'database',
    patterns: [/firebase/gi, /firestore/gi, /realtime\s+database/gi]
  },
  
  // Auth
  nextauth: {
    name: 'NextAuth.js',
    category: 'auth',
    patterns: [/next-auth/gi, /NextAuth/g, /useSession/g, /getServerSession/g]
  },
  clerk: {
    name: 'Clerk',
    category: 'auth',
    patterns: [/clerk/gi, /@clerk\/nextjs/g, /<SignedIn>/g, /<SignedOut>/g]
  },
  auth0: {
    name: 'Auth0',
    category: 'auth',
    patterns: [/auth0/gi, /@auth0\/auth0-react/g, /useAuth0/g]
  },
  lucia: {
    name: 'Lucia',
    category: 'auth',
    patterns: [/lucia/gi, /lucia-auth/g, /validateSession/g]
  },
  
  // UI Libs
  tailwind: {
    name: 'Tailwind CSS',
    category: 'ui-lib',
    patterns: [/tailwind/gi, /className="[^"]*flex[^"]*"/g, /className="[^"]*text-[a-z]+-\d+[^"]*"/g]
  },
  mui: {
    name: 'Material UI',
    category: 'ui-lib',
    patterns: [/material-ui/gi, /@mui\/material/g, /<ThemeProvider theme=/g]
  },
  chakra: {
    name: 'Chakra UI',
    category: 'ui-lib',
    patterns: [/chakra-ui/gi, /<Box/g, /<Flex/g, /useColorMode/g]
  },
  radix: {
    name: 'Radix UI',
    category: 'ui-lib',
    patterns: [/radix-ui/gi, /@radix-ui\/react-/g]
  },
  shadcn: {
    name: 'shadcn/ui',
    category: 'ui-lib',
    patterns: [/shadcn/gi, /components\/ui/g, /cn\(/g]
  },
  framer: {
    name: 'Framer Motion',
    category: 'animation',
    patterns: [/framer-motion/gi, /<motion\./g, /useAnimation/g, /AnimatePresence/g]
  },
  gsap: {
    name: 'GSAP',
    category: 'animation',
    patterns: [/gsap/gi, /gsap\.to/g, /gsap\.from/g, /ScrollTrigger/g]
  },

  // Backend
  express: {
    name: 'Express',
    category: 'backend',
    patterns: [/express/gi, /app\.get\(/g, /app\.use\(/g, /req,\s*res/g]
  },
  nestjs: {
    name: 'NestJS',
    category: 'backend',
    patterns: [/nestjs/gi, /@Controller/g, /@Injectable/g, /@Module/g]
  },
  fastify: {
    name: 'Fastify',
    category: 'backend',
    patterns: [/fastify/gi, /fastify\.get/g, /fastify\.register/g]
  },
  hono: {
    name: 'Hono',
    category: 'backend',
    patterns: [/hono/gi, /new\s+Hono/g, /c\.json/g, /c\.text/g]
  },
  django: {
    name: 'Django',
    category: 'backend',
    patterns: [/django/gi, /models\.Model/g, /views\.py/g, /urls\.py/g]
  },
  flask: {
    name: 'Flask',
    category: 'backend',
    patterns: [/flask/gi, /@app\.route/g, /render_template/g]
  },
  springboot: {
    name: 'Spring Boot',
    category: 'backend',
    patterns: [/spring\s*boot/gi, /@RestController/g, /@Autowired/g, /@SpringBootApplication/g]
  },
  rubyonrails: {
    name: 'Ruby on Rails',
    category: 'backend',
    patterns: [/ruby\s*on\s*rails/gi, /ActiveRecord/g, /ApplicationController/g]
  },
  laravel: {
    name: 'Laravel',
    category: 'backend',
    patterns: [/laravel/gi, /Illuminate\\/g, /Artisan::/g, /Eloquent/g]
  },

  // Mobile
  reactnative: {
    name: 'React Native',
    category: 'frontend',
    patterns: [/react-native/gi, /<View>/g, /<Text>/g, /StyleSheet\.create/g]
  },
  flutter: {
    name: 'Flutter',
    category: 'frontend',
    patterns: [/flutter/gi, /StatelessWidget/g, /StatefulWidget/g, /pubspec\.yaml/g]
  },
  swift: {
    name: 'SwiftUI',
    category: 'frontend',
    patterns: [/swiftui/gi, /import\s+SwiftUI/g, /some\s+View/g, /@State/g]
  },
  kotlin: {
    name: 'Jetpack Compose',
    category: 'frontend',
    patterns: [/jetpack\s*compose/gi, /@Composable/g, /Modifier\./g, /remember\{/g]
  },

  // Windows Native Frontend
  winui3: {
    name: 'WinUI 3',
    category: 'frontend',
    patterns: [/WinUI/gi, /Microsoft\.UI\.Xaml/g, /<Window/g, /<NavigationView/g, /<CommandBar/g]
  },
  wpf: {
    name: 'WPF',
    category: 'frontend',
    patterns: [/WPF/gi, /System\.Windows/g, /<Window/g, /<Grid/g, /<StackPanel/g]
  },
  maui: {
    name: '.NET MAUI',
    category: 'frontend',
    patterns: [/MAUI/gi, /Microsoft\.Maui/g, /<ContentPage/g, /<VerticalStackLayout/g]
  },
  uwp: {
    name: 'UWP',
    category: 'frontend',
    patterns: [/UWP/gi, /Windows\.UI\.Xaml/g, /<Page/g, /<Grid/g]
  },
  reactnativewindows: {
    name: 'React Native for Windows',
    category: 'frontend',
    patterns: [/react-native-windows/gi, /react-native/gi]
  },
  tauri: {
    name: 'Tauri',
    category: 'frontend',
    patterns: [/tauri/gi, /@tauri-apps/g, /tauri\.conf\.json/g]
  },

  // Windows Native State Management
  communitytoolkit: {
    name: 'CommunityToolkit.Mvvm',
    category: 'state',
    patterns: [/CommunityToolkit\.Mvvm/g, /ObservableObject/g, /\[ObservableProperty\]/g, /\[RelayCommand\]/g]
  },
  prism: {
    name: 'Prism',
    category: 'state',
    patterns: [/Prism/gi, /BindableBase/g, /DelegateCommand/g, /ViewModelBase/g]
  },
  reactiveui: {
    name: 'ReactiveUI',
    category: 'state',
    patterns: [/ReactiveUI/gi, /ReactiveObject/g, /ReactiveCommand/g, /WhenAnyValue/g]
  },

  // Windows Native Database
  sqlitenet: {
    name: 'SQLite-net',
    category: 'database',
    patterns: [/sqlite-net-pcl/gi, /SQLiteConnection/g, /\[Table/g, /\[PrimaryKey/g]
  },
  efcore: {
    name: 'Entity Framework Core',
    category: 'database',
    patterns: [/EntityFrameworkCore/gi, /DbContext/g, /DbSet/g, /OnModelCreating/g]
  },
  litedb: {
    name: 'LiteDB',
    category: 'database',
    patterns: [/LiteDB/gi, /LiteDatabase/g, /GetCollection/g]
  },

  // Windows Native Deployment
  msix: {
    name: 'MSIX',
    category: 'deployment',
    patterns: [/MSIX/gi, /Package\.appxmanifest/g, /wapproj/g]
  },
  squirrel: {
    name: 'Squirrel',
    category: 'deployment',
    patterns: [/Squirrel/gi, /UpdateManager/g]
  }
};

interface CompatibilityConfig {
  compatibleWith: string[];
  conflictsWith: string[];
  requires: string[];
}

const COMPATIBILITY_MAP: Record<string, CompatibilityConfig> = {
  nextjs: {
    compatibleWith: ['react', 'tailwind', 'prisma', 'nextauth', 'clerk', 'zustand', 'redux', 'drizzle', 'supabase', 'mongodb', 'postgres', 'mysql', 'firebase', 'auth0', 'lucia', 'chakra', 'radix', 'shadcn', 'framer', 'gsap', 'reactquery', 'swr', 'apollo', 'urql', 'trpc', 'jotai', 'recoil', 'mobx', 'xstate'],
    conflictsWith: ['vue', 'angular', 'remix', 'astro', 'svelte', 'solid', 'qwik'],
    requires: ['react']
  },
  remix: {
    compatibleWith: ['react', 'tailwind', 'prisma', 'drizzle', 'supabase', 'mongodb', 'postgres', 'mysql', 'firebase', 'auth0', 'lucia', 'chakra', 'radix', 'shadcn', 'framer', 'gsap', 'reactquery', 'swr', 'apollo', 'urql', 'trpc', 'zustand', 'redux', 'jotai', 'recoil', 'mobx', 'xstate'],
    conflictsWith: ['nextjs', 'vue', 'angular', 'astro', 'svelte', 'solid', 'qwik'],
    requires: ['react']
  },
  nextauth: {
    compatibleWith: ['nextjs', 'prisma', 'drizzle', 'postgres', 'mysql', 'mongodb'],
    conflictsWith: ['clerk', 'auth0', 'lucia'],
    requires: ['nextjs']
  },
  clerk: {
    compatibleWith: ['nextjs', 'react', 'remix', 'astro'],
    conflictsWith: ['nextauth', 'auth0', 'lucia'],
    requires: []
  },
  vue: {
    compatibleWith: ['tailwind', 'supabase', 'firebase'],
    conflictsWith: ['react', 'angular', 'nextjs', 'remix', 'svelte', 'solid', 'qwik', 'mui', 'chakra', 'radix', 'shadcn'],
    requires: []
  },
  react: {
    compatibleWith: ['nextjs', 'remix', 'tailwind', 'mui', 'zustand', 'redux', 'chakra', 'radix', 'shadcn', 'framer', 'reactquery', 'swr', 'apollo', 'urql', 'trpc', 'jotai', 'recoil', 'mobx', 'xstate'],
    conflictsWith: ['vue', 'angular', 'svelte', 'solid', 'qwik'],
    requires: []
  },
  angular: {
    compatibleWith: ['tailwind', 'firebase'],
    conflictsWith: ['react', 'vue', 'nextjs', 'remix', 'svelte', 'solid', 'qwik', 'mui', 'chakra', 'radix', 'shadcn'],
    requires: []
  },
  svelte: {
    compatibleWith: ['tailwind', 'supabase', 'firebase'],
    conflictsWith: ['react', 'vue', 'angular', 'nextjs', 'remix', 'solid', 'qwik', 'mui', 'chakra', 'radix', 'shadcn'],
    requires: []
  },
  solid: {
    compatibleWith: ['tailwind', 'supabase', 'firebase'],
    conflictsWith: ['react', 'vue', 'angular', 'nextjs', 'remix', 'svelte', 'qwik', 'mui', 'chakra', 'radix', 'shadcn'],
    requires: []
  },
  qwik: {
    compatibleWith: ['tailwind', 'supabase', 'firebase'],
    conflictsWith: ['react', 'vue', 'angular', 'nextjs', 'remix', 'svelte', 'solid', 'mui', 'chakra', 'radix', 'shadcn'],
    requires: []
  },
  shadcn: {
    compatibleWith: ['react', 'nextjs', 'remix', 'tailwind', 'radix'],
    conflictsWith: ['vue', 'angular', 'svelte', 'solid', 'qwik', 'mui', 'chakra'],
    requires: ['react', 'tailwind', 'radix']
  },
  prisma: {
    compatibleWith: ['nextjs', 'remix', 'express', 'nestjs', 'fastify', 'hono', 'postgres', 'mysql', 'mongodb'],
    conflictsWith: ['drizzle'],
    requires: []
  },
  drizzle: {
    compatibleWith: ['nextjs', 'remix', 'express', 'nestjs', 'fastify', 'hono', 'postgres', 'mysql'],
    conflictsWith: ['prisma'],
    requires: []
  },
  winui3: {
    compatibleWith: ['communitytoolkit', 'prism', 'reactiveui', 'sqlitenet', 'efcore', 'litedb', 'msix'],
    conflictsWith: ['wpf', 'maui', 'uwp', 'reactnativewindows', 'tauri', 'react', 'vue', 'angular', 'nextjs'],
    requires: []
  },
  wpf: {
    compatibleWith: ['communitytoolkit', 'prism', 'reactiveui', 'sqlitenet', 'efcore', 'litedb', 'msix', 'squirrel'],
    conflictsWith: ['winui3', 'maui', 'uwp', 'reactnativewindows', 'tauri', 'react', 'vue', 'angular', 'nextjs'],
    requires: []
  },
  maui: {
    compatibleWith: ['communitytoolkit', 'prism', 'reactiveui', 'sqlitenet', 'efcore', 'litedb', 'msix'],
    conflictsWith: ['winui3', 'wpf', 'uwp', 'reactnativewindows', 'tauri', 'react', 'vue', 'angular', 'nextjs'],
    requires: []
  },
  communitytoolkit: {
    compatibleWith: ['winui3', 'wpf', 'maui', 'uwp'],
    conflictsWith: ['prism', 'reactiveui', 'redux', 'zustand'],
    requires: []
  },
  efcore: {
    compatibleWith: ['winui3', 'wpf', 'maui', 'uwp', 'sqlitenet'],
    conflictsWith: ['prisma', 'drizzle'],
    requires: []
  }
};

export function detectFrameworks(text: string): DetectedFramework[] {
  const detected: DetectedFramework[] = [];
  
  for (const [key, framework] of Object.entries(EXTENDED_FRAMEWORKS)) {
    const evidence: string[] = [];
    let matchCount = 0;
    
    for (const pattern of framework.patterns) {
      const matches = text.match(pattern);
      if (matches) {
        matchCount += matches.length;
        evidence.push(...matches.slice(0, 3).map(m => `"${m}"`));
      }
    }
    
    const matchedPatterns = framework.patterns.filter(p => p.test(text)).length;
    const confidence = Math.min(100, Math.round(
      (matchCount * 5) + (matchedPatterns / framework.patterns.length * 50)
    ));
    
    if (confidence >= 15) {
      detected.push({
        name: key,
        displayName: framework.name,
        category: framework.category,
        confidence,
        evidence: evidence.slice(0, 5)
      });
    }
  }
  
  return detected.sort((a, b) => b.confidence - a.confidence);
}

export function validateCompatibility(detected: DetectedFramework[]): CompatibilityIssue[] {
  const issues: CompatibilityIssue[] = [];
  
  for (const framework of detected) {
    const compat = COMPATIBILITY_MAP[framework.name];
    if (!compat) continue;
    
    // Check for conflicts
    for (const other of detected) {
      if (framework.name === other.name) continue;
      
      if (compat.conflictsWith.includes(other.name)) {
        issues.push({
          type: 'conflict',
          frameworks: [framework.name, other.name],
          message: `${framework.displayName} conflicts with ${other.displayName}`,
          severity: 'error'
        });
      }
    }
    
    // Check for missing requirements
    for (const required of compat.requires) {
      const hasRequired = detected.some(f => f.name === required);
      if (!hasRequired) {
        const requiredDisplayName = EXTENDED_FRAMEWORKS[required]?.name || required;
        issues.push({
          type: 'missing-requirement',
          frameworks: [framework.name, required],
          message: `${framework.displayName} requires ${requiredDisplayName}`,
          severity: 'warning'
        });
      }
    }
  }
  
  // Deduplicate issues
  const uniqueIssues = Array.from(new Set(issues.map(i => i.message)))
    .map(msg => issues.find(i => i.message === msg)!);
    
  return uniqueIssues;
}
