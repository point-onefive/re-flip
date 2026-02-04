# Web (HTML + JS) - Base Documentation

**Source:** https://docs.base.org/base-account/quickstart/web
**Scraped:** 2026-02-04T10:27:16.942887

---

## Table of Contents

  - ​1. Install the SDK (Optional)
    - ​Option A: CDN (No installation required)
    - ​Option B: NPM Package
  - ​2. Copy-paste this HTML file
  - ​3. Serve the file
  - ​Next steps
  - ​Video Guide

---

## Content

Base Documentation home pageSearch...⌘KAsk AISearch...NavigationQuickstartWeb (HTML + JS)Get StartedBase ChainBase AccountBase AppMini AppsOnchainKitCookbookShowcaseLearnGitHubSupportIntroductionBase Account OverviewQuickstartWeb (HTML + JS)Web (Next.js)Mobile (React Native)GuidesAuthenticate UsersAccept PaymentsAccept Recurring PaymentsBatch TransactionsSponsor GasUse Sub AccountsUse Spend PermissionsUse Coinbase Balances OnchainSign and Verify Typed DataPay Gas in ERC20 tokensFramework IntegrationsWagmi/ViemPrivyCoinbase Developer PlatformRainbowKitReownThirdwebReferenceAccount SDKProviderUI ElementsOnchain ContractsMoreTroubleshootingBase Gasless CampaignTelemetryMigrate from Coinbase Wallet SDKBasenamesBasenames FAQBasename Transfer GuideContributeContribute to the Base Account DocsSecurity and Bug BountyOn this page1. Install the SDK (Optional)Option A: CDN (No installation required)Option B: NPM Package2. Copy-paste this HTML file3. Serve the fileNext stepsVideo GuideThis quick-start shows the minimum code required to add Sign in with Base and Base Pay to any web page using nothing but the Base Account SDK. No frameworks, no additional libraries.
Interactive Playground: Want to test the SDK functions before integrating?
Try our Base Pay SDK
Playground to experiment
with pay() and getPaymentStatus() functions.
Do you prefer video content?There is a video guide that covers the implementation in detail in the last section of this page.
​1. Install the SDK (Optional)
You can use the Base Account SDK in two ways:
​Option A: CDN (No installation required)
Just include the script tag in your HTML - no build tools needed!
index.htmlReport incorrect codeCopyAsk AI[...rest of your code]
<script src="https://unpkg.com/@base-org/account/dist/base-account.min.js"></script>
[...rest of your code]

For a full example, see example below.
​Option B: NPM Package
If you prefer to install locally:
npmpnpmyarnbunReport incorrect codeCopyAsk AInpm install @base-org/account

Then use ES modules:
index.htmlReport incorrect codeCopyAsk AI<script type="module">
 import {
 createBaseAccountSDK,
 pay,
 getPaymentStatus,
 } from "@base-org/account";
 // ... rest of your code
</script>

This guide uses the CDN approach for simplicity.
​2. Copy-paste this HTML file
index.htmlReport incorrect codeCopyAsk AI<!DOCTYPE html>
<html>
 <head>
 <meta charset="utf-8" />
 <title>Base Account Quick-start</title>
 </head>
 <body>
 <h1>Base Account Demo</h1>

 <button id="signin">Sign in with Base</button>
 <button id="pay">Pay with Base</button>

 <div id="status"></div>

 <!-- Load Base Account SDK via CDN -->
 <script src="https://unpkg.com/@base-org/account/dist/base-account.min.js"></script>

 <script>
 // Initialize Base Account SDK with app configuration
 const provider = window
 .createBaseAccountSDK({
 appName: "Base Account Quick-start",
 appLogoUrl: "https://base.org/logo.png",
 })
 .getProvider();
 const statusDiv = document.getElementById("status");
 let userAddress = null;

 function showStatus(message, type = "success") {
 statusDiv.innerHTML = message;
 }

 // Generate a fresh nonce for authentication
 function generateNonce() {
 return window.crypto.randomUUID().replace(/-/g, "");
 }

 // Sign in with Base using wallet_connect method
 document.getElementById("signin").onclick = async () => {
 try {
 showStatus("Connecting to Base Account...", "success");

 // Generate a fresh nonce
 const nonce = generateNonce();

 // Connect and authenticate using the new wallet_connect method
 const { accounts } = await provider.request({
 method: "wallet_connect",
 params: [
 {
 version: "1",
 capabilities: {
 signInWithEthereum: {
 nonce,
 chainId: "0x2105", // Base Mainnet - 8453
 },
 },
 },
 ],
 });

 const { address } = accounts[0];
 const { message, signature } =
 accounts[0].capabilities.signInWithEthereum;

 userAddress = address;

 showStatus(
 `✅ Successfully signed in! Address: ${address.slice(
 0,
 6
 )}...${address.slice(-4)}`
 );

 // In a real app, you would send the message and signature to your backend for verification
 console.log("Authentication data:", { address, message, signature });
 } catch (error) {
 console.error("Sign-in error:", error);
 showStatus(`❌ Sign-in failed: ${error.message}`, "error");
 }
 };

 // One-tap USDC payment using window.base API (works with or without sign-in)
 document.getElementById("pay").onclick = async () => {
 try {
 showStatus("Processing payment...", "success");

 const result = await window.base.pay({
 amount: "5.00", // USD – SDK quotes equivalent USDC
 to: "0x2211d1D0020DAEA8039E46Cf1367962070d77DA9",
 testnet: true, // set to false or omit for Mainnet
 });

 const status = await window.base.getPaymentStatus({
 id: result.id,
 testnet: true,
 });

 showStatus(`🎉 Payment completed! Status: ${status.status}`);
 } catch (error) {
 showStatus(`❌ Payment failed: ${error.message}`, "error");
 }
 };
 </script>
 </body>
