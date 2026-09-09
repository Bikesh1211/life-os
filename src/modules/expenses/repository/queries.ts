import { connectToDatabase } from "@/lib/mongodb";
import { Transaction as TransactionModel, ExpenseCategory as ExpenseCategoryModel } from "@/lib/models/expenses";

function monthRange(year: number, month: number) {
  return { start: new Date(year, month - 1, 1), end: new Date(year, month, 1) };
}

export async function getMonthlySpending(
  userId: string,
  year: number,
  month: number,
): Promise<{ total: number; count: number }> {
  await connectToDatabase();
  const { start: startDate, end: endDate } = monthRange(year, month);

  const [result] = await TransactionModel.aggregate([
    {
      $match: {
        userId,
        type: "expense",
        deletedAt: null,
        transactionDate: { $gte: startDate, $lt: endDate },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
  ]);

  return {
    total: result?.total ?? 0,
    count: result?.count ?? 0,
  };
}

export async function getMonthlyIncome(
  userId: string,
  year: number,
  month: number,
): Promise<number> {
  await connectToDatabase();
  const { start: startDate, end: endDate } = monthRange(year, month);

  const [result] = await TransactionModel.aggregate([
    {
      $match: {
        userId,
        type: "income",
        deletedAt: null,
        transactionDate: { $gte: startDate, $lt: endDate },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$amount" },
      },
    },
  ]);

  return result?.total ?? 0;
}

export async function getSpendingByCategory(
  userId: string,
  year: number,
  month: number,
): Promise<
  {
    categoryId: string | null;
    categoryName: string | null;
    categoryColor: string | null;
    categoryIcon: string | null;
    total: number;
    count: number;
  }[]
> {
  await connectToDatabase();
  const { start: startDate, end: endDate } = monthRange(year, month);

  const results = await TransactionModel.aggregate([
    {
      $match: {
        userId,
        type: "expense",
        deletedAt: null,
        transactionDate: { $gte: startDate, $lt: endDate },
      },
    },
    {
      $lookup: {
        from: "expensecategories",
        localField: "categoryId",
        foreignField: "_id",
        as: "category",
      },
    },
    {
      $unwind: {
        path: "$category",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $group: {
        _id: "$categoryId",
        categoryName: { $first: "$category.name" },
        categoryColor: { $first: "$category.color" },
        categoryIcon: { $first: "$category.icon" },
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { total: -1 },
    },
  ]);

  return results.map((r: any) => ({
    categoryId: r._id?.toString?.() ?? null,
    categoryName: r.categoryName ?? null,
    categoryColor: r.categoryColor ?? null,
    categoryIcon: r.categoryIcon ?? null,
    total: r.total,
    count: r.count,
  }));
}

export async function getDailySpending(
  userId: string,
  startDate: Date,
  endDate: Date,
): Promise<{ date: string; total: number; count: number }[]> {
  await connectToDatabase();

  const results = await TransactionModel.aggregate([
    {
      $match: {
        userId,
        type: "expense",
        deletedAt: null,
        transactionDate: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $addFields: {
        dateStr: {
          $dateToString: { format: "%Y-%m-%d", date: "$transactionDate" },
        },
      },
    },
    {
      $group: {
        _id: "$dateStr",
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  return results.map((r: any) => ({
    date: r._id,
    total: r.total,
    count: r.count,
  }));
}

export async function getTopMerchants(
  userId: string,
  year: number,
  month: number,
  limit = 10,
): Promise<{ merchant: string | null; total: number; count: number }[]> {
  await connectToDatabase();
  const { start: startDate, end: endDate } = monthRange(year, month);

  const results = await TransactionModel.aggregate([
    {
      $match: {
        userId,
        type: "expense",
        deletedAt: null,
        merchant: { $exists: true, $ne: null },
        transactionDate: { $gte: startDate, $lt: endDate },
      },
    },
    {
      $group: {
        _id: "$merchant",
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { total: -1 },
    },
    { $limit: limit },
  ]);

  return results.map((r: any) => ({
    merchant: r._id,
    total: r.total,
    count: r.count,
  }));
}

export async function getSpendingByPaymentMethod(
  userId: string,
  year: number,
  month: number,
): Promise<{ paymentMethod: string | null; total: number; count: number }[]> {
  await connectToDatabase();
  const { start: startDate, end: endDate } = monthRange(year, month);

  const results = await TransactionModel.aggregate([
    {
      $match: {
        userId,
        type: "expense",
        deletedAt: null,
        paymentMethod: { $exists: true, $ne: null },
        transactionDate: { $gte: startDate, $lt: endDate },
      },
    },
    {
      $group: {
        _id: "$paymentMethod",
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { total: -1 },
    },
  ]);

  return results.map((r: any) => ({
    paymentMethod: r._id,
    total: r.total,
    count: r.count,
  }));
}

export async function getAverageDailySpend(
  userId: string,
  year: number,
  month: number,
): Promise<{ average: number; total: number; daysInMonth: number }> {
  const { total } = await getMonthlySpending(userId, year, month);
  const daysInMonth = new Date(year, month, 0).getDate();
  return {
    average: daysInMonth > 0 ? total / daysInMonth : 0,
    total,
    daysInMonth,
  };
}
