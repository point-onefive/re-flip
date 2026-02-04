# Accept Recurring Payments - Base Documentation

**Source:** https://docs.base.org/base-account/guides/accept-recurring-payments
**Scraped:** 2026-02-04T10:27:11.765973

---

## Table of Contents

  - ​Start accepting recurring payments with Base Pay Subscriptions
  - ​How It Works
  - ​Implementation Guide
    - ​Architecture Overview
    - ​Setup: Create Your Subscription Owner Wallet
    - ​Client-Side: Create Subscriptions
    - ​Server-Side: Charge Subscriptions
    - ​Server-Side: Revoke Subscriptions
    - ​Fund Management
    - ​Testing on Testnet
  - ​Network and Token Support
  - ​Advanced Topics
    - ​Custom Transaction Handling
  - ​API Reference
  - subscribe()
  - getStatus()
  - charge()
  - revoke()
  - Setup Owner Wallet
  - prepareCharge()
  - prepareRevoke()
  - Spend Permissions
  - One-Time Payments

---

## Content

Base Documentation home pageSearch...⌘KAsk AISearch...NavigationGuidesAccept Recurring PaymentsGet StartedBase ChainBase AccountBase AppMini AppsOnchainKitCookbookShowcaseLearnGitHubSupportIntroductionBase Account OverviewQuickstartWeb (HTML + JS)Web (Next.js)Mobile (React Native)GuidesAuthenticate UsersAccept PaymentsAccept Recurring PaymentsBatch TransactionsSponsor GasUse Sub AccountsUse Spend PermissionsUse Coinbase Balances OnchainSign and Verify Typed DataPay Gas in ERC20 tokensFramework IntegrationsWagmi/ViemPrivyCoinbase Developer PlatformRainbowKitReownThirdwebReferenceAccount SDKProviderUI ElementsOnchain ContractsMoreTroubleshootingBase Gasless CampaignTelemetryMigrate from Coinbase Wallet SDKBasenamesBasenames FAQBasename Transfer GuideContributeContribute to the Base Account DocsSecurity and Bug BountyOn this pageStart accepting recurring payments with Base Pay SubscriptionsHow It WorksImplementation GuideArchitecture OverviewSetup: Create Your Subscription Owner WalletClient-Side: Create SubscriptionsServer-Side: Charge SubscriptionsServer-Side: Revoke SubscriptionsFund ManagementTesting on TestnetNetwork and Token SupportAdvanced TopicsCustom Transaction HandlingAPI Reference​Start accepting recurring payments with Base Pay Subscriptions
Base Subscriptions enable you to build predictable, recurring revenue streams by accepting automatic USDC payments. Whether you’re running a SaaS platform, content subscription service, or any business model requiring regular payments, Base Subscriptions provide a seamless solution with no merchant fees.
Key Capabilities:
Flexible Billing PeriodsSupport any billing cycle that fits your business model:
Daily subscriptions for short-term services
Weekly for regular deliveries or services
Monthly for standard SaaS subscriptions
Annual for discounted long-term commitments
Custom periods (e.g., 14 days, 90 days) for unique models
Partial and Usage-Based ChargingCharge any amount up to the permitted limit:
Fixed recurring amounts for predictable billing
Variable usage-based charges within a cap
Tiered pricing with different charge amounts
Prorated charges for mid-cycle changes
Subscription ManagementFull control over the subscription lifecycle:
Real-time status checking to verify active subscriptions
Remaining charge amount for the current period
Next period start date for planning
Cancellation detection for immediate updates
Enterprise-Ready FeaturesBuilt for production use cases:
No transaction fees or platform cuts
Instant settlement in USDC stablecoin
Testnet support for development and testing
Detailed transaction history for accounting
Programmatic access via SDK

​How It Works
Base Subscriptions leverage Spend Permissions – a powerful onchain primitive that allows users to grant revocable spending rights to applications. Here’s the complete flow:
1User Approves SubscriptionYour customer grants your application permission to charge their wallet up to a specified amount each billing period. This is a one-time approval that remains active until cancelled.2Application Charges PeriodicallyYour backend service charges the subscription when payment is due, without requiring any user interaction. You can charge up to the approved amount per period.3Smart Period ManagementThe spending limit automatically resets at the start of each new period. If you don’t charge the full amount in one period, it doesn’t roll over.4User Maintains ControlCustomers can view and cancel their subscriptions anytime through their wallet, ensuring transparency and trust.
​Implementation Guide
​Architecture Overview
A complete subscription implementation requires both client and server components:
Client-Side (Frontend):

