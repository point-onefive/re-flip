# Migrate an Existing App - Base Documentation

**Source:** https://docs.base.org/mini-apps/quickstart/migrate-existing-apps
**Scraped:** 2026-02-04T10:27:27.402465

---

## Table of Contents

    - ​Example Manifest

---

## Content

Base Documentation home pageSearch...⌘KAsk AISearch...NavigationQuickstartMigrate an Existing AppGet StartedBase ChainBase AccountBase AppMini AppsOnchainKitCookbookShowcaseLearnQuickstartMigrate an Existing AppCreate a Mini AppBuild ChecklistBuilding for The Base AppMini App TemplatesNEWCore ConceptsManifestContextEmbeds & PreviewsBase AccountNotificationsAuthenticationNavigationTechnical GuidesSign Your ManifestGenerate Dynamic Embed ImagesSend Notifications (Neynar)Accept PaymentsFeatured GuidelinesFeatured ChecklistProduct GuidelinesDesign GuidelinesNotification GuidelinesTechnical GuidelinesGrowth PlaybookWhy Mini AppsOptimize OnboardingIdeating Viral AppsRewardsTroubleshootingCommon Issues & DebuggingBase App CompatibilityHow Search worksTest Your AppResourcesTemplatesDesign resourcesLlms full.txtPrerequisites

You have an existing web app
You have a Base app account

1Add the MiniApp SDKnpmpnpmyarnReport incorrect codeCopyAsk AInpm install @farcaster/miniapp-sdk
2Trigger App DisplayOnce your app has loaded, call sdk.actions.ready() to hide the loading splash screen and display your app. Vanilla JS Reactapp.jsReport incorrect codeCopyAsk AIimport { sdk } from '@farcaster/miniapp-sdk';

// Once app is ready to be displayed
await sdk.actions.ready();
In React apps, call ready() inside a useEffect hook to prevent it from running on every re-render. Call ready() as soon as possible and avoid jitter and content reflows.app.tsxReport incorrect codeCopyAsk AIimport { sdk } from '@farcaster/miniapp-sdk';
import { useEffect } from 'react';

function App() {
 useEffect(() => {
 sdk.actions.ready();
 }, []);

 return(...your app content goes here...)
}

export default App;

3Host the ManifestCreate a file available at https://www.your-domain.com/.well-known/farcaster.json. Vanilla JS Next.jsCreate the manifest file in your project at /public/.well-known/farcaster.json.Create a Next.js route to host your manifest fileapp/.well-known/farcaster.json/route.tsReport incorrect codeCopyAsk AIfunction withValidProperties(properties: Record<string, undefined | string | string[]>) {
return Object.fromEntries(
 Object.entries(properties).filter(([_, value]) => (Array.isArray(value) ? value.length > 0 : !!value))
);
}

