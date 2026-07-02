import { getDashboardSummary, getCategoryBreakdown, getDailySpendingTimeline, getTopMerchantsList } from "./modules/expenses/service/dashboard";
import { getExpenseCategories } from "./modules/expenses/service/categories";

async function main() {
  const userId = "test-user-id"; // standard dummy or real from DB if exists
  console.log("Starting test-overview script for userId:", userId);

  try {
    console.log("Calling getDashboardSummary...");
    const summary = await getDashboardSummary(userId);
    console.log("Summary success:", summary);

    console.log("Calling getCategoryBreakdown...");
    const categoryBreakdown = await getCategoryBreakdown(userId);
    console.log("Category breakdown success:", categoryBreakdown);

    console.log("Calling getDailySpendingTimeline...");
    const timeline = await getDailySpendingTimeline(userId, 365);
    console.log("Timeline success:", timeline.length, "rows");

    console.log("Calling getTopMerchantsList...");
    const topMerchants = await getTopMerchantsList(userId);
    console.log("Top merchants success:", topMerchants);

    console.log("Calling getExpenseCategories...");
    const categories = await getExpenseCategories(userId);
    console.log("Categories success:", categories);

    console.log("All queries executed successfully!");
  } catch (err) {
    console.error("Error executing queries:", err);
  }
}

main().then(() => process.exit(0)).catch(err => {
  console.error("Main exception:", err);
  process.exit(1);
});
