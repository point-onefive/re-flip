# Accept Payments - Base Documentation

**Source:** https://docs.base.org/base-account/guides/accept-payments
**Scraped:** 2026-02-04T10:27:09.607767

---

## Table of Contents

  - ​Why Base Pay?
  - ​Client-side (Browser SDK)
    - ​Collect user information (optional)
  - ​Server Side
    - ​Verify User Transaction
    - ​Validate User Info
  - ​Add the Base Pay Button
  - ​Test on Base Sepolia

---

## Content

Base Documentation home pageSearch...⌘KAsk AISearch...NavigationGuidesAccept PaymentsGet StartedBase ChainBase AccountBase AppMini AppsOnchainKitCookbookShowcaseLearnGitHubSupportIntroductionBase Account OverviewQuickstartWeb (HTML + JS)Web (Next.js)Mobile (React Native)GuidesAuthenticate UsersAccept PaymentsAccept Recurring PaymentsBatch TransactionsSponsor GasUse Sub AccountsUse Spend PermissionsUse Coinbase Balances OnchainSign and Verify Typed DataPay Gas in ERC20 tokensFramework IntegrationsWagmi/ViemPrivyCoinbase Developer PlatformRainbowKitReownThirdwebReferenceAccount SDKProviderUI ElementsOnchain ContractsMoreTroubleshootingBase Gasless CampaignTelemetryMigrate from Coinbase Wallet SDKBasenamesBasenames FAQBasename Transfer GuideContributeContribute to the Base Account DocsSecurity and Bug BountyOn this pageWhy Base Pay?Client-side (Browser SDK)Collect user information (optional)Server SideVerify User TransactionValidate User InfoAdd the Base Pay ButtonTest on Base Sepolia​Why Base Pay?
USDC on Base is a fully-backed digital dollar that settles in seconds and costs pennies in gas. Base Pay lets you accept those dollars with a single click—no cards, no FX fees, no chargebacks.

Any user can pay – works with every Base Account (smart-wallet) out of the box.
USDC, not gas – you charge in dollars; gas sponsorship is handled automatically.
Fast – most payments confirm in <2 seconds on Base.
Funded accounts – users pay with USDC from their Base Account or Coinbase Account.
No extra fees – you receive the full amount.

Please Follow the Brand GuidelinesIf you intend on using the BasePayButton, please follow the Brand Guidelines to ensure consistency across your application.
​Client-side (Browser SDK)
Interactive Playground: Try out the pay() and getPaymentStatus() functions in our Base Pay SDK Playground before integrating them into your app.
Browser (SDK)Report incorrect codeCopyAsk AI
import { pay, getPaymentStatus } from '@base-org/account';

// Trigger a payment – user will see a popup from their wallet service
try {
 const payment = await pay({
 amount: '1.00', // USD amount (USDC used internally)
 to: '0xRecipient', // your address
 testnet: true // set false for Mainnet
 });

 // Option 1: Poll until mined
 const { status } = await getPaymentStatus({ 
 id: payment.id,
 testnet: true // MUST match the testnet setting used in pay()
 });
 if (status === 'completed') console.log('🎉 payment settled');

} catch (error) {
 console.error(`Payment failed: ${error.message}`);
}

Important: The testnet parameter in getPaymentStatus() must match the value used in the original pay() call. If you initiated a payment on testnet with testnet: true, you must also pass testnet: true when checking its status.
This is what the user will see when prompted to pay:

​Collect user information (optional)
Need an email, phone, or shipping address at checkout? Pass a payerInfo object:
Report incorrect codeCopyAsk AItry {
 const payment = await pay({
 amount: '25.00',
 to: '0xRecipient',
 payerInfo: {
 requests: [
 { type: 'email' },
 { type: 'phoneNumber', optional: true },
 { type: 'physicalAddress', optional: true }
 ],
 callbackURL: 'https://your-api.com/validate' // Optional - for server-side validation
 }
 });

 console.log(`Payment sent! Transaction ID: ${payment.id}`);

 // Log the collected user information
 if (payment.payerInfoResponses) {
 if (payment.payerInfoResponses.email) {
 console.log(`Email: ${payment.payerInfoResponses.email}`);
 }
 if (payment.payerInfoResponses.phoneNumber) {
 console.log(`Phone: ${payment.payerInfoResponses.phoneNumber.number}`);
 console.log(`Country: ${payment.payerInfoResponses.phoneNumber.country}`);
 }
 if (payment.payerInfoResponses.physicalAddress) {
 const address = payment.payerInfoResponses.physicalAddress;
 console.log(`Shipping Address: ${address.name.firstName} ${address.name.familyName}, ${address.address1}, ${address.city}, ${address.state} ${address.postalCode}`);
 }
 }
} catch (error) {
 console.error(`Payment failed: ${error.message}`);
}