User interface for subscription creation
Create wallet requests and handle user responses

Server-Side (Backend - Node.js):

CDP smart wallet for executing charges and revocations
Scheduled jobs for periodic billing
Database for subscription tracking
Handlers for status updates
Retry logic for failed charges

CDP-Powered BackendBase Subscriptions use CDP (Coinbase Developer Platform) server wallets for effortless backend management. The charge() and revoke() functions handle all transaction details automatically:
✅ Automatic wallet management
✅ Built-in transaction signing
✅ Gas estimation and nonce handling
✅ Optional paymaster support for gasless transactions
Get CDP credentials from CDP Portal.
Security RequirementsTo accept recurring payments, you need:
CDP credentials (API key ID, secret, and wallet secret)
Backend infrastructure (Node.js) to execute charges securely
Database to store and manage subscription IDs
Never expose CDP credentials in client-side code

​Setup: Create Your Subscription Owner Wallet
First, set up your CDP smart wallet that will act as the subscription owner:
backend/setup.tsReport incorrect codeCopyAsk AIimport { base } from '@base-org/account/node';

// Backend setup (Node.js only)
// Set CDP credentials as environment variables:
// CDP_API_KEY_ID, CDP_API_KEY_SECRET, CDP_WALLET_SECRET
// PAYMASTER_URL (recommended for gasless transactions)

async function setupSubscriptionWallet() {
 try {
 // Create or retrieve your subscription owner wallet (CDP smart wallet)
 const wallet = await base.subscription.getOrCreateSubscriptionOwnerWallet({
 walletName: 'my-app-subscriptions' // Optional: customize wallet name
 });

 console.log('✅ Subscription owner wallet ready!');
 console.log(`Smart Wallet Address: ${wallet.address}`);
 console.log(`Wallet Name: ${wallet.walletName}`);

 // Make this address available to your frontend
 // Option 1: Store in database/config
 // Option 2: Expose via API endpoint
 // Option 3: Set as public environment variable (e.g., NEXT_PUBLIC_SUBSCRIPTION_OWNER)

 return wallet;
 } catch (error) {
 console.error('Failed to setup wallet:', error.message);
 throw error;
 }
}

// Run once at application startup
setupSubscriptionWallet();

// Optional: Provide an API endpoint for the frontend to fetch the address
export async function getSubscriptionOwnerAddress() {
 const wallet = await base.subscription.getOrCreateSubscriptionOwnerWallet();
 return wallet.address;
}
See all 38 lines
Backend Only: This setup runs in your Node.js backend with CDP credentials. The resulting wallet address is public and safe to share with your frontend for use in subscribe() calls.
Keep CDP Credentials Private: Never expose CDP credentials (API key, secrets) to the frontend. Only the subscription owner wallet address needs to be accessible to the frontend.
​Client-Side: Create Subscriptions
Users create subscriptions from your frontend application:
SubscriptionButton.tsxReport incorrect codeCopyAsk AIimport React, { useState } from 'react';
import { base } from '@base-org/account';

// This address comes from your backend setup (see setup.ts example above)
// You can fetch it from your backend or configure it as a public env var
const SUBSCRIPTION_OWNER_ADDRESS = "0xYourCDPWalletAddress"; // Replace with your actual address

