import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: {
				DEFAULT: '1rem',
				sm: '2rem',
				lg: '3rem',
			},
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				'handwritten': ['Caveat', 'Architects Daughter', 'cursive'],
				'sketch': ['Architects Daughter', 'cursive'],
				'casual': ['Kalam', 'cursive'],
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'paper-grid': 'linear-gradient(rgba(0,0,0,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.05) 1px, transparent 1px)',
			},
			gridTemplateColumns: {
				'16': 'repeat(16, minmax(0, 1fr))',
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Pastel color palette
				'pastel-blue': '#A8D8EA',
				'pastel-pink': '#FFD3D8',
				'pastel-mint': '#C7E8CA',
				'pastel-yellow': '#FFF3B2',
				'pastel-purple': '#E1BEE7',
				'pastel-orange': '#FFD4A3',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				'sketch': '15px 25px 20px 18px',
				'sketch-alt': '20px 15px 25px 18px',
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'wiggle': {
					'0%, 100%': { transform: 'rotate(-0.5deg)' },
					'50%': { transform: 'rotate(0.5deg)' }
				},
				'bounce-sketch': {
					'0%, 100%': { transform: 'translateY(0) rotate(-0.2deg)' },
					'50%': { transform: 'translateY(-5px) rotate(0.2deg)' }
				},
				'spin-sketch': {
					'0%': { transform: 'rotate(0deg)' },
					'100%': { transform: 'rotate(360deg)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'wiggle': 'wiggle 2s ease-in-out infinite',
				'bounce-sketch': 'bounce-sketch 1s ease-in-out infinite',
				'spin-sketch': 'spin-sketch 1.5s ease-in-out infinite'
			},
			spacing: {
				'18': '4.5rem',
				'88': '22rem',
			},
			fontSize: {
				'2xs': '0.625rem',
			},
			screens: {
				'xs': '475px',
			},
			backgroundSize: {
				'grid': '20px 20px',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;