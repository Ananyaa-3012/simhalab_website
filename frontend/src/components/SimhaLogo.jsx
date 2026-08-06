import { useTheme } from '../context/ThemeContext'
import simhaIconDark from '../assets/simha-icon-dark.png'
import simhaIconLight from '../assets/simha-icon-light.png'
import simhaLogoDark from '../assets/simha-logo-dark.png'
import simhaLogoLight from '../assets/simha-logo-light.png'
import simhaLogoFullDark from '../assets/simha-logo-full-dark.png'
import simhaLogoFullLight from '../assets/simha-logo-full-light.png'

const logos = {
  icon: { dark: simhaIconDark, light: simhaIconLight },
  logo: { dark: simhaLogoDark, light: simhaLogoLight },
  full: { dark: simhaLogoFullDark, light: simhaLogoFullLight },
}

export default function SimhaLogo({ variant = 'logo', className, style, alwaysDark }) {
  const { theme } = useTheme()
  const activeTheme = alwaysDark ? 'dark' : theme
  const src = logos[variant]?.[activeTheme] || logos.logo.dark

  return (
    <img
      src={src}
      alt="SIMHA"
      className={className}
      style={style}
    />
  )
}
