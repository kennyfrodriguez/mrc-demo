import { Button } from '@/components/ui/button';

export function List({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`space-y-1 ${className}`}>{children}</div>;
}

export function ListItem({ children, className, onClick }: { 
  children: React.ReactNode; 
  className?: string;
  onClick?: () => void;
}) {
  return (
    <Button variant="ghost" className={`w-full justify-start ${className}`} onClick={onClick}>
      {children}
    </Button>
  );
} 