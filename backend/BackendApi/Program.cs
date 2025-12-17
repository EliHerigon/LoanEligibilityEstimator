using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

// Main API endpoint for loan estimation
app.MapPost("/api/estimate", ([FromBody] EstimateRequest req) =>
{
    // Validate input
    if (req.AnnualIncome < 0 || req.MonthlyDebts < 0 || req.LoanAmount < 0 || req.InterestRate < 0 || req.TermYears <= 0)
        return Results.BadRequest(new { error = "Values must be non-negative, and termYears must be > 0." });

    // Validate credit score
    if (req.CreditScore is < 300 or > 850)
        return Results.BadRequest(new { error = "Credit score must be between 300 and 850." });

    // Calculate monthly income
    var monthlyIncome = req.AnnualIncome / 12.0;

    // Calculate monthly payment using amortization formula
    var monthlyRate = req.InterestRate / 100.0 / 12.0;
    var n = req.TermYears * 12;
    
    // Handle zero interest rate case
    double monthlyPayment;
    if (monthlyRate == 0)
        monthlyPayment = req.LoanAmount / n;
    // Otherwise use standard formula
    else
    {
        var pow = Math.Pow(1 + monthlyRate, n);
        monthlyPayment = req.LoanAmount * (monthlyRate * pow) / (pow - 1);
    }

    // Calculate DTI
    var totalMonthlyDebt = req.MonthlyDebts + monthlyPayment;
    var dti = monthlyIncome <= 0 ? 1.0 : totalMonthlyDebt / monthlyIncome;
    var dtiPercent = dti * 100.0;
    // Get credit tier and max DTI
    var (tier, maxDti) = GetCreditTier(req.CreditScore);
    // Prepare reasons and tips
    var reasons = new List<string>();
    var tips = new List<string>();

    // Make decision based on DTI and credit tier
    string decision;
    if (dti <= maxDti)
    {
        decision = "Eligible";
        reasons.Add($"DTI {dtiPercent:F2}% is within your tier limit ({maxDti * 100:F0}%).");
        reasons.Add($"Credit tier is {tier} (score {req.CreditScore}).");
    }
    else if (dti <= maxDti + 0.05)
    {
        decision = "Maybe";
        reasons.Add($"DTI {dtiPercent:F2}% is slightly above your tier limit ({maxDti * 100:F0}%).");
        tips.Add("Pay down monthly debts or consider a smaller loan amount.");
        tips.Add("Improving credit score may increase your allowed DTI.");
    }
    else
    {
        decision = "Not Yet";
        reasons.Add($"DTI {dtiPercent:F2}% is above your tier limit ({maxDti * 100:F0}%).");
        tips.Add("Reduce monthly debts or increase income.");
        tips.Add("Consider a smaller loan amount or longer term.");
        tips.Add("Work on improving credit score for better thresholds.");
    }

    var res = new EstimateResponse(
        MonthlyIncome: Round2(monthlyIncome),
        MonthlyPayment: Round2(monthlyPayment),
        DtiPercent: Round2(dtiPercent),
        CreditTier: tier,
        Decision: decision,
        Reasons: reasons,
        Tips: tips
    );

    return Results.Ok(res);
});

app.Run("http://localhost:5100");

// Helper to get credit tier and max DTI based on score
static (string Tier, double MaxDti) GetCreditTier(int score)
{
    if (score >= 760) return ("Excellent", 0.45);
    if (score >= 700) return ("Good", 0.41);
    if (score >= 640) return ("Fair", 0.36);
    return ("Poor", 0.30);
}

static double Round2(double x) => Math.Round(x, 2);

// Request and Response record definitions
public record EstimateRequest(
    double AnnualIncome,
    double MonthlyDebts,
    int CreditScore,
    double LoanAmount,
    double InterestRate,
    int TermYears
);

// Response record
public record EstimateResponse(
    double MonthlyIncome,
    double MonthlyPayment,
    double DtiPercent,
    string CreditTier,
    string Decision,
    List<string> Reasons,
    List<string> Tips
);
