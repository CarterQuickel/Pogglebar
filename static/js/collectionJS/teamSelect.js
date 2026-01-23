// Defensive team select toggle script
(function () {
    function qs(id) { return document.getElementById(id); }

    function setup() {
        const teamTrigger = qs('teamSelectButton');
        const teamOverlay = qs('teamSelectOverlay');
        const teamClose = qs('teamSelectClose');
        const teamPanel = qs('teamSelect');

        if (!teamOverlay || !teamPanel) {
            console.warn('teamSelect: overlay or panel not found in DOM. Overlay will not be usable.');
            return;
        }

        // Ensure initial hidden state
        teamOverlay.style.display = 'none';
        teamPanel.style.display = 'none';

        // Show handler
        function show() {
            teamOverlay.style.display = 'block';
            teamPanel.style.display = 'block';
            // move focus for accessibility
            if (teamClose) teamClose.focus();
        }

        // Hide handler
        function hide() {
            teamOverlay.style.display = 'none';
            teamPanel.style.display = 'none';
        }

        // Attach trigger if present
        if (teamTrigger) {
            teamTrigger.addEventListener('click', function (e) {
                e.preventDefault();
                show();
            });
        } else {
            console.warn('teamSelect: trigger element with id "team" not found. Add a button/link with id="team" to open the selector.');
        }

        // Close button
        if (teamClose) {
            teamClose.addEventListener('click', function (e) {
                e.preventDefault(); hide();
            });
        }

        // Esc key closes
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') hide();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setup);
    } else {
        // DOM already loaded
        try { setup(); } catch (err) { console.error('teamSelect setup error:', err); }
    }
})();