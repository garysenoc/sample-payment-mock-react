import './App.css'
import PayPalPayment from './components/PayPalPayment'

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Payment Processing App</h1>
      </header>
      <main className="app-content">
        <PayPalPayment />
      </main>
      <footer className="app-footer">
        <p>© {new Date().getFullYear()} Payment Processing App</p>
      </footer>
    </div>
  )
}

export default App