</html>
See all 106 lines
​3. Serve the file
Any static server will work:
Report incorrect codeCopyAsk AInpx serve .
# or
python -m http.server

Open http://localhost:3000, click Sign in with Base (optional) and then Pay with Base, approve the transaction, and you’ve sent 5 USDC on Base Sepolia—done! 🎉
​Next steps

Add Sign In With Base Button – implement full SIWE authentication with backend verification
Add Base Pay Button – collect user information during payment flow

Please Follow the Brand GuidelinesIf you intend on using the SignInWithBaseButton or BasePayButton, please follow the Brand Guidelines to ensure consistency across your application.
​Video Guide
Was this page helpful?YesNoSuggest editsRaise issueBase Account OverviewPreviousWeb (Next.js)Next⌘I

---

## Code Examples

### Code Block 1 (unknown)

```unknown
[...rest of your code]
<script src="https://unpkg.com/@base-org/account/dist/base-account.min.js"></script>
[...rest of your code]
```

### Code Block 2 (unknown)

```unknown
npm install @base-org/account
```

### Code Block 3 (unknown)

```unknown
<script type="module">
  import {
    createBaseAccountSDK,
    pay,
    getPaymentStatus,
  } from "@base-org/account";
  // ... rest of your code
</script>
```

### Code Block 4 (unknown)

```unknown
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Base Account Quick-start</title>
  </head>
  <body>
    <h1>Base Account Demo</h1>

    <button id="signin">Sign in with Base</button>
    <button id="pay">Pay with Base</button>

    <div id="status"></div>

    <!-- Load Base Account SDK via CDN -->
    <script src="https://unpkg.com/@base-org/account/dist/base-account.min.js"></script>

    <script>
      // Initialize Base Account SDK with app configuration
      const provider = window
        .createBaseAccountSDK({
          appName: "Base Account Quick-start",
          appLogoUrl: "https://base.org/logo.png",
        })
        .getProvider();
      const statusDiv = document.getElementById("status");
      let userAddress = null;

      function showStatus(message, type = "success") {
        statusDiv.innerHTML = message;
      }

      // Generate a fresh nonce for authentication
      function generateNonce() {
        return window.crypto.randomUUID().replace(/-/g, "");
      }

      // Sign in with Base using wallet_connect method
      document.getElementById("signin").onclick = async () => {
        try {
          showStatus("Connecting to Base Account...", "success");

          // Generate a fresh nonce
          const nonce = generateNonce();

          // Connect and authenticate using the new wallet_connect method
          const { accounts } = await provider.request({
            method: "wallet_connect",
            params: [
              {
                version: "1",
                capabilities: {
                  signInWithEthereum: {
                    nonce,
                    chainId: "0x2105", // Base Mainnet - 8453
                  },
                },
              },
            ],
          });

          const { address } = accounts[0];
          const { message, signature } =
            accounts[0].capabilities.signInWithEthereum;

          userAddress = address;

          showStatus(
            `✅ Successfully signed in! Address: ${address.slice(
              0,
              6
            )}...${address.slice(-4)}`
          );

          // In a real app, you would send the message and signature to your backend for verification
          console.log("Authentication data:", { address, message, signature });
        } catch (error) {
          console.error("Sign-in error:", error);
          showStatus(`❌ Sign-in failed: ${error.message}`, "error");
        }
      };

      // One-tap USDC payment using window.base API (works with or without sign-in)
      document.getElementById("pay").onclick = async () => {
        try {
          showStatus("Processing payment...", "success");

          const result = await window.base.pay({
            amount: "5.00", // USD – SDK quotes equivalent USDC
            to: "0x2211d1D0020DAEA8039E46Cf1367962070d77DA9",
            testnet: true, // set to false or omit for Mainnet
          });

          const status = await window.base.getPaymentStatus({
            id: result.id,
            testnet: true,
          });

          showStatus(`🎉 Payment completed! Status: ${status.status}`);
        } catch (error) {
          showStatus(`❌ Payment failed: ${error.message}`, "error");
        }
      };
    </script>
  </body>
</html>
```

### Code Block 5 (unknown)

```unknown
npx serve .
# or
python -m http.server
```

---

## Related Links

- [Skip to main content](https://docs.base.org/base-account/quickstart/web#content-area)
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
- [1. Install the SDK (Optional)](https://docs.base.org/base-account/quickstart/web#1-install-the-sdk-optional)
- [Option A: CDN (No installation required)](https://docs.base.org/base-account/quickstart/web#option-a-cdn-no-installation-required)
- [Option B: NPM Package](https://docs.base.org/base-account/quickstart/web#option-b-npm-package)
- [2. Copy-paste this HTML file](https://docs.base.org/base-account/quickstart/web#2-copy-paste-this-html-file)
- [3. Serve the file](https://docs.base.org/base-account/quickstart/web#3-serve-the-file)
- [Next steps](https://docs.base.org/base-account/quickstart/web#next-steps)
- [Video Guide](https://docs.base.org/base-account/quickstart/web#video-guide)
- [Add Sign In With Base Button](https://docs.base.org/base-account/reference/ui-elements/sign-in-with-base-button)
- [Add Base Pay Button](https://docs.base.org/base-account/reference/ui-elements/base-pay-button)
- [Brand Guidelines](https://docs.base.org/base-account/reference/ui-elements/brand-guidelines)
