import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  CreditCard,
  Eye,
  LayoutDashboard,
  MessageSquare,
  Plus,
  Send,
  Settings,
  Smartphone,
  Users,
} from 'lucide-react'
import { APPS } from '../data/mockData'
import { useCart } from '../contexts/CartContext'
import { Badge } from '../components/ui/Badge'
import { formatStartingPrice, getInitials } from '../lib/utils'

type DemoView = 'customer' | 'operator' | 'admin'

interface DemoField {
  label: string
  value: string
  type?: 'text' | 'date' | 'time' | 'select' | 'textarea' | 'money'
}

function getDemoCopy(appName: string, tags: string[]) {
  const has = (tag: string) => tags.includes(tag)

  if (has('restaurant')) {
    return {
      primaryUser: 'Hungry customer',
      operatorUser: 'Kitchen team',
      requestLabel: 'Place pickup order',
      requestTitle: 'Order from the live menu',
      inputOne: 'Hot honey chicken sandwich',
      inputTwo: 'Pickup at 6:30 PM',
      fields: [
        { label: 'Order mode', value: 'Pickup - ASAP', type: 'select' as const },
        { label: 'Guest name', value: 'Maya Johnson' },
        { label: 'Guest phone', value: '(404) 555-0188' },
        { label: 'Menu item', value: 'Hot honey chicken sandwich combo' },
        { label: 'Modifiers', value: 'No pickles, extra sauce, add bacon' },
        { label: 'Side / drink', value: 'Cajun fries + sweet tea', type: 'select' as const },
        { label: 'Pickup time', value: '6:30 PM', type: 'time' as const },
        { label: 'Promo code', value: 'LUNCH10' },
        { label: 'Tip', value: '$3.00', type: 'money' as const },
        { label: 'Kitchen note', value: 'Customer has a mild onion allergy. Bag sauces separately.', type: 'textarea' as const },
      ],
      queueTitle: 'Kitchen queue',
      queueItems: [
        '#1048 - Hot honey combo - due 6:30 PM',
        '#1047 - Family wing tray - preparing',
        '#1046 - Two bowls - ready for pickup',
      ],
      metrics: ['42 orders today', '$1,840 revenue', '18 min avg prep'],
    }
  }

  if (has('barber') || has('salon')) {
    return {
      primaryUser: 'Returning client',
      operatorUser: 'Barber',
      requestLabel: 'Book appointment',
      requestTitle: 'Choose service and time',
      inputOne: 'Fade + beard trim',
      inputTwo: 'Saturday at 10:30 AM',
      fields: [
        { label: 'Service', value: 'Fade + beard trim', type: 'select' as const },
        { label: 'Preferred barber', value: 'Andre' },
        { label: 'Appointment date', value: 'Saturday, July 11', type: 'date' as const },
        { label: 'Appointment time', value: '10:30 AM', type: 'time' as const },
        { label: 'Deposit', value: '$20.00', type: 'money' as const },
      ],
      queueTitle: 'Today\'s chair schedule',
      queueItems: ['10:30 AM - Marcus J.', '11:15 AM - Lineup', '12:00 PM - New client'],
      metrics: ['16 bookings today', '$320 deposits', '4.9 client rating'],
    }
  }

  if (has('cleaning')) {
    return {
      primaryUser: 'Homeowner',
      operatorUser: 'Cleaning coordinator',
      requestLabel: 'Request cleaning quote',
      requestTitle: 'Schedule a cleaning visit',
      inputOne: '3 bedroom home',
      inputTwo: 'Biweekly cleaning',
      fields: [
        { label: 'Service address', value: '1840 Peachtree Rd NE, Atlanta, GA 30309' },
        { label: 'Property type', value: 'House', type: 'select' as const },
        { label: 'Bedrooms / bathrooms', value: '3 beds / 2 baths' },
        { label: 'Preferred date', value: 'Friday, July 17', type: 'date' as const },
        { label: 'Preferred arrival window', value: '9:00 AM - 11:00 AM', type: 'time' as const },
        { label: 'Access notes', value: 'Gate code 2048. Please bring pet-safe products.', type: 'textarea' as const },
      ],
      queueTitle: 'Cleaning schedule',
      queueItems: ['Quote request needs estimate', 'Crew assigned to Midtown job', 'Before/after photos uploaded'],
      metrics: ['19 jobs this week', '$7,850 scheduled', '12 recurring clients'],
    }
  }

  if (has('delivery') || has('courier') || has('rideshare')) {
    return {
      primaryUser: has('rideshare') ? 'Rider' : 'Sender',
      operatorUser: has('rideshare') ? 'Dispatcher' : 'Dispatch team',
      requestLabel: has('rideshare') ? 'Request ride' : 'Create delivery',
      requestTitle: has('rideshare') ? 'Set pickup and destination' : 'Set pickup and drop-off',
      inputOne: has('rideshare') ? 'Airport terminal pickup' : 'Package pickup: Suite 240',
      inputTwo: has('rideshare') ? 'Downtown hotel' : 'Drop-off by 4:00 PM',
      fields: has('rideshare')
        ? [
            { label: 'Pickup address', value: '6000 N Terminal Pkwy, Atlanta, GA 30320' },
            { label: 'Destination address', value: '265 Peachtree St NE, Atlanta, GA 30303' },
            { label: 'Pickup time', value: 'Now', type: 'time' as const },
            { label: 'Vehicle type', value: 'Comfort SUV', type: 'select' as const },
            { label: 'Rider notes', value: 'Meet at domestic arrivals, Door S2', type: 'textarea' as const },
          ]
        : [
            { label: 'Pickup address', value: '75 5th St NW, Atlanta, GA 30308' },
            { label: 'Drop-off address', value: '101 Marietta St NW, Atlanta, GA 30303' },
            { label: 'Package type', value: 'Small parcel', type: 'select' as const },
            { label: 'Delivery deadline', value: 'Today by 4:00 PM', type: 'time' as const },
            { label: 'Recipient phone', value: '(404) 555-0194' },
            { label: 'Proof required', value: 'Photo + signature', type: 'select' as const },
          ],
      queueTitle: has('rideshare') ? 'Active rides' : 'Dispatch board',
      queueItems: has('rideshare')
        ? ['Driver assigned', 'Rider pickup in 7 min', 'Trip completed']
        : ['New courier request', 'Driver en route', 'Proof of delivery ready'],
      metrics: has('rideshare')
        ? ['24 rides today', '8 active drivers', '6 min avg pickup']
        : ['31 deliveries today', '11 active drivers', '97% on-time'],
    }
  }

  if (has('real-estate')) {
    return {
      primaryUser: 'Buyer lead',
      operatorUser: 'Agent',
      requestLabel: 'Request showing',
      requestTitle: 'Find and tour a property',
      inputOne: '3 bed under $450k',
      inputTwo: 'Tour this weekend',
      fields: [
        { label: 'Search area', value: 'Decatur, GA + 10 mile radius' },
        { label: 'Price range', value: '$350,000 - $450,000', type: 'money' as const },
        { label: 'Bedrooms / bathrooms', value: '3+ beds / 2+ baths' },
        { label: 'Property type', value: 'Single-family home', type: 'select' as const },
        { label: 'Preferred showing date', value: 'Saturday, July 18', type: 'date' as const },
        { label: 'Financing status', value: 'Pre-approved buyer', type: 'select' as const },
      ],
      queueTitle: 'Agent lead queue',
      queueItems: ['New showing request', 'Mortgage question', 'Saved search follow-up'],
      metrics: ['128 listing views', '14 new leads', '6 showings booked'],
    }
  }

  if (has('church') || has('community')) {
    return {
      primaryUser: 'Community member',
      operatorUser: 'Staff admin',
      requestLabel: 'Register for event',
      requestTitle: 'Join an event or group',
      inputOne: 'Sunday volunteer team',
      inputTwo: 'Add family members',
      fields: [
        { label: 'Event or group', value: 'Sunday volunteer team', type: 'select' as const },
        { label: 'Event date', value: 'Sunday, July 12', type: 'date' as const },
        { label: 'Attendees', value: '2 adults, 1 child' },
        { label: 'Volunteer role', value: 'Welcome desk', type: 'select' as const },
        { label: 'Prayer or care note', value: 'Please follow up about youth group registration.', type: 'textarea' as const },
      ],
      queueTitle: 'Engagement queue',
      queueItems: ['New event registration', 'Volunteer signup', 'Donation receipt sent'],
      metrics: ['312 active members', '48 event RSVPs', '$4,280 given'],
    }
  }

  if (has('school') || has('lessons')) {
    return {
      primaryUser: 'Parent or student',
      operatorUser: 'Instructor',
      requestLabel: 'Request lesson spot',
      requestTitle: 'Enroll a student',
      inputOne: 'Beginner piano lessons',
      inputTwo: 'Tuesdays after 5 PM',
      fields: [
        { label: 'Program', value: 'Piano - beginner', type: 'select' as const },
        { label: 'Student name', value: 'Jordan Carter' },
        { label: 'Student age', value: '11' },
        { label: 'Guardian name', value: 'Alicia Carter' },
        { label: 'Guardian phone', value: '(214) 555-0167' },
        { label: 'Guardian email', value: 'alicia@example.com' },
        { label: 'Skill level', value: 'Beginner - knows basic notes', type: 'select' as const },
        { label: 'Preferred instructor', value: 'Ms. Rivera', type: 'select' as const },
        { label: 'Preferred days', value: 'Tuesday or Thursday' },
        { label: 'Preferred time', value: 'After 5:00 PM', type: 'time' as const },
        { label: 'Package', value: '4-lesson starter pack', type: 'select' as const },
        { label: 'Student goals / notes', value: 'Wants to prepare for school talent show. Has a keyboard at home.', type: 'textarea' as const },
      ],
      queueTitle: 'Instructor schedule',
      queueItems: [
        'Jordan Carter - trial piano lesson request',
        'Mia Thompson - package renewal due',
        'Ethan Brooks - attendance note from Tuesday',
      ],
      metrics: ['84 enrolled students', '22 lessons this week', '$6,420 monthly revenue'],
    }
  }

  if (has('client-portal')) {
    return {
      primaryUser: 'Client',
      operatorUser: 'Account manager',
      requestLabel: 'Approve milestone',
      requestTitle: 'Review project status',
      inputOne: 'Website redesign',
      inputTwo: 'Approve homepage draft',
      fields: [
        { label: 'Project', value: 'Website redesign' },
        { label: 'Milestone', value: 'Homepage design approval', type: 'select' as const },
        { label: 'Due date', value: 'Friday, July 10', type: 'date' as const },
        { label: 'Uploaded file', value: 'homepage-v3.fig' },
        { label: 'Client decision', value: 'Approved with minor copy changes', type: 'select' as const },
        { label: 'Feedback', value: 'Use the second hero option and update the services section headline.', type: 'textarea' as const },
      ],
      queueTitle: 'Client approvals',
      queueItems: ['Milestone awaiting approval', 'New file uploaded', 'Invoice viewed'],
      metrics: ['18 active clients', '9 approvals pending', '92% on-time delivery'],
    }
  }

  if (has('dashboard') || has('admin') || has('internal-tools')) {
    return {
      primaryUser: 'Staff member',
      operatorUser: 'Operations manager',
      requestLabel: 'Create internal record',
      requestTitle: 'Manage an operational workflow',
      inputOne: 'New customer onboarding',
      inputTwo: 'Priority review',
      fields: [
        { label: 'Record type', value: 'Customer onboarding', type: 'select' as const },
        { label: 'Assigned team member', value: 'Operations Lead' },
        { label: 'Priority', value: 'High', type: 'select' as const },
        { label: 'Due date', value: 'Thursday, July 16', type: 'date' as const },
        { label: 'Linked customer', value: 'Acme Services LLC' },
        { label: 'Internal notes', value: 'Needs approval before billing account is activated.', type: 'textarea' as const },
      ],
      queueTitle: 'Internal work queue',
      queueItems: ['New onboarding record', 'Manager approval needed', 'Billing account ready'],
      metrics: ['126 records managed', '18 tasks open', '94% completion rate'],
    }
  }

  if (has('custom') || has('mvp')) {
    return {
      primaryUser: 'Founder',
      operatorUser: 'Product strategist',
      requestLabel: 'Create blueprint brief',
      requestTitle: 'Scope a custom app idea',
      inputOne: 'Local services marketplace',
      inputTwo: 'Need MVP in phases',
      fields: [
        { label: 'App idea', value: 'Marketplace for local service providers' },
        { label: 'Primary users', value: 'Customers, providers, platform admin' },
        { label: 'Core workflow', value: 'Customer requests service, provider quotes, admin tracks jobs', type: 'textarea' as const },
        { label: 'Launch target', value: 'MVP in 8 weeks', type: 'select' as const },
        { label: 'Budget range', value: '$10,000 - $25,000', type: 'money' as const },
      ],
      queueTitle: 'Blueprint review',
      queueItems: ['Idea submitted', 'Workflow map drafted', 'Build quote ready'],
      metrics: ['5 roles mapped', '18 features scoped', '3 launch phases'],
    }
  }

  return {
    primaryUser: 'Customer',
    operatorUser: 'Operations team',
    requestLabel: 'Submit request',
    requestTitle: `Try ${appName}`,
    inputOne: 'New customer workflow',
    inputTwo: 'Priority request',
    fields: [
      { label: 'Request type', value: 'New customer workflow', type: 'select' as const },
      { label: 'Preferred date', value: 'Friday, July 17', type: 'date' as const },
      { label: 'Preferred time', value: '2:00 PM', type: 'time' as const },
      { label: 'Customer notes', value: 'Please customize this flow around our current process.', type: 'textarea' as const },
    ],
    queueTitle: 'Operations queue',
    queueItems: ['New request received', 'Assigned to staff', 'Completed and reported'],
    metrics: ['126 records managed', '18 tasks open', '94% completion rate'],
  }
}

