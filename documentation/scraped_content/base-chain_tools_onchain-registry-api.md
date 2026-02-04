# Onchain Registry API - Base Documentation

**Source:** https://docs.base.org/base-chain/tools/onchain-registry-api
**Scraped:** 2026-02-04T10:27:00.912294

---

## Table of Contents

  - ​Instructions
  - ​Endpoints
    - ​GET /entries
      - ​Query Parameters
      - ​Response
    - ​GET /featured
      - ​Response
  - ​Entry Schema
  - ​Terms & Conditions

---

## Content

Base Documentation home pageSearch...⌘KAsk AISearch...NavigationToolsOnchain Registry APIGet StartedBase ChainBase AccountBase AppMini AppsOnchainKitCookbookShowcaseLearnGitHubStatusChain StatsExplorerSupportBlogQuickstartWhy Base?Deploy on BaseConnecting to BaseBase-Mainnet BridgeBase-Solana BridgeNetwork InformationBase ContractsEcosystem ContractsNetwork FeesBlock BuildingTransaction FinalityDifferences: Ethereum & BaseTroubleshooting TransactionsConfiguration ChangelogFlashblocksAppsNode ProvidersFlashblocks FAQNode OperatorsGetting StartedPerformance TuningSnapshotsTroubleshootingBuilder CodesBase Builder CodesBuilder Codes FAQToolsBase ProductsOnchain Registry APINode ProvidersBlock ExplorersNetwork FaucetsOraclesUser OnboardingData IndexersCross-chainAccount AbstractionOnrampsTokens in Coinbase WalletSecuritySecurity Council for BaseAvoid Malicious FlagsReport a VulnerabilityOn this pageInstructionsEndpointsGET /entriesQuery ParametersResponseGET /featuredResponseEntry SchemaTerms & ConditionsThe base url for our API endpoints is https://base.org/api/registry/. The use of Onchain Registry API is governed by the license terms outlined in our Terms & Conditions.
​Instructions

Users of this API can use the /entries and /featured endpoints to display Onchain Registry entries on their own surfaces
If your team would like to use referral codes to point your users to entries, we recommend appending your referral code to the link provided in the target_url field
If your team would like to filter entries based on where they are hosted or by creator, we recommend implementing logic based on the target_url and creator_name fields

​Endpoints
​GET /entries
This endpoint will display all Onchain Registry entries subject to any query parameters set below
​Query Parameters
NameTypeDescriptionpagenumberThe page number (default 1)limitnumberThe number of entries per page (default 10)categoryarrayThe category or categories of the entries of interest (Options: Games, Social, Creators, Finance, Media)curationstringThe entry’s level of curation (Options: Featured, Curated, Community)
​Response
JSONReport incorrect codeCopyAsk AI{
 "data": [
 {
 "id": "7AsRdN8uf601fCkH1e084F",
 "category": "Creators",
 "content": {
 "title": "Based Project",
 "short_description": "Short description of this based project with max char count of 30",
 "full_description": "Full description of this based project with max char count of 200",
 "image_url": "https://base.org/image.png",
 "target_url": "https://base.org/target-page",
 "cta_text": "Mint",
 "function_signature": "mint(uint256)",
 "contract_address": "0x1FC10ef15E041C5D3C54042e52EB0C54CB9b710c",
 "token_id": "2",
 "token_amount": "0.01",
 "featured": true,
 "creator_name": "Base",
 "creator_image_url": "https://base.org/creator-image.png",
 "curation": "featured",
 "start_ts": "2024-06-25T04:00:00Z",
 "expiration_ts": "2024-07-29T00:00:00Z"
 },
 "updated_at": null,
 "created_at": "2024-07-10T18:20:42.000Z"
 },
 {
 "id": "8fRbdN8uf601fCkH1e084F",
 "category": "Games",
 "content": {
 "title": "Based Project II",
 "short_description": "Short description of this second based project with max char count of 30",
 "full_description": "Full description of this second based project with max char count of 200",
 "image_url": "https://base.org/image2.png",
 "target_url": "https://base.org/second-target-page",
 "cta_text": "Mint",
 "function_signature": "mint(uint256)",
 "contract_address": "0x1FC10ef15E041C5D3C54042e52EB0C54CB9b710c",
 "token_id": "1",
 "token_amount": "0.005",
 "featured": false,
 "creator_name": "Base",
 "creator_image_url": "https://base.org/creator-image2.png",
 "curation": "community",
 "start_ts": "2024-06-25T04:00:00Z",
 "expiration_ts": "2024-07-29T00:00:00Z"
 },
 "updated_at": "2024-07-11T18:20:42.000Z",
 "created_at": "2024-07-10T18:20:42.000Z"
 }
 ],
 "pagination": {
 "total_records": 2,
 "current_page": 1,
 "total_pages": 1,
 "limit": 10
 }
}