export function SubscriptionButton() {
 const [loading, setLoading] = useState(false);
 const [subscribed, setSubscribed] = useState(false);
 const [subscriptionId, setSubscriptionId] = useState('');

 const handleSubscribe = async () => {
 setLoading(true);

 try {
 // Create subscription
 const subscription = await base.subscription.subscribe({
 recurringCharge: "29.99",
 subscriptionOwner: SUBSCRIPTION_OWNER_ADDRESS, // Address from your backend CDP wallet
 periodInDays: 30,
 testnet: false
 });

 // Store subscription ID for future reference
 setSubscriptionId(subscription.id);
 console.log('Subscription created:', subscription.id);
 console.log('Payer:', subscription.subscriptionPayer);
 console.log('Amount:', subscription.recurringCharge);
 console.log('Period:', subscription.periodInDays, 'days');

 // Send subscription ID to your backend
 await saveSubscriptionToBackend(subscription.id, subscription.subscriptionPayer);

 setSubscribed(true);

 } catch (error) {
 console.error('Subscription failed:', error);
 alert('Failed to create subscription: ' + error.message);
 } finally {
 setLoading(false);
 }
 };

 const saveSubscriptionToBackend = async (id: string, payer: string) => {
 // Example API call to store subscription in your database
 const response = await fetch('/api/subscriptions', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ subscriptionId: id, payerAddress: payer })
 });

 if (!response.ok) {
 throw new Error('Failed to save subscription');
 }
 };

 if (subscribed) {
 return (
 <div className="subscription-status">
 <Check>✅ Subscription active</Check>
 <p>Subscription ID: {subscriptionId.slice(0, 10)}...</p>
 </div>
 );
 }

 return (
 <button 
 onClick={handleSubscribe} 
 disabled={loading}
 className="subscribe-button"
 >
 {loading ? 'Processing...' : 'Subscribe - $29.99/month'}
 </button>
 );
}
See all 76 lines
​Server-Side: Charge Subscriptions
Execute charges effortlessly from your backend using CDP:
chargeSubscriptions.tsReport incorrect codeCopyAsk AIimport { base } from '@base-org/account/node';

// Requires: CDP_API_KEY_ID, CDP_API_KEY_SECRET, CDP_WALLET_SECRET env vars
// Recommended: PAYMASTER_URL for gasless transactions

async function chargeSubscription(subscriptionId: string, recipientAddress?: string) {
 try {
 // 1. Check subscription status
 const status = await base.subscription.getStatus({
 id: subscriptionId,
 testnet: false
 });

 if (!status.isSubscribed) {
 console.log('Subscription cancelled by user');
 return { success: false, reason: 'cancelled' };
 }

 const availableCharge = parseFloat(status.remainingChargeInPeriod || '0');

 if (availableCharge === 0) {
 console.log(`No charge available until ${status.nextPeriodStart}`);
 return { success: false, reason: 'no_charge_available' };
 }

 // 2. Charge the subscription - CDP handles everything automatically
 // Using paymaster for gasless transactions (recommended)
 const result = await base.subscription.charge({
 id: subscriptionId,
 amount: 'max-remaining-charge',
 paymasterUrl: process.env.PAYMASTER_URL, // Optional: for gasless transactions
 recipient: recipientAddress, // Optional: send USDC to specific address
 testnet: false
 });

 console.log(`✅ Charged ${result.amount} USDC (gasless)`);
 console.log(`Transaction: ${result.id}`);
 if (recipientAddress) {
 console.log(`Sent to: ${recipientAddress}`);
 }

 return {
 success: true,
 transactionHash: result.id,
 amount: result.amount,
 recipient: result.recipient
 };

 } catch (error) {
 console.error('Charge failed:', error);
 return { success: false, error: error.message };
 }
}
See all 53 lines
​Server-Side: Revoke Subscriptions
Cancel subscriptions programmatically from your backend:
revokeSubscription.tsReport incorrect codeCopyAsk AIimport { base } from '@base-org/account/node';

async function revokeSubscription(subscriptionId: string, reason: string) {
 try {
 // Revoke the subscription with paymaster for gasless transactions
 const result = await base.subscription.revoke({
 id: subscriptionId,
 paymasterUrl: process.env.PAYMASTER_URL, // Optional: for gasless transactions
 testnet: false
 });

 console.log(`✅ Revoked subscription: ${subscriptionId}`);
 console.log(`Transaction: ${result.id}`);
 console.log(`Reason: ${reason}`);

 return {
 success: true,
 transactionHash: result.id
 };

 } catch (error) {
 console.error('Revoke failed:', error);
 return { success: false, error: error.message };
 }
}

// Usage examples
async function handleUserCancellation(subscriptionId: string) {
 return await revokeSubscription(subscriptionId, 'user_requested');
}

