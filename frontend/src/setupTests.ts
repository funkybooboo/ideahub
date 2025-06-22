// 1) this import will auto-extend Vitest's `expect` with all jest-dom matchers
import '@testing-library/jest-dom/vitest';

import { beforeAll, vi } from 'vitest';

// 2) stub out fetch so your App test never tries a real HTTP request
beforeAll(() => {
    vi.stubGlobal('fetch', () =>
        Promise.resolve({
            json: () => Promise.resolve([]),
        }),
    );
});
