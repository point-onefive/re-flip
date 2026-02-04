# Developer's Guide to Effective AI Prompting - Base Documentation

**Source:** https://docs.base.org/get-started/prompt-library
**Scraped:** 2026-02-04T10:27:32.221841

---

## Table of Contents

  - ​Understanding Context Windows
    - ​Why Context Matters
    - ​Optimizing for Context Windows
  - ​Setting Up AI Tools
    - ​Configuring Cursor Rules
    - ​Creating Cursor Rules
    - ​Setting Up an OnchainKit Project
  - ​Creating Project Documentation
  - ​Effective Prompting Strategies
  - ​Working with OnchainKit
    - ​Leveraging LLMs.txt for Documentation
  - ​Debugging with AI
    - ​Effective Debugging Prompts
    - ​When You’re Stuck
  - ​Advanced Prompting Techniques
  - ​Best Practices Summary

---

## Content

Base Documentation home pageSearch...⌘KAsk AISearch...NavigationBuild with AIDeveloper's Guide to Effective AI PromptingGet StartedBase ChainBase AccountBase AppMini AppsOnchainKitCookbookShowcaseLearnStatusFaucetBridgeBlogIntroductionBaseQuickstartBuild an AppLaunch a TokenDeploy Smart ContractsBuilder SupportGet FundedBase Services HubBase Mentorship ProgramCountry Leads & AmbassadorsBuild with AIMCP ServerStatic Docs FilesPrompt LibraryOn this pageUnderstanding Context WindowsWhy Context MattersOptimizing for Context WindowsSetting Up AI ToolsConfiguring Cursor RulesCreating Cursor RulesSetting Up an OnchainKit ProjectCreating Project DocumentationEffective Prompting StrategiesWorking with OnchainKitLeveraging LLMs.txt for DocumentationDebugging with AIEffective Debugging PromptsWhen You’re StuckAdvanced Prompting TechniquesBest Practices SummaryThis guide helps developers leverage AI tools effectively in their coding workflow. Whether you’re using Cursor, GitHub Copilot, or other AI assistants, these strategies will help you get better results and integrate AI smoothly into your development process.
​Understanding Context Windows
​Why Context Matters
AI coding assistants have what’s called a “context window” - the amount of text they can “see” and consider when generating responses. Think of it as the AI’s working memory:

Most modern AI assistants can process thousands of tokens (roughly 4-5 words per token)
Everything you share and everything the AI responds with consumes this limited space
Once the context window fills up, parts of your conversational history may be lost.

This is why providing relevant context upfront is crucial - the AI can only work with what it can “see” in its current context window.
​Optimizing for Context Windows
To get the most out of AI assistants:

Prioritize relevant information: Focus on sharing the most important details first
Remove unnecessary content: Avoid pasting irrelevant code or documentation
Structure your requests: Use clear sections and formatting to make information easy to process
Reference external resources: For large codebases, consider sharing only the most relevant files
For larger projects, create and reference a central documentation file that summarizes key information, rather than repeatedly explaining the same context.

​Setting Up AI Tools
​Configuring Cursor Rules
Cursor Rules allow you to provide consistent context to Cursor AI, making it more effective at understanding your codebase and providing relevant suggestions.
​Creating Cursor Rules

Open the Command Palette in Cursor:

Mac: Cmd + Shift + P

Windows/Linux: Ctrl + Shift + P

Search for “Cursor Rules” and select the option to create or edit rules

Add project-specific rules that help Cursor understand your project:

Next.js
Astro
Vite

Save your rules file and Cursor will apply these rules to its AI suggestions

​Setting Up an OnchainKit Project
To create a new OnchainKit project:
Report incorrect codeCopyAsk AInpm create onchain@latest

After creating your project, prompt to generate comprehensive documentation for your new OnchainKit project.
​Creating Project Documentation
A comprehensive instructions file helps AI tools understand your project better. This should be created early in your project and updated regularly.
Ready-to-Use Prompt for Creating Instructions.md:
Report incorrect codeCopyAsk AICreate a detailed instructions.md file for my project with the following sections:

1. Overview: Summarize the project goals, problem statements, and core functionality
2. Tech Stack: List all technologies, libraries, frameworks with versions
3. Project Structure: Document the file organization with explanations
4. Coding Standards: Document style conventions, linting rules, and patterns
5. User Stories: Key functionality from the user perspective
6. APIs and Integrations: External services and how they connect

​Effective Prompting Strategies
Be Specific and Direct
Start with clear commands and be specific about what you want. AI tools respond best to clear, direct instructions.
Example: ❌ “Help me with my code”
✅ “Refactor this authentication function to use async/await instead of nested then() calls”
Provide Context for Complex Tasks
Ready-to-Use Prompt:
Report incorrect codeCopyAsk AII'm working on a onchainkit project using [frameworks/libraries]. I need your help with:

