import SedipranosTable from '@/components/SedipranosTable'
export default function PageSedipranos() {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-foreground m-0 text-2xl font-semibold tracking-tight">Sedipranos</h1>
        <p className="text-sm text-muted-foreground mt-1.5 mb-0">Directorio de miembros de SEDIPRO UNT</p>
      </div>

      <SedipranosTable />
    </div>
  )
}
