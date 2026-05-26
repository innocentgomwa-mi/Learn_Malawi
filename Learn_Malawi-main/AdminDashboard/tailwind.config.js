const withOpacityValue = (variable) => ({ opacityValue }) => {
  if (opacityValue === undefined) {
    return `hsl(var(${variable}))`
  }
  return `hsl(var(${variable}) / ${opacityValue})`
}

export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        border: withOpacityValue('--border'),
        ring: withOpacityValue('--ring'),
        background: withOpacityValue('--background'),
        foreground: withOpacityValue('--foreground'),
        card: withOpacityValue('--card'),
        'card-foreground': withOpacityValue('--card-foreground'),
        popover: withOpacityValue('--popover'),
        'popover-foreground': withOpacityValue('--popover-foreground'),
        primary: withOpacityValue('--primary'),
        'primary-foreground': withOpacityValue('--primary-foreground'),
        secondary: withOpacityValue('--secondary'),
        'secondary-foreground': withOpacityValue('--secondary-foreground'),
        muted: withOpacityValue('--muted'),
        'muted-foreground': withOpacityValue('--muted-foreground'),
        accent: withOpacityValue('--accent'),
        'accent-foreground': withOpacityValue('--accent-foreground'),
        destructive: withOpacityValue('--destructive'),
        'destructive-foreground': withOpacityValue('--destructive-foreground'),
        input: withOpacityValue('--input'),
        'chart-1': withOpacityValue('--chart-1'),
        'chart-2': withOpacityValue('--chart-2'),
        'chart-3': withOpacityValue('--chart-3'),
        'chart-4': withOpacityValue('--chart-4'),
        'chart-5': withOpacityValue('--chart-5'),
        'sidebar-background': withOpacityValue('--sidebar-background'),
        'sidebar-foreground': withOpacityValue('--sidebar-foreground'),
        'sidebar-primary': withOpacityValue('--sidebar-primary'),
        'sidebar-primary-foreground': withOpacityValue('--sidebar-primary-foreground'),
        'sidebar-accent': withOpacityValue('--sidebar-accent'),
        'sidebar-accent-foreground': withOpacityValue('--sidebar-accent-foreground'),
        'sidebar-border': withOpacityValue('--sidebar-border'),
        'sidebar-ring': withOpacityValue('--sidebar-ring'),
      },
      borderRadius: {
        lg: 'var(--radius)',
      },
    },
  },
  plugins: [],
}
