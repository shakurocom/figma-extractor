import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

import { appDescription, appName, gitConfig } from './shared';

// `tagline` controls whether the appDescription is shown next to the title.
// It's shown in the home top navbar, but hidden in the docs sidebar where space is tight.
export function baseOptions({ tagline = true }: { tagline?: boolean } = {}): BaseLayoutProps {
  return {
    nav: {
      title: (
        <>
          <span className="font-extrabold">{appName}</span>
          {tagline && (
            <span className="hidden text-fd-muted-foreground font-normal md:inline">
              {appDescription}
            </span>
          )}
        </>
      ),
    },
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
