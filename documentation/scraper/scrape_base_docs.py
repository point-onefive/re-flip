#!/usr/bin/env python3
"""
Base.org Documentation Scraper
Crawls Base.org build pages and documentation to gather context for building on Base.
"""

import os
import json
import time
import re
from datetime import datetime
from urllib.parse import urljoin, urlparse
from pathlib import Path

import requests
from bs4 import BeautifulSoup

# Configuration
BASE_URLS = [
    "https://www.base.org/build",
    "https://docs.base.org/get-started/base",
]

# Documentation sections to crawl
DOC_SECTIONS = [
    "https://docs.base.org/get-started/base",
    "https://docs.base.org/get-started/contracts",
    "https://docs.base.org/get-started/connect-wallet",
    "https://docs.base.org/get-started/fund-your-wallet",
    "https://docs.base.org/building-with-base/overview",
    "https://docs.base.org/building-with-base/quickstart",
    "https://docs.base.org/building-with-base/deployment-quickstart",
    "https://docs.base.org/building-with-base/guides",
    "https://docs.base.org/tools/overview",
    "https://docs.base.org/tools/bridges",
    "https://docs.base.org/tools/oracles",
    "https://docs.base.org/tools/data-indexers",
    "https://docs.base.org/tools/faucets",
    "https://docs.base.org/tools/onramps",
    "https://docs.base.org/tools/block-explorers",
    "https://docs.base.org/tools/node-providers",
    "https://docs.base.org/tools/foundry",
    "https://docs.base.org/tools/hardhat",
    "https://docs.base.org/tools/thirdweb",
    "https://docs.base.org/contracts/overview",
    "https://docs.base.org/network-information",
    "https://docs.base.org/differences",
    "https://docs.base.org/fees",
    "https://docs.base.org/security",
]

# Output directory
OUTPUT_DIR = Path(__file__).parent.parent / "scraped_content"

# Request headers
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
}


def create_output_dir():
    """Create output directory if it doesn't exist."""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    print(f"📁 Output directory: {OUTPUT_DIR}")


def clean_text(text):
    """Clean and normalize text content."""
    # Remove excessive whitespace
    text = re.sub(r'\n\s*\n', '\n\n', text)
    text = re.sub(r' +', ' ', text)
    return text.strip()


def extract_code_blocks(soup):
    """Extract code blocks from the page."""
    code_blocks = []
    for pre in soup.find_all('pre'):
        code = pre.get_text()
        # Try to detect language
        classes = pre.get('class', [])
        lang = 'unknown'
        for cls in classes:
            if 'language-' in str(cls):
                lang = str(cls).replace('language-', '')
                break
        code_blocks.append({
            'language': lang,
            'code': code.strip()
        })
    return code_blocks


def extract_links(soup, base_url):
    """Extract all relevant links from the page."""
    links = []
    for a in soup.find_all('a', href=True):
        href = a['href']
        text = a.get_text(strip=True)
        full_url = urljoin(base_url, href)
        
        # Only include relevant links
        if any(domain in full_url for domain in ['base.org', 'docs.base.org', 'github.com/base-org']):
            links.append({
                'text': text,
                'url': full_url
            })
    return links


def scrape_page(url):
    """Scrape a single page and extract content."""
    print(f"🔍 Scraping: {url}")
    
    try:
        response = requests.get(url, headers=HEADERS, timeout=30)
        response.raise_for_status()
    except requests.RequestException as e:
        print(f"   ❌ Error fetching {url}: {e}")
        return None
    
    soup = BeautifulSoup(response.text, 'html.parser')
    
    # Remove script and style elements
    for element in soup(['script', 'style', 'nav', 'footer', 'header']):
        element.decompose()
    
    # Extract title
    title = soup.find('title')
    title_text = title.get_text(strip=True) if title else urlparse(url).path
    
    # Try to find main content area
    main_content = (
        soup.find('main') or 
        soup.find('article') or 
        soup.find('div', class_=re.compile(r'content|docs|main', re.I)) or
        soup.find('body')
    )
    
    # Extract text content
    text_content = clean_text(main_content.get_text()) if main_content else ""
    
    # Extract code blocks
    code_blocks = extract_code_blocks(soup)
    
    # Extract links
    links = extract_links(soup, url)
    
    # Extract headings for structure
    headings = []
    for h in soup.find_all(['h1', 'h2', 'h3', 'h4']):
        headings.append({
            'level': h.name,
            'text': h.get_text(strip=True)
        })
    
    return {
        'url': url,
        'title': title_text,
        'scraped_at': datetime.now().isoformat(),
        'headings': headings,
        'content': text_content,
        'code_blocks': code_blocks,
        'links': links,
    }


