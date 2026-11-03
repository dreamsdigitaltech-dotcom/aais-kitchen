import { useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { toast } from 'sonner'
import {
  Award,
  Camera,
  ChevronRight,
  Download,
  Gift,
  Heart,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  X,
} from 'lucide-react'

import { HamperCard, HamperDialog } from '@/components/hamper'
import { InquiryBagSheet, type BagItem } from '@/components/inquiry-bag'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  about,
  catalog,
  cdn,
  contact,
  formatPrice,
  getHamperCategory,
  hamperCategories,
  hampers,
  priceBands,
  whatsappLink,
  type Hamper,
  type SizeOption,
} from '@/lib/catalog'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/')({
  component: Home,
})

type CategoryId = (typeof hamperCategories)[number]['id']
type BandId = (typeof priceBands)[number]['id']
type SortOrder = 'price-asc' | 'price-desc' | 'page-asc'

const instagramUrl = `https://instagram.com/${contact.instagram}`
const generalEnquiry = whatsappLink(
  "Hello Aai's Kitchen! I'd like to know more about your Diwali 2026 gift hampers.",
)
const corporateEnquiry = whatsappLink(
  "Hello Aai's Kitchen! 🪔 I'd like a quote for corporate / bulk Diwali gifting.",
)

const faqs = [
  {
    q: 'Which products are available at Aai’s Kitchen?',
    a: "We currently offer three products: Multigrain Sev, Masala Besan Sev and Mewa Laddu. Explore our products section to see the available options.",
  },
  {
    q: 'How can I place an order?',
    a: "You can click the Buy Now button on a product or contact us through WhatsApp at +91 9890122457. We will help you with your order enquiry.",
  },
  {
    q: 'How can I know the product prices?',
    a: "Please contact us on WhatsApp for the latest product prices and availability.",
  },
  {
    q: 'Do you deliver outside Nagpur?',
    a: "We currently accept delivery enquiries for Nagpur and nearby areas. Please contact us on WhatsApp to confirm delivery availability for your location.",
  },
  {
    q: 'Can I ask about ingredients and product details?',
    a: "Absolutely! Contact us on WhatsApp and we will help you with available product information, ingredients and other details.",
  },
  {
    q: 'Can I customise my order?',
    a: "Please contact us on WhatsApp to discuss your requirements and check whether customisation is available.",
  },
]

