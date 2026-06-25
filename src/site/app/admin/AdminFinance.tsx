"use client";

import { financeDetails } from "@/content/finance";

function DetailCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-muted bg-card p-6 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-foreground">{title}</h3>
      {children}
    </section>
  );
}

function DetailRows({ rows }: { rows: ReadonlyArray<{ label: string; value: string }> }) {
  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <div key={row.label} className="rounded-xl bg-muted px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-[#6E9277]">{row.label}</p>
          <p className="mt-1 break-all text-sm font-semibold text-foreground">{row.value}</p>
        </div>
      ))}
    </div>
  );
}

export default function AdminFinance() {
  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl text-foreground">Finance Details</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Internal giving instructions for staff. These details are not shown on the public donation page.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <DetailCard title="Tax & Receipt Info">
          <DetailRows
            rows={[
              { label: "Tax status", value: financeDetails.taxStatus.label },
              { label: "EIN", value: financeDetails.taxStatus.ein },
              { label: "Finance email", value: financeDetails.financeEmail },
              { label: "Tax note", value: financeDetails.taxStatus.taxNote },
            ]}
          />
        </DetailCard>

        <DetailCard title="Bank Transfer">
          <DetailRows rows={financeDetails.bankTransfer} />
        </DetailCard>

        <DetailCard title="Mobile Giving">
          <DetailRows rows={financeDetails.mobileGiving} />
          <p className="mt-3 text-xs text-muted-foreground">Memo: DONATION</p>
        </DetailCard>

        <DetailCard title="Cryptocurrency">
          <div className="space-y-3">
            {financeDetails.crypto.map((item) => (
              <div key={item.coin} className="rounded-xl bg-muted px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-[#6E9277]">{item.coin}</p>
                <p className="mt-1 break-all font-mono text-xs text-foreground">{item.address}</p>
              </div>
            ))}
          </div>
        </DetailCard>

        <DetailCard title="Check By Mail">
          <DetailRows
            rows={[
              { label: "Payable to", value: financeDetails.checkByMail.payableTo },
              { label: "Mailing address", value: financeDetails.checkByMail.mailingAddress },
              { label: "Memo", value: financeDetails.checkByMail.memo },
            ]}
          />
        </DetailCard>

        <DetailCard title="DAF / Stock / Securities">
          <DetailRows
            rows={[
              { label: "DAF search name", value: financeDetails.donorAdvisedFund.searchName },
              { label: "DAF EIN", value: financeDetails.donorAdvisedFund.ein },
              { label: "DAF note", value: financeDetails.donorAdvisedFund.note },
              { label: "Stock note", value: financeDetails.stockAndSecurities.note },
            ]}
          />
        </DetailCard>
      </div>
    </div>
  );
}
