import React from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ThemeToggle = ({ className = '' }) => {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`w-9 h-9 ${className}`}
      title={isDark ? 'Modo claro' : 'Modo oscuro'}
    >
      {isDark
        ? <Sun className="w-4 h-4 text-yellow-400" />
        : <Moon className="w-4 h-4 text-muted-foreground" />}
    </Button>
  );
};

export default ThemeToggle;
