import { Navigate } from 'react-router-dom';

function NotFound() {
    return <Navigate to="/" replace />;
}

export default NotFound;
