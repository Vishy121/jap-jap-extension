document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.nav-item');
    const contentArea = document.getElementById('content-area');
    const loader = document.getElementById('loader');
    const tierTitle = document.getElementById('tier-title');

    const tiers = {
        'Beginner': { title: 'Beginner AI Path', subtitle: 'Foundation & Concepts' },
        'Intermediate': { title: 'Intermediate AI Path', subtitle: 'Implementation & Tools' },
        'Advanced': { title: 'Advanced AI Path', subtitle: 'Architecture & Research' }
    };

    async function loadTier(tier) {
        // Clear previous content
        contentArea.innerHTML = '';
        loader.style.display = 'block';
        tierTitle.textContent = tiers[tier].title;

        const result = await fetchAILearningTips(tier);
        
        loader.style.display = 'none';

        if (result.success) {
            renderContent(result.data);
        } else {
            contentArea.innerHTML = `
                <div style="text-align:center; color: var(--text-secondary); margin-top: 50px; padding: 20px;">
                    <p style="color: var(--tier-3); margin-bottom: 10px;">Error Loading Insights</p>
                    <p style="font-size: 0.8rem;">${result.error}</p>
                    <button id="retry-btn" style="margin-top: 15px; background: var(--accent-color); color: black; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer;">Retry</button>
                </div>
            `;
            document.getElementById('retry-btn').addEventListener('click', () => loadTier(tier));
        }
    }

    function renderContent(data) {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'topic-group';
        
        const titleH3 = document.createElement('h3');
        titleH3.className = 'topic-title';
        titleH3.textContent = data.topic;
        groupDiv.appendChild(titleH3);

        data.papers.forEach(paper => {
            const card = document.createElement('div');
            card.className = 'tip-card';
            card.innerHTML = `
                <div style="font-weight: 800; color: var(--accent-color); margin-bottom: 5px;">${paper.title}</div>
                <div style="font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 2px;">${paper.authors}</div>
                <div style="font-size: 0.7rem; color: #888; margin-bottom: 10px; font-style: italic;">${paper.date}</div>
                <p>${paper.summary}</p>
            `;
            groupDiv.appendChild(card);
        });

        contentArea.appendChild(groupDiv);
    }

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Update active state
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            const tier = item.getAttribute('data-tier');
            loadTier(tier);
        });
    });

    // Initial load
    loadTier('Beginner');
});
