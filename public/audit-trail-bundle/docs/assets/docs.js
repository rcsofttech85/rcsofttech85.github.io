(function () {
    const script = document.currentScript || document.querySelector('script[src$="docs.js"]');
    const scriptUrl = new URL(script.src, window.location.href);
    const docsRoot = scriptUrl.href.replace(/assets\/docs\.js(?:\?.*)?$/, "");
    const base = new URL("4.x/", docsRoot).href;

    const docs = [
        {
            section: "Start",
            items: [
                ["Overview", base + "index.html", "index", "How AuditTrailBundle works and where to start."],
                ["Quick Start", base + "quick-start.html", "quick-start", "Install the bundle, migrate the schema, and add the Auditable attribute."],
                ["Configuration", base + "configuration.html", "configuration", "Configure transports, integrity, access auditing, and EasyAdmin."],
            ],
        },
        {
            section: "Transports",
            items: [
                ["Database", base + "transports.html#database", "transports", "Persist audit logs to the local database."],
                ["Async Database", base + "transports.html#async-database", "transports", "Persist database audits through Messenger workers."],
                ["Queue", base + "transports.html#queue", "transports", "Publish audit messages to Symfony Messenger."],
                ["HTTP", base + "transports.html#http", "transports", "Send audit logs to an external HTTP endpoint."],
                ["Chain", base + "transports.html#chain", "transports", "Combine delivery paths and fallback behavior."],
            ],
        },
        {
            section: "Usage",
            items: [
                ["Auditable Attributes", base + "usage.html#auditable-attributes", "usage", "Use Auditable, AuditCondition, AuditAccess, and Sensitive attributes."],
                ["Collection Tracking", base + "usage.html#collection-tracking", "usage", "Understand collection diffs, same-flush relation IDs, and association limitations."],
                ["Context & Events", base + "usage.html#context-and-events", "usage", "Add context metadata and hook audit creation, delivery failures, and Messenger stamps."],
                ["AuditReader API", base + "usage.html#audit-reader-api", "usage", "Query audit history with fluent immutable filters."],
                ["EasyAdmin Integration", base + "admin-security.html#easyadmin-integration", "admin-security", "Browse, filter, export, and revert audit logs in EasyAdmin."],
                ["Security & Integrity", base + "admin-security.html#security-integrity", "admin-security", "Mask data, sign logs, verify tamper evidence, and sign transport payloads."],
            ],
        },
        {
            section: "Operations",
            items: [
                ["Revert & Recovery", base + "operations.html#revert-recovery", "operations", "Revert bad changes and restore soft deleted entities."],
                ["CLI Commands", base + "operations.html#cli-commands", "operations", "List, purge, export, diff, revert, and verify logs."],
                ["Serialization", base + "operations.html#serialization", "operations", "Understand the flat JSON queue and HTTP payload shape."],
            ],
        },
        {
            section: "Reference",
            items: [
                ["Upgrade Guides", base + "upgrade-architecture.html#upgrade-guides", "upgrade-architecture", "Upgrade from v3 to v4 and plan future version moves."],
                ["Architecture", base + "upgrade-architecture.html#architecture", "upgrade-architecture", "Map runtime services, extension points, query, transport, and revert internals."],
            ],
        },
    ];

    const flatDocs = docs.flatMap((group) =>
        group.items.map(([title, url, page, description]) => ({
            title,
            url,
            page,
            section: group.section,
            description,
            haystack: `${title} ${group.section} ${description}`.toLowerCase(),
        }))
    );

    function currentPage() {
        return document.body.dataset.docPage || "";
    }

    function buildNav() {
        const target = document.querySelector("[data-docs-nav]");
        if (!target) {
            return;
        }

        const activePage = currentPage();
        const nav = document.createElement("nav");
        nav.className = "docs-nav";

        docs.forEach((group) => {
            const section = document.createElement("div");
            section.className = "docs-nav-section";

            const title = document.createElement("span");
            title.className = "docs-nav-title";
            title.textContent = group.section;
            section.appendChild(title);

            group.items.forEach(([label, url, page]) => {
                const link = document.createElement("a");
                link.href = url;
                link.textContent = label;
                if (page === activePage) {
                    link.classList.add("is-active");
                }
                section.appendChild(link);
            });

            nav.appendChild(section);
        });

        target.appendChild(nav);
    }

    function buildToc() {
        const target = document.querySelector("[data-page-toc]");
        const content = document.querySelector(".doc-content");
        if (!target || !content) {
            return;
        }

        const headings = Array.from(content.querySelectorAll("h2[id], h3[id]"));
        if (!headings.length) {
            target.hidden = true;
            return;
        }

        const heading = document.createElement("h2");
        heading.textContent = "On this page";
        const nav = document.createElement("nav");

        headings.forEach((item) => {
            const link = document.createElement("a");
            link.href = `#${item.id}`;
            link.textContent = item.textContent;
            if (item.tagName === "H3") {
                link.style.paddingLeft = "1rem";
            }
            nav.appendChild(link);
        });

        target.appendChild(heading);
        target.appendChild(nav);
    }

    function setupSearch() {
        const input = document.querySelector("[data-doc-search]");
        const results = document.querySelector("[data-search-results]");
        if (!input || !results) {
            return;
        }

        const render = () => {
            const query = input.value.trim().toLowerCase();
            results.innerHTML = "";

            if (query.length < 2) {
                results.classList.remove("is-open");
                return;
            }

            const matches = flatDocs
                .filter((item) => item.haystack.includes(query))
                .slice(0, 8);

            if (!matches.length) {
                const empty = document.createElement("div");
                empty.className = "search-empty";
                empty.textContent = "No docs matched that search.";
                results.appendChild(empty);
                results.classList.add("is-open");
                return;
            }

            matches.forEach((item) => {
                const link = document.createElement("a");
                link.href = item.url;
                link.innerHTML = `<strong>${item.title}</strong><span>${item.section} - ${item.description}</span>`;
                results.appendChild(link);
            });

            results.classList.add("is-open");
        };

        input.addEventListener("input", render);
        input.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                input.value = "";
                results.classList.remove("is-open");
            }
        });

        document.addEventListener("click", (event) => {
            if (!event.target.closest(".search-box")) {
                results.classList.remove("is-open");
            }
        });
    }

    function setupCodeCopy() {
        document.querySelectorAll("pre").forEach((pre) => {
            if (pre.querySelector(".copy-code")) {
                return;
            }

            const button = document.createElement("button");
            button.className = "copy-code";
            button.type = "button";
            button.textContent = "Copy";
            pre.appendChild(button);

            button.addEventListener("click", async () => {
                const code = pre.querySelector("code");
                const text = code ? code.innerText : pre.innerText.replace("Copy", "").trim();

                try {
                    await navigator.clipboard.writeText(text);
                } catch (error) {
                    const textarea = document.createElement("textarea");
                    textarea.value = text;
                    textarea.setAttribute("readonly", "");
                    textarea.style.position = "fixed";
                    textarea.style.opacity = "0";
                    document.body.appendChild(textarea);
                    textarea.select();
                    document.execCommand("copy");
                    textarea.remove();
                }

                button.textContent = "Copied";
                button.classList.add("is-copied");
                window.setTimeout(() => {
                    button.textContent = "Copy";
                    button.classList.remove("is-copied");
                }, 1400);
            });
        });
    }

    function setupMobileNav() {
        const button = document.querySelector("[data-mobile-nav-toggle]");
        if (!button) {
            return;
        }

        button.addEventListener("click", () => {
            document.body.classList.toggle("nav-open");
            button.setAttribute("aria-expanded", document.body.classList.contains("nav-open") ? "true" : "false");
        });

        document.querySelector("[data-docs-nav]")?.addEventListener("click", (event) => {
            if (event.target.closest("a")) {
                document.body.classList.remove("nav-open");
                button.setAttribute("aria-expanded", "false");
            }
        });
    }

    function setupVersionSelect() {
        const select = document.querySelector("[data-version-select]");
        if (!select) {
            return;
        }

        select.addEventListener("change", () => {
            if (select.value) {
                window.location.href = select.value;
            }
        });
    }

    function setYear() {
        document.querySelectorAll("[data-year]").forEach((target) => {
            target.textContent = new Date().getFullYear();
        });
    }

    buildNav();
    buildToc();
    setupSearch();
    setupCodeCopy();
    setupMobileNav();
    setupVersionSelect();
    setYear();
})();