export async function GET() {
const URL = process.env.NEXT_PUBLIC_URL as string;
return Response.json(paste_manifest_json_object_here); // see the next step for the manifest_json_object
}
4Update the ManifestCopy the example manifest below and add it to the file created in the previous step. Update each field in the miniapp.For details on each field, see the field reference​Example Manifest/.well-known/farcaster.jsonReport incorrect codeCopyAsk AI{
 "accountAssociation": { // these will be added in step 5
 "header": "",
 "payload": "",
 "signature": ""
 },
 "miniapp": {
 "version": "1",
 "name": "Example Mini App",
 "homeUrl": "https://ex.co",
 "iconUrl": "https://ex.co/i.png",
 "splashImageUrl": "https://ex.co/l.png",
 "splashBackgroundColor": "#000000",
 "webhookUrl": "https://ex.co/api/webhook",
 "subtitle": "Fast, fun, social",
 "description": "A fast, fun way to challenge friends in real time.",
 "screenshotUrls": [
 "https://ex.co/s1.png",
 "https://ex.co/s2.png",
 "https://ex.co/s3.png"
 ],
 "primaryCategory": "social",
 "tags": ["example", "miniapp", "baseapp"],
 "heroImageUrl": "https://ex.co/og.png",
 "tagline": "Play instantly",
 "ogTitle": "Example Mini App",
 "ogDescription": "Challenge friends in real time.",
 "ogImageUrl": "https://ex.co/og.png",
 "noindex": true
 }
}
5Create accountAssociation CredentialsThe accountAssociation fields in the manifest are used to verify ownership of your app. You can generate these fields on Base Build.
Ensure all changes are live so that the Manifest file is available at your app’s url.
Navigate to the Base Build Account association tool.
Paste your domain in the App URL field (ex: sample-url.vercel.app) and click “Submit”
Click on the “Verify” button that appears and follow the instructions to generate the accountAssociation fields.
Copy the accountAssociation fields and paste them into the manifest file you added in the previous step.
/.well-known/farcaster.jsonReport incorrect codeCopyAsk AI{
 "accountAssociation": {
 "header": "eyJmaWQiOjkxNTIsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHgwMmVmNzkwRGQ3OTkzQTM1ZkQ4NDdDMDUzRURkQUU5NDBEMDU1NTk2In0",
 "payload": "eyJkb21haW4iOiJhcHAuZXhhbXBsZS5jb20ifQ",
 "signature": "MHgwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDIwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwNDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMjAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAyMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwYzAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMTIwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAxNzAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDEyNDdhNDhlZGJmMTMwZDU0MmIzMWQzZTg1ZDUyOTAwMmEwNDNkMjM5NjZiNWVjNTNmYjhlNzUzZmIyYzc1MWFmNTI4MWFiYTgxY2I5ZDE3NDAyY2YxMzQxOGI2MTcwYzFiODY3OTExZDkxN2UxMzU3MmVkMWIwYzNkYzEyM2Q1ODAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMjVmMTk4MDg2YjJkYjE3MjU2NzMxYmM0NTY2NzNiOTZiY2VmMjNmNTFkMWZiYWNkZDdjNDM3OWVmNjU0NjU1NzJmMWQwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwOGE3YjIyNzQ3OTcwNjUyMjNhMjI3NzY1NjI2MTc1NzQ2ODZlMmU2NzY1NzQyMjJjMjI2MzY4NjE2YzZjNjU2ZTY3NjUyMjNhMjI2NDJkMzQ0YjMzMzMzNjUyNDY3MDc0MzE0NTYxNjQ2Yjc1NTE0ODU3NDg2ZDc5Mzc1Mzc1Njk2YjQ0MzI0ZjM1NGE2MzRhNjM2YjVhNGM3NDUzMzczODIyMmMyMjZmNzI2OTY3Njk2ZTIyM2EyMjY4NzQ3NDcwNzMzYTJmMmY2YjY1Nzk3MzJlNjM2ZjY5NmU2MjYxNzM2NTJlNjM2ZjZkMjIyYzIyNjM3MjZmNzM3MzRmNzI2OTY3Njk2ZTIyM2E2NjYxNmM3MzY1N2QwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMA"
 },
 "miniapp": {...} // these fields remain the same
}
Note: Because you are signing with your Base Account, the signature field will be significantly longer than if you were to sign directly with your Farcaster custody wallet.6Add Embed MetadataUpdate your index.html file to include the fc:miniapp metadata. This is used to generate the rich embeds when your app is shared and is required for your app to display. Vanilla JS Next.jsAdd directly to your index.html file.index.htmlReport incorrect codeCopyAsk AI <meta name="fc:miniapp" content='{
 "version":"next",
 "imageUrl":"https://your-app.com/embed-image",
 "button":{
 "title":"Play Now",
 "action":{
 "type":"launch_miniapp",
 "name":"Your App Name",
 "url":"https://your-app.com"
 }
 }
 }' />
Use the generateMetadata function to add the fc:miniapp metadata.app/layout.tsxReport incorrect codeCopyAsk AI export async function generateMetadata(): Promise<Metadata> {
 return {
 other: {
 'fc:miniapp': JSON.stringify({
 version: 'next',
 imageUrl: 'https://your-app.com/embed-image',
 button: {
 title: `Launch Your App Name`,
 action: {
 type: 'launch_miniapp',
 name: 'Your App Name',
 url: 'https://your-app.com',
 splashImageUrl: 'https://your-app.com/splash-image',
 splashBackgroundColor: '#000000',
 },
 },
 }),
 },
 };
 }
7Push to ProductionEnsure all changes are live.8Preview Your AppUse the Base Build Preview tool to validate your app.
Add your app URL to view the embeds and click the launch button to verify the app launches as expected.
Use the “Account association” tab to verify the association credentials were created correctly.
Use the “Metadata” to see the metadata added from the manifest and identify any missing fields.
9Post to PublishTo publish your app, create a post in the Base app with your app’s URL.Was this page helpful?YesNoSuggest editsRaise issueCreate a Mini AppNext⌘I