async function handlePolicyViolation(subscriptionId: string) {
 return await revokeSubscription(subscriptionId, 'policy_violation');
}
See all 34 lines
Automatic Transaction Management: The charge() and revoke() functions handle all transaction details including wallet management, gas estimation, nonce handling, and transaction confirmation. Use the paymasterUrl parameter to enable gasless transactions for your users.
Gasless Transactions: Set the PAYMASTER_URL environment variable to sponsor gas fees for your subscription charges and revocations. This creates a seamless experience where your backend covers all gas costs. Get your paymaster URL from the CDP Portal.
​Fund Management
By default, charged USDC remains in your subscription owner wallet. You can optionally specify a recipient address to automatically transfer funds to a different address:
 Default (Keep in Owner Wallet) Send to Treasury Wallet Dynamic RecipientsReport incorrect codeCopyAsk AI// Funds stay in the subscription owner wallet
const result = await base.subscription.charge({
 id: subscriptionId,
 amount: 'max-remaining-charge',
 testnet: false
});

// USDC is now in your CDP smart wallet
// Access it later or transfer as needed
Report incorrect codeCopyAsk AI// Automatically send to your treasury wallet
const result = await base.subscription.charge({
 id: subscriptionId,
 amount: 'max-remaining-charge',
 recipient: '0xYourTreasuryAddress',
 testnet: false
});

// USDC is sent directly to the recipient address
console.log(`Sent ${result.amount} to ${result.recipient}`);
Report incorrect codeCopyAsk AI// Send to different addresses based on subscription type
async function chargeWithRecipient(subscriptionId: string, plan: string) {
 const recipients = {
 premium: '0xPremiumTreasuryAddress',
 basic: '0xBasicTreasuryAddress',
 enterprise: '0xEnterpriseTreasuryAddress'
 };

 return await base.subscription.charge({
 id: subscriptionId,
 amount: 'max-remaining-charge',
 recipient: recipients[plan],
 testnet: false
 });
}

​Testing on Testnet
Test your subscription implementation on Base Sepolia before going live:
testnet-frontend.tsReport incorrect codeCopyAsk AI// Frontend: Create subscription on testnet
const subscription = await base.subscription.subscribe({
 recurringCharge: "10.00",
 subscriptionOwner: SUBSCRIPTION_OWNER_ADDRESS,
 periodInDays: 1, // Daily for faster testing
 testnet: true // Use Base Sepolia
});
See all 7 lines
testnet-backend.tsReport incorrect codeCopyAsk AI// Backend: Setup wallet on testnet (Node.js only)
import { base } from '@base-org/account/node';

const wallet = await base.subscription.getOrCreateSubscriptionOwnerWallet({
 walletName: 'testnet-subscriptions'
});

// Check status on testnet
const status = await base.subscription.getStatus({
 id: subscriptionId,
 testnet: true
});

// Charge on testnet with paymaster
const result = await base.subscription.charge({
 id: subscriptionId,
 amount: "10.00",
 paymasterUrl: process.env.PAYMASTER_URL, // Gasless transactions
 testnet: true
});

console.log(`Testnet charge (gasless): ${result.id}`);
See all 22 lines
​Network and Token Support
Base Subscriptions (USDC on Base):
NetworkChain IDTokenStatusBase Mainnet8453USDC✅ Production ReadyBase Sepolia84532USDC✅ Testing Available
Custom Implementations Possible: While Base Subscriptions are optimized for USDC on Base, you can use the underlying Spend Permissions primitive to build custom subscription implementations with any ERC-20 token or native ETH on any EVM-compatible chain.
​Advanced Topics
​Custom Transaction Handling
For developers who need manual control over transaction execution or want to integrate with existing wallet infrastructure, use the lower-level utilities:
prepareCharge - Manual Charge ExecutionIf you can’t use CDP wallets, prepareCharge() gives you call data to execute manually:Report incorrect codeCopyAsk AIimport { base } from '@base-org/account';

// Prepare charge call data
const chargeCalls = await base.subscription.prepareCharge({
 id: subscriptionId,
 amount: 'max-remaining-charge',
 testnet: false
});

// Execute with your own wallet infrastructure
// (requires custom wallet client setup)
See prepareCharge reference for details.prepareRevoke - Manual Revoke ExecutionSimilarly, prepareRevoke() provides revocation call data:Report incorrect codeCopyAsk AIimport { base } from '@base-org/account';

