"use client";

import { financeDetails } from "@/content/finance";

function DetailCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-[#e3d9ce] bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-[#474747]">{title}</h3>
      {children}
    </section>
  );
}

function DetailRows({ rows }: { rows: ReadonlyArray<{ label: string; value: string }> }) {
  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <div key={row.label} className="rounded-xl bg-[#EFE7DB] px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-[#6E9277]">{row.label}</p>
          <p className="mt-1 break-all text-sm font-semibold text-[#474747]">{row.value}</p>
        </div>
      ))}
    </div>
  );
}

export default function AdminFinance() {
  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl text-[#474747]">Finance Details</h1>
        <p className="text-sm text-[#7a7068] mt-1">
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
          <p className="mt-3 text-xs text-[#7a7068]">Memo: DONATION</p>
        </DetailCard>

        <DetailCard title="Cryptocurrency">
          <div className="space-y-3">
            {financeDetails.crypto.map((item) => (
              <div key={item.coin} className="rounded-xl bg-[#EFE7DB] px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-[#6E9277]">{item.coin}</p>
                <p className="mt-1 break-all font-mono text-xs text-[#474747]">{item.address}</p>
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
