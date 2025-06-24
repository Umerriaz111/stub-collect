import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

export default function PageNotFound() {
    return (
        <div
            style={{
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                background: 'white',
            }}
        >
            <Typography variant="h1" component="h1" gutterBottom style={{ fontSize: '3em', color: '#007bff' }}>
                404
            </Typography>
            <Typography variant="h4" component="h2" gutterBottom style={{ fontSize: '2em', color: '#333' }}>
                Oops!
            </Typography>
            <Typography variant="h4" style={{ marginBottom: '12px' }}>
                Page Not Found
            </Typography>
            <Button
                // component={Link}
                // to="/"
                variant="contained"
                size="small"
                style={{ backgroundColor: '#007bff', color: '#fff' }}
                onClick={() => window.history.back()}
            >
                Go Back
            </Button>
        </div>
    )
}