// Prepare revoke call data
const revokeCall = await base.subscription.prepareRevoke({
 id: subscriptionId,
 testnet: false
});

// Execute with your own wallet infrastructure
See prepareRevoke reference for details.
​API Reference
subscribe()Create subscriptions from frontendgetStatus()Check subscription statuscharge()Charge subscriptions from backendrevoke()Cancel subscriptions from backendSetup Owner WalletSetup CDP owner wallet for subscription managementprepareCharge()Advanced: Custom charge executionprepareRevoke()Advanced: Custom revoke executionSpend PermissionsDeep dive into the underlying primitiveOne-Time PaymentsAccept single payments
Was this page helpful?YesNoSuggest editsRaise issueAccept PaymentsPreviousBatch TransactionsNext⌘I

---

## Code Examples

### Code Block 1 (unknown)

```unknown
import { base } from '@base-org/account/node';

// Backend setup (Node.js only)
// Set CDP credentials as environment variables:
// CDP_API_KEY_ID, CDP_API_KEY_SECRET, CDP_WALLET_SECRET
// PAYMASTER_URL (recommended for gasless transactions)

async function setupSubscriptionWallet() {
  try {
    // Create or retrieve your subscription owner wallet (CDP smart wallet)
    const wallet = await base.subscription.getOrCreateSubscriptionOwnerWallet({
      walletName: 'my-app-subscriptions' // Optional: customize wallet name
    });
    
    console.log('✅ Subscription owner wallet ready!');
    console.log(`Smart Wallet Address: ${wallet.address}`);
    console.log(`Wallet Name: ${wallet.walletName}`);
    
    // Make this address available to your frontend
    // Option 1: Store in database/config
    // Option 2: Expose via API endpoint
    // Option 3: Set as public environment variable (e.g., NEXT_PUBLIC_SUBSCRIPTION_OWNER)
    
    return wallet;
  } catch (error) {
    console.error('Failed to setup wallet:', error.message);
    throw error;
  }
}

// Run once at application startup
setupSubscriptionWallet();

// Optional: Provide an API endpoint for the frontend to fetch the address
export async function getSubscriptionOwnerAddress() {
  const wallet = await base.subscription.getOrCreateSubscriptionOwnerWallet();
  return wallet.address;
}
```

### Code Block 2 (unknown)

```unknown
import React, { useState } from 'react';
import { base } from '@base-org/account';

// This address comes from your backend setup (see setup.ts example above)
// You can fetch it from your backend or configure it as a public env var
const SUBSCRIPTION_OWNER_ADDRESS = "0xYourCDPWalletAddress"; // Replace with your actual address

export function SubscriptionButton() {
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [subscriptionId, setSubscriptionId] = useState('');
  
  const handleSubscribe = async () => {
    setLoading(true);
    
    try {
      // Create subscription
      const subscription = await base.subscription.subscribe({
        recurringCharge: "29.99",
        subscriptionOwner: SUBSCRIPTION_OWNER_ADDRESS, // Address from your backend CDP wallet
        periodInDays: 30,
        testnet: false
      });
      
      // Store subscription ID for future reference
      setSubscriptionId(subscription.id);
      console.log('Subscription created:', subscription.id);
      console.log('Payer:', subscription.subscriptionPayer);
      console.log('Amount:', subscription.recurringCharge);
      console.log('Period:', subscription.periodInDays, 'days');
      
      // Send subscription ID to your backend
      await saveSubscriptionToBackend(subscription.id, subscription.subscriptionPayer);
      
      setSubscribed(true);
      
    } catch (error) {
      console.error('Subscription failed:', error);
      alert('Failed to create subscription: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const saveSubscriptionToBackend = async (id: string, payer: string) => {
    // Example API call to store subscription in your database
    const response = await fetch('/api/subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscriptionId: id, payerAddress: payer })
    });
    
    if (!response.ok) {
      throw new Error('Failed to save subscription');
    }
  };
  
  if (subscribed) {
    return (
      <div className="subscription-status">
        <Check>✅ Subscription active</Check>
        <p>Subscription ID: {subscriptionId.slice(0, 10)}...</p>
      </div>
    );
  }
  
  return (
    <button 
      onClick={handleSubscribe} 
      disabled={loading}
      className="subscribe-button"
    >
      {loading ? 'Processing...' : 'Subscribe - $29.99/month'}
    </button>
  );
}
```

