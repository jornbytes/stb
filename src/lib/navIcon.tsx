import { BookOpen, HardDrive, Mail, Star, Home, Users, ExternalLink } from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  home:     Home,
  book:     BookOpen,
  drive:    HardDrive,
  mail:     Mail,
  users:    Users,
  star:     Star,
  external: ExternalLink,
};

export function NavIcon({ icon, className = 'w-5 h-5' }: { icon: string; className?: string }) {
  const Icon = ICON_MAP[icon];
  if (!Icon) return null;
  return <Icon className={className} />;
}

export function hasNavIcon(icon?: string): boolean {
  return !!icon && icon in ICON_MAP;
}