​GET /featured
This endpoint will display a single Onchain Registry entry that is being actively featured
​Response
JSONReport incorrect codeCopyAsk AI{
 "data": {
 "id": "7AsRdN8uf601fCkH1e084F",
 "category": "Creators",
 "content": {
 "title": "Based Project",
 "short_description": "Short description of this based project with max char count of 30",
 "full_description": "Full description of this based project with max char count of 200",
 "image_url": "https://base.org/image.png",
 "target_url": "https://base.org/target-page",
 "cta_text": "Mint",
 "function_signature": "mint(uint256)",
 "contract_address": "0x1FC10ef15E041C5D3C54042e52EB0C54CB9b710c",
 "token_id": "2",
 "token_amount": "0.01",
 "featured": true,
 "creator_name": "Base",
 "creator_image_url": "https://base.org/creator-image.png",
 "curation": "featured",
 "start_ts": "2024-06-25T04:00:00Z",
 "expiration_ts": "2024-07-29T00:00:00Z"
 },
 "updated_at": null,
 "created_at": "2024-07-10T18:20:42.000Z"
 }
}

​Entry Schema
NameTypeDescriptionidstringUnique entry IDcategorystringThe category of the entry (Options: Games, Social, Creators, Finance, Media)titlestringThe title of the entryshort_descriptionstringShort version of the entry description (max 30 char)full_descriptionstringFull version of the entry description (max 200 char)image_urlstringURL of the entry’s featured imagetarget_urlstringURL for the entry’s desired user actioncta_textstringThis is the type of user action for the entry (Options: Play, Mint, Buy, Trade, Explore)function_signaturestringThe function signature associated with the desired user action on the entry’s contractcontract_addressstringThe contract address associated with the entrytoken_idstringThe token ID if this is an ERC-1155token_amountstringThe price of the entry’s desired user actionfeaturedbooleanA true or false based on whether the entry is actively featuredcreator_namestringThe name of the entry’s creatorcreator_image_urlstringThe logo of the entry’s creatorcurationstringThe entry’s level of curation Options: Featured - one entry per day with top placementCurated - community entries beingCommunity - all other community entriesstart_tsstringThe UTC timestamp that the entry is open to usersexpiration_tsstringThe UTC timestamp that the entry is no longer open to usersupdated_atstring || nullThe UTC timestamp that the entry was last updated (null if the entry has not been updated since creation)created_atstringThe UTC timestamp that the entry was created
​Terms & Conditions
We grant third parties a non-exclusive, worldwide, royalty-free license to use the Onchain Registry API solely for the purpose of integrating it into their applications or services. This license does not extend to any data or content accessed through the Onchain API, which remains the sole responsibility of the third party. By using the Onchain Registry API, third parties agree to comply with our license terms and any applicable laws and regulations as set forth in Coinbase Developer Platform Terms of Service. We make no warranties regarding the Onchain Registry API, and users accept all risks associated with its use. The Onchain App Registry API is an Early Access Product per Section 18 of the Coinbase Developer Platform Terms of Service and the Coinbase Prohibited Use Policy, and all terms and conditions therein govern your use of the Onchain Registry API.Was this page helpful?YesNoSuggest editsRaise issueBase ProductsPreviousNode ProvidersNext⌘I