def save_content(data, filename):
    """Save scraped content to files."""
    if not data:
        return
    
    # Save as JSON
    json_path = OUTPUT_DIR / f"{filename}.json"
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    # Save as readable markdown
    md_path = OUTPUT_DIR / f"{filename}.md"
    with open(md_path, 'w', encoding='utf-8') as f:
        f.write(f"# {data['title']}\n\n")
        f.write(f"**Source:** {data['url']}\n")
        f.write(f"**Scraped:** {data['scraped_at']}\n\n")
        f.write("---\n\n")
        
        # Table of contents from headings
        if data['headings']:
            f.write("## Table of Contents\n\n")
            for h in data['headings']:
                indent = "  " * (int(h['level'][1]) - 1)
                f.write(f"{indent}- {h['text']}\n")
            f.write("\n---\n\n")
        
        # Main content
        f.write("## Content\n\n")
        f.write(data['content'])
        f.write("\n\n")
        
        # Code blocks
        if data['code_blocks']:
            f.write("---\n\n## Code Examples\n\n")
            for i, block in enumerate(data['code_blocks'], 1):
                f.write(f"### Code Block {i} ({block['language']})\n\n")
                f.write(f"```{block['language']}\n{block['code']}\n```\n\n")
        
        # Links
        if data['links']:
            f.write("---\n\n## Related Links\n\n")
            seen = set()
            for link in data['links']:
                if link['url'] not in seen:
                    f.write(f"- [{link['text']}]({link['url']})\n")
                    seen.add(link['url'])
    
    print(f"   ✅ Saved: {filename}.json, {filename}.md")


def url_to_filename(url):
    """Convert URL to a safe filename."""
    parsed = urlparse(url)
    path = parsed.path.strip('/')
    if not path:
        path = parsed.netloc
    # Replace special characters
    filename = re.sub(r'[^\w\-]', '_', path)
    return filename


def discover_doc_links(soup, base_url):
    """Discover additional documentation links from navigation."""
    doc_links = set()
    
    for a in soup.find_all('a', href=True):
        href = a['href']
        full_url = urljoin(base_url, href)
        
        # Only include docs.base.org links
        if 'docs.base.org' in full_url and '#' not in full_url:
            # Normalize URL
            parsed = urlparse(full_url)
            clean_url = f"{parsed.scheme}://{parsed.netloc}{parsed.path}"
            doc_links.add(clean_url)
    
    return list(doc_links)


def scrape_all():
    """Main function to scrape all pages."""
    print("=" * 60)
    print("🚀 Base.org Documentation Scraper")
    print("=" * 60)
    print()
    
    create_output_dir()
    
    all_data = []
    scraped_urls = set()
    urls_to_scrape = list(set(BASE_URLS + DOC_SECTIONS))
    
    # First pass - scrape initial URLs and discover more
    discovered_urls = set()
    
    for url in urls_to_scrape:
        if url in scraped_urls:
            continue
            
        data = scrape_page(url)
        if data:
            scraped_urls.add(url)
            all_data.append(data)
            
            filename = url_to_filename(url)
            save_content(data, filename)
            
            # Discover more URLs from the page
            try:
                response = requests.get(url, headers=HEADERS, timeout=30)
                soup = BeautifulSoup(response.text, 'html.parser')
                new_links = discover_doc_links(soup, url)
                discovered_urls.update(new_links)
            except:
                pass
            
            # Be polite - add delay between requests
            time.sleep(0.5)
    
    # Second pass - scrape discovered URLs
    print(f"\n📚 Found {len(discovered_urls)} additional documentation pages")
    
    for url in discovered_urls:
        if url in scraped_urls:
            continue
        
        # Limit to important sections
        important_sections = [
            '/get-started/', '/building-with-base/', '/tools/', 
            '/contracts/', '/fees', '/network', '/differences',
            '/security', '/guides/', '/quickstart'
        ]
        
        if not any(section in url for section in important_sections):
            continue
            
        data = scrape_page(url)
        if data:
            scraped_urls.add(url)
            all_data.append(data)
            
            filename = url_to_filename(url)
            save_content(data, filename)
            
            time.sleep(0.5)
    
    # Create summary file
    summary_path = OUTPUT_DIR / "_summary.json"
    summary = {
        'total_pages_scraped': len(all_data),
        'scraped_at': datetime.now().isoformat(),
        'pages': [{'title': d['title'], 'url': d['url']} for d in all_data]
    }
    
    with open(summary_path, 'w', encoding='utf-8') as f:
        json.dump(summary, f, indent=2)
    
    # Create master markdown file
    master_path = OUTPUT_DIR / "_MASTER_DOCUMENTATION.md"
    with open(master_path, 'w', encoding='utf-8') as f:
        f.write("# Base.org Complete Documentation\n\n")
        f.write(f"**Total Pages:** {len(all_data)}\n")
        f.write(f"**Generated:** {datetime.now().isoformat()}\n\n")
        f.write("---\n\n")
        f.write("## Index\n\n")
        
        for d in all_data:
            f.write(f"- [{d['title']}]({d['url']})\n")
        
        f.write("\n---\n\n")
        
        for d in all_data:
            f.write(f"# {d['title']}\n\n")
            f.write(f"**Source:** {d['url']}\n\n")
            f.write(d['content'][:5000])  # First 5000 chars of each
            if len(d['content']) > 5000:
                f.write("\n\n[Content truncated...]\n")
            f.write("\n\n---\n\n")
    
    print()
    print("=" * 60)
    print(f"✅ Scraping complete!")
    print(f"   Total pages: {len(all_data)}")
    print(f"   Output: {OUTPUT_DIR}")
    print("=" * 60)
    
    return all_data


if __name__ == "__main__":
    scrape_all()
