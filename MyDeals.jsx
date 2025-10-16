import { useState, useEffect } from 'react'
import { releaseFunds, getExplorerUrl, formatAddress } from '../utils/solana'

function MyDeals() {
  const [contracts, setContracts] = useState([])
  const [releasingId, setReleasingId] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [modalMessage, setModalMessage] = useState({ title: '', text: '', emoji: '' })

  useEffect(() => {
    const storedContracts = JSON.parse(localStorage.getItem('contracts') || '[]')
    setContracts(storedContracts)
  }, [])

  const handleReleaseFunds = async (contract) => {
    if (contract.status === 'completed') return

    setReleasingId(contract.id)

    try {
      setModalMessage({
        title: 'Releasing Funds...',
        text: 'Please wait while we transfer SOL to the freelancer.',
        emoji: '⏳'
      })
      setShowModal(true)

      const signature = await releaseFunds(
        contract.escrowSecretKey,
        contract.freelancerWallet,
        parseFloat(contract.amount)
      )

      const updatedContracts = contracts.map(c =>
        c.id === contract.id
          ? { ...c, status: 'completed', releaseTxSignature: signature }
          : c
      )
      
      setContracts(updatedContracts)
      localStorage.setItem('contracts', JSON.stringify(updatedContracts))

      setModalMessage({
        title: 'Funds Released!',
        text: `Successfully sent ${contract.amount} SOL to the freelancer.`,
        emoji: '✅'
      })

      setTimeout(() => setShowModal(false), 5000)

    } catch (error) {
      console.error('Error releasing funds:', error)
      setModalMessage({
        title: 'Error',
        text: error.message || 'Failed to release funds. Please try again.',
        emoji: '❌'
      })
      setTimeout(() => setShowModal(false), 4000)
    } finally {
      setReleasingId(null)
    }
  }

  const getStatusColor = (status) => {
    if (status === 'completed') return 'bg-green-100 text-green-800'
    if (status === 'funded') return 'bg-blue-100 text-blue-800'
    return 'bg-yellow-100 text-yellow-800'
  }

  const getStatusText = (status) => {
    if (status === 'completed') return 'Completed'
    if (status === 'funded') return 'Funded'
    return 'Pending'
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8 text-center">My Deals</h1>

      {contracts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-5xl mb-4">📋</div>
          <p className="text-xl text-gray-600">No contracts yet</p>
          <p className="text-gray-500 mt-2">Create your first contract to get started</p>
        </div>
      ) : (
        <div className="space-y-4">
          {contracts.map((contract) => (
            <div key={contract.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{contract.jobTitle}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(contract.status)}`}>
                        {getStatusText(contract.status)}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{contract.description}</p>
                    
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Amount:</span>
                        <span className="text-indigo-600 font-semibold">{contract.amount} SOL</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Freelancer:</span>
                        <span className="font-mono text-xs">{formatAddress(contract.freelancerWallet)}</span>
                      </div>
                      {contract.escrowPublicKey && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Escrow:</span>
                          <span className="font-mono text-xs">{formatAddress(contract.escrowPublicKey)}</span>
                        </div>
                      )}
                      {contract.fundingTxSignature && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Funding Tx:</span>
                          <a
                            href={getExplorerUrl(contract.fundingTxSignature)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-700 underline text-xs"
                          >
                            View on Explorer
                          </a>
                        </div>
                      )}
                      {contract.releaseTxSignature && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Release Tx:</span>
                          <a
                            href={getExplorerUrl(contract.releaseTxSignature)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-700 underline text-xs"
                          >
                            View on Explorer
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleReleaseFunds(contract)}
                    disabled={contract.status === 'completed' || releasingId === contract.id}
                    className={`px-6 py-2 rounded-lg font-medium transition whitespace-nowrap ml-4 ${
                      contract.status === 'completed'
                        ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                        : releasingId === contract.id
                        ? 'bg-gray-400 text-white cursor-wait'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {releasingId === contract.id ? 'Releasing...' : contract.status === 'completed' ? 'Completed' : 'Release Funds'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 sm:p-8 max-w-md w-full shadow-2xl transform transition-all">
            <div className="text-center">
              <div className="text-5xl mb-4">{modalMessage.emoji}</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{modalMessage.title}</h3>
              <p className="text-gray-600">{modalMessage.text}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyDeals
