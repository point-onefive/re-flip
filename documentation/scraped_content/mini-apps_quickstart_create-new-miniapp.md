# Create a Mini App - Base Documentation

**Source:** https://docs.base.org/mini-apps/quickstart/create-new-miniapp
**Scraped:** 2026-02-04T10:27:08.813213

---

## Table of Contents

  - Deploy to Vercel
  - ​Next Steps
  - Templates

---

## Content

Base Documentation home pageSearch...⌘KAsk AISearch...NavigationQuickstartCreate a Mini AppGet StartedBase ChainBase AccountBase AppMini AppsOnchainKitCookbookShowcaseLearnQuickstartMigrate an Existing AppCreate a Mini AppBuild ChecklistBuilding for The Base AppMini App TemplatesNEWCore ConceptsManifestContextEmbeds & PreviewsBase AccountNotificationsAuthenticationNavigationTechnical GuidesSign Your ManifestGenerate Dynamic Embed ImagesSend Notifications (Neynar)Accept PaymentsFeatured GuidelinesFeatured ChecklistProduct GuidelinesDesign GuidelinesNotification GuidelinesTechnical GuidelinesGrowth PlaybookWhy Mini AppsOptimize OnboardingIdeating Viral AppsRewardsTroubleshootingCommon Issues & DebuggingBase App CompatibilityHow Search worksTest Your AppResourcesTemplatesDesign resourcesLlms full.txtPrerequisites

Base app account
Vercel account for hosting the application

1Deploy TemplateClick the button below and follow the prompts to deploy the quickstart template to Vercel.Deploy to VercelRapidly deploy the quickstart template to Vercel to get started.2Clone your repositoryClone the repo created by Vercel to make local edits.Replace <your-username> with your github username.TerminalReport incorrect codeCopyAsk AIgit clone https://github.com/<your-username>/new-mini-app-quickstart
cd new-mini-app-quickstart
npm install
3Update Manifest configurationThe minikit.config.ts file is responsible for configuring your manifest located at app/.well-known/farcaster.json and creating embed metadata. You can customize the manifest by updating the miniapp object.For details on each field, see the field reference.minikit.config.tsReport incorrect codeCopyAsk AIexport const minikitConfig = {
 accountAssociation: { // this will be added in step 5
 "header": "",
 "payload": "",
 "signature": ""
 },
 miniapp: {
 version: "1",
 name: "Cubey", 
 subtitle: "Your AI Ad Companion", 
 description: "Ads",
 screenshotUrls: [`${ROOT_URL}/screenshot-portrait.png`],
 iconUrl: `${ROOT_URL}/blue-icon.png`,
 splashImageUrl: `${ROOT_URL}/blue-hero.png`,
 splashBackgroundColor: "#000000",
 homeUrl: ROOT_URL,
 webhookUrl: `${ROOT_URL}/api/webhook`,
 primaryCategory: "social",
 tags: ["marketing", "ads", "quickstart", "waitlist"],
 heroImageUrl: `${ROOT_URL}/blue-hero.png`, 
 tagline: "",
 ogTitle: "",
 ogDescription: "",
 ogImageUrl: `${ROOT_URL}/blue-hero.png`,
 },
} as const;
4Create accountAssociation CredentialsNow that you have a public domain for your application, you are ready to associate your mini app with your Farcaster account.

Ensure all changes are live by pushing changes to the main branch.
Ensure that Vercel’s Deployment Protection is off by going to the Vercel dashboard for your project and navigating to Settings -> Deployment Protection and toggling “Vercel Authentication” to off and click save. 

Navigate to the Base Build Account association tool.

Paste your domain in the App URL field (ex: sample-url.vercel.app) and click “Submit”

