import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

function Header() {
  const [walletAddress, setWalletAddress] = useState(null)

  useEffect(() => {
    checkIfWalletIsConnected()
    setupDisconnectListener()
  }, [])

  const checkIfWalletIsConnected = async () => {
    try {
      const { solana } = window
      const wasDisconnected = localStorage.getItem('walletDisconnected')
      
      if (solana?.isPhantom && !wasDisconnected) {
        const response = await solana.connect({ onlyIfTrusted: true })
        setWalletAddress(response.publicKey.toString())
        localStorage.removeItem('walletDisconnected')
      }
    } catch (error) {
      console.log('No wallet connected')
    }
  }

  const setupDisconnectListener = () => {
    const { solana } = window
    if (solana?.isPhantom) {
      solana.on('disconnect', () => {
        setWalletAddress(null)
        localStorage.setItem('walletDisconnected', 'true')
      })
    }
  }

  const connectWallet = async () => {
    try {
      const { solana } = window
      if (!solana) {
        alert('Please install Phantom wallet!')
        return
      }

      if (solana.isPhantom) {
        const response = await solana.connect({ onlyIfTrusted: false })
        setWalletAddress(response.publicKey.toString())
        localStorage.removeItem('walletDisconnected')
      }
    } catch (error) {
      console.error('Error connecting wallet:', error)
    }
  }

  const disconnectWallet = async () => {
    try {
      const { solana } = window
      if (solana?.isPhantom) {
        await solana.disconnect()
        setWalletAddress(null)
        localStorage.setItem('walletDisconnected', 'true')
      }
    } catch (error) {
      console.error('Error disconnecting wallet:', error)
    }
  }

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold text-indigo-600 hover:text-indigo-700 transition">
            OLOPA
          </Link>

          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-700 hover:text-indigo-600 transition font-medium">
              Home
            </Link>
            <Link to="/create" className="text-gray-700 hover:text-indigo-600 transition font-medium">
              Create Contract
            </Link>
            <Link to="/deals" className="text-gray-700 hover:text-indigo-600 transition font-medium">
              My Deals
            </Link>
          </nav>

          <div className="flex items-center">
            {walletAddress ? (
              <div className="flex items-center gap-3">
                <span className="hidden sm:inline text-sm text-gray-600">
                  {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}
                </span>
                <button
                  onClick={disconnectWallet}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition text-sm font-medium"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>

        <nav className="md:hidden pb-3 flex justify-center space-x-6">
          <Link to="/" className="text-gray-700 hover:text-indigo-600 transition text-sm font-medium">
            Home
          </Link>
          <Link to="/create" className="text-gray-700 hover:text-indigo-600 transition text-sm font-medium">
            Create
          </Link>
          <Link to="/deals" className="text-gray-700 hover:text-indigo-600 transition text-sm font-medium">
            Deals
          </Link>
        </nav>
      </div>
    </header>
  )
}

export default Header
