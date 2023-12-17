type Expense = {
    id?: string
    label: string
    description: string
    category: string
    subcategory: string
    value: number
    account: string
    createdOn: number
    owner: string
}

export type ExpenseWithMonth = Expense & { month: string }

export default Expense;