Click on the “Verify” button that appears and follow the instructions to generate the accountAssociation fields.
Copy the accountAssociation object
5Update `minikit.config.ts`Update your minikit.config.ts file to include the accountAssociation object you copied in the previous step.minikit.config.tsReport incorrect codeCopyAsk AIexport const minikitConfig = {
 accountAssociation: {
 "header": "eyJmaBBiOjE3MzE4LCJ0eXBlIjoiY3VzdG9keSIsImtleSI6IjB4NzYwQjA0NDc5NjM4MTExNzNmRjg3YDPBYzA5OEJBQ0YxNzNCYkU0OCJ9",
 "payload": "eyJkb21haW4iOiJ4BWl0bGlzdC1xcy52ZXJjZWwuYXBwIn7",
 "signature": "MHhmNGQzN2M2OTk4NDIwZDNjZWVjYTNiODllYzJkMjAwOTkyMDEwOGVhNTFlYWI3NjAyN2QyMmM1MDVhNzIyMWY2NTRiYmRlZmQ0NGQwOWNiY2M2NmI2B7VmNGZiMmZiOGYzNDVjODVmNmQ3ZTVjNzI3OWNmMGY4ZTA2ODYzM2FjZjFi"
 },
 miniapp: {
 ...
 },
 }
6Push updates to productionPush all changes to the main branch. Vercel will automatically deploy the changes to your production environment.7Preview Your AppGo to base.dev/preview to validate your app.
Add your app URL to view the embeds and click the launch button to verify the app launches as expected.
Use the “Account association” tab to verify the association credentials were created correctly.
Use the “Metadata” tab to see the metadata added from the manifest and identify any missing fields.
8Post to PublishTo publish your app, create a post in the Base app with your app’s URL.
​Next Steps
Explore the templates and resources available to help you build your mini app.
TemplatesWas this page helpful?YesNoSuggest editsRaise issueMigrate an Existing AppPreviousBuild ChecklistNext⌘I

---

## Code Examples

### Code Block 1 (unknown)

```unknown
git clone https://github.com/<your-username>/new-mini-app-quickstart
cd new-mini-app-quickstart
npm install
```

### Code Block 2 (unknown)

```unknown
export const minikitConfig = {
  accountAssociation: { // this will be added in step 5
    "header": "",
    "payload": "",
    "signature": ""
  },
  miniapp: {
    version: "1",
    name: "Cubey", 
    subtitle: "Your AI Ad Companion", 
    description: "Ads",
    screenshotUrls: [`${ROOT_URL}/screenshot-portrait.png`],
    iconUrl: `${ROOT_URL}/blue-icon.png`,
    splashImageUrl: `${ROOT_URL}/blue-hero.png`,
    splashBackgroundColor: "#000000",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "social",
    tags: ["marketing", "ads", "quickstart", "waitlist"],
    heroImageUrl: `${ROOT_URL}/blue-hero.png`, 
    tagline: "",
    ogTitle: "",
    ogDescription: "",
    ogImageUrl: `${ROOT_URL}/blue-hero.png`,
  },
} as const;
```

### Code Block 3 (unknown)

```unknown
export const minikitConfig = {
    accountAssociation: {
        "header": "eyJmaBBiOjE3MzE4LCJ0eXBlIjoiY3VzdG9keSIsImtleSI6IjB4NzYwQjA0NDc5NjM4MTExNzNmRjg3YDPBYzA5OEJBQ0YxNzNCYkU0OCJ9",
        "payload": "eyJkb21haW4iOiJ4BWl0bGlzdC1xcy52ZXJjZWwuYXBwIn7",
        "signature": "MHhmNGQzN2M2OTk4NDIwZDNjZWVjYTNiODllYzJkMjAwOTkyMDEwOGVhNTFlYWI3NjAyN2QyMmM1MDVhNzIyMWY2NTRiYmRlZmQ0NGQwOWNiY2M2NmI2B7VmNGZiMmZiOGYzNDVjODVmNmQ3ZTVjNzI3OWNmMGY4ZTA2ODYzM2FjZjFi"
    },
    miniapp: {
        ...
    },
  }
```

---

## Related Links

- [Skip to main content](https://docs.base.org/mini-apps/quickstart/create-new-miniapp#content-area)
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
- [​](https://docs.base.org/mini-apps/quickstart/create-new-miniapp#next-steps)