---

## Code Examples

### Code Block 1 (unknown)

```unknown
{
    "data": [
        {
            "id": "7AsRdN8uf601fCkH1e084F",
            "category": "Creators",
            "content": {
                "title": "Based Project",
                "short_description": "Short description of this based project with max char count of 30",
                "full_description": "Full description of this based project with max char count of 200",
                "image_url": "https://base.org/image.png",
                "target_url": "https://base.org/target-page",
                "cta_text": "Mint",
                "function_signature": "mint(uint256)",
                "contract_address": "0x1FC10ef15E041C5D3C54042e52EB0C54CB9b710c",
                "token_id": "2",
                "token_amount": "0.01",
                "featured": true,
                "creator_name": "Base",
                "creator_image_url": "https://base.org/creator-image.png",
                "curation": "featured",
                "start_ts": "2024-06-25T04:00:00Z",
                "expiration_ts": "2024-07-29T00:00:00Z"
            },
            "updated_at": null,
            "created_at": "2024-07-10T18:20:42.000Z"
        },
        {
            "id": "8fRbdN8uf601fCkH1e084F",
            "category": "Games",
            "content": {
                "title": "Based Project II",
                "short_description": "Short description of this second based project with max char count of 30",
                "full_description": "Full description of this second based project with max char count of 200",
                "image_url": "https://base.org/image2.png",
                "target_url": "https://base.org/second-target-page",
                "cta_text": "Mint",
                "function_signature": "mint(uint256)",
                "contract_address": "0x1FC10ef15E041C5D3C54042e52EB0C54CB9b710c",
                "token_id": "1",
                "token_amount": "0.005",
                "featured": false,
                "creator_name": "Base",
                "creator_image_url": "https://base.org/creator-image2.png",
                "curation": "community",
                "start_ts": "2024-06-25T04:00:00Z",
                "expiration_ts": "2024-07-29T00:00:00Z"
            },
            "updated_at": "2024-07-11T18:20:42.000Z",
            "created_at": "2024-07-10T18:20:42.000Z"
        }
    ],
    "pagination": {
        "total_records": 2,
        "current_page": 1,
        "total_pages": 1,
        "limit": 10
    }
}
```

### Code Block 2 (unknown)

```unknown
{
    "data": {
        "id": "7AsRdN8uf601fCkH1e084F",
        "category": "Creators",
        "content": {
            "title": "Based Project",
            "short_description": "Short description of this based project with max char count of 30",
            "full_description": "Full description of this based project with max char count of 200",
            "image_url": "https://base.org/image.png",
            "target_url": "https://base.org/target-page",
            "cta_text": "Mint",
            "function_signature": "mint(uint256)",
            "contract_address": "0x1FC10ef15E041C5D3C54042e52EB0C54CB9b710c",
            "token_id": "2",
            "token_amount": "0.01",
            "featured": true,
            "creator_name": "Base",
            "creator_image_url": "https://base.org/creator-image.png",
            "curation": "featured",
            "start_ts": "2024-06-25T04:00:00Z",
            "expiration_ts": "2024-07-29T00:00:00Z"
        },
        "updated_at": null,
        "created_at": "2024-07-10T18:20:42.000Z"
    }
}
```

---

## Related Links