Supported request types:
typereturnsemailstringname{ firstName, familyName }phoneNumber{ number, country }physicalAddressfull address objectonchainAddressstring
Required by default — set optional: true to avoid aborting the payment if the user declines.
How to validate the user’s information?You can use the callbackURL to validate the user’s information on the server side.Learn more about this in the callbackURL reference.
​Server Side
When accepting payments, your backend must validate transactions and user info received from the frontend. This section covers two critical aspects: verifying transaction completion and validating user information.
​Verify User Transaction
Use getPaymentStatus() on your backend to confirm that a payment has been completed before fulfilling orders. Never trust payment confirmations from the frontend alone.
Backend (SDK)Report incorrect codeCopyAsk AIimport { getPaymentStatus } from '@base-org/account';

export async function checkPayment(txId: string, testnet = false) {
 const status = await getPaymentStatus({ 
 id: txId,
 testnet // Must match the testnet setting from the original pay() call
 });
 if (status.status === 'completed') {
 // fulfill order
 }
}

Prevent Replay and Impersonation Attacks
Replay attacks: A malicious user could submit the same valid transaction ID multiple times. Always track processed transaction IDs in your database.
Impersonation attacks: A malicious user could submit someone else’s transaction ID to fulfill their own order. Always verify that the payment sender matches the authenticated user.

Here’s an example that prevents both attack vectors:
Backend (with replay protection)Report incorrect codeCopyAsk AIimport { getPaymentStatus } from '@base-org/account';

// Example using a database to track processed transactions
// Replace with your actual database implementation (PostgreSQL, MongoDB, etc.)
const processedTransactions = new Map<string, { 
 orderId: string; 
 sender: string; 
 amount: string;
 timestamp: Date;
}>(); // In production, use a persistent database

export async function verifyAndFulfillPayment(
 txId: string, 
 orderId: string,
 payerAddress: string, // From authenticated user (SIWE, JWT, etc.)
 testnet = false
) {
 // 1. Check if this transaction was already processed
 if (processedTransactions.has(txId)) {
 throw new Error('Transaction already processed');
 }

 // 2. Verify the payment status on-chain
 const { status, sender, amount, recipient } = await getPaymentStatus({ 
 id: txId,
 testnet
 });

 if (status !== 'completed') {
 throw new Error(`Payment not completed. Status: ${status}`);
 }

 // 3. Verify the payment sender matches the authenticated user
 // This prevents a malicious user from claiming someone else's payment
 if (sender.toLowerCase() !== payerAddress.toLowerCase()) {
 throw new Error('Payment sender does not match authenticated user');
 }

 // 4. Validate the payment details match your order
 // This ensures the user paid the correct amount to the correct address
 const expectedAmount = await getOrderAmount(orderId);
 const expectedRecipient = process.env.PAYMENT_ADDRESS;

 if (amount !== expectedAmount) {
 throw new Error('Payment amount mismatch');
 }

 if (recipient.toLowerCase() !== expectedRecipient.toLowerCase()) {
 throw new Error('Payment recipient mismatch');
 }

 // 5. Mark transaction as processed BEFORE fulfilling
 // Store sender for easy lookup (e.g., to query all payments from a user)
 // In production, use a database transaction to ensure atomicity
 processedTransactions.set(txId, {
 orderId,
 sender,
 amount,
 timestamp: new Date()
 });

 // 6. Fulfill the order
 await fulfillOrder(orderId);

 return { success: true, orderId, sender };
}
See all 66 lines
Database recommendations for tracking transactions:
Store the transaction ID, order ID, sender address, amount, timestamp, and fulfillment status
Use a unique constraint on the transaction ID to prevent duplicates
Consider adding an index on the transaction ID for fast lookups

