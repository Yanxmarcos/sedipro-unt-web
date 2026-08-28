import UsersTable from '@/components/UsersTable'

export default function PageUsuarios() {
    return (
        <div
            style={{
                padding: '28px',
                minHeight: '100%',
                fontFamily: 'Poppins, sans-serif',
            }}
        >
            <div style={{ marginBottom: '24px' }}>
                <h1
                    style={{
                        fontFamily: 'Montserrat, sans-serif',
                        fontWeight: 700,
                        fontSize: '22px',
                        color: 'var(--color-primary-active)',
                        margin: 0,
                        lineHeight: 1.2,
                    }}
                >
                    Usuarios
                </h1>
                <p style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '6px', marginBottom: 0 }}>
                    Gestión de usuarios del sistema
                </p>
            </div>

            <UsersTable />
        </div>
    )
}
