import { Link } from 'react-router-dom'

function Home() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          Welcome to <span className="text-indigo-600">OLOPA</span>
        </h1>
        
        <p className="text-lg sm:text-xl text-gray-600 mb-4 max-w-2xl mx-auto">
          Secure Web3 freelance escrow platform. Create contracts, manage deals, and release funds with blockchain transparency.
        </p>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8 max-w-2xl mx-auto">
          <p className="text-sm text-yellow-800">
            <span className="font-semibold">⚠️ MVP Notice:</span> This platform uses Solana <strong>devnet</strong> for testing. 
            Escrow keys are stored in browser localStorage for demo purposes only. Not production-ready.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Link
            to="/create"
            className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition text-lg font-medium shadow-lg hover:shadow-xl"
          >
            Create Contract
          </Link>
          <Link
            to="/deals"
            className="w-full sm:w-auto bg-white border-2 border-indigo-600 text-indigo-600 px-8 py-3 rounded-lg hover:bg-indigo-50 transition text-lg font-medium"
          >
            View My Deals
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-3">🔒</div>
            <h3 className="text-xl font-semibold mb-2">Real Escrow</h3>
            <p className="text-gray-600">Funds locked on Solana blockchain until work is approved</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="text-xl font-semibold mb-2">Actual SOL Transfers</h3>
            <p className="text-gray-600">Real blockchain transactions via Phantom wallet</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-3">🌐</div>
            <h3 className="text-xl font-semibold mb-2">Decentralized</h3>
            <p className="text-gray-600">No intermediaries, verifiable on Solana Explorer</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
