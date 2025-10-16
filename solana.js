import { 
  Connection, 
  PublicKey, 
  Transaction, 
  SystemProgram,
  LAMPORTS_PER_SOL,
  Keypair
} from '@solana/web3.js'

const NETWORK = 'devnet'
const ENDPOINT = 'https://api.devnet.solana.com'

export const getConnection = () => {
  return new Connection(ENDPOINT, 'confirmed')
}

export const getProvider = () => {
  if ('solana' in window) {
    const provider = window.solana
    if (provider.isPhantom) {
      return provider
    }
  }
  return null
}

export const connectWallet = async () => {
  const provider = getProvider()
  if (!provider) {
    throw new Error('Phantom wallet not found! Please install it.')
  }
  
  const response = await provider.connect()
  return response.publicKey.toString()
}

export const getBalance = async (publicKeyString) => {
  const connection = getConnection()
  const publicKey = new PublicKey(publicKeyString)
  const balance = await connection.getBalance(publicKey)
  return balance / LAMPORTS_PER_SOL
}

export const createEscrowAccount = () => {
  const escrowKeypair = Keypair.generate()
  return {
    publicKey: escrowKeypair.publicKey.toString(),
    secretKey: Array.from(escrowKeypair.secretKey)
  }
}

export const fundEscrow = async (fromWalletPublicKey, escrowPublicKey, amountSOL, escrowKeypair) => {
  const provider = getProvider()
  if (!provider) {
    throw new Error('Phantom wallet not found')
  }

  const connection = getConnection()
  const fromPubkey = new PublicKey(fromWalletPublicKey)
  const escrowPubkey = new PublicKey(escrowPublicKey)
  const escrowAmount = Math.floor(amountSOL * LAMPORTS_PER_SOL)

  const rentExemption = await connection.getMinimumBalanceForRentExemption(0)
  const totalLamports = escrowAmount + rentExemption
  
  const escrowKeypairObj = Keypair.fromSecretKey(new Uint8Array(escrowKeypair))

  const transaction = new Transaction()
  
  transaction.add(
    SystemProgram.createAccount({
      fromPubkey: fromPubkey,
      newAccountPubkey: escrowPubkey,
      lamports: totalLamports,
      space: 0,
      programId: SystemProgram.programId
    })
  )

  transaction.feePayer = fromPubkey
  const { blockhash } = await connection.getLatestBlockhash()
  transaction.recentBlockhash = blockhash

  transaction.partialSign(escrowKeypairObj)
  
  const signed = await provider.signTransaction(transaction)
  const signature = await connection.sendRawTransaction(signed.serialize())
  await connection.confirmTransaction(signature)

  return signature
}

export const releaseFunds = async (escrowSecretKey, recipientPublicKey, amountSOL) => {
  const connection = getConnection()
  
  const escrowKeypair = Keypair.fromSecretKey(new Uint8Array(escrowSecretKey))
  const recipientPubkey = new PublicKey(recipientPublicKey)
  
  const escrowBalance = await connection.getBalance(escrowKeypair.publicKey)
  const lamportsToSend = Math.floor(amountSOL * LAMPORTS_PER_SOL)
  
  if (escrowBalance < lamportsToSend) {
    throw new Error('Insufficient funds in escrow')
  }

  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: escrowKeypair.publicKey,
      toPubkey: recipientPubkey,
      lamports: lamportsToSend
    })
  )

  transaction.feePayer = escrowKeypair.publicKey
  const { blockhash } = await connection.getLatestBlockhash()
  transaction.recentBlockhash = blockhash

  transaction.sign(escrowKeypair)
  
  const signature = await connection.sendRawTransaction(transaction.serialize())
  await connection.confirmTransaction(signature)

  return signature
}

export const getEscrowBalance = async (escrowPublicKey) => {
  const connection = getConnection()
  const publicKey = new PublicKey(escrowPublicKey)
  const balance = await connection.getBalance(publicKey)
  return balance / LAMPORTS_PER_SOL
}

export const formatAddress = (address) => {
  if (!address) return ''
  return `${address.slice(0, 4)}...${address.slice(-4)}`
}

export const getExplorerUrl = (signature, type = 'tx') => {
  return `https://explorer.solana.com/${type}/${signature}?cluster=${NETWORK}`
}
