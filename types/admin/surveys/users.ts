export interface Organization {
    id: string | null
    name: string | null
  }
  
  export interface Employee {
    id: string
    name: string
    userId: string
    number: string
    createdAt: string
    updatedAt: string
    deletedAt: string | null
    companyId: string
    organizationId: string | null
    organization: Organization | null
  }
  
  export interface User {
    id: string
    loginId: string
    email: string
    avatar: string | null
    role: string
    createdAt: string
    updatedAt: string
    deletedAt: string | null
    employee: Employee
    // 必要に応じて他のフィールドを追加
  }
  
  export interface UserOption {
    value: string
    label: string
    group?: string // 組織でグループ化する場合に使用
  }
  
  