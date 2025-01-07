import { useThemeStore } from '@/store/themeStore';
import { Button } from './ui/Button';

export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <Button
      variant="secondary"
      onClick={toggleTheme}
      className="px-3"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? '🌞' : '🌙'}
    </Button>
  );
}