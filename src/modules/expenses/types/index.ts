// Frontend types for the expenses module
// These match the API response shape (dates serialized as strings)

export interface Transaction {
  id: string;
  userId: string;
  accountId: string | null;
  categoryId: string | null;
  type: string;
  amount: string;
  currency: string;
  merchant: string | null;
  description: string | null;
  paymentMethod: string | null;
  transactionDate: string;
  location: string | null;
  isRecurring: boolean;
  recurrence: string;
  recurrenceEndDate: string | null;
  attachments: string[] | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Account {
  id: string;
  userId: string;
  name: string;
  type: string;
  balance: string;
  currency: string;
  icon: string | null;
  color: string | null;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface ExpenseCategory {
  id: string;
  userId: string | null;
  name: string;
  icon: string | null;
  color: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Budget {
  id: string;
  userId: string;
  categoryId: string;
  amount: string;
  period: string;
  startDate: string;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Tag {
  id: string;
  userId: string;
  name: string;
  color: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

// Frontend-specific composite types
export interface BudgetWithSpending {
  id: string;
  categoryId: string;
  amount: string;
  period: string;
  startDate: string;
  endDate: string | null;
  spent: number;
  remaining: number;
  percentageUsed: number;
  categoryName: string | null;
  categoryColor: string | null;
  categoryIcon: string | null;
}

export interface RecurringTransaction {
  id: string;
  amount: string;
  merchant: string | null;
  description: string | null;
  transactionDate: string;
  recurrence: string;
  categoryId: string | null;
  paymentMethod: string | null;
}

export interface OverviewData {
  summary: {
    monthlySpending: number;
    monthlyIncome: number;
    savingsRate: number;
    averageDailySpend: number;
    transactionCount: number;
  };
  categoryBreakdown: {
    categoryId: string | null;
    categoryName: string | null;
    categoryColor: string | null;
    categoryIcon: string | null;
    total: number;
    count: number;
  }[];
  timeline: { date: string; total: number; count: number }[];
  topMerchants: { merchant: string; total: number; count: number }[];
  categories: { id: string; name: string; icon: string | null }[];
}

export interface AnalyticsData {
  categoryBreakdown: {
    categoryName: string | null;
    categoryColor: string | null;
    total: number;
    count: number;
  }[];
  timeline: { date: string; total: number; count: number }[];
  topMerchants: { merchant: string; total: number; count: number }[];
  paymentMethods: { paymentMethod: string; total: number; count: number }[];
  averageDaily: { average: number; total: number; daysInMonth: number };
  totalSpending: number;
  totalIncome: number;
}

export interface CategoryItem {
  categoryId: string | null;
  categoryName: string | null;
  categoryColor: string | null;
  categoryIcon: string | null;
  total: number;
  count: number;
}

export interface CategoryBreakdownProps {
  data: CategoryItem[];
  totalSpending: number;
}