export function DemoPage() {
  const { slug } = useParams<{ slug: string }>()
  const app = APPS.find(a => a.slug === slug)
  const { addRequest, hasRequest } = useCart()
  const [view, setView] = useState<DemoView>('customer')
  const [step, setStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)

  const demo = useMemo(() => app ? getDemoCopy(app.name, app.tags) : null, [app])

  if (!app || !demo) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-depot-black">Demo not found</h1>
        <Link to="/store" className="text-depot-orange hover:underline mt-4 inline-block">Back to app catalog</Link>
      </div>
    )
  }

  const selectedApp = app

  const workflow = [
    { label: 'Request created', desc: `${demo.primaryUser} starts the workflow from the public app.` },
    { label: 'Team notified', desc: `${demo.operatorUser} sees the request immediately.` },
    { label: 'Status updated', desc: 'Customer and staff both see progress without extra calls.' },
    { label: 'Payment or approval', desc: 'Collect payment, deposit, approval, or next-step confirmation.' },
  ]

  function handleDemoSubmit() {
    setSubmitted(true)
    setStep(2)
  }

  function handleAddRequest() {
    addRequest(selectedApp)
  }

  function renderDemoField(field: DemoField) {
    const valueClass = 'w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm bg-stone-50 text-stone-700'

    return (
      <div key={field.label}>
        <label className="block text-xs font-bold text-stone-500 mb-1.5">{field.label}</label>
        {field.type === 'textarea' ? (
          <textarea value={field.value} readOnly rows={3} className={`${valueClass} resize-none`} />
        ) : (
          <div className="relative">
            <input value={field.value} readOnly className={valueClass} />
            {field.type && (
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] uppercase tracking-wide text-stone-400 bg-white border border-stone-200 rounded px-1.5 py-0.5">
                {field.type}
              </span>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-stone-50 min-h-screen">
      <section className="bg-depot-black text-white">
        <div className="h-1" style={{ backgroundColor: app.category.color }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link to={`/app/${app.slug}`} className="inline-flex items-center gap-1 text-stone-300 hover:text-white text-sm mb-6">
            <ArrowLeft size={14} /> Back to {app.name}
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-black text-lg"
                  style={{ backgroundColor: app.category.color }}
                >
                  {getInitials(app.name)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="orange">Live Sample</Badge>
                    <span className="text-xs text-stone-400">{app.category.name}</span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-black mt-1">{app.name} Demo</h1>
                </div>
              </div>
              <p className="text-stone-300 text-lg leading-relaxed">
                Click through the customer, operator, and admin sides of this template. This is the kind of working workflow your custom build starts from.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAddRequest}
                className="inline-flex items-center justify-center gap-2 bg-depot-orange hover:bg-depot-orange-dark text-white px-5 py-3 rounded-xl font-bold text-sm transition-colors"
              >
                <Plus size={16} /> {hasRequest(app.id) ? 'Added to Build Tray' : 'Request Customization'}
              </button>
              <Link
                to="/checkout"
                className="inline-flex items-center justify-center gap-2 bg-white text-depot-black hover:bg-stone-100 px-5 py-3 rounded-xl font-bold text-sm transition-colors"
              >
                <Send size={16} /> Submit Quote Request
              </Link>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-12 gap-6">
          <aside className="lg:col-span-3 space-y-4">
            <div className="bg-white border border-stone-200 rounded-xl p-4">
              <p className="text-xs font-bold text-stone-400 uppercase tracking-wide mb-3">Preview Mode</p>
              {[
                { id: 'customer' as DemoView, label: 'Customer App', icon: <Smartphone size={16} /> },
                { id: 'operator' as DemoView, label: 'Operator View', icon: <Users size={16} /> },
                { id: 'admin' as DemoView, label: 'Admin Dashboard', icon: <LayoutDashboard size={16} /> },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setView(item.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                    view === item.id ? 'bg-depot-orange text-white' : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  {item.icon} {item.label}
                </button>
              ))}
            </div>

            <div className="bg-white border border-stone-200 rounded-xl p-4">
              <p className="text-xs font-bold text-stone-400 uppercase tracking-wide mb-3">Workflow</p>
              <div className="space-y-2">
                {workflow.map((item, index) => (
                  <button
                    key={item.label}
                    onClick={() => setStep(index + 1)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      step === index + 1 ? 'border-depot-orange bg-orange-50' : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <span className="flex items-center gap-2 text-sm font-bold text-depot-black">
                      {step > index + 1 ? <CheckCircle size={14} className="text-emerald-500" /> : <Clock size={14} className="text-stone-400" />}
                      {item.label}
                    </span>
                    <span className="block text-xs text-stone-500 mt-1 leading-relaxed">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <section className="lg:col-span-6">
            <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
              <div className="border-b border-stone-200 px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-stone-400">Interactive sample</p>
                  <h2 className="font-black text-depot-black">
                    {view === 'customer' && demo.requestTitle}
                    {view === 'operator' && demo.queueTitle}
                    {view === 'admin' && 'Business command center'}
                  </h2>
                </div>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1">
                  Working preview
                </span>
              </div>

              {view === 'customer' && (
                <div className="p-5 space-y-5">
                  <div className="rounded-xl border border-stone-200 p-4">
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <label className="block text-xs font-bold text-stone-400 uppercase tracking-wide">Expected customer fields</label>
                      <span className="text-xs text-stone-400">{demo.fields.length} fields</span>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {demo.fields.map(renderDemoField)}
                    </div>
                    <button
                      onClick={handleDemoSubmit}
                      className="mt-4 w-full bg-depot-orange hover:bg-depot-orange-dark text-white rounded-lg py-3 font-bold text-sm transition-colors"
                    >
                      {demo.requestLabel}
                    </button>
                  </div>

                  {submitted && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 flex items-start gap-3">
                      <CheckCircle size={18} className="text-emerald-600 mt-0.5" />
                      <div>
                        <p className="font-bold text-emerald-800 text-sm">Sample request created</p>
                        <p className="text-emerald-700 text-xs mt-1">Now switch to Operator View to see how your team handles it.</p>
                      </div>
                    </div>
                  )}

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="border border-stone-200 rounded-xl p-4">
                      <CreditCard size={18} className="text-depot-orange mb-2" />
                      <p className="font-bold text-sm text-depot-black">Payment-ready</p>
                      <p className="text-xs text-stone-500 mt-1">Deposits, invoices, checkout, or approval steps can be wired in.</p>
                    </div>
                    <div className="border border-stone-200 rounded-xl p-4">
                      <MessageSquare size={18} className="text-depot-orange mb-2" />
                      <p className="font-bold text-sm text-depot-black">Notifications</p>
                      <p className="text-xs text-stone-500 mt-1">Email and SMS updates keep customers and staff in sync.</p>
                    </div>
                  </div>
                </div>
              )}

              {view === 'operator' && (
                <div className="p-5 space-y-4">
                  {demo.queueItems.map((item, index) => (
                    <div key={item} className="border border-stone-200 rounded-xl p-4 flex items-center justify-between gap-3">
                      <div>
                        <p className="font-bold text-sm text-depot-black">{item}</p>
                        <p className="text-xs text-stone-500 mt-1">
                          {index === 0 ? 'Needs review' : index === 1 ? 'Assigned and in progress' : 'Ready for customer update'}
                        </p>
                      </div>
                      <button
                        onClick={() => setStep(Math.min(index + 2, 4))}
                        className="px-3 py-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-colors"
                      >
                        Update
                      </button>
                    </div>
                  ))}
                  <div className="bg-stone-900 text-white rounded-xl p-4">
                    <p className="text-xs text-stone-400 mb-2">Internal note</p>
                    <p className="text-sm">Every field, status, role, and workflow can be customized around how your team actually works.</p>
                  </div>
                </div>
              )}

              {view === 'admin' && (
                <div className="p-5 space-y-5">
                  <div className="grid sm:grid-cols-3 gap-3">
                    {demo.metrics.map(metric => (
                      <div key={metric} className="border border-stone-200 rounded-xl p-4">
                        <p className="text-lg font-black text-depot-black">{metric.split(' ').slice(0, -1).join(' ')}</p>
                        <p className="text-xs text-stone-500 mt-1">{metric.split(' ').slice(-1)[0]}</p>
                      </div>
                    ))}
                  </div>

                  <div className="border border-stone-200 rounded-xl p-4 space-y-3">
                    <p className="font-bold text-depot-black text-sm flex items-center gap-2">
                      <Settings size={16} className="text-depot-orange" /> Customization switches
                    </p>
                    {app.features.slice(0, 5).map(feature => (
                      <div key={feature} className="flex items-center justify-between gap-3 text-sm">
                        <span className="text-stone-600">{feature}</span>
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-1">
                          Included
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          <aside className="lg:col-span-3 space-y-4">
            <div className="bg-white border border-stone-200 rounded-xl p-5">
              <Eye size={22} className="text-depot-orange mb-3" />
              <h3 className="font-black text-depot-black mb-2">What this proves</h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                This is not a static screenshot. It shows the roles, states, and handoffs that matter in a real app build.
              </p>
            </div>

            <div className="bg-white border border-stone-200 rounded-xl p-5">
              <p className="text-sm text-stone-500 mb-1">Starting at</p>
              <p className="text-2xl font-black text-depot-black">{formatStartingPrice(app)}</p>
              <p className="text-xs text-stone-400 mt-1">{app.buildTime} typical build time</p>
              <button
                onClick={handleAddRequest}
                className="mt-4 w-full bg-depot-orange hover:bg-depot-orange-dark text-white rounded-xl py-3 font-bold text-sm transition-colors"
              >
                {hasRequest(app.id) ? 'Added to Build Tray' : 'Customize This App'}
              </button>
              <Link
                to="/cart"
                className="mt-2 block text-center text-sm text-depot-orange hover:underline"
              >
                View Build Tray
              </Link>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
