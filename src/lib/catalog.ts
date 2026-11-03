import data from '@/data/catalog.json'

export interface SizeOption {
label: string
weight: string
price: number
}

export interface Hamper {
page: number
slug: string
name: string
image: string
packaging: string | null
items: string[]
price: number
options?: SizeOption[]
}

export const catalog = data.catalog
export const about = data.about
export const contact = data.contact
export const hampers: Hamper[] = data.hampers

export function formatPrice(value: number) {
return `₹${value.toLocaleString('en-IN')}`
}

export function cdn(src: string, width?: number) {
if (
width &&
typeof window !== 'undefined' &&
window.location.hostname.includes('netlify.app')
) {
return `/.netlify/images?url=${encodeURIComponent(src)}&w=${width}&fm=webp&q=80`
}
return src
}

export function whatsappLink(message: string) {
return `https://wa.me/91${contact.whatsapp}?text=${encodeURIComponent(message)}`
}

export function enquiryMessage(hamper: Hamper, option?: SizeOption) {
const detail = option
? `${hamper.name} – ${option.label} (${option.weight})`
: hamper.name

return `Namaste Aai's Kitchen! Mujhe ${detail} ke baare mein jaankari chahiye. Kripya price aur availability batayein.`
}

export interface InquiryItem {
hamperSlug: string
optionLabel?: string
quantity: number
}

export function getHamperCategory(
hamper: Hamper,
): 'boxes' | 'trays' | 'baskets' | 'keepsakes' {
const packaging = (hamper.packaging || '').toLowerCase()
const name = hamper.name.toLowerCase()

if (packaging.includes('basket') || name.includes('basket')) return 'baskets'
if (packaging.includes('tray') || name.includes('tray')) return 'trays'

if (
packaging.includes('keepsake') ||
name.includes('emerald') ||
name.includes('heritage') ||
name.includes('delight')
) {
return 'keepsakes'
}

return 'boxes'
}

export const hamperCategories = [
{ id: 'all', label: 'All Products' },
{ id: 'boxes', label: 'Products' },
{ id: 'trays', label: 'Special Products' },
{ id: 'baskets', label: 'Traditional Snacks' },
{ id: 'keepsakes', label: 'Traditional Sweets' },
] as const

export const priceBands = [
{ id: 'all', label: 'All prices', min: 0, max: Infinity },
{ id: 'under-1000', label: 'Under ₹1,000', min: 0, max: 999 },
{ id: '1000-1500', label: '₹1,000 – ₹1,500', min: 1000, max: 1500 },
{ id: 'premium', label: '₹1,800 & above', min: 1800, max: Infinity },
] as const

export function consolidatedEnquiryMessage(
  items: Array<{ hamper: Hamper; option?: SizeOption; quantity: number }>,
) {
  if (items.length === 0) {
    return "Namaste Aai's Kitchen! Mujhe aapke products ke baare mein jaankari chahiye."
  }

  const lines = items.map((item, idx) => {
    const optLabel = item.option
      ? " [" + item.option.label + " · " + item.option.weight + "]"
      : ""

    return (
      (idx + 1) +
      ". *" +
      item.hamper.name +
      "*" +
      optLabel +
      " x " +
      item.quantity
    )
  })

  return (
    "Namaste Aai's Kitchen! 😊\n\n" +
    "Mujhe ye products order karne hain:\n\n" +
    lines.join("\n") +
    "\n\nKripya price, availability aur Nagpur delivery details confirm karein. Dhanyavaad!"
  )
}
