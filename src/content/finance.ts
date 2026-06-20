export const financeDetails = {
  financeEmail: "finance@onebyone.org",
  taxStatus: {
    label: "501(c)(3) registered",
    ein: "82-1234567",
    taxNote: "All donations are tax-deductible to the full extent allowed by law.",
  },
  bankTransfer: [
    { label: "Bank Name", value: "First Community Bank" },
    { label: "Account Name", value: "One By One Ministries Inc." },
    { label: "Routing Number", value: "021000021" },
    { label: "Account Number", value: "4887712930" },
    { label: "Swift / BIC", value: "BOFAUS3N" },
  ],
  mobileGiving: [
    { label: "Cash App", value: "@OneByOneMinistries" },
    { label: "Venmo", value: "@OneByOneMinistries" },
    { label: "Zelle", value: "info@onebyone.org" },
  ],
  crypto: [
    { coin: "Bitcoin (BTC)", address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh" },
    { coin: "Ethereum (ETH)", address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F" },
  ],
  checkByMail: {
    payableTo: "One By One Ministries Inc.",
    mailingAddress: "123 Mission Drive, Atlanta, GA 30301",
    memo: "Include your email for a tax receipt.",
  },
  donorAdvisedFund: {
    searchName: "One By One Ministries Inc.",
    ein: "82-1234567",
    note: "Search for the ministry by legal name in your DAF portal.",
  },
  stockAndSecurities: {
    note: "Contact the finance team for DTC transfer details before initiating a stock or securities gift.",
  },
} as const;
