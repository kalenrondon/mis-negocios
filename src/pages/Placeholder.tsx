interface Props {
  title: string
}

export default function Placeholder({ title }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">{title}</h1>
      <p className="text-slate-500 dark:text-slate-400">Próximamente disponible</p>
    </div>
  )
}