---

## Code Examples

### Code Block 1 (unknown)

```unknown
npm install @farcaster/miniapp-sdk
```

### Code Block 2 (unknown)

```unknown
import { sdk } from '@farcaster/miniapp-sdk';

// Once app is ready to be displayed
await sdk.actions.ready();
```

### Code Block 3 (unknown)

```unknown
import { sdk } from '@farcaster/miniapp-sdk';
import { useEffect } from 'react';

function App() {
    useEffect(() => {
        sdk.actions.ready();
    }, []);

    return(...your app content goes here...)
}

export default App;
```

### Code Block 4 (unknown)

```unknown
function withValidProperties(properties: Record<string, undefined | string | string[]>) {
return Object.fromEntries(
    Object.entries(properties).filter(([_, value]) => (Array.isArray(value) ? value.length > 0 : !!value))
);
}

export async function GET() {
const URL = process.env.NEXT_PUBLIC_URL as string;
return Response.json(paste_manifest_json_object_here); // see the next step for the manifest_json_object
}
```

### Code Block 5 (unknown)

```unknown
{
  "accountAssociation": {  // these will be added in step 5
    "header": "",
    "payload": "",
    "signature": ""
  },
  "miniapp": {
    "version": "1",
    "name": "Example Mini App",
    "homeUrl": "https://ex.co",
    "iconUrl": "https://ex.co/i.png",
    "splashImageUrl": "https://ex.co/l.png",
    "splashBackgroundColor": "#000000",
    "webhookUrl": "https://ex.co/api/webhook",
    "subtitle": "Fast, fun, social",
    "description": "A fast, fun way to challenge friends in real time.",
    "screenshotUrls": [
      "https://ex.co/s1.png",
      "https://ex.co/s2.png",
      "https://ex.co/s3.png"
    ],
    "primaryCategory": "social",
    "tags": ["example", "miniapp", "baseapp"],
    "heroImageUrl": "https://ex.co/og.png",
    "tagline": "Play instantly",
    "ogTitle": "Example Mini App",
    "ogDescription": "Challenge friends in real time.",
    "ogImageUrl": "https://ex.co/og.png",
    "noindex": true
  }
}
```

### Code Block 6 (unknown)

```unknown
{
  "accountAssociation": {
    "header": "eyJmaWQiOjkxNTIsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHgwMmVmNzkwRGQ3OTkzQTM1ZkQ4NDdDMDUzRURkQUU5NDBEMDU1NTk2In0",
    "payload": "eyJkb21haW4iOiJhcHAuZXhhbXBsZS5jb20ifQ",
    "signature": "MHgwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDIwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwNDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMjAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAyMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwYzAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMTIwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAxNzAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDEyNDdhNDhlZGJmMTMwZDU0MmIzMWQzZTg1ZDUyOTAwMmEwNDNkMjM5NjZiNWVjNTNmYjhlNzUzZmIyYzc1MWFmNTI4MWFiYTgxY2I5ZDE3NDAyY2YxMzQxOGI2MTcwYzFiODY3OTExZDkxN2UxMzU3MmVkMWIwYzNkYzEyM2Q1ODAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMjVmMTk4MDg2YjJkYjE3MjU2NzMxYmM0NTY2NzNiOTZiY2VmMjNmNTFkMWZiYWNkZDdjNDM3OWVmNjU0NjU1NzJmMWQwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwOGE3YjIyNzQ3OTcwNjUyMjNhMjI3NzY1NjI2MTc1NzQ2ODZlMmU2NzY1NzQyMjJjMjI2MzY4NjE2YzZjNjU2ZTY3NjUyMjNhMjI2NDJkMzQ0YjMzMzMzNjUyNDY3MDc0MzE0NTYxNjQ2Yjc1NTE0ODU3NDg2ZDc5Mzc1Mzc1Njk2YjQ0MzI0ZjM1NGE2MzRhNjM2YjVhNGM3NDUzMzczODIyMmMyMjZmNzI2OTY3Njk2ZTIyM2EyMjY4NzQ3NDcwNzMzYTJmMmY2YjY1Nzk3MzJlNjM2ZjY5NmU2MjYxNzM2NTJlNjM2ZjZkMjIyYzIyNjM3MjZmNzM3MzRmNzI2OTY3Njk2ZTIyM2E2NjYxNmM3MzY1N2QwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMA"
  },
  "miniapp": {...} // these fields remain the same
}
```