​Validate User Info
If you’re collecting user information (email, phone, shipping address) during checkout, use the callbackURL parameter to validate this data server-side before the transaction is submitted.
Your callback endpoint receives the user’s information and must respond with either a success or error response:
Backend (validation endpoint)Report incorrect codeCopyAsk AIexport async function POST(request: Request) {
 const requestData = await request.json();
 const { requestedInfo } = requestData.capabilities.dataCallback;
 const errors: Record<string, string> = {};

 // Validate email
 if (requestedInfo.email) {
 const blockedDomains = ['tempmail.com', 'throwaway.com'];
 const domain = requestedInfo.email.split('@')[1];
 if (blockedDomains.includes(domain)) {
 errors.email = 'Please use a valid email address';
 }
 }

 // Validate shipping address
 if (requestedInfo.physicalAddress) {
 const addr = requestedInfo.physicalAddress;
 const supportedCountries = ['US', 'CA', 'GB'];
 if (!supportedCountries.includes(addr.countryCode)) {
 errors.physicalAddress = { 
 countryCode: 'We currently only ship to US, Canada, and UK' 
 };
 }
 }

 // Return errors if validation failed
 if (Object.keys(errors).length > 0) {
 return Response.json({ errors });
 }

 // Success - return the request to proceed with the transaction
 return Response.json({ request: requestData });
}

The callback is invoked before the transaction is submitted. If you return errors, the user is prompted to correct their information. If you return success, the transaction proceeds.
For complete details on the callback request/response format and all supported data types, see the dataCallback reference.
​Add the Base Pay Button
Use the pre-built component for a native look-and-feel:
Checkout.tsxReport incorrect codeCopyAsk AIimport { BasePayButton } from '@base-org/account-ui/react';
import { pay } from '@base-org/account';

export function Checkout() {
 const handlePayment = async () => {
 try {
 const payment = await pay({ amount: '5.00', to: '0xRecipient' });
 console.log(`Payment sent! Transaction ID: ${payment.id}`);
 } catch (error) {
 console.error(`Payment failed: ${error.message}`);
 }
 };

 return (
 <BasePayButton
 colorScheme="light"
 onClick={handlePayment}
 />
 );
}

See full props and theming options in the Button Reference and Brand Guidelines.
Please Follow the Brand GuidelinesIf you intend on using the BasePayButton, please follow the Brand Guidelines to ensure consistency across your application.
​Test on Base Sepolia

Get test USDC from the Circle Faucet (select “Base Sepolia”).

Pass testnet: true in your pay() and getPaymentStatus() calls.

Use Sepolia BaseScan to watch the transaction.

Was this page helpful?YesNoSuggest editsRaise issueAuthenticate UsersPreviousAccept Recurring PaymentsNext⌘I

---

## Code Examples

### Code Block 1 (unknown)

```unknown
import { pay, getPaymentStatus } from '@base-org/account';

// Trigger a payment – user will see a popup from their wallet service
try {
  const payment = await pay({
    amount: '1.00',           // USD amount (USDC used internally)
    to:    '0xRecipient',     // your address
    testnet: true            // set false for Mainnet
  });
  
  // Option 1: Poll until mined
  const { status } = await getPaymentStatus({ 
    id: payment.id,
    testnet: true            // MUST match the testnet setting used in pay()
  });
  if (status === 'completed') console.log('🎉 payment settled');
  
} catch (error) {
  console.error(`Payment failed: ${error.message}`);
}
```

### Code Block 2 (unknown)

```unknown
try {
  const payment = await pay({
    amount: '25.00',
    to: '0xRecipient',
    payerInfo: {
      requests: [
        { type: 'email' },
        { type: 'phoneNumber', optional: true },
        { type: 'physicalAddress', optional: true }
      ],
      callbackURL: 'https://your-api.com/validate' // Optional - for server-side validation
    }
  });
  
  console.log(`Payment sent! Transaction ID: ${payment.id}`);
  
  // Log the collected user information
  if (payment.payerInfoResponses) {
    if (payment.payerInfoResponses.email) {
      console.log(`Email: ${payment.payerInfoResponses.email}`);
    }
    if (payment.payerInfoResponses.phoneNumber) {
      console.log(`Phone: ${payment.payerInfoResponses.phoneNumber.number}`);
      console.log(`Country: ${payment.payerInfoResponses.phoneNumber.country}`);
    }
    if (payment.payerInfoResponses.physicalAddress) {
      const address = payment.payerInfoResponses.physicalAddress;
      console.log(`Shipping Address: ${address.name.firstName} ${address.name.familyName}, ${address.address1}, ${address.city}, ${address.state} ${address.postalCode}`);
    }
  }
} catch (error) {
  console.error(`Payment failed: ${error.message}`);
}
```

