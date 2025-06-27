// Simple validation functions without external dependencies

export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

export function validateTransactionData(data: {
  description: string
  amount: number
  type: string
  category: string
  date: string
}): ValidationResult {
  const errors: Record<string, string> = {}

  if (!data.description || data.description.trim().length === 0) {
    errors.description = "Description is required"
  } else if (data.description.length > 255) {
    errors.description = "Description too long"
  }

  if (!data.amount || data.amount <= 0) {
    errors.amount = "Amount must be positive"
  } else if (data.amount > 999999999) {
    errors.amount = "Amount too large"
  }

  if (!data.type || !["income", "expense"].includes(data.type)) {
    errors.type = "Type is required"
  }

  if (!data.category || data.category.trim().length === 0) {
    errors.category = "Category is required"
  }

  if (!data.date || !/^\d{4}-\d{2}-\d{2}$/.test(data.date)) {
    errors.date = "Invalid date format"
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

export function validateContractData(data: {
  client_name: string
  title: string
  total_value: number
  status: string
  start_date: string
}): ValidationResult {
  const errors: Record<string, string> = {}

  if (!data.client_name || data.client_name.trim().length === 0) {
    errors.client_name = "Client name is required"
  }

  if (!data.title || data.title.trim().length === 0) {
    errors.title = "Title is required"
  }

  if (!data.total_value || data.total_value <= 0) {
    errors.total_value = "Total value must be positive"
  }

  if (!data.status || !["active", "pending", "completed", "cancelled"].includes(data.status)) {
    errors.status = "Status is required"
  }

  if (!data.start_date || !/^\d{4}-\d{2}-\d{2}$/.test(data.start_date)) {
    errors.start_date = "Invalid date format"
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

export function validateEmployeeData(data: {
  name: string
  role?: string
  salary: number
  hire_date: string
}): ValidationResult {
  const errors: Record<string, string> = {}

  if (!data.name || data.name.trim().length === 0) {
    errors.name = "Name is required"
  }

  if (!data.salary || data.salary <= 0) {
    errors.salary = "Salary must be positive"
  }

  if (!data.hire_date || !/^\d{4}-\d{2}-\d{2}$/.test(data.hire_date)) {
    errors.hire_date = "Invalid date format"
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}
