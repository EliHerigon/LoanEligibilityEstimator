import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { LoanApiService } from "./loan-api.service";
import { EstimateResponse } from "./loan.models";

// Main component for loan estimator page including template and styles
@Component({
  selector: "app-loan-estimator",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
  <div class="page">
    <header class="header">
      <div>
        <h1>Loan Eligibility Estimator</h1>
        <p class="sub">
          Enter your info and we’ll estimate affordability using a simple DTI + credit tier rule set.
        </p>
      </div>
      <span class="pill">Angular + .NET</span>
    </header>

    <div class="grid">
      <section class="card">
        <h2>Inputs</h2>

        <form [formGroup]="form" (ngSubmit)="onEstimate()" class="form">
          <div class="row">
            <label>
              Annual Income
              <input type="number" formControlName="annualIncome" />
              <small>Yearly gross income (USD)</small>
            </label>

            <label>
              Monthly Debts
              <input type="number" formControlName="monthlyDebts" />
              <small>Total monthly debt payments</small>
            </label>
          </div>

          <div class="row">
            <label>
              Credit Score
              <input type="number" formControlName="creditScore" />
              <small>300–850</small>
            </label>

            <label>
              Loan Amount
              <input type="number" formControlName="loanAmount" />
              <small>Requested principal</small>
            </label>
          </div>

          <div class="row">
            <label>
              Interest Rate (%)
              <input type="number" step="0.01" formControlName="interestRate" />
              <small>Example: 6.50</small>
            </label>

            <label>
              Term (Years)
              <input type="number" formControlName="termYears" />
              <small>Example: 30</small>
            </label>
          </div>

          <div class="actions">
            <button class="btn" type="submit" [disabled]="form.invalid || loading">
              <span *ngIf="!loading">Estimate</span>
              <span *ngIf="loading">Estimating…</span>
            </button>

            <button class="btn ghost" type="button" (click)="form.reset({
              annualIncome: 75000,
              monthlyDebts: 1500,
              creditScore: 700,
              loanAmount: 300000,
              interestRate: 6.5,
              termYears: 30
            })" [disabled]="loading">
              Reset
            </button>
          </div>

          <p *ngIf="error" class="error">{{ error }}</p>
        </form>
      </section>

      <section class="card results">
        <h2>Results</h2>

        <div *ngIf="!result && !loading" class="empty">
          <p>Run an estimate to see results here.</p>
        </div>

        <div *ngIf="result" class="resultWrap">
          <div class="banner" [ngClass]="result.decision.toLowerCase().split(' ').join('')">
            <div class="bannerLeft">
              <div class="label">Decision</div>
              <div class="decision">{{ result.decision }}</div>
            </div>
            <div class="bannerRight">
              <div class="mini">
                <span class="miniLabel">Credit Tier</span>
                <span class="miniVal">{{ result.creditTier }}</span>
              </div>
              <div class="mini">
                <span class="miniLabel">DTI</span>
                <span class="miniVal">{{ result.dtiPercent | number:'1.0-2' }}%</span>
              </div>
            </div>
          </div>

          <div class="stats">
            <div class="stat">
              <div class="statLabel">Monthly Income</div>
              <div class="statVal">\${{ result.monthlyIncome | number:'1.2-2' }}</div>
            </div>
            <div class="stat">
              <div class="statLabel">Monthly Payment</div>
              <div class="statVal">\${{ result.monthlyPayment | number:'1.2-2' }}</div>
            </div>
          </div>

          <div class="split">
            <div>
              <h3>Reasons</h3>
              <ul>
                <li *ngFor="let r of result.reasons">{{ r }}</li>
              </ul>
            </div>

            <div *ngIf="result.tips?.length">
              <h3>Tips</h3>
              <ul>
                <li *ngFor="let t of result.tips">{{ t }}</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>

    <footer class="footer">
      <span>Demo estimator only — not financial advice.</span>
    </footer>
  </div>