### Code Block 3 (unknown)

```unknown
import { getPaymentStatus } from '@base-org/account';

export async function checkPayment(txId: string, testnet = false) {
  const status = await getPaymentStatus({ 
    id: txId,
    testnet  // Must match the testnet setting from the original pay() call
  });
  if (status.status === 'completed') {
    // fulfill order
  }
}
```

### Code Block 4 (unknown)

```unknown
import { getPaymentStatus } from '@base-org/account';

// Example using a database to track processed transactions
// Replace with your actual database implementation (PostgreSQL, MongoDB, etc.)
const processedTransactions = new Map<string, { 
  orderId: string; 
  sender: string; 
  amount: string;
  timestamp: Date;
}>(); // In production, use a persistent database

export async function verifyAndFulfillPayment(
  txId: string, 
  orderId: string,
  payerAddress: string, // From authenticated user (SIWE, JWT, etc.)
  testnet = false
) {
  // 1. Check if this transaction was already processed
  if (processedTransactions.has(txId)) {
    throw new Error('Transaction already processed');
  }

  // 2. Verify the payment status on-chain
  const { status, sender, amount, recipient } = await getPaymentStatus({ 
    id: txId,
    testnet
  });

  if (status !== 'completed') {
    throw new Error(`Payment not completed. Status: ${status}`);
  }

  // 3. Verify the payment sender matches the authenticated user
  // This prevents a malicious user from claiming someone else's payment
  if (sender.toLowerCase() !== payerAddress.toLowerCase()) {
    throw new Error('Payment sender does not match authenticated user');
  }

  // 4. Validate the payment details match your order
  // This ensures the user paid the correct amount to the correct address
  const expectedAmount = await getOrderAmount(orderId);
  const expectedRecipient = process.env.PAYMENT_ADDRESS;
  
  if (amount !== expectedAmount) {
    throw new Error('Payment amount mismatch');
  }
  
  if (recipient.toLowerCase() !== expectedRecipient.toLowerCase()) {
    throw new Error('Payment recipient mismatch');
  }

  // 5. Mark transaction as processed BEFORE fulfilling
  // Store sender for easy lookup (e.g., to query all payments from a user)
  // In production, use a database transaction to ensure atomicity
  processedTransactions.set(txId, {
    orderId,
    sender,
    amount,
    timestamp: new Date()
  });
  
  // 6. Fulfill the order
  await fulfillOrder(orderId);
  
  return { success: true, orderId, sender };
}
```

### Code Block 5 (unknown)

```unknown
export async function POST(request: Request) {
  const requestData = await request.json();
  const { requestedInfo } = requestData.capabilities.dataCallback;
  const errors: Record<string, string> = {};

  // Validate email
  if (requestedInfo.email) {
    const blockedDomains = ['tempmail.com', 'throwaway.com'];
    const domain = requestedInfo.email.split('@')[1];
    if (blockedDomains.includes(domain)) {
      errors.email = 'Please use a valid email address';
    }
  }

  // Validate shipping address
  if (requestedInfo.physicalAddress) {
    const addr = requestedInfo.physicalAddress;
    const supportedCountries = ['US', 'CA', 'GB'];
    if (!supportedCountries.includes(addr.countryCode)) {
      errors.physicalAddress = { 
        countryCode: 'We currently only ship to US, Canada, and UK' 
      };
    }
  }

  // Return errors if validation failed
  if (Object.keys(errors).length > 0) {
    return Response.json({ errors });
  }

  // Success - return the request to proceed with the transaction
  return Response.json({ request: requestData });
}
```

### Code Block 6 (unknown)

```unknown
import { BasePayButton } from '@base-org/account-ui/react';
import { pay } from '@base-org/account';

export function Checkout() {
  const handlePayment = async () => {
    try {
      const payment = await pay({ amount: '5.00', to: '0xRecipient' });
      console.log(`Payment sent! Transaction ID: ${payment.id}`);
    } catch (error) {
      console.error(`Payment failed: ${error.message}`);
    }
  };

  return (
    <BasePayButton
      colorScheme="light"
      onClick={handlePayment}
    />
  );
}
```

---

## Related Links

