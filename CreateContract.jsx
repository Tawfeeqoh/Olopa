import { useState } from 'react'
import { createEscrowAccount, fundEscrow, getProvider, getExplorerUrl } from '../utils/solana'

function CreateContract() {
  const [formData, setFormData] = useState({
    freelancerWallet: '',
    jobTitle: '',
    description: '',
    amount: ''
  })
  const [showModal, setShowModal] = useState(false)
  const [modalMessage, setModalMessage] = useState({ title: '', text: '', emoji: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [txSignature, setTxSignature] = useState(null)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const provider = getProvider()
      if (!provider || !provider.publicKey) {
        setModalMessage({
          title: 'Wallet Not Connected',
          text: 'Please connect your Phantom wallet first.',
          emoji: '⚠️'
        })
        setShowModal(true)
        setTimeout(() => setShowModal(false), 3000)
        setIsSubmitting(false)
        return
      }

      const clientWallet = provider.publicKey.toString()

      setModalMessage({
        title: 'Creating Escrow...',
        text: 'Please wait while we set up the escrow account.',
        emoji: '⏳'
      })
      setShowModal(true)

      const escrow = createEscrowAccount()

      setModalMessage({
        title: 'Confirm Transaction',
        text: 'Please approve the transaction in your Phantom wallet.',
        emoji: '🔐'
      })

      const signature = await fundEscrow(
        clientWallet,
        escrow.publicKey,
        parseFloat(formData.amount),
        escrow.secretKey
      )

      const contract = {
        id: Date.now().toString(),
        ...formData,
        clientWallet,
        escrowPublicKey: escrow.publicKey,
        escrowSecretKey: escrow.secretKey,
        status: 'funded',
        fundingTxSignature: signature,
        createdAt: new Date().toISOString()
      }

      const existingContracts = JSON.parse(localStorage.getItem('contracts') || '[]')
      existingContracts.push(contract)
      localStorage.setItem('contracts', JSON.stringify(existingContracts))

      setTxSignature(signature)
      setModalMessage({
        title: 'Success!',
        text: 'Contract created and funds locked in escrow.',
        emoji: '✅'
      })

      setFormData({
        freelancerWallet: '',
        jobTitle: '',
        description: '',
        amount: ''
      })

      setTimeout(() => {
        setShowModal(false)
        setTxSignature(null)
      }, 5000)

    } catch (error) {
      console.error('Error creating contract:', error)
      setModalMessage({
        title: 'Error',
        text: error.message || 'Failed to create contract. Please try again.',
        emoji: '❌'
      })
      setTimeout(() => setShowModal(false), 4000)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8 text-center">Create New Contract</h1>

      <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Freelancer Wallet Address *
            </label>
            <input
              type="text"
              name="freelancerWallet"
              value={formData.freelancerWallet}
              onChange={handleChange}
              required
              placeholder="Enter Solana wallet address"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Title *
            </label>
            <input
              type="text"
              name="jobTitle"
              value={formData.jobTitle}
              onChange={handleChange}
              required
              placeholder="e.g., Website Development"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="4"
              placeholder="Describe the work to be done..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount (SOL) *
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
              step="0.01"
              min="0"
              placeholder="0.00"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 rounded-lg transition font-medium text-lg shadow-lg hover:shadow-xl ${
              isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {isSubmitting ? 'Creating...' : 'Create Contract & Fund Escrow'}
          </button>
          
          <p className="text-sm text-gray-500 text-center">
            This will transfer SOL to an escrow account on Solana devnet
          </p>
        </form>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 sm:p-8 max-w-md w-full shadow-2xl transform transition-all">
            <div className="text-center">
              <div className="text-5xl mb-4">{modalMessage.emoji}</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{modalMessage.title}</h3>
              <p className="text-gray-600 mb-4">{modalMessage.text}</p>
              {txSignature && (
                <a
                  href={getExplorerUrl(txSignature)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-indigo-600 hover:text-indigo-700 text-sm underline"
                >
                  View on Solana Explorer
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CreateContract