`,

  styles: [`
  :host { display:block; }

  .page{
    min-height: 100vh;
    padding: 28px 18px 40px;
    background: radial-gradient(1200px 700px at 20% 10%, #476a99ff 0%, transparent 60%),
                radial-gradient(900px 500px at 90% 20%, #476a99ff 0%, transparent 45%),
                #0b1220;
    color: #e5e7eb;
    font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
  }

  .header{
    max-width: 1100px;
    margin: 0 auto 18px;
    display:flex;
    align-items:flex-end;
    justify-content:space-between;
    gap: 12px;
  }

  h1{
    margin: 0;
    font-size: 28px;
    letter-spacing: 0.2px;
  }

  .sub{
    margin: 6px 0 0;
    color: #ffffffff;
    max-width: 700px;
    line-height: 1.35;
  }

  .pill{
    display:inline-flex;
    align-items:center;
    gap:8px;
    padding: 8px 12px;
    border-radius: 999px;
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.12);
    color: #e5e7eb;
    font-weight: 600;
    font-size: 12px;
    white-space: nowrap;
  }

  .grid{
    max-width: 1100px;
    margin: 0 auto;
    display:grid;
    grid-template-columns: 1fr;
    gap: 14px;
  }

  @media (min-width: 980px){
    .grid{
      grid-template-columns: 1.05fr 0.95fr;
      gap: 16px;
    }
  }

  .card{
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 18px;
    padding: 18px;
    backdrop-filter: blur(10px);
    box-shadow: 0 18px 40px rgba(0,0,0,0.25);
  }

  .card h2{
    margin: 0 0 12px;
    font-size: 16px;
    color: #eaf0ff;
    letter-spacing: 0.3px;
  }

  .form{ display:grid; gap: 12px; }

  .row{
    display:grid;
    grid-template-columns: 1fr;
    gap: 10px;
  }

  @media (min-width: 620px){
    .row{ grid-template-columns: 1fr 1fr; }
  }

  label{
    display:grid;
    gap: 6px;
    color: #e5e7eb;
    font-weight: 600;
    font-size: 13px;
  }

  small{
    color: #a9b7d0;
    font-weight: 500;
    margin-top: -2px;
  }

  input{
    height: 42px;
    padding: 0 12px;
    border-radius: 12px;
    border: 1px solid rgba(255,255,255,0.14);
    background: rgba(0,0,0,0.25);
    color: #e5e7eb;
    outline: none;
  }

  input:focus{
    border-color: rgba(59,130,246,0.75);
    box-shadow: 0 0 0 4px rgba(59,130,246,0.18);
  }

  .actions{
    display:flex;
    gap: 10px;
    align-items:center;
    margin-top: 4px;
  }

  .btn{
    height: 42px;
    padding: 0 14px;
    border-radius: 12px;
    border: 1px solid rgba(255,255,255,0.14);
    background: linear-gradient(135deg, rgba(59,130,246,0.95), rgba(168,85,247,0.95));
    color: white;
    font-weight: 800;
    cursor: pointer;
    transition: transform 0.06s ease, filter 0.2s ease;
  }

  .btn:disabled{
    cursor:not-allowed;
    filter: grayscale(0.5) brightness(0.8);
    opacity: 0.7;
  }

  .btn:active{ transform: translateY(1px); }

  .btn.ghost{
    background: rgba(255,255,255,0.06);
    color: #e5e7eb;
    font-weight: 700;
  }

  .error{
    margin: 6px 0 0;
    color: #fecaca;
    background: rgba(239,68,68,0.12);
    border: 1px solid rgba(239,68,68,0.25);
    padding: 10px 12px;
    border-radius: 12px;
  }

  .empty{
    color: #b6c2d6;
    padding: 6px 0 0;
  }

  .resultWrap{ display:grid; gap: 12px; }

  .banner{
    display:flex;
    justify-content:space-between;
    gap: 12px;
    padding: 14px;
    border-radius: 16px;
    border: 1px solid rgba(255,255,255,0.12);
    background: rgba(255,255,255,0.06);
  }

  .banner.eligible{
    background: linear-gradient(135deg, rgba(34,197,94,0.20), rgba(59,130,246,0.10));
    border-color: rgba(34,197,94,0.25);
  }
  .banner.maybe{
    background: linear-gradient(135deg, rgba(245,158,11,0.22), rgba(168,85,247,0.10));
    border-color: rgba(245,158,11,0.28);
  }
  .banner.notyet{
    background: linear-gradient(135deg, rgba(239,68,68,0.20), rgba(59,130,246,0.10));
    border-color: rgba(239,68,68,0.28);
  }

  .label{
    color: #b6c2d6;
    font-size: 12px;
    font-weight: 700;
  }
  .decision{
    font-size: 20px;
    font-weight: 900;
    margin-top: 2px;
  }

  .bannerRight{
    display:flex;
    gap: 12px;
    align-items:flex-end;
    flex-wrap: wrap;
    justify-content:flex-end;
  }

  .mini{
    display:grid;
    gap: 2px;
    text-align:right;
  }
  .miniLabel{
    color: #b6c2d6;
    font-size: 11px;
    font-weight: 700;
  }
  .miniVal{
    font-weight: 900;
    font-size: 14px;
  }

  .stats{
    display:grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .stat{
    padding: 12px;
    border-radius: 14px;
    border: 1px solid rgba(255,255,255,0.12);
    background: rgba(0,0,0,0.20);
  }

  .statLabel{
    color: #b6c2d6;
    font-size: 12px;
    font-weight: 700;
  }
  .statVal{
    margin-top: 4px;
    font-size: 16px;
    font-weight: 900;
  }

  .split{
    display:grid;
    grid-template-columns: 1fr;
    gap: 12px;
  }

  @media (min-width: 720px){
    .split{ grid-template-columns: 1fr 1fr; }
  }

  h3{
    margin: 8px 0 8px;
    font-size: 14px;
    color: #eaf0ff;
  }

  ul{
    margin: 0;
    padding-left: 18px;
    color: #d6def1;
    line-height: 1.45;
  }

  .footer{
    max-width: 1100px;
    margin: 14px auto 0;
    color: #9fb0cc;
    font-size: 12px;
  }
`]

})
export class LoanEstimatorComponent {
  loading = false;
  error: string | null = null;
  result: EstimateResponse | null = null;

  // Form definition, first values are just defaults for convenience
  form = this.fb.group({
    annualIncome: [75000, [Validators.required, Validators.min(0)]],
    monthlyDebts: [1500, [Validators.required, Validators.min(0)]],
    creditScore: [700, [Validators.required, Validators.min(300), Validators.max(850)]],
    loanAmount: [300000, [Validators.required, Validators.min(0)]],
    interestRate: [6.5, [Validators.required, Validators.min(0)]],
    termYears: [30, [Validators.required, Validators.min(1)]],
  });

  constructor(private fb: NonNullableFormBuilder, private api: LoanApiService) {}

  // Handle form submission
  onEstimate() {
    if (this.form.invalid) return;

    this.loading = true;
    this.error = null;
    this.result = null;

    const req = this.form.getRawValue();

    this.api.estimate(req).subscribe({
      next: (res) => { this.result = res; this.loading = false; },
      error: (err) => {
        console.error(err);
        this.error = "API call failed. Is the backend running on :5100?";
        this.loading = false;
      }
    });
  }
  formatDecision(d: EstimateResponse["decision"]): string {
  return d === "NotYet" ? "Not Yet" : d;
    }
}