- [Skip to main content](https://docs.base.org/base-account/guides/accept-payments#content-area)
- [Base Documentationhome page](https://docs.base.org/)
- [Get Started](https://docs.base.org/get-started/base)
- [Base Chain](https://docs.base.org/base-chain/quickstart/why-base)
- [Base Account](https://docs.base.org/base-account/overview/what-is-base-account)
- [Base App](https://docs.base.org/base-app/introduction/beta-faq)
- [Mini Apps](https://docs.base.org/mini-apps/quickstart/migrate-existing-apps)
- [OnchainKit](https://docs.base.org/onchainkit/latest/getting-started/overview)
- [Cookbook](https://docs.base.org/cookbook/onboard-any-user)
- [Showcase](https://docs.base.org/showcase)
- [Learn](https://docs.base.org/learn/welcome)
- [Web (HTML + JS)](https://docs.base.org/base-account/quickstart/web)
- [Web (Next.js)](https://docs.base.org/base-account/quickstart/web-react)
- [Mobile (React Native)](https://docs.base.org/base-account/quickstart/mobile-integration)
- [Authenticate Users](https://docs.base.org/base-account/guides/authenticate-users)
- [Accept Payments](https://docs.base.org/base-account/guides/accept-payments)
- [Accept Recurring Payments](https://docs.base.org/base-account/guides/accept-recurring-payments)
- [Batch Transactions](https://docs.base.org/base-account/improve-ux/batch-transactions)
- [Sponsor Gas](https://docs.base.org/base-account/improve-ux/sponsor-gas/paymasters)
- [Use Sub Accounts](https://docs.base.org/base-account/improve-ux/sub-accounts)
- [Use Spend Permissions](https://docs.base.org/base-account/improve-ux/spend-permissions)
- [Use Coinbase Balances Onchain](https://docs.base.org/base-account/improve-ux/magic-spend)
- [Sign and Verify Typed Data](https://docs.base.org/base-account/guides/sign-and-verify-typed-data)
- [Pay Gas in ERC20 tokens](https://docs.base.org/base-account/improve-ux/sponsor-gas/erc20-paymasters)
- [Coinbase Developer Platform](https://docs.base.org/base-account/framework-integrations/cdp)
- [RainbowKit](https://docs.base.org/base-account/framework-integrations/rainbowkit)
- [Reown](https://docs.base.org/base-account/framework-integrations/reown)
- [Thirdweb](https://docs.base.org/base-account/framework-integrations/thirdweb)
- [Base Gasless Campaign](https://docs.base.org/base-account/more/base-gasless-campaign)
- [Telemetry](https://docs.base.org/base-account/more/telemetry)
- [Migrate from Coinbase Wallet SDK](https://docs.base.org/base-account/guides/migration-guide)
- [Basenames FAQ](https://docs.base.org/base-account/basenames/basenames-faq)
- [Basename Transfer Guide](https://docs.base.org/base-account/basenames/basename-transfer)
- [Contribute to the Base Account Docs](https://docs.base.org/base-account/contribute/contribute-to-base-account-docs)
- [Security and Bug Bounty](https://docs.base.org/base-account/contribute/security-and-bug-bounty)
- [Why Base Pay?](https://docs.base.org/base-account/guides/accept-payments#why-base-pay)
- [Client-side (Browser SDK)](https://docs.base.org/base-account/guides/accept-payments#client-side-browser-sdk)
- [Collect user information (optional)](https://docs.base.org/base-account/guides/accept-payments#collect-user-information-optional)
- [Server Side](https://docs.base.org/base-account/guides/accept-payments#server-side)
- [Verify User Transaction](https://docs.base.org/base-account/guides/accept-payments#verify-user-transaction)
- [Validate User Info](https://docs.base.org/base-account/guides/accept-payments#validate-user-info)
- [Add the Base Pay Button](https://docs.base.org/base-account/guides/accept-payments#add-the-base-pay-button)
- [Test on Base Sepolia](https://docs.base.org/base-account/guides/accept-payments#test-on-base-sepolia)
- [Brand Guidelines](https://docs.base.org/base-account/reference/ui-elements/brand-guidelines)
- [pay()](https://docs.base.org/base-account/reference/base-pay/pay)
- [getPaymentStatus()](https://docs.base.org/base-account/reference/base-pay/getPaymentStatus)
- [full address object](https://docs.base.org/base-account/reference/core/capabilities/datacallback#physical-address-object)
- [callbackURL reference](https://docs.base.org/base-account/reference/core/capabilities/datacallback)
- [Button Reference](https://docs.base.org/base-account/reference/ui-elements/base-pay-button)
