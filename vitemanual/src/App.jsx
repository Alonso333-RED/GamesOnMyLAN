import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import { usePointerGlow } from './hooks/usePointerGlow';
import Home from './pages/Home';
import Requirements from './pages/Requirements';
import Installation from './pages/Installation';
import Solutions from './pages/Solutions';
import BackupRestore from './pages/BackupRestore';
import NotFound from './pages/NotFound';

function Layout({ children }) {
    usePointerGlow();

    return (
        <>
            <Header />
            <main className="main-panel container mt-4 mt-md-5">{children}</main>
            <Footer />
        </>
    );
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/"
                    element={
                        <Layout>
                            <Home />
                        </Layout>
                    }
                />
                <Route
                    path="/requirements"
                    element={
                        <Layout>
                            <Requirements />
                        </Layout>
                    }
                />
                <Route
                    path="/installation"
                    element={
                        <Layout>
                            <Installation />
                        </Layout>
                    }
                />
                <Route
                    path="/solutions"
                    element={
                        <Layout>
                            <Solutions />
                        </Layout>
                    }
                />
                <Route
                    path="/backup-restore"
                    element={
                        <Layout>
                            <BackupRestore />
                        </Layout>
                    }
                />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
