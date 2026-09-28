import UsersTable from '@/components/UsersTable'
export default function PageUsuarios() {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-foreground m-0 text-2xl font-semibold tracking-tight">Usuarios</h1>
        <p className="text-sm text-muted-foreground mt-1.5 mb-0">Gestión de usuarios del sistema</p>
      </div>

      <UsersTable />
    </div>
  )
}
