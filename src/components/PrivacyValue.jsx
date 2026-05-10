import { useStore } from '../store/useStore'
import clsx from 'clsx'

export default function PrivacyValue({ value, className }) {
  const modoPrivacidad = useStore(state => state.modoPrivacidad)

  return (
    <span className={clsx(
      className,
      modoPrivacidad && "privacy-blur select-none pointer-events-none"
    )}>
      {value}
    </span>
  )
}
