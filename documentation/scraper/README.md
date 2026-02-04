# Base.org Documentation Scraper

A Python script to crawl and extract documentation from Base.org for building dApps on Base blockchain.

## Purpose

This scraper gathers comprehensive documentation about:
- Getting started with Base
- Deploying smart contracts
- Development tools (Foundry, Hardhat, Thirdweb)
- Network information
- Fees and gas costs
- Security best practices

## Usage

### Install Dependencies

```bash
pip install -r requirements.txt
```

### Run Scraper

```bash
python scrape_base_docs.py
```

## Output

The scraper creates files in `../scraped_content/`:

- **Individual JSON files** - Structured data for each page
- **Individual MD files** - Human-readable markdown for each page  
- **_summary.json** - Index of all scraped pages
- **_MASTER_DOCUMENTATION.md** - Combined documentation in one file

## Structure

```
documentation/
├── scraper/
│   ├── scrape_base_docs.py    # Main scraper script
│   ├── requirements.txt       # Python dependencies
│   └── README.md             # This file
└── scraped_content/          # Output directory
    ├── _summary.json
    ├── _MASTER_DOCUMENTATION.md
    ├── docs_base_org_get-started_base.json
    ├── docs_base_org_get-started_base.md
    └── ... (more files)
```

## Project Context

This documentation is being gathered to build a **Coin Flip Game** on Base:

### Game Features
- Two-player coin flip wagering game
- Create games with custom wager amounts
- Join open games or invite friends via shareable links
- Random selection of who calls heads/tails
- 1% transaction fee on winnings
- Rematch functionality with alternating caller

### Key Docs to Review
1. Smart contract deployment
2. Wallet connection
3. Transaction handling
4. Gas/fee optimization on Base