### Code Block 3 (unknown)

```unknown
import { base } from '@base-org/account/node';

// Requires: CDP_API_KEY_ID, CDP_API_KEY_SECRET, CDP_WALLET_SECRET env vars
// Recommended: PAYMASTER_URL for gasless transactions

async function chargeSubscription(subscriptionId: string, recipientAddress?: string) {
  try {
    // 1. Check subscription status
    const status = await base.subscription.getStatus({
      id: subscriptionId,
      testnet: false
    });
    
    if (!status.isSubscribed) {
      console.log('Subscription cancelled by user');
      return { success: false, reason: 'cancelled' };
    }
    
    const availableCharge = parseFloat(status.remainingChargeInPeriod || '0');
    
    if (availableCharge === 0) {
      console.log(`No charge available until ${status.nextPeriodStart}`);
      return { success: false, reason: 'no_charge_available' };
    }
    
    // 2. Charge the subscription - CDP handles everything automatically
    // Using paymaster for gasless transactions (recommended)
    const result = await base.subscription.charge({
      id: subscriptionId,
      amount: 'max-remaining-charge',
      paymasterUrl: process.env.PAYMASTER_URL, // Optional: for gasless transactions
      recipient: recipientAddress, // Optional: send USDC to specific address
      testnet: false
    });
    
    console.log(`✅ Charged ${result.amount} USDC (gasless)`);
    console.log(`Transaction: ${result.id}`);
    if (recipientAddress) {
      console.log(`Sent to: ${recipientAddress}`);
    }
    
    return {
      success: true,
      transactionHash: result.id,
      amount: result.amount,
      recipient: result.recipient
    };
    
  } catch (error) {
    console.error('Charge failed:', error);
    return { success: false, error: error.message };
  }
}
```

### Code Block 4 (unknown)

```unknown
import { base } from '@base-org/account/node';

async function revokeSubscription(subscriptionId: string, reason: string) {
  try {
    // Revoke the subscription with paymaster for gasless transactions
    const result = await base.subscription.revoke({
      id: subscriptionId,
      paymasterUrl: process.env.PAYMASTER_URL, // Optional: for gasless transactions
      testnet: false
    });
    
    console.log(`✅ Revoked subscription: ${subscriptionId}`);
    console.log(`Transaction: ${result.id}`);
    console.log(`Reason: ${reason}`);
    
    return {
      success: true,
      transactionHash: result.id
    };
    
  } catch (error) {
    console.error('Revoke failed:', error);
    return { success: false, error: error.message };
  }
}

// Usage examples
async function handleUserCancellation(subscriptionId: string) {
  return await revokeSubscription(subscriptionId, 'user_requested');
}

async function handlePolicyViolation(subscriptionId: string) {
  return await revokeSubscription(subscriptionId, 'policy_violation');
}
```

### Code Block 5 (unknown)

```unknown
// Funds stay in the subscription owner wallet
const result = await base.subscription.charge({
  id: subscriptionId,
  amount: 'max-remaining-charge',
  testnet: false
});

// USDC is now in your CDP smart wallet
// Access it later or transfer as needed
```

### Code Block 6 (unknown)

```unknown
// Automatically send to your treasury wallet
const result = await base.subscription.charge({
  id: subscriptionId,
  amount: 'max-remaining-charge',
  recipient: '0xYourTreasuryAddress',
  testnet: false
});

// USDC is sent directly to the recipient address
console.log(`Sent ${result.amount} to ${result.recipient}`);
```

### Code Block 7 (unknown)

```unknown
// Send to different addresses based on subscription type
async function chargeWithRecipient(subscriptionId: string, plan: string) {
  const recipients = {
    premium: '0xPremiumTreasuryAddress',
    basic: '0xBasicTreasuryAddress',
    enterprise: '0xEnterpriseTreasuryAddress'
  };
  
  return await base.subscription.charge({
    id: subscriptionId,
    amount: 'max-remaining-charge',
    recipient: recipients[plan],
    testnet: false
  });
}
```

### Code Block 8 (unknown)

