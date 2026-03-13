export type DeploymentType = 'web_app' | 'mobile_app' | 'api' | 'desktop' | 'saas_platform'
export type AppStatus = 'available' | 'beta' | 'coming_soon'
export type Complexity = 'starter' | 'standard' | 'enterprise'
export type ProjectStatus =
  | 'submitted'
  | 'reviewing'
  | 'quoted'
  | 'approved'
  | 'building'
  | 'testing'
  | 'delivered'
  | 'cancelled'

export interface Category {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  aisle: number
  color: string
  appCount: number
}

export interface Vendor {
  id: string
  name: string
  logoUrl: string
  verified: boolean
  description: string
  appCount: number
  deliveredProjects: number
  rating: number
}

export interface App {
  id: string
  vendorId: string
  vendor: Vendor
  categoryId: string
  category: Category
  name: string
  slug: string
  tagline: string
  description: string
  logoUrl?: string
  screenshots?: string[]
  /** Starting price for a custom build — null = "Get a Quote" */
  startingPrice: number | null
  complexity: Complexity
  buildTime: string          // e.g. "2–4 weeks"
  deploymentType: DeploymentType
  techStack: string[]        // e.g. ["React", "Node.js", "PostgreSQL"]
  features: string[]         // bullet list of what's included
  sampleUrl: string          // live demo / interactive preview URL
  rating: number
  reviewCount: number
  deliveredCount: number     // how many times this has been built for clients
  featured: boolean
  newArrival: boolean
  tags: string[]
  status: AppStatus
}

export interface Review {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  appId: string
  rating: number
  title: string
  body: string
  helpfulCount: number
  createdAt: string
  verified: boolean
}

// A user "adds to tray" = expresses interest in getting an app built
export interface BuildRequest {
  app: App
  addedAt: string
}

// The full inquiry form submitted when requesting a build
export interface ProjectInquiry {
  appId: string
  name: string
  email: string
  company?: string
  requirements: string
  budgetRange: string
  timeline: string
  preferredStack?: string
}

// A project in the client's dashboard after inquiry is submitted
export interface Project {
  id: string
  userId: string
  app: App
  status: ProjectStatus
  submittedAt: string
  quotedPrice?: number
  estimatedDelivery?: string
  deliveredUrl?: string
  notes?: string
}

export interface User {
  id: string
  email: string
  fullName?: string
  avatarUrl?: string
  role: 'customer' | 'vendor' | 'admin'
}
