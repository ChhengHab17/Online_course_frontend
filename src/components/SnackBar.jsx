import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

export default function CustomizedSnackbars({ open, handleClose, message, severity }) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={3000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }} // <-- top center
    >
      <Alert
        onClose={handleClose}
        severity={severity || "success"}
        variant="filled"
        sx={{ width: '100%' }}
      >
        {message || "Login successful!"}
      </Alert>
    </Snackbar>
  );
}