```unknown
// Frontend: Create subscription on testnet
const subscription = await base.subscription.subscribe({
  recurringCharge: "10.00",
  subscriptionOwner: SUBSCRIPTION_OWNER_ADDRESS,
  periodInDays: 1, // Daily for faster testing
  testnet: true     // Use Base Sepolia
});
```

### Code Block 9 (unknown)

```unknown
// Backend: Setup wallet on testnet (Node.js only)
import { base } from '@base-org/account/node';

const wallet = await base.subscription.getOrCreateSubscriptionOwnerWallet({
  walletName: 'testnet-subscriptions'
});

// Check status on testnet
const status = await base.subscription.getStatus({
  id: subscriptionId,
  testnet: true
});

// Charge on testnet with paymaster
const result = await base.subscription.charge({
  id: subscriptionId,
  amount: "10.00",
  paymasterUrl: process.env.PAYMASTER_URL, // Gasless transactions
  testnet: true
});

console.log(`Testnet charge (gasless): ${result.id}`);
```

### Code Block 10 (unknown)

```unknown
import { base } from '@base-org/account';

// Prepare charge call data
const chargeCalls = await base.subscription.prepareCharge({
  id: subscriptionId,
  amount: 'max-remaining-charge',
  testnet: false
});

// Execute with your own wallet infrastructure
// (requires custom wallet client setup)
```

### Code Block 11 (unknown)

```unknown
import { base } from '@base-org/account';

// Prepare revoke call data
const revokeCall = await base.subscription.prepareRevoke({
  id: subscriptionId,
  testnet: false
});

// Execute with your own wallet infrastructure
```

---

## Related Links

- [Skip to main content](https://docs.base.org/base-account/guides/accept-recurring-payments#content-area)
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
- [Start accepting recurring payments with Base Pay Subscriptions](https://docs.base.org/base-account/guides/accept-recurring-payments#start-accepting-recurring-payments-with-base-pay-subscriptions)
- [How It Works](https://docs.base.org/base-account/guides/accept-recurring-payments#how-it-works)
- [Implementation Guide](https://docs.base.org/base-account/guides/accept-recurring-payments#implementation-guide)
- [Architecture Overview](https://docs.base.org/base-account/guides/accept-recurring-payments#architecture-overview)
- [Setup: Create Your Subscription Owner Wallet](https://docs.base.org/base-account/guides/accept-recurring-payments#setup-create-your-subscription-owner-wallet)
- [Client-Side: Create Subscriptions](https://docs.base.org/base-account/guides/accept-recurring-payments#client-side-create-subscriptions)
- [Server-Side: Charge Subscriptions](https://docs.base.org/base-account/guides/accept-recurring-payments#server-side-charge-subscriptions)
- [Server-Side: Revoke Subscriptions](https://docs.base.org/base-account/guides/accept-recurring-payments#server-side-revoke-subscriptions)
- [Fund Management](https://docs.base.org/base-account/guides/accept-recurring-payments#fund-management)
- [Testing on Testnet](https://docs.base.org/base-account/guides/accept-recurring-payments#testing-on-testnet)
- [Network and Token Support](https://docs.base.org/base-account/guides/accept-recurring-payments#network-and-token-support)
- [Advanced Topics](https://docs.base.org/base-account/guides/accept-recurring-payments#advanced-topics)
- [Custom Transaction Handling](https://docs.base.org/base-account/guides/accept-recurring-payments#custom-transaction-handling)
- [API Reference](https://docs.base.org/base-account/guides/accept-recurring-payments#api-reference)
- [prepareChargereference](https://docs.base.org/base-account/reference/base-pay/prepareCharge)
- [prepareRevokereference](https://docs.base.org/base-account/reference/base-pay/prepareRevoke)
- [subscribe()Create subscriptions from frontend](https://docs.base.org/base-account/reference/base-pay/subscribe)
- [getStatus()Check subscription status](https://docs.base.org/base-account/reference/base-pay/getStatus)
- [charge()Charge subscriptions from backend](https://docs.base.org/base-account/reference/base-pay/charge)
- [revoke()Cancel subscriptions from backend](https://docs.base.org/base-account/reference/base-pay/revoke)
- [Setup Owner WalletSetup CDP owner wallet for subscription management](https://docs.base.org/base-account/reference/base-pay/getOrCreateSubscriptionOwnerWallet)
