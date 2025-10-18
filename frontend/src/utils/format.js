export const formatINR = (amount) => {
  try {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
  } catch (e) {
    return `₹${amount}`
  }
}

export default formatINR
