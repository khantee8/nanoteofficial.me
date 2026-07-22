import { Inter, Inter_Tight, Space_Grotesk, Fraunces, Archivo, Archivo_Black, JetBrains_Mono } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], weight: ['400', '600'], variable: '--font-inter', display: 'swap' });
const interTight = Inter_Tight({ subsets: ['latin'], weight: ['600', '800'], variable: '--font-inter-tight', display: 'swap' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], weight: ['500', '700'], variable: '--font-space-grotesk', display: 'swap' });
const fraunces = Fraunces({ subsets: ['latin'], weight: ['600', '900'], variable: '--font-fraunces', display: 'swap' });
const archivo = Archivo({ subsets: ['latin'], weight: ['600', '800'], variable: '--font-archivo', display: 'swap' });
const archivoBlack = Archivo_Black({ subsets: ['latin'], weight: ['400'], variable: '--font-archivo-black', display: 'swap' });
const jetbrains = JetBrains_Mono({ subsets: ['latin'], weight: ['500'], variable: '--font-jetbrains', display: 'swap' });

export const slideFontVars = [inter, interTight, spaceGrotesk, fraunces, archivo, archivoBlack, jetbrains]
  .map((f) => f.variable).join(' ');
