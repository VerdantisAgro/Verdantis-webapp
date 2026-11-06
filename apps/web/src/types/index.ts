// User Role Type - Only Farmer
export type UserRole = "produtor"

// Lot Interface with profitability (no property reference)
export interface Lote {
  id: string
  name: string
  crop: string
  production: number
  cost: number
  salePrice: number
  revenue: number
  profit: number
  margin: number
  status: "Ativo" | "Finalizado" | "Em Preparo"
  area?: number
}

// Lot Form Data (solid, real-world fields only)
export interface LoteFormData {
  name: string
  cropId: string
  production: number
  cost: number
  salePrice: number
}

// KPI Card Props
export interface KpiCardProps {
  title: string
  value: string
  description?: string
  icon: React.ReactNode
  trend?: {
    value: number
    label: string
  }
  variant?: "default" | "success" | "danger" | "warning"
}

// Stat Card Props
export interface StatCardProps {
  title: string
  value: string
  icon: React.ReactNode
  description?: string
  variant?: "default" | "success" | "danger"
}

// Chart Card Props
export interface ChartCardProps {
  title: string
  description?: string
  children: React.ReactNode
}

// Crop Market Data for Analytics
export interface CropMarketData {
  id: string
  name: string
  imageUrl: string
  pricePerSack: number
  priceMin?: number
  priceMax?: number
  unit?: string
  priceTrend: "up" | "down" | "stable"
}

// Crop Data Interface
export type CropStatus = "Em Crescimento" | "Plantio" | "Pronto" | "Colheita"

export interface CropData {
  id: string
  name: string
  lot: string
  status: CropStatus
  plantingDate: string
  harvestDate: string
  area: number
  daysUntilHarvest?: number
  progress?: number
  irrigation?: boolean
  weather?: boolean
}

// Cultivo (Cultivation) Interface - no property reference
export interface Cultivo extends CropData {
  loteId: string
  variety: string
  expectedYield: number
  actualYield?: number
  notes?: string
  isComplete?: boolean
  traceabilityHash?: TraceabilityHash
  events?: TraceabilityEvent[]
}

export interface CultivoFormData {
  name: string
  loteId: string
  variety: string
  plantingDate: string
  harvestDate: string
  area: number
  expectedYield: number
  notes?: string
}

// Traceability Event System
export type TraceabilityEventType = 
  | "INPUT_ADDITION" 
  | "IRRIGATION" 
  | "HARVEST" 
  | "PEST_CONTROL"
  | "SOIL_PREPARATION"
  | "PRUNING"
  | "FERTILIZATION"
  | "INSPECTION"
  | "OTHER"

export interface TraceabilityEvent {
  id: string
  lotId: string
  type: TraceabilityEventType
  description: string
  timestamp: Date
}

export interface TraceabilityHash {
  lotId: string
  hash: string
  generatedAt: Date
  eventCount: number
}

// Chart Data Types
export interface ProfitByLotData {
  name: string
  lucro: number
  custo: number
  receita: number
}

export interface ProfitOverTimeData {
  month: string
  lucro: number
}

export interface ProfitByCropData {
  crop: string
  lucro: number
}

// Profile
export interface UserProfile {
  name: string
  email: string
  phone: string
  location: string
  bio: string
  memberSince: string
}

// Simulation Types
export interface SimulationLot {
  id: string
  name: string
  isTemporary: boolean
  area: number
  crop: string
}

export interface SimulationScenario {
  id: string
  name: string
  lot: SimulationLot
  estimatedYield: number
  estimatedPrice: number
  estimatedCost: number
  laborCost: number
  inputCost: number
  otherCosts: number
  createdAt: Date
}

export interface SimulationResult {
  id: string
  scenario: SimulationScenario
  totalRevenue: number
  totalCost: number
  profit: number
  margin: number
  roi: number
  breakEvenPrice: number
  breakEvenYield: number
}
