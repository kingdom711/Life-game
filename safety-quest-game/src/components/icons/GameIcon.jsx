import {
  ShieldCheck,
  AlertTriangle,
  Coins,
  Zap,
  Trophy,
  BookOpen,
  Target,
  ShoppingCart,
  User,
  Bell,
  Flame,
  BarChart2,
  Medal,
  Lock,
  ClipboardList,
  HardHat,
  Crown,
  Star,
  Package,
  Sword,
  Users,
  Map,
  FileText,
  Layers,
  Bot,
  Route,
  Swords,
  Newspaper,
  Thermometer,
  Clapperboard,
  CheckSquare,
  MessageSquare,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  Sparkles,
  ShieldAlert,
  Award,
  TrendingUp,
  Settings,
  Home,
  LogOut,
  Eye,
  Info,
  Plus,
  Minus,
  Check,
  X,
  AlertCircle,
  Calendar,
  Clock,
  Gift,
  Percent,
} from 'lucide-react';

const ICON_MAP = {
  // Safety / Protection
  shield: ShieldCheck,
  'shield-check': ShieldCheck,
  'shield-alert': ShieldAlert,
  warning: AlertTriangle,
  alert: AlertCircle,

  // Game economy
  coins: Coins,
  gold: Coins,
  points: Coins,
  xp: Zap,
  energy: Zap,
  zap: Zap,
  percent: Percent,

  // Achievements & Status
  trophy: Trophy,
  medal: Medal,
  crown: Crown,
  star: Star,
  award: Award,
  sparkles: Sparkles,

  // Navigation
  education: BookOpen,
  book: BookOpen,
  quest: Target,
  target: Target,
  shop: ShoppingCart,
  cart: ShoppingCart,
  profile: User,
  user: User,
  home: Home,
  settings: Settings,
  logout: LogOut,

  // Social
  team: Users,
  users: Users,
  message: MessageSquare,
  bell: Bell,

  // Game elements
  fire: Flame,
  flame: Flame,
  streak: Flame,
  sword: Sword,
  swords: Swords,
  package: Package,
  layers: Layers,
  lock: Lock,

  // Content / Data
  chart: BarChart2,
  stats: BarChart2,
  'bar-chart': BarChart2,
  trending: TrendingUp,
  clipboard: ClipboardList,
  checklist: ClipboardList,
  check: Check,
  'check-square': CheckSquare,
  file: FileText,
  report: FileText,
  calendar: Calendar,
  clock: Clock,

  // Roles
  'hard-hat': HardHat,
  technician: HardHat,
  worker: HardHat,

  // AI / Advanced features
  bot: Bot,
  ai: Bot,
  route: Route,
  'learning-path': Route,
  map: Map,
  heatmap: Thermometer,
  scenario: Clapperboard,
  newspaper: Newspaper,
  briefing: Newspaper,

  // UI Controls
  refresh: RefreshCw,
  'chevron-up': ChevronUp,
  'chevron-down': ChevronDown,
  close: X,
  info: Info,
  eye: Eye,
  plus: Plus,
  minus: Minus,

  // Reward
  gift: Gift,
  reward: Gift,
};

export function GameIcon({ name = '', size = 20, className = '', strokeWidth = 1.75, style }) {
  const Icon = ICON_MAP[name?.toLowerCase()] ?? AlertCircle;
  return (
    <Icon
      size={size}
      strokeWidth={strokeWidth}
      className={className}
      style={style}
      aria-hidden="true"
    />
  );
}

export { ICON_MAP };
export default GameIcon;