function Home() {
  const [category, setCategory] = useState<CategoryId>('all')
  const [band, setBand] = useState<BandId>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sort, setSort] = useState<SortOrder>('page-asc')
  const [selected, setSelected] = useState<Hamper | null>(null)

  // Bag State
  const [bagItems, setBagItems] = useState<BagItem[]>([])
  const [bagOpen, setBagOpen] = useState(false)

  const handleAddToBag = (
    hamper: Hamper,
    option?: SizeOption,
    quantity = 1,
  ) => {
    setBagItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.hamper.slug === hamper.slug &&
          item.option?.label === option?.label,
      )
      if (existingIndex > -1) {
        const updated = [...prev]
        updated[existingIndex].quantity += quantity
        return updated
      }
      const newItem: BagItem = {
        id: `${hamper.slug}-${option?.label || 'standard'}-${Date.now()}`,
        hamper,
        option,
        quantity,
      }
      return [...prev, newItem]
    })

    toast.success(`Added ${hamper.name} to Festive Bag`, {
      description: option
        ? `${option.label} · Quantity: ${quantity}`
        : `Quantity: ${quantity}`,
      action: {
        label: 'View Bag',
        onClick: () => setBagOpen(true),
      },
    })
  }

  const handleUpdateQuantity = (id: string, delta: number) => {
    setBagItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const nextQty = item.quantity + delta
            return nextQty > 0 ? { ...item, quantity: nextQty } : null
          }
          return item
        })
        .filter((item): item is BagItem => item !== null),
    )
  }

  const handleRemoveItem = (id: string) => {
    setBagItems((prev) => prev.filter((item) => item.id !== id))
    toast('Item removed from inquiry bag')
  }

  const handleClearBag = () => {
    setBagItems([])
    toast('Inquiry bag cleared')
  }

  const totalBagCount = bagItems.reduce((sum, item) => sum + item.quantity, 0)

  // Filter and sort visible hampers
  const visible = useMemo(() => {
    const { min, max } = priceBands.find((b) => b.id === band)!
    const query = searchQuery.trim().toLowerCase()

    return hampers
      .filter((h) => {
        // Price band filter
        if (h.price < min || h.price > max) return false

        // Category filter
        if (category !== 'all') {
          const itemCat = getHamperCategory(h)
          if (itemCat !== category) return false
        }

        // Search query
        if (query) {
          const matchName = h.name.toLowerCase().includes(query)
          const matchPackaging = (h.packaging || '')
            .toLowerCase()
            .includes(query)
          const matchItems = h.items.some((item) =>
            item.toLowerCase().includes(query),
          )
          if (!matchName && !matchPackaging && !matchItems) return false
        }

        return true
      })
      .sort((a, b) => {
        if (sort === 'price-asc') return a.price - b.price
        if (sort === 'price-desc') return b.price - a.price
        return a.page - b.page
      })
  }, [band, category, searchQuery, sort])

  const lowest = Math.min(...hampers.map((h) => h.price))
  const highest = Math.max(...hampers.map((h) => h.price))

  const isFiltered =
    category !== 'all' || band !== 'all' || searchQuery.trim().length > 0

  const resetFilters = () => {
    setCategory('all')
    setBand('all')
    setSearchQuery('')
    setSort('page-asc')
  }

  return (
    <div className="min-h-svh bg-background text-foreground antialiased selection:bg-gold/25 selection:text-primary">
      {/* 1. Festive Announcement Bar */}
      <div className="relative z-50 border-b border-gold/40 bg-primary px-4 py-2 text-center text-xs tracking-wide text-primary-foreground sm:text-sm">
        <div className="mx-auto flex max-w-content items-center justify-center gap-2">
          <Sparkles className="size-3.5 text-gold shrink-0" />
          <span>
            <strong className="text-gold">Aai's Kitchen:</strong>{' '}
            Homemade savouries and traditional laddus. Bringing delicious snacks to your family in Nagpur!
          </span>
          <a
            href={generalEnquiry}
            target="_blank"
            rel="noreferrer"
            className="ml-2 hidden rounded-full bg-gold/20 px-2.5 py-0.5 text-[0.7rem] font-semibold text-gold underline-offset-4 hover:underline md:inline"
          >
            Enquire Now →
          </a>
        </div>
      </div>

      {/* 2. Responsive Header */}
      <SiteHeader
        bagItemCount={totalBagCount}
        onOpenBag={() => setBagOpen(true)}
      />

      <main>
        {/* 3. Aai's Kitchen Hero Banner */}
<section className="overflow-hidden bg-[#fff4df]">
  <div className="mx-auto max-w-[1600px]">
    <img
      src="/img/aais-kitchen-hero.png"
      alt="Aai's Kitchen - Homemade Savouries and Laddus"
      className="block h-auto w-full"
      fetchPriority="high"
    />
  </div>

  <div className="flex flex-wrap justify-center gap-4 px-5 pb-10">
    <a
      href="#hampers"
      className="rounded-full bg-[#791b27] px-8 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#5f1420]"
    >
      Explore Our Products
    </a>

    <a
      href={generalEnquiry}
      target="_blank"
      rel="noreferrer"
      className="rounded-full border border-[#791b27] px-8 py-3.5 text-sm font-semibold text-[#791b27] transition hover:bg-[#791b27]/10"
    >
      Enquire on WhatsApp
    </a>
  </div>
</section>

        {/* 4. Promise Strip */}
        <div className="border-y border-gold/50 bg-card/90 shadow-xs">
          <ul className="mx-auto flex max-w-content flex-wrap items-center justify-center gap-x-8 gap-y-2.5 px-5 py-4 text-sm font-medium tracking-[0.15em] text-primary sm:text-base">
            {catalog.tagline.map((t, i) => (
              <li key={t} className="flex items-center gap-8">
                {i > 0 && <span className="text-gold">✦</span>}
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 5. Why Choose Sweet-O-Clock Section */}
        <section
  id="why-us"
  className="mx-auto max-w-content scroll-mt-20 px-5 py-20 sm:px-8"
>
  <div className="text-center">
    <p className="text-xs tracking-[0.35em] text-gold uppercase">
      The Aai's Kitchen Difference
    </p>
    <h2 className="mt-3 font-display text-3xl text-primary sm:text-4xl lg:text-5xl">
      Simple, Traditional & Made with Care
    </h2>
    <p className="mx-auto mt-4 max-w-2xl font-elegant text-lg text-foreground/80 sm:text-xl">
      Discover delicious savouries and traditional treats from Aai's Kitchen.
      Explore our selection of Multigrain Sev, Masala Besan Sev and Mewa Laddu,
      prepared with care in Nagpur.
    </p>
  </div>

  <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
    <WhyUsCard
      icon={Heart}
      title="Made with Care"
      description="Every product is prepared with care to bring delicious snacks and traditional treats to your table."
    />
    <WhyUsCard
      icon={Award}
      title="Traditional Favourites"
      description="Enjoy familiar Indian snack flavours and traditional treats from Aai's Kitchen."
    />
    <WhyUsCard
      icon={Gift}
      title="Something for Everyone"
      description="Choose from savoury Multigrain Sev, Masala Besan Sev and delicious Mewa Laddu."
    />
    <WhyUsCard
      icon={ShieldCheck}
      title="Nagpur Delivery"
      description="We accept enquiries for orders and delivery in Nagpur and nearby areas through WhatsApp."
    />
  </div>
</section>

        {/* 6. Hampers Collection Section */}
        <section
          id="hampers"
          className="mx-auto max-w-content scroll-mt-20 px-5 py-16 sm:px-8"
        >
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="text-xs tracking-[0.35em] text-gold uppercase">
                Browse The Collection
              </p>
              <h2 className="mt-2 font-display text-4xl text-primary sm:text-5xl">
                Diwali Gift Hampers
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Showing {visible.length} of {hampers.length} hampers
              </p>
            </div>

            {/* Sort & Search Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-56 flex-1 sm:w-64">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search sweets, nuts, diyas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-md border border-input bg-card py-2 pr-8 pl-9 text-sm text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOrder)}
                className="rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <option value="page-asc">Catalog order</option>
                <option value="price-asc">Price: Low to high</option>
                <option value="price-desc">Price: High to low</option>
              </select>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="mt-8 flex flex-wrap gap-2 border-b border-border/80 pb-4">
            {hamperCategories.map((cat) => {
              const count =
                cat.id === 'all'
                  ? hampers.length
                  : hampers.filter((h) => getHamperCategory(h) === cat.id)
                      .length
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={cn(
                    'rounded-full px-4 py-2 text-xs font-medium tracking-wide transition sm:text-sm',
                    category === cat.id
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'border border-border bg-card text-foreground/80 hover:border-gold hover:text-primary',
                  )}
                >
                  {cat.label} ({count})
                </button>
              )
            })}
          </div>

          {/* Price Bands Filter */}
          <div
            role="group"
            aria-label="Filter by price band"
            className="mt-4 flex flex-wrap items-center gap-2"
          >
            <span className="text-xs text-muted-foreground">Price range:</span>
            {priceBands.map((b) => {
              const count = hampers.filter(
                (h) => h.price >= b.min && h.price <= b.max,
              ).length
              return (
                <button
                  key={b.id}
                  type="button"
                  aria-pressed={band === b.id}
                  onClick={() => setBand(b.id)}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-xs transition',
                    band === b.id
                      ? 'border-primary bg-primary/10 font-semibold text-primary'
                      : 'border-border/70 bg-card text-muted-foreground hover:border-gold hover:text-foreground',
                  )}
                >
                  {b.label} <span className="opacity-60">({count})</span>
                </button>
              )
            })}

            {isFiltered && (
              <button
                type="button"
                onClick={resetFilters}
                className="ml-auto text-xs text-accent underline-offset-4 hover:underline"
              >
                Reset all filters
              </button>
            )}
          </div>

          {/* Product Grid */}
          {visible.length === 0 ? (
            <div className="mt-12 rounded-xl border border-dashed border-border bg-card/50 p-12 text-center">
              <Sparkles className="mx-auto size-8 text-gold" />
              <h3 className="mt-4 font-display text-xl text-primary">
                No hampers found
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                No hampers match the selected filters or search query.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-6 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((h) => (
                <li key={h.slug}>
                  <HamperCard
                    hamper={h}
                    onOpen={() => setSelected(h)}
                    onAddToBag={handleAddToBag}
                  />
                </li>
              ))}
            </ul>
          )}

          <div className="mt-10 rounded-lg border border-gold/40 bg-card p-4 text-center sm:p-6">
            <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm italic">
              {catalog.priceNote}
            </p>
          </div>
        </section>

        {/* 7. Brand Story Section */}
        <section
          id="story"
          className="scroll-mt-20 bg-primary text-primary-foreground"
        >
          <div className="mx-auto grid max-w-content gap-12 px-5 py-20 sm:px-8 md:grid-cols-[0.8fr_1.2fr] md:items-center">
            <div className="flex flex-col items-center text-center md:items-start md:text-left">
              <div className="rounded-full bg-background p-3 shadow-md">
                <img
                  src="/img/Logo.jpeg"
                  alt="Aai's Kitchen logo"
                  width={140}
                  height={126}
                  className="size-28 object-contain"
                />
              </div>
              <p className="mt-6 text-xs tracking-[0.35em] text-gold uppercase">
                {about.eyebrow}
              </p>
              <h2 className="mt-2 font-display text-4xl sm:text-5xl">
                {about.heading}
              </h2>
              <div className="mt-4 h-px w-20 bg-gold" />
            </div>

            <div className="space-y-6 font-elegant text-xl leading-relaxed text-primary-foreground/90 sm:text-2xl">
              {about.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}

              <div className="mt-6 flex flex-wrap gap-2 pt-2">
                {contact.branches.map((b) => (
                  <span
                    key={b}
                    className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-3.5 py-1 text-xs font-sans tracking-wide text-gold"
                  >
                    <MapPin className="size-3" /> Nagpur · {b}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 8. Custom & Corporate Orders */}
        <section
          id="corporate"
          className="mx-auto max-w-content scroll-mt-20 px-5 py-20 sm:px-8"
        >
          <div className="relative overflow-hidden rounded-2xl border border-gold/70 bg-gradient-to-r from-card via-card to-gold/10 p-8 shadow-sm sm:p-12 md:grid-cols-[1.4fr_1fr] md:items-center lg:p-16">
            <div className="max-w-2xl">
              <span className="text-xs font-semibold tracking-[0.25em] text-gold uppercase">
                Corporate &amp; Bulk Gifting
              </span>
              <h2 className="mt-3 font-script text-5xl leading-tight text-primary sm:text-6xl">
                Customise for Your Organisation
              </h2>
              <p className="mt-4 font-elegant text-xl leading-relaxed text-foreground/85">
                Every hamper can be customised to your exact requirements,
                dietary preferences, and budget. Personalisation, bespoke
                festive greeting cards, and corporate company branding are
                available.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a
                  href={corporateEnquiry}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-sm font-medium text-accent-foreground shadow-md transition hover:bg-accent/90 focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <MessageCircle className="size-4" /> Request Corporate Quote
                </a>
                <a
                  href={`tel:+91${contact.phones[0]}`}
                  className="inline-flex items-center gap-2 rounded-full border border-primary px-6 py-3.5 text-sm font-medium text-primary transition hover:bg-primary/5"
                >
                  <Phone className="size-4" /> Call: {contact.phones[0]}
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* 9. Festive FAQ Section */}
        <section
          id="faq"
          className="mx-auto max-w-reading scroll-mt-20 px-5 py-20 sm:px-8"
        >
          <div className="text-center">
            <p className="text-xs tracking-[0.35em] text-gold uppercase">
              Frequently Asked Questions
            </p>
            <h2 className="mt-2 font-display text-3xl text-primary sm:text-4xl">
              Everything You Need to Know
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Clear, authentic answers about ordering, ingredients, and delivery
            </p>
          </div>

          <Accordion
            type="single"
            collapsible
            className="mt-10 divide-y divide-border"
          >
            {faqs.map((faq, i) => (
              <AccordionItem key={faq.q} value={`faq-${i}`}>
                <AccordionTrigger className="text-base font-medium text-primary hover:text-accent">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="font-elegant text-lg leading-relaxed text-foreground/80">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* 10. Contact Section */}
        <section
  id="contact"
  className="scroll-mt-20 border-t border-border bg-card/60"
>
  <div className="mx-auto max-w-content px-5 py-20 sm:px-8">
    <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
      <div>
        <p className="text-xs tracking-[0.35em] text-gold uppercase">
          Connect With Aai&apos;s Kitchen
        </p>
        <h2 className="mt-2 font-display text-4xl text-primary sm:text-5xl">
          Get in Touch
        </h2>
      </div>

      <p className="max-w-md font-elegant text-xl text-foreground/80">
        Have questions about our products or want to place an order?
        We would love to hear from you.
      </p>
    </div>

    <dl className="mt-12 grid gap-10 sm:grid-cols-2">
      <ContactItem label="WhatsApp Orders & Enquiries">
        <a
          href={generalEnquiry}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 hover:text-primary"
        >
          <MessageCircle className="size-4 text-gold shrink-0" />
          <span>+91 9890122457</span>
        </a>
      </ContactItem>

      <ContactItem label="Our Location">
        <span className="flex items-center gap-2 font-medium">
          <MapPin className="size-4 text-gold shrink-0" />
          <span>Nagpur, Maharashtra</span>
        </span>
        <span className="block text-xs text-muted-foreground">
          Delivery enquiries for Nagpur and nearby areas.
        </span>
      </ContactItem>
    </dl>
  </div>
</section>

        
      </main>

      {/* 12. Rich Footer */}
      <footer className="border-t border-gold/50 bg-card">
        <div className="mx-auto max-w-content px-5 py-12 sm:px-8">
          <div className="grid gap-10 md:grid-cols-4">
            <div className="space-y-4 md:col-span-2">
              <div className="flex items-center gap-3">
                <img
                  src="/img/Logo.jpeg"
                  alt="Aai's Kitchen"
                  width={48}
                  height={44}
                  className="size-12 object-contain"
                />
                <div>
  <h3 className="font-display text-lg font-semibold text-primary">
    Aai&apos;s Kitchen
  </h3>
  <p className="text-xs text-muted-foreground">
    Healthy Snacks · Nagpur
  </p>
</div>
</div>

<p className="max-w-md font-elegant text-base leading-relaxed text-foreground/80">
  Discover delicious savouries and traditional treats from Aai&apos;s
  Kitchen. Explore our Multigrain Sev, Masala Besan Sev and Mewa Laddu,
  made with care.
</p>
</div>

            <div>
  <p className="text-xs font-semibold tracking-wider text-gold uppercase">
    Quick Navigation
  </p>
  <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
    <li>
      <a href="#hampers" className="hover:text-primary">
        Our Products
      </a>
    </li>
    <li>
      <a href="#why-us" className="hover:text-primary">
        Why Choose Us
      </a>
    </li>
    <li>
      <a href="#story" className="hover:text-primary">
        About Us
      </a>
    </li>
    <li>
      <a href="#faq" className="hover:text-primary">
        FAQs
      </a>
    </li>
    <li>
      <a href="#contact" className="hover:text-primary">
        Contact Us
      </a>
    </li>
  </ul>
</div>

            <div>
  <p className="text-xs font-semibold tracking-wider text-gold uppercase">
    Get in Touch
  </p>

  <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
    <li>
      <a
        href={generalEnquiry}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-2 hover:text-primary"
      >
        <MessageCircle className="size-4 text-gold" />
        WhatsApp: +91 9890122457
      </a>
    </li>

    <li className="flex items-center gap-2">
      <MapPin className="size-4 text-gold" />
      Nagpur, Maharashtra
    </li>

    <li className="pt-1 text-xs">
      Delivery enquiries for Nagpur and nearby areas.
    </li>
  </ul>
</div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
  <span>
    &copy; {new Date().getFullYear()} Aai&apos;s Kitchen · All rights
    reserved.
  </span>

  <span>Handcrafted with love ❤️</span>

  <span>
    Powered by{" "}
    <strong className="text-foreground">
      Dreams Digital Technologies
    </strong>
  </span>
</div>
        </div>
      </footer>

      {/* 13. Dialogs & Drawers */}
      <HamperDialog
        hamper={selected}
        onOpenChange={(open) => !open && setSelected(null)}
        onAddToBag={handleAddToBag}
      />

      <InquiryBagSheet
        open={bagOpen}
        onOpenChange={setBagOpen}
        items={bagItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearBag={handleClearBag}
      />
    </div>
  )
}

function SiteHeader({
  bagItemCount,
  onOpenBag,
}: {
  bagItemCount: number
  onOpenBag: () => void
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-content items-center justify-between gap-4 px-5 py-3 sm:px-8">
        <a href="#" className="flex items-center gap-3">
          <img
            src="/img/Logo.jpeg"
            alt="Aai's Kitchen"
            width={44}
            height={40}
            className="size-11 object-contain"
          />
          <div className="flex flex-col">
            <span className="text-xs font-semibold tracking-[0.25em] text-primary uppercase sm:text-sm">
              Aai&apos;s Kitchen
            </span>
            <span className="text-[0.65rem] tracking-wider text-gold uppercase">
              Healthy Snacks
            </span>
          </div>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 text-sm font-medium lg:flex">
  <a href="#hampers" className="text-foreground/80 hover:text-primary">
    Our Products
  </a>

  <a href="#why-us" className="text-foreground/80 hover:text-primary">
    Why Choose Us
  </a>

  <a href="#story" className="text-foreground/80 hover:text-primary">
    About Us
  </a>

  <a href="#faq" className="text-foreground/80 hover:text-primary">
    FAQs
  </a>

  <a href="#contact" className="text-foreground/80 hover:text-primary">
    Contact
  </a>
</nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Inquiry Bag Trigger */}
          <button
            type="button"
            onClick={onOpenBag}
            className="relative flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-2 text-xs font-medium text-primary shadow-2xs transition hover:border-gold hover:bg-gold/5"
            title="Open Festive Inquiry Bag"
          >
            <ShoppingBag className="size-4" />
            <span className="hidden sm:inline">Cart</span>
            {bagItemCount > 0 && (
              <span className="flex size-5 items-center justify-center rounded-full bg-accent text-[0.65rem] font-bold text-accent-foreground">
                {bagItemCount}
              </span>
            )}
          </button>

          {/* Quick WhatsApp Link */}
          <a
            href={generalEnquiry}
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-medium text-primary-foreground shadow-xs transition hover:bg-primary/90 sm:inline-flex"
          >
            <MessageCircle className="size-4" />
            <span>WhatsApp</span>
          </a>

          {/* Mobile Menu Trigger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="flex size-9 items-center justify-center rounded-md border border-border bg-card text-foreground lg:hidden"
            aria-label="Open mobile navigation"
          >
            <Menu className="size-5" />
          </button>
        </div>
      </div>

      {/* Mobile Menu Sheet */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent
          side="left"
          className="flex w-full flex-col bg-background sm:max-w-xs"
        >
          <SheetHeader className="border-b border-border pb-4 text-left">
            <div className="flex items-center gap-3">
              <img
                src="/img/Logo.jpeg"
                alt="Aai's Kitchen"
                className="size-10 object-contain"
              />
              <div>
                <SheetTitle className="font-display text-lg text-primary">
                  Aai&apos;s Kitchen
                </SheetTitle>
                <p className="text-xs text-muted-foreground">
                  Healthy Snacks
                </p>
              </div>
            </div>
          </SheetHeader>

          <nav className="flex-1 space-y-1 py-4 text-base font-medium">
            <MobileNavLink
              href="#hampers"
              onClick={() => setMobileMenuOpen(false)}
            >
              Our Products
            </MobileNavLink>
            <MobileNavLink
              href="#why-us"
              onClick={() => setMobileMenuOpen(false)}
            >
              Why Aai&apos;s Kitchen
            </MobileNavLink>
            <MobileNavLink
              href="#story"
              onClick={() => setMobileMenuOpen(false)}
            >
              Our Story
            </MobileNavLink>
            <MobileNavLink
              href="#corporate"
              onClick={() => setMobileMenuOpen(false)}
            >
              Corporate Orders
            </MobileNavLink>
            <MobileNavLink href="#faq" onClick={() => setMobileMenuOpen(false)}>
              FAQs
            </MobileNavLink>
            <MobileNavLink
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact &amp; Branches
            </MobileNavLink>
          </nav>

          <div className="border-t border-border pt-4">
            <p className="text-xs font-semibold tracking-wider text-gold uppercase">
              Nagpur Branches
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {contact.branches.join(' · ')}
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <a
                href={generalEnquiry}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 rounded-full bg-primary py-2.5 text-xs font-medium text-primary-foreground"
              >
                <MessageCircle className="size-4" /> Message on WhatsApp
              </a>
              <a
                href="/downloads/sweet-oclock-diwali-2026-catalog.pdf"
                download
                className="flex items-center justify-center gap-2 rounded-full border border-border py-2 text-xs font-medium text-foreground hover:border-gold"
              >
                <Download className="size-3.5" /> Download PDF (18 Pgs)
              </a>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  )
}

function MobileNavLink({
  href,
  children,
  onClick,
}: {
  href: string
  children: React.ReactNode
  onClick: () => void
}) {
  return (
    <a
      href={href}
      onClick={onClick}
      className="flex items-center justify-between rounded-md px-3 py-2.5 text-foreground/90 transition hover:bg-primary/5 hover:text-primary"
    >
      <span>{children}</span>
      <ChevronRight className="size-4 text-muted-foreground" />
    </a>
  )
}

function WhyUsCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
}) {
  return (
    <div className="rounded-xl border border-border/80 bg-card p-6 shadow-xs transition duration-300 hover:-translate-y-1 hover:border-gold hover:shadow-md">
      <div className="flex size-12 items-center justify-center rounded-full border border-gold/40 bg-gold/10 text-primary">
        <Icon className="size-6 text-gold" />
      </div>
      <h3 className="mt-5 font-display text-xl text-primary">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  )
}

function ContactItem({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <dt className="text-xs tracking-[0.25em] text-gold uppercase">{label}</dt>
      <dd className="mt-3 space-y-1.5 text-base sm:text-lg">{children}</dd>
    </div>
  )
}

function DownloadLink({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  return (
    <a
      href={href}
      download
      className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-medium transition hover:border-gold hover:text-primary"
    >
      <Download className="size-3.5" /> {children}
    </a>
  )
}

