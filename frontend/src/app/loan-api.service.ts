import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { EstimateRequest, EstimateResponse } from "./loan.models";

// Service to interact with loan estimate API
@Injectable({ providedIn: "root" })
export class LoanApiService {
  private readonly baseUrl = "/api";

  constructor(private http: HttpClient) {}

  estimate(req: EstimateRequest): Observable<EstimateResponse> {
    return this.http.post<EstimateResponse>(`${this.baseUrl}/estimate`, req);
  }
}
