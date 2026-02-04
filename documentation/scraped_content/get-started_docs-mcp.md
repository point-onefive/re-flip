# MCP Server - Base Documentation

**Source:** https://docs.base.org/get-started/docs-mcp
**Scraped:** 2026-02-04T10:27:28.875779

---

## Table of Contents

  - ​Setup with Cursor
  - ​Setup with Claude Code

---

## Content

Base Documentation home pageSearch...⌘KAsk AISearch...NavigationBuild with AIMCP ServerGet StartedBase ChainBase AccountBase AppMini AppsOnchainKitCookbookShowcaseLearnStatusFaucetBridgeBlogIntroductionBaseQuickstartBuild an AppLaunch a TokenDeploy Smart ContractsBuilder SupportGet FundedBase Services HubBase Mentorship ProgramCountry Leads & AmbassadorsBuild with AIMCP ServerStatic Docs FilesPrompt LibraryOn this pageSetup with CursorSetup with Claude CodeModel Context Protocol (MCP) is an open standard that lets AI assistants securely access external data sources. The Base MCP server connects your AI coding assistant directly to our documentation, giving it live access to search and retrieve the exact information you need in real time.
​Setup with Cursor
Cursor is an AI-powered code editor built as a fork of VS Code with features like AI code completion and natural language editing.
1Open MCP settingsIn Cursor, open Settings and navigate to Tools & MCP, then click Add MCP Server.2Add Base docs serverIn the mcp.json configuration file, add:mcp.jsonReport incorrect codeCopyAsk AI{
 "mcpServers": {
 "base-docs": {
 "url": "https://docs.base.org/mcp"
 }
 }
}
3Save and restartSave the file and restart Cursor to apply the changes.4Start buildingYour AI assistant can now access Base docs in real time. Try asking: “How do I deploy a smart contract on Base?”
​Setup with Claude Code
Claude Code is an agentic coding tool that lives in your terminal and understands your codebase.
1Add the Base docs MCP serverRun the following command in your terminal:TerminalReport incorrect codeCopyAsk AIclaude mcp add --transport http base-docs https://docs.base.org/mcp
2Verify installationCheck that the server was added successfully:TerminalReport incorrect codeCopyAsk AIclaude mcp list
3Start buildingLaunch Claude Code and start asking questions. Try: “How do I deploy a smart contract on Base?”Was this page helpful?YesNoSuggest editsRaise issueCountry Leads & AmbassadorsPreviousStatic Docs FilesNext⌘I

---

## Code Examples

### Code Block 1 (unknown)

```unknown
{
  "mcpServers": {
    "base-docs": {
      "url": "https://docs.base.org/mcp"
    }
  }
}
```

### Code Block 2 (unknown)

```unknown
claude mcp add --transport http base-docs https://docs.base.org/mcp
```

### Code Block 3 (unknown)

```unknown
claude mcp list
```

---

## Related Links

- [Skip to main content](https://docs.base.org/get-started/docs-mcp#content-area)
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
- [Faucet](https://docs.base.org/base-chain/tools/network-faucets)
- [Bridge](https://docs.base.org/base-chain/network-information/bridges-mainnet)
- [Build an App](https://docs.base.org/get-started/build-app)
- [Launch a Token](https://docs.base.org/get-started/launch-token)
- [Deploy Smart Contracts](https://docs.base.org/get-started/deploy-smart-contracts)
- [Get Funded](https://docs.base.org/get-started/get-funded)
- [Base Services Hub](https://docs.base.org/get-started/base-services-hub)
- [Base Mentorship Program](https://docs.base.org/get-started/base-mentorship-program)
- [Country Leads & Ambassadors](https://docs.base.org/get-started/country-leads-and-ambassadors)
- [MCP Server](https://docs.base.org/get-started/docs-mcp)
- [Static Docs Files](https://docs.base.org/get-started/docs-llms)
- [Prompt Library](https://docs.base.org/get-started/prompt-library)
- [Setup with Cursor](https://docs.base.org/get-started/docs-mcp#setup-with-cursor)
- [Setup with Claude Code](https://docs.base.org/get-started/docs-mcp#setup-with-claude-code)
