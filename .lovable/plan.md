# Simplify home, dashboard, and branch courses

## Changes
- Remove the “Choose your career goal” section from the home page.
- Remove the “All Courses” card from the home-page branch picker; show branch content only after a branch is selected.
- Combine each selected branch’s subject cards with company-requirement percentages in one section.
- Remove the bottom “Create my roadmap” call-to-action from the home page.
- Remove the dashboard’s “Create profile” prompt while keeping an existing profile visible and editable.
- Expand Courses so every selected branch shows all of its main subjects, while preserving the existing course lessons and filters.

## Technical details
- Reuse the existing 13-branch subject and skill-demand data.
- Match requirement percentages to relevant subject cards using shared subject/skill keywords, with branch-ranked fallback values.
- Keep “All courses” available on the Courses page so students can view every branch’s subjects grouped by branch.
- Verify the build and the home, dashboard, and courses screens.