### Code Block 7 (unknown)

```unknown
<meta name="fc:miniapp" content='{
  "version":"next",
  "imageUrl":"https://your-app.com/embed-image",
  "button":{
      "title":"Play Now",
      "action":{
      "type":"launch_miniapp",
      "name":"Your App Name",
      "url":"https://your-app.com"
      }
  }
  }' />
```

### Code Block 8 (unknown)

```unknown
export async function generateMetadata(): Promise<Metadata> {
    return {
        other: {
        'fc:miniapp': JSON.stringify({
            version: 'next',
            imageUrl: 'https://your-app.com/embed-image',
            button: {
                title: `Launch Your App Name`,
                action: {
                    type: 'launch_miniapp',
                    name: 'Your App Name',
                    url: 'https://your-app.com',
                    splashImageUrl: 'https://your-app.com/splash-image',
                    splashBackgroundColor: '#000000',
                },
            },
        }),
        },
    };
    }
```

---

## Related Links

- [Skip to main content](https://docs.base.org/mini-apps/quickstart/migrate-existing-apps#content-area)
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
- [Create a Mini App](https://docs.base.org/mini-apps/quickstart/create-new-miniapp)
- [Build Checklist](https://docs.base.org/mini-apps/quickstart/build-checklist)
- [Building for The Base App](https://docs.base.org/mini-apps/quickstart/building-for-the-base-app)
- [Manifest](https://docs.base.org/mini-apps/core-concepts/manifest)
- [Context](https://docs.base.org/mini-apps/core-concepts/context)
- [Embeds & Previews](https://docs.base.org/mini-apps/core-concepts/embeds-and-previews)
- [Base Account](https://docs.base.org/mini-apps/core-concepts/base-account)
- [Notifications](https://docs.base.org/mini-apps/core-concepts/notifications)
- [Authentication](https://docs.base.org/mini-apps/core-concepts/authentication)
- [Navigation](https://docs.base.org/mini-apps/core-concepts/navigation)
- [Sign Your Manifest](https://docs.base.org/mini-apps/technical-guides/sign-manifest)
- [Generate Dynamic Embed Images](https://docs.base.org/mini-apps/technical-guides/dynamic-embeds)
- [Send Notifications (Neynar)](https://docs.base.org/mini-apps/technical-guides/neynar-notifications)
- [Accept Payments](https://docs.base.org/mini-apps/technical-guides/accept-payments)
- [Featured Checklist](https://docs.base.org/mini-apps/featured-guidelines/overview)
- [Product Guidelines](https://docs.base.org/mini-apps/featured-guidelines/product-guidelines)
- [Design Guidelines](https://docs.base.org/mini-apps/featured-guidelines/design-guidelines)
- [Notification Guidelines](https://docs.base.org/mini-apps/featured-guidelines/notification-guidelines)
- [Technical Guidelines](https://docs.base.org/mini-apps/featured-guidelines/technical-guidelines)
- [Why Mini Apps](https://docs.base.org/mini-apps/introduction/overview)
- [Optimize Onboarding](https://docs.base.org/mini-apps/growth/optimize-onboarding)
- [Ideating Viral Apps](https://docs.base.org/mini-apps/growth/build-viral-mini-apps)
- [Rewards](https://docs.base.org/mini-apps/growth/rewards)
- [Common Issues & Debugging](https://docs.base.org/mini-apps/troubleshooting/common-issues)
- [Base App Compatibility](https://docs.base.org/mini-apps/troubleshooting/base-app-compatibility)
- [How Search works](https://docs.base.org/mini-apps/troubleshooting/how-search-works)
- [Test Your App](https://docs.base.org/mini-apps/troubleshooting/testing)
- [Templates](https://docs.base.org/mini-apps/resources/templates)
- [Design resources](https://docs.base.org/mini-apps/resources/design-resources)
- [Llms full.txt](https://docs.base.org/mini-apps/llms-full.txt)
- [field reference](https://docs.base.org/mini-apps/features/manifest#field-reference)
- [​](https://docs.base.org/mini-apps/quickstart/migrate-existing-apps#example-manifest)