1. Problem: [describe specific issue]
2. Current approach: [explain what you've tried]
3. Constraints: [mention any technical limitations]
4. Expected outcome: [describe what success looks like]

Here's the relevant documentation @https://docs.base.org/onchainkit/llms.txt

Ask for Iterations
Start simple and refine through iterations rather than trying to get everything perfect in one go.
Ready-to-Use Prompt:
Report incorrect codeCopyAsk AILet's approach this step by step:
1. First, implement a basic version of [feature] with minimal functionality
2. Then, we'll review and identify areas for improvement
3. Next, let's add error handling and edge cases
4. Finally, we'll optimize for performance

Please start with step 1 now.

​Working with OnchainKit
​Leveraging LLMs.txt for Documentation
The OnchainKit project provides optimized documentation in the form of LLMs.txt files. These files are specifically formatted to be consumed by AI models:

Use OnchainKit Documentation
2.Find the component you want to implement
3.Copy the corresponding LLMs.txt url
4.Paste it into your prompt to provide context

Example LLMs.txt Usage:
Report incorrect codeCopyAsk AII'm implementing a swap component with OnchainKit. Here's the relevant LLMs.txt:

@https://docs.base.org/onchainkit/llms.txt

Based on this documentation, please show me how to implement a wallet connector that:
1. Swap from base usdc to base th
2. Handles connection states properly
3. Includes error handling
4. Follows best practices for user experience

Component Integration Example
Ready-to-Use Prompt for Token Balance Display:
Report incorrect codeCopyAsk AII need to implement a new feature in my project.

1. Shows the connected wallet's balance of our {ERC20 token}. 
2. It Updates when the balance changes.
3. Handles loading and error states appropriately
4. Follows our project's coding standards
5. Update our instructions.md to reflect this new implementation
*update the prompt a token of your choice

​Debugging with AI
​Effective Debugging Prompts
Ready-to-Use Prompt for Bug Analysis:
Report incorrect codeCopyAsk AII'm encountering an issue with my code:

1. Expected behavior: [what should happen]
2. Actual behavior: [what's happening instead]
3. Error messages: [include any errors]
4. Relevant code: [paste the problematic code]

Please analyze this situation step by step and help me:
1. Identify potential causes of this issue
2. Suggest debugging steps to isolate the problem
3. Propose possible solutions

Ready-to-Use Prompt for Adding Debug Logs:
Report incorrect codeCopyAsk AII need to debug the following function. Please add comprehensive logging statements that will help me trace:
1. Input values and their types
2. Function execution flow
3. Intermediate state changes
4. Output values or errors

Here's my code:
[paste your code]

​When You’re Stuck
If you’re uncertain how to proceed:
Ready-to-Use Clarification Prompt:
Report incorrect codeCopyAsk AII'm unsure how to proceed with [specific task]. Here's what I know:
1. [context about the problem]
2. [what you've tried]
3. [specific areas where you need guidance]

What additional information would help you provide better assistance?

If you’re unsure about something, simply state it clearly:
Report incorrect codeCopyAsk AII'm not sure how to proceed with this implementation. Could you provide some guidance on possible approaches?

​Advanced Prompting Techniques
Modern AI assistants have capabilities that you can leverage with these advanced techniques:
1. Step-by-step reasoning: Ask the AI to work through problems systematically
Report incorrect codeCopyAsk AIPlease analyze this code step by step and identify potential issues.

2. Format specification: Request specific formats for clarity
Report incorrect codeCopyAsk AIPlease structure your response as a tutorial with code examples and explanations.

3. Length guidance: Indicate whether you want brief or detailed responses
Report incorrect codeCopyAsk AIPlease provide a concise explanation in 2-3 paragraphs.

4. Clarify ambiguities: Help resolve unclear points when you receive multiple options
Report incorrect codeCopyAsk AII notice you suggested two approaches. To clarify, I'd prefer to use the first approach with {insert language choice here}.

​Best Practices Summary

Understand context limitations: Recognize that AI tools have finite context windows and prioritize information accordingly
Provide relevant context: Share code snippets, error messages, and project details that matter for your specific question
Be specific in requests: Clear, direct instructions yield better results than vague questions
Break complex tasks into steps: Iterative approaches often work better for complex problems
Request explanations: Ask the AI to explain generated code or concepts you don’t understand
Use formatting for clarity: Structure your prompts with clear sections and formatting
Reference documentation: When working with specific libraries like OnchainKit, share relevant documentation
Test and validate: Always review and test AI-generated code before implementing
Build on previous context: Refer to earlier parts of your conversation when iterating
Provide feedback: Let the AI know what worked and what didn’t to improve future responses
Was this page helpful?YesNoSuggest editsRaise issueStatic Docs FilesPrevious⌘I

---

## Code Examples

### Code Block 1 (unknown)

```unknown
npm create onchain@latest
```

### Code Block 2 (unknown)

```unknown
Create a detailed instructions.md file for my project with the following sections:

1. Overview: Summarize the project goals, problem statements, and core functionality
2. Tech Stack: List all technologies, libraries, frameworks with versions
3. Project Structure: Document the file organization with explanations
4. Coding Standards: Document style conventions, linting rules, and patterns
5. User Stories: Key functionality from the user perspective
6. APIs and Integrations: External services and how they connect
```

### Code Block 3 (unknown)

```unknown
I'm working on a onchainkit project using [frameworks/libraries]. I need your help with:

1. Problem: [describe specific issue]
2. Current approach: [explain what you've tried]
3. Constraints: [mention any technical limitations]
4. Expected outcome: [describe what success looks like]

Here's the relevant documentation @https://docs.base.org/onchainkit/llms.txt
```

### Code Block 4 (unknown)

```unknown
Let's approach this step by step:
1. First, implement a basic version of [feature] with minimal functionality
2. Then, we'll review and identify areas for improvement
3. Next, let's add error handling and edge cases
4. Finally, we'll optimize for performance

Please start with step 1 now.
```

### Code Block 5 (unknown)

```unknown
I'm implementing a swap component with OnchainKit. Here's the relevant LLMs.txt:

@https://docs.base.org/onchainkit/llms.txt

Based on this documentation, please show me how to implement a wallet connector that:
1. Swap from base usdc to base th
2. Handles connection states properly
3. Includes error handling
4. Follows best practices for user experience
```

### Code Block 6 (unknown)

```unknown
I need to implement a new feature in my project.

1. Shows the connected wallet's balance of our {ERC20 token}. 
2. It Updates when the balance changes.
3. Handles loading and error states appropriately
4. Follows our project's coding standards
5. Update our instructions.md to reflect this new implementation
*update the prompt a token of your choice
```

### Code Block 7 (unknown)

```unknown
I'm encountering an issue with my code:

1. Expected behavior: [what should happen]
2. Actual behavior: [what's happening instead]
3. Error messages: [include any errors]
4. Relevant code: [paste the problematic code]

Please analyze this situation step by step and help me:
1. Identify potential causes of this issue
2. Suggest debugging steps to isolate the problem
3. Propose possible solutions
```

### Code Block 8 (unknown)

```unknown
I need to debug the following function. Please add comprehensive logging statements that will help me trace:
1. Input values and their types
2. Function execution flow
3. Intermediate state changes
4. Output values or errors

Here's my code:
[paste your code]
```

### Code Block 9 (unknown)

```unknown
I'm unsure how to proceed with [specific task]. Here's what I know:
1. [context about the problem]
2. [what you've tried]
3. [specific areas where you need guidance]

What additional information would help you provide better assistance?
```

### Code Block 10 (unknown)

```unknown
I'm not sure how to proceed with this implementation. Could you provide some guidance on possible approaches?
```

### Code Block 11 (unknown)

```unknown
Please analyze this code step by step and identify potential issues.
```

### Code Block 12 (unknown)

```unknown
Please structure your response as a tutorial with code examples and explanations.
```

### Code Block 13 (unknown)

```unknown
Please provide a concise explanation in 2-3 paragraphs.
```

### Code Block 14 (unknown)

```unknown
I notice you suggested two approaches. To clarify, I'd prefer to use the first approach with {insert language choice here}.
```

---

## Related Links

- [Skip to main content](https://docs.base.org/get-started/prompt-library#content-area)
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
- [Understanding Context Windows](https://docs.base.org/get-started/prompt-library#understanding-context-windows)
- [Why Context Matters](https://docs.base.org/get-started/prompt-library#why-context-matters)
- [Optimizing for Context Windows](https://docs.base.org/get-started/prompt-library#optimizing-for-context-windows)
- [Setting Up AI Tools](https://docs.base.org/get-started/prompt-library#setting-up-ai-tools)
- [Configuring Cursor Rules](https://docs.base.org/get-started/prompt-library#configuring-cursor-rules)
- [Creating Cursor Rules](https://docs.base.org/get-started/prompt-library#creating-cursor-rules)
- [Setting Up an OnchainKit Project](https://docs.base.org/get-started/prompt-library#setting-up-an-onchainkit-project)
- [Creating Project Documentation](https://docs.base.org/get-started/prompt-library#creating-project-documentation)
- [Effective Prompting Strategies](https://docs.base.org/get-started/prompt-library#effective-prompting-strategies)
- [Working with OnchainKit](https://docs.base.org/get-started/prompt-library#working-with-onchainkit)
- [Leveraging LLMs.txt for Documentation](https://docs.base.org/get-started/prompt-library#leveraging-llms-txt-for-documentation)
- [Debugging with AI](https://docs.base.org/get-started/prompt-library#debugging-with-ai)
- [Effective Debugging Prompts](https://docs.base.org/get-started/prompt-library#effective-debugging-prompts)
- [When You’re Stuck](https://docs.base.org/get-started/prompt-library#when-you%E2%80%99re-stuck)
- [Advanced Prompting Techniques](https://docs.base.org/get-started/prompt-library#advanced-prompting-techniques)
- [Best Practices Summary](https://docs.base.org/get-started/prompt-library#best-practices-summary)
- [​](https://docs.base.org/get-started/prompt-library#when-you’re-stuck)