- [Skip to main content](https://docs.base.org/base-chain/tools/onchain-registry-api#content-area)
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
- [Status](https://status.base.org/)
- [Chain Stats](https://www.base.org/stats)
- [Deploy on Base](https://docs.base.org/base-chain/quickstart/deploy-on-base)
- [Connecting to Base](https://docs.base.org/base-chain/quickstart/connecting-to-base)
- [Base-Mainnet Bridge](https://docs.base.org/base-chain/quickstart/bridge-token)
- [Base-Solana Bridge](https://docs.base.org/base-chain/quickstart/base-solana-bridge)
- [Base Contracts](https://docs.base.org/base-chain/network-information/base-contracts)
- [Ecosystem Contracts](https://docs.base.org/base-chain/network-information/ecosystem-contracts)
- [Network Fees](https://docs.base.org/base-chain/network-information/network-fees)
- [Block Building](https://docs.base.org/base-chain/network-information/block-building)
- [Transaction Finality](https://docs.base.org/base-chain/network-information/transaction-finality)
- [Differences: Ethereum & Base](https://docs.base.org/base-chain/network-information/diffs-ethereum-base)
- [Troubleshooting Transactions](https://docs.base.org/base-chain/network-information/troubleshooting-transactions)
- [Configuration Changelog](https://docs.base.org/base-chain/network-information/configuration-changelog)
- [Apps](https://docs.base.org/base-chain/flashblocks/apps)
- [Node Providers](https://docs.base.org/base-chain/flashblocks/node-providers)
- [Flashblocks FAQ](https://docs.base.org/base-chain/flashblocks/docs)
- [Getting Started](https://docs.base.org/base-chain/node-operators/run-a-base-node)
- [Performance Tuning](https://docs.base.org/base-chain/node-operators/performance-tuning)
- [Snapshots](https://docs.base.org/base-chain/node-operators/snapshots)
- [Troubleshooting](https://docs.base.org/base-chain/node-operators/troubleshooting)
- [Base Builder Codes](https://docs.base.org/base-chain/builder-codes/builder-codes)
- [Builder Codes FAQ](https://docs.base.org/base-chain/builder-codes/builder-codes-faq)
- [Base Products](https://docs.base.org/base-chain/tools/base-products)
- [Onchain Registry API](https://docs.base.org/base-chain/tools/onchain-registry-api)
- [Node Providers](https://docs.base.org/base-chain/tools/node-providers)
- [Block Explorers](https://docs.base.org/base-chain/tools/block-explorers)
- [Network Faucets](https://docs.base.org/base-chain/tools/network-faucets)
- [Oracles](https://docs.base.org/base-chain/tools/oracles)
- [User Onboarding](https://docs.base.org/base-chain/tools/onboarding)
- [Data Indexers](https://docs.base.org/base-chain/tools/data-indexers)
- [Cross-chain](https://docs.base.org/base-chain/tools/cross-chain)
- [Account Abstraction](https://docs.base.org/base-chain/tools/account-abstraction)
- [Onramps](https://docs.base.org/base-chain/tools/onramps)
- [Tokens in Coinbase Wallet](https://docs.base.org/base-chain/tools/tokens-in-wallet)
- [Security Council for Base](https://docs.base.org/base-chain/security/security-council)
- [Avoid Malicious Flags](https://docs.base.org/base-chain/security/avoid-malicious-flags)
- [Report a Vulnerability](https://docs.base.org/base-chain/security/report-vulnerability)
- [Instructions](https://docs.base.org/base-chain/tools/onchain-registry-api#instructions)
- [Endpoints](https://docs.base.org/base-chain/tools/onchain-registry-api#endpoints)
- [GET /entries](https://docs.base.org/base-chain/tools/onchain-registry-api#get-%2Fentries)
- [Query Parameters](https://docs.base.org/base-chain/tools/onchain-registry-api#query-parameters)
- [Response](https://docs.base.org/base-chain/tools/onchain-registry-api#response)
- [GET /featured](https://docs.base.org/base-chain/tools/onchain-registry-api#get-%2Ffeatured)
- [Response](https://docs.base.org/base-chain/tools/onchain-registry-api#response-2)
- [Entry Schema](https://docs.base.org/base-chain/tools/onchain-registry-api#entry-schema)
- [Terms & Conditions](https://docs.base.org/base-chain/tools/onchain-registry-api#terms-%26-conditions)
- [https://base.org/api/registry/](https://base.org/api/registry/)
- [Terms & Conditions](https://docs.base.org/base-chain/tools/onchain-registry-api#terms--conditions)
- [​](https://docs.base.org/base-chain/tools/onchain-registry-api#get-/entries)
- [​](https://docs.base.org/base-chain/tools/onchain-registry-api#get-/featured)
- [​](https://docs.base.org/base-chain/tools/onchain-registry-api#terms-&-conditions)
