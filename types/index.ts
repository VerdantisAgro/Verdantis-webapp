// Dashboard Image Type
export interface DashboardImage {
  src: string
  title: string
  description: string
}

// Crop Status Type
export type CropStatus = "Em Crescimento" | "Plantio" | "Pronto" | "Colheita"

// User Role Type
export type UserRole = "produtor" | "gestor"

// Crop Data Interface
export interface CropData {
  id: string
  name: string
  lot: string
  farm: string
  status: CropStatus
  plantingDate: string
  harvestDate: string
  area: number
  daysUntilHarvest: number
  progress: number
  irrigation: boolean
  weather: boolean
}

// Farm Property Interface
export interface FarmProperty {
  id: string
  name: string
  area: number
  location: string
  crops: CropData[]
}

// Producer Stats Interface
export interface ProducerStats {
  totalArea: number
  properties: number
  activeCrops: number
  nextHarvest: {
    days: number
    crop: string
    lot: string
  }
  productivity: number
}

// Manager Stats Interface
export interface ManagerStats {
  totalProducers: number
  totalArea: number
  activeCrops: number
  averageProductivity: number
}

// Top Producer Interface
export interface TopProducer {
  rank: number
  name: string
  area: number
  mainCrop: string
}

// Crop Distribution Interface
export interface CropDistribution {
  name: string
  percentage: number
  area: number
  producers: number
  activeLots: number
  productivity: number
}

// Regional Distribution Interface
export interface RegionalDistribution {
  state: string
  area: number
  percentage: number
}

// Sustainability Metrics Interface
export interface SustainabilityMetrics {
  waterReduction: number
  co2Reduction: number
  activeCertifications: number
}

// Certification Data Interface
export interface CertificationData {
  name: string
  farms: number
  percentage: number
}

// Environmental Impact Interface
export interface EnvironmentalImpact {
  metric: string
  reduction: number
  progress: number
}

// Alert Type
export type AlertType = "warning" | "success" | "info"

// Alert Interface
export interface Alert {
  id: string
  type: AlertType
  title: string
  description: string
  icon: string
}

// Weather Data Interface
export interface WeatherData {
  temperature: number
  condition: string
  humidity: number
  windSpeed: number
}

// Login Form Data Interface
export interface LoginFormData {
  email: string
  password: string
  role: UserRole | null
  rememberMe: boolean
}

// Chart Data Point Interface
export interface ChartDataPoint {
  month: string
  value: number
